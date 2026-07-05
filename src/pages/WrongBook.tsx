import { useNavigate } from 'react-router-dom';
import { XCircle, Play, Trash2, RotateCcw, Download } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import { useQuestionStore } from '@/stores/questionStore';
import { usePdfStore } from '@/stores/pdfStore';
import { QUESTION_TYPE_LABELS } from '@/constants';
import { useAi } from '@/hooks/useAi';
import { useState } from 'react';
import MarkdownViewer from '@/components/shared/MarkdownViewer';

export default function WrongBook() {
  const navigate = useNavigate();
  const { getWrongQuestions, toggleWrong } = useQuestionStore();
  const { pdfFiles } = usePdfStore();
  const { reExplain } = useAi();
  const wrongQuestions = getWrongQuestions();
  const [reExplanation, setReExplanation] = useState<{ questionId: string; content: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReExplain = async (q: { id: string; question: string; answer: string | string[]; explanation: string }) => {
    setLoading(true);
    const result = await reExplain(q.question, Array.isArray(q.answer) ? q.answer.join(', ') : q.answer, q.explanation);
    if (result) setReExplanation({ questionId: q.id, content: result });
    setLoading(false);
  };

  const handleExport = () => {
    const text = wrongQuestions.map((q, i) => {
      return `${i + 1}. [${QUESTION_TYPE_LABELS[q.type]}] ${q.question}\n答案: ${Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}\n解析: ${q.explanation}\n`;
    }).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '错题本.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (wrongQuestions.length === 0) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <XCircle size={28} className="text-emerald-500" />
        </div>
        <p className="text-sm text-gray-500 mb-1">暂无错题</p>
        <p className="text-xs text-gray-400">继续努力，减少错误！</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">错题本 ({wrongQuestions.length})</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download size={14} className="mr-1" />导出
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {wrongQuestions.map((q, i) => {
          const pdf = pdfFiles.find((f) => f.id === q.pdfId);
          return (
            <Card key={q.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400">{i + 1}</span>
                  <Tag variant="info">{QUESTION_TYPE_LABELS[q.type]}</Tag>
                  {q.chapter && <Tag>{q.chapter}</Tag>}
                  {pdf && <Tag variant="default">{pdf.name}</Tag>}
                </div>
                <button onClick={() => toggleWrong(q.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>

              <p className="text-sm text-gray-800 mb-3 leading-relaxed">{q.question}</p>

              {q.options && (
                <div className="space-y-1 mb-3">
                  {q.options.map((opt, idx) => {
                    const letter = opt.charAt(0);
                    const isCorrect = Array.isArray(q.answer) ? q.answer.includes(letter) : q.answer === letter;
                    return (
                      <div key={idx} className={`text-xs px-3 py-1.5 rounded ${isCorrect ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-500'}`}>
                        {opt} {isCorrect ? '✓' : ''}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-xs font-medium text-gray-600 mb-1">正确答案: <span className="text-amber-600">{Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}</span></p>
                <p className="text-xs text-gray-500">{q.explanation}</p>
              </div>

              <div className="flex gap-2">
                {pdf && (
                  <Button variant="outline" size="sm" onClick={() => navigate(`/practice/${q.pdfId}/wrong`)}>
                    <Play size={12} className="mr-1" />再练一次
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleReExplain(q)} disabled={loading}>
                  <RotateCcw size={12} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />AI 讲解
                </Button>
              </div>

              {reExplanation?.questionId === q.id && (
                <div className="mt-3 bg-blue-50 rounded-lg p-3">
                  <MarkdownViewer content={reExplanation.content} />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
