import { useParams } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import Card from '@/components/ui/Card';
import MarkdownViewer from '@/components/shared/MarkdownViewer';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { usePdfStore } from '@/stores/pdfStore';
import { useAi } from '@/hooks/useAi';
import type { ChatMessage } from '@/types/api';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage, saveToStorage } from '@/utils/storage';
import { cn } from '@/lib/utils';

export default function AiChat() {
  const { pdfId } = useParams<{ pdfId: string }>();
  const { pdfFiles } = usePdfStore();
  const { loading, askQuestion } = useAi();
  const pdf = pdfFiles.find((f) => f.id === pdfId);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (!pdfId) return [];
    return getFromStorage<ChatMessage[]>(STORAGE_KEYS.CHAT_HISTORY + pdfId, []);
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (pdfId) {
      saveToStorage(STORAGE_KEYS.CHAT_HISTORY + pdfId, messages);
    }
  }, [messages, pdfId]);

  const handleSend = async () => {
    if (!input.trim() || !pdfId || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    const history = newMessages.slice(-6);
    const reply = await askQuestion(pdfId, userMsg.content, history);
    if (reply) {
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!pdf) {
    return <div className="text-center py-20"><p className="text-gray-500">请先选择一个 PDF 文件</p></div>;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
          <Sparkles size={16} className="text-cyan-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-800">AI 问答</h2>
          <p className="text-xs text-gray-400 truncate max-w-[200px]">{pdf.name}</p>
        </div>
      </div>

      <Card className="flex-1 overflow-y-auto p-4 mb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">针对「{pdf.name}」提问</p>
            <p className="text-xs text-gray-300 mt-1">例如：第三章的重点是什么？</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-amber-600" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-xl px-4 py-3 text-sm',
                    msg.role === 'user'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-50 text-gray-800'
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <MarkdownViewer content={msg.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-blue-600" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-amber-600" />
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <LoadingSpinner size={16} text="思考中..." />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </Card>

      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入你的问题..."
          rows={1}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
