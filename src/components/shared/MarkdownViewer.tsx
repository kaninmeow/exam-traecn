import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

/**
 * 将 markdown 中的 $...$（行内公式）和 $$...$$（块级公式）替换为唯一占位符，
 * 返回替换后的文本和占位符 → 渲染结果的映射。
 */
function extractMathFormulas(text: string): { processed: string; map: Map<string, string> } {
  const map = new Map<string, string>();
  let counter = 0;

  // 先处理块级公式 $$...$$（必须在行内公式之前）
  let processed = text.replace(/\$\$([\s\S]+?)\$\$/g, (_match, formula: string) => {
    const key = `%%MATH_BLOCK_${counter++}%%`;
    try {
      map.set(key, katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false }));
    } catch {
      map.set(key, `<span class="text-red-500">公式渲染错误</span>`);
    }
    return key;
  });

  // 再处理行内公式 $...$（排除转义的 \$ 和货币符号）
  processed = processed.replace(/(?<!\$)\$(?!\$)((?:[^$\\]|\\.)+?)\$(?!\$)/g, (_match, formula: string) => {
    const key = `%%MATH_INLINE_${counter++}%%`;
    try {
      map.set(key, katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false }));
    } catch {
      map.set(key, `<span class="text-red-500">公式错误</span>`);
    }
    return key;
  });

  return { processed, map };
}

export default function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  const { processed, mathMap } = useMemo(() => {
    const result = extractMathFormulas(content);
    return { processed: result.processed, mathMap: result.map };
  }, [content]);

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-6">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">{children}</h3>,
          p: ({ children }) => {
            // 检查子节点中是否包含数学公式占位符
            const text = extractTextFromChildren(children);
            if (text && mathMap.has(text.trim())) {
              return (
                <div
                  className="my-3 overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: mathMap.get(text.trim())! }}
                />
              );
            }
            // 检查是否包含行内公式占位符
            if (text && containsMathPlaceholder(text, mathMap)) {
              return (
                <p className="text-gray-700 leading-relaxed mb-3">
                  <InlineMathText text={text} mathMap={mathMap} />
                </p>
              );
            }
            return <p className="text-gray-700 leading-relaxed mb-3">{children}</p>;
          },
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-gray-700 mb-3">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-gray-700 mb-3">{children}</ol>,
          li: ({ children }) => {
            const text = extractTextFromChildren(children);
            if (text && containsMathPlaceholder(text, mathMap)) {
              return <li className="leading-relaxed"><InlineMathText text={text} mathMap={mathMap} /></li>;
            }
            return <li className="leading-relaxed">{children}</li>;
          },
          code: ({ className: codeClassName, children }) => {
            const isInline = !codeClassName;
            if (isInline) {
              return <code className="bg-gray-100 text-amber-600 px-1.5 py-0.5 rounded text-sm">{children}</code>;
            }
            return (
              <code className="block bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-3">
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-amber-400 pl-4 italic text-gray-600 mb-3">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border border-gray-200 rounded-lg">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 bg-gray-50 text-left text-sm font-semibold text-gray-700 border-b">{children}</th>
          ),
          td: ({ children }) => {
            const text = extractTextFromChildren(children);
            if (text && containsMathPlaceholder(text, mathMap)) {
              return (
                <td className="px-4 py-2 text-sm text-gray-700 border-b">
                  <InlineMathText text={text} mathMap={mathMap} />
                </td>
              );
            }
            return <td className="px-4 py-2 text-sm text-gray-700 border-b">{children}</td>;
          },
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}

/** 从 React 子节点中提取纯文本 */
function extractTextFromChildren(children: React.ReactNode): string | null {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) {
    return children.map((c) => extractTextFromChildren(c)).join('');
  }
  if (children && typeof children === 'object' && 'props' in children) {
    return extractTextFromChildren((children as React.ReactElement).props.children);
  }
  return null;
}

/** 检查文本中是否包含数学公式占位符 */
function containsMathPlaceholder(text: string, mathMap: Map<string, string>): boolean {
  for (const key of mathMap.keys()) {
    if (text.includes(key)) return true;
  }
  return false;
}

/** 渲染包含行内公式占位符的文本 */
function InlineMathText({ text, mathMap }: { text: string; mathMap: Map<string, string> }) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let partIndex = 0;

  while (remaining.length > 0) {
    let earliestPos = remaining.length;
    let matchedKey: string | null = null;

    for (const key of mathMap.keys()) {
      const pos = remaining.indexOf(key);
      if (pos !== -1 && pos < earliestPos) {
        earliestPos = pos;
        matchedKey = key;
      }
    }

    if (!matchedKey) break;

    if (earliestPos > 0) {
      parts.push(<span key={`t-${partIndex++}`}>{remaining.slice(0, earliestPos)}</span>);
    }
    parts.push(
      <span
        key={`m-${partIndex++}`}
        dangerouslySetInnerHTML={{ __html: mathMap.get(matchedKey)! }}
      />
    );
    remaining = remaining.slice(earliestPos + matchedKey.length);
  }

  if (remaining.length > 0) {
    parts.push(<span key={`t-${partIndex++}`}>{remaining}</span>);
  }

  return <>{parts}</>;
}
