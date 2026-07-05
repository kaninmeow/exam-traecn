import { useNavigate } from 'react-router-dom';
import { Star, Play, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import { useQuestionStore } from '@/stores/questionStore';
import { usePdfStore } from '@/stores/pdfStore';
import { QUESTION_TYPE_LABELS } from '@/constants';

export default function Favorites() {
  const navigate = useNavigate();
  const { getFavoriteQuestions, toggleFavorite } = useQuestionStore();
  const { pdfFiles } = usePdfStore();
  const favQuestions = getFavoriteQuestions();

  if (favQuestions.length === 0) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Star size={28} className="text-amber-400" />
        </div>
        <p className="text-sm text-gray-500 mb-1">暂无收藏题目</p>
        <p className="text-xs text-gray-400">在刷题时点击星标收藏重要题目</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">收藏夹 ({favQuestions.length})</h2>
      </div>

      <div className="space-y-3">
        {favQuestions.map((q, i) => {
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
                <button onClick={() => toggleFavorite(q.id)} className="p-1 text-amber-500 hover:text-red-500 transition-colors">
                  <Star size={14} fill="currentColor" />
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
                <p className="text-xs font-medium text-gray-600 mb-1">答案: <span className="text-amber-600">{Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}</span></p>
                <p className="text-xs text-gray-500">{q.explanation}</p>
              </div>

              {pdf && (
                <Button variant="outline" size="sm" onClick={() => navigate(`/practice/${q.pdfId}/favorite`)}>
                  <Play size={12} className="mr-1" />练习收藏题
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
