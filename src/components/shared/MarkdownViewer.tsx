import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export default function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-6">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">{children}</h3>,
          p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-3">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-gray-700 mb-3">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-gray-700 mb-3">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          code: ({ className, children }) => {
            const isInline = !className;
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
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-gray-700 border-b">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
