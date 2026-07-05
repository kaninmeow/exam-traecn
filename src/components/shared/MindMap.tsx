import { useEffect, useRef, useCallback, useState } from 'react';
import { Markmap } from 'markmap-view';
import { Maximize2, AlertCircle, Download } from 'lucide-react';

interface MindMapProps {
  markdown: string;
  className?: string;
}

interface MNode {
  content: string;
  children: MNode[];
}

function buildTree(raw: string): MNode | null {
  if (!raw?.trim()) return null;
  const lines = raw.split('\n');
  const root: MNode = { content: '知识结构', children: [] };
  const items: { indent: number; text: string }[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('```')) { inCodeBlock = !inCodeBlock; continue; }
    if (inCodeBlock) continue;
    if (trimmed.match(/^#\s+/)) continue;
    const originalIndent = line.search(/\S/);
    const headingMatch = trimmed.match(/^#{2,6}\s+(.+)/);
    if (headingMatch) { items.push({ indent: 0, text: headingMatch[1].trim() }); continue; }
    const listMatch = trimmed.match(/^[-*+]\s+(.+)/) || trimmed.match(/^\d+\.\s+(.+)/);
    if (listMatch) { items.push({ indent: originalIndent, text: listMatch[1].trim() }); continue; }
    items.push({ indent: originalIndent, text: trimmed });
  }

  if (items.length === 0) return null;
  const uniqueIndents = Array.from(new Set(items.map((it) => it.indent))).sort((a, b) => a - b);
  const indentToLevel = new Map<number, number>();
  uniqueIndents.forEach((ind, lvl) => indentToLevel.set(ind, lvl));

  const stack: { node: MNode; level: number }[] = [{ node: root, level: -1 }];
  for (const item of items) {
    const level = indentToLevel.get(item.indent) ?? 0;
    const newNode: MNode = { content: item.text, children: [] };
    while (stack.length > 1 && stack[stack.length - 1].level >= level) stack.pop();
    stack[stack.length - 1].node.children.push(newNode);
    stack.push({ node: newNode, level });
  }
  return root;
}

function parseTransform(t: string): { tx: number; ty: number; sx: number; sy: number } {
  let tx = 0, ty = 0, sx = 1, sy = 1;
  const m = t.match(/translate\(\s*([^,\s]+)[,\s]+([^)]+)\)/);
  if (m) { tx = parseFloat(m[1]) || 0; ty = parseFloat(m[2]) || 0; }
  const s = t.match(/scale\(\s*([^,\s]+)(?:[,\s]+([^)]+))?\)/);
  if (s) { sx = parseFloat(s[1]) || 1; sy = s[2] ? parseFloat(s[2]) || 1 : sx; }
  return { tx, ty, sx, sy };
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function MindMap({ markdown, className }: MindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const exportingRef = useRef(false);

  const renderMap = useCallback(async () => {
    if (!svgRef.current || !markdown?.trim()) return;
    try {
      const tree = buildTree(markdown);
      if (!tree || tree.children.length === 0) {
        setError('思维导图数据为空，请尝试重新生成');
        return;
      }
      const svg = svgRef.current;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const mm = Markmap.create(svg, {
        duration: 300, maxWidth: 300, initialExpandLevel: 3, paddingX: 16,
        color: (node: { state?: { path?: string } }) => {
          const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];
          const depth = node.state?.path ? node.state.path.split('.').length - 1 : 0;
          return colors[depth % colors.length];
        },
      });
      mmRef.current = mm;
      setError(null);
      await mm.setData(tree as Parameters<typeof mm.setData>[0]);
      await mm.fit();
    } catch (e) {
      console.error('MindMap render error:', e);
      setError('思维导图渲染失败，请尝试重新生成');
    }
  }, [markdown]);

  useEffect(() => { renderMap(); return () => { mmRef.current = null; }; }, [renderMap]);
  useEffect(() => { const h = () => mmRef.current?.fit(); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);

  const handleFit = () => mmRef.current?.fit();

  const handleExport = async () => {
    const mm = mmRef.current;
    const svg = svgRef.current;
    if (!mm || !svg || exportingRef.current) return;
    exportingRef.current = true;
    setExporting(true);

    const origDuration = mm.options.duration;
    const origAutoFit = mm.options.autoFit;
    const foldSaves: { node: { payload?: { fold?: number } | null }; original: number }[] = [];

    const restore = () => {
      for (const save of foldSaves) {
        if (save.node.payload) {
          save.node.payload = { ...save.node.payload, fold: save.original };
        }
      }
      mm.options.duration = origDuration;
      mm.options.autoFit = origAutoFit;
      mm.renderData().then(() => mm.fit()).catch(() => {});
    };

    try {
      mm.options.duration = 0;
      mm.options.autoFit = false;

      if (mm.state.data) {
        walkAndExpand(mm.state.data, foldSaves);
      }

      await mm.renderData();
      await mm.fit();

      // 等浏览器完成绘制
      await new Promise<void>((r) => setTimeout(r, 150));

      doExport(svg); // doExport 内部会调用 finish()
      restore();      // 恢复原始状态
    } catch (e) {
      console.error('Export error:', e);
      restore();
      finish();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function walkAndExpand(node: any, saves: { node: any; original: number }[]) {
    if (node.payload?.fold) {
      saves.push({ node, original: node.payload.fold });
      node.payload = { ...node.payload, fold: 0 };
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) walkAndExpand(child, saves);
    }
  }

  function doExport(svg: SVGSVGElement) {
    const g = svg.querySelector<SVGGElement>('g');
    if (!g) { console.warn('doExport: no <g> found'); finish(); return; }

    const gBBox = g.getBBox();
    if (gBBox.width < 1 || gBBox.height < 1) { console.warn('doExport: empty bbox', gBBox); finish(); return; }

    const gTransform = g.getAttribute('transform') || '';
    const { tx, ty, sx, sy } = parseTransform(gTransform);

    const contentX = tx + gBBox.x * sx;
    const contentY = ty + gBBox.y * sy;
    const contentW = gBBox.width * sx;
    const contentH = gBBox.height * sy;

    const pad = 30;
    const exportW = Math.ceil(contentW + pad * 2);
    const exportH = Math.ceil(contentH + pad * 2);
    const viewBox = `${contentX - pad} ${contentY - pad} ${exportW} ${exportH}`;
    const outW = exportW * 2;
    const outH = exportH * 2;

    // 克隆 SVG
    const cloned = svg.cloneNode(true) as SVGSVGElement;
    cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    cloned.setAttribute('width', String(outW));
    cloned.setAttribute('height', String(outH));
    cloned.setAttribute('viewBox', viewBox);
    cloned.removeAttribute('class');
    cloned.style.cssText = '';

    // 内联样式
    inlineStyles(svg, cloned);

    const svgStr = new XMLSerializer().serializeToString(cloned);
    const encodedSvg = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));

    const img = new Image();
    let finished = false;
    const safeFinish = () => { if (!finished) { finished = true; finish(); } };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) { downloadSvg(svgStr); safeFinish(); return; }
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, outW, outH);
      ctx.drawImage(img, 0, 0, outW, outH);
      try {
        triggerDownload(canvas.toDataURL('image/png'), '思维导图.png');
      } catch {
        downloadSvg(svgStr);
      }
      safeFinish();
    };
    img.onerror = () => { downloadSvg(svgStr); safeFinish(); };
    // 安全超时：5秒后如果 img 还没触发 onload/onerror，强制完成
    setTimeout(() => { if (!finished) { downloadSvg(svgStr); safeFinish(); } }, 5000);
    img.src = encodedSvg;
  }

  function inlineStyles(svg: SVGSVGElement, cloned: SVGSVGElement) {
    const mmCss: string[] = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.cssText.includes('.mm-') || rule.cssText.includes('markmap')) {
            mmCss.push(rule.cssText);
          }
        }
      } catch { /* 跨域忽略 */ }
    }
    const origStyle = svg.querySelector('style');
    if (origStyle?.textContent) mmCss.push(origStyle.textContent);

    const origEls = svg.querySelectorAll('*');
    const clonedEls = cloned.querySelectorAll('*');
    for (let i = 0; i < origEls.length; i++) {
      const orig = origEls[i] as SVGElement;
      const clone = clonedEls[i] as SVGElement;
      if (!orig || !clone) continue;
      const cs = window.getComputedStyle(orig);
      for (const prop of ['fill', 'stroke', 'stroke-width', 'font-size', 'font-family', 'font-weight', 'opacity', 'text-anchor']) {
        const v = cs.getPropertyValue(prop);
        if (v && v !== '' && v !== 'normal') clone.style.setProperty(prop, v);
      }
    }

    const existingClonedStyle = cloned.querySelector('style');
    if (existingClonedStyle) existingClonedStyle.remove();
    if (mmCss.length > 0) {
      const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      styleEl.textContent = mmCss.join('\n');
      cloned.insertBefore(styleEl, cloned.firstChild);
    }
  }

  function downloadSvg(svgStr: string) {
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, '思维导图.svg');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function finish() {
    exportingRef.current = false;
    setExporting(false);
  }

  if (!markdown?.trim()) {
    return <div className="text-center py-12 text-sm text-gray-400">暂无思维导图数据</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={28} className="text-amber-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">{error}</p>
        <p className="text-xs text-gray-400 mt-1">请尝试重新生成总结</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className || ''}`}>
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button onClick={handleFit} className="p-1.5 bg-white/80 hover:bg-white rounded-lg shadow-sm border border-gray-200 transition-colors" title="适应屏幕">
          <Maximize2 size={14} className="text-gray-600" />
        </button>
        <button onClick={handleExport} disabled={exporting} className="p-1.5 bg-white/80 hover:bg-white rounded-lg shadow-sm border border-gray-200 transition-colors disabled:opacity-50" title="导出为图片">
          <Download size={14} className={exporting ? 'animate-bounce text-amber-500' : 'text-gray-600'} />
        </button>
      </div>
      <svg ref={svgRef} className="w-full" style={{ minHeight: 420, height: '55vh', maxHeight: 650 }} />
    </div>
  );
}
