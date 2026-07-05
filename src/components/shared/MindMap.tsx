import { useEffect, useRef, useCallback, useState } from 'react';
import { Markmap } from 'markmap-view';
import { Maximize2, AlertCircle } from 'lucide-react';

interface MindMapProps {
  markdown: string;
  className?: string;
}

/** markmap IPureNode 结构 */
interface MNode {
  content: string;
  children: MNode[];
}

/**
 * 解析 AI 返回的 markdown 为 markmap 可用的纯树结构（仅 content + children）。
 * 兼容多种 AI 输出格式。
 */
function buildTree(raw: string): MNode | null {
  if (!raw?.trim()) return null;

  const lines = raw.split('\n');
  const root: MNode = { content: '知识结构', children: [] };

  // 第一步：提取所有有效行的 (indent, text)
  const items: { indent: number; text: string }[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    // 跳过顶级 # 标题
    if (trimmed.match(/^#\s+/)) continue;

    const originalIndent = line.search(/\S/);

    // ## 标题 → 一级节点
    const headingMatch = trimmed.match(/^#{2,6}\s+(.+)/);
    if (headingMatch) {
      items.push({ indent: 0, text: headingMatch[1].trim() });
      continue;
    }

    // 列表项
    const listMatch = trimmed.match(/^[-*+]\s+(.+)/) || trimmed.match(/^\d+\.\s+(.+)/);
    if (listMatch) {
      items.push({ indent: originalIndent, text: listMatch[1].trim() });
      continue;
    }

    // 纯文本
    items.push({ indent: originalIndent, text: trimmed });
  }

  if (items.length === 0) return null;

  // 第二步：将原始缩进值映射为连续层级 0, 1, 2...
  const uniqueIndents = Array.from(new Set(items.map((it) => it.indent))).sort((a, b) => a - b);
  const indentToLevel = new Map<number, number>();
  uniqueIndents.forEach((ind, lvl) => indentToLevel.set(ind, lvl));

  // 第三步：用栈构建树
  const stack: { node: MNode; level: number }[] = [{ node: root, level: -1 }];

  for (const item of items) {
    const level = indentToLevel.get(item.indent) ?? 0;
    const newNode: MNode = { content: item.text, children: [] };

    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    stack[stack.length - 1].node.children.push(newNode);
    stack.push({ node: newNode, level });
  }

  return root;
}

export default function MindMap({ markdown, className }: MindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);
  const [error, setError] = useState<string | null>(null);

  const renderMap = useCallback(async () => {
    if (!svgRef.current || !markdown?.trim()) return;

    try {
      const tree = buildTree(markdown);
      if (!tree || tree.children.length === 0) {
        setError('思维导图数据为空，请尝试重新生成');
        return;
      }

      // 清空 SVG
      const svg = svgRef.current;
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      // 创建 markmap 实例（不传 data，之后用 setData）
      const mm = Markmap.create(svg, {
        duration: 300,
        maxWidth: 300,
        initialExpandLevel: 3,
        paddingX: 16,
        color: (node: { state?: { path?: string } }) => {
          const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];
          const depth = node.state?.path ? node.state.path.split('.').length - 1 : 0;
          return colors[depth % colors.length];
        },
      });

      mmRef.current = mm;
      setError(null);

      // setData 内部会调用 _initializeData 给每个节点分配 state
      await mm.setData(tree as Parameters<typeof mm.setData>[0]);
      await mm.fit();
    } catch (e) {
      console.error('MindMap render error:', e);
      setError('思维导图渲染失败，请尝试重新生成');
    }
  }, [markdown]);

  useEffect(() => {
    renderMap();
    return () => {
      mmRef.current = null;
    };
  }, [renderMap]);

  useEffect(() => {
    const handleResize = () => {
      mmRef.current?.fit();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFit = () => {
    mmRef.current?.fit();
  };

  if (!markdown?.trim()) {
    return (
      <div className="text-center py-12 text-sm text-gray-400">
        暂无思维导图数据
      </div>
    );
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
        <button
          onClick={handleFit}
          className="p-1.5 bg-white/80 hover:bg-white rounded-lg shadow-sm border border-gray-200 transition-colors"
          title="适应屏幕"
        >
          <Maximize2 size={14} className="text-gray-600" />
        </button>
      </div>
      <svg
        ref={svgRef}
        className="w-full"
        style={{ minHeight: 420, height: '55vh', maxHeight: 650 }}
      />
    </div>
  );
}
