import { useState } from 'react';
import { CheckCircle2, XCircle, Star, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Question } from '@/types/question';
import { useQuestionStore } from '@/stores/questionStore';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';

interface QuestionCardProps {
  question: Question;
  showAnswer?: boolean;
  onReExplain?: (question: Question) => void;
}

export default function QuestionCard({ question, showAnswer = false, onReExplain }: QuestionCardProps) {
  const { isFavorite, toggleFavorite } = useQuestionStore();
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>(
    question.type === 'multiple' ? [] : ''
  );
  const [revealed, setRevealed] = useState(showAnswer);
  const isFav = isFavorite(question.id);

  const handleOptionClick = (option: string) => {
    if (revealed) return;
    if (question.type === 'multiple') {
      const current = Array.isArray(selectedAnswer) ? selectedAnswer : [];
      const letter = option.charAt(0);
      setSelectedAnswer(
        current.includes(letter) ? current.filter((a) => a !== letter) : [...current, letter]
      );
    } else {
      setSelectedAnswer(option.charAt(0));
    }
  };

  const handleCheck = () => {
    setRevealed(true);
  };

  const getOptionClass = (option: string) => {
    if (!revealed) {
      const letter = option.charAt(0);
      const isSelected = Array.isArray(selectedAnswer)
        ? selectedAnswer.includes(letter)
        : selectedAnswer === letter;
      return isSelected ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
    }

    const letter = option.charAt(0);
    const correctAnswers = Array.isArray(question.answer)
      ? question.answer
      : [question.answer];
    const isCorrect = correctAnswers.includes(letter);
    const userSelected = Array.isArray(selectedAnswer)
      ? selectedAnswer.includes(letter)
      : selectedAnswer === letter;

    if (isCorrect) return 'border-emerald-500 bg-emerald-50 text-emerald-800';
    if (userSelected && !isCorrect) return 'border-red-400 bg-red-50 text-red-700';
    return 'border-gray-200 opacity-60';
  };

  const isCorrectAnswer = () => {
    if (!revealed) return null;
    const correctAnswers = Array.isArray(question.answer)
      ? question.answer.sort()
      : [question.answer];
    const userAns = Array.isArray(selectedAnswer)
      ? [...selectedAnswer].sort()
      : [selectedAnswer];
    return JSON.stringify(correctAnswers) === JSON.stringify(userAns);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Tag variant={question.type === 'single' ? 'info' : question.type === 'multiple' ? 'warning' : question.type === 'judge' ? 'success' : 'default'}>
            {question.type === 'single' ? '单选' : question.type === 'multiple' ? '多选' : question.type === 'judge' ? '判断' : question.type === 'fill' ? '填空' : '简答'}
          </Tag>
          {question.chapter && <Tag>{question.chapter}</Tag>}
        </div>
        <button
          onClick={() => toggleFavorite(question.id)}
          className={cn('p-1.5 rounded-lg transition-colors', isFav ? 'text-amber-500' : 'text-gray-300 hover:text-gray-400')}
        >
          <Star size={18} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>

      <p className="text-gray-800 font-medium mb-4 leading-relaxed">{question.question}</p>

      {question.options && question.options.length > 0 && (
        <div className="space-y-2 mb-4">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(option)}
              disabled={revealed}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors duration-200',
                getOptionClass(option)
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {(question.type === 'fill' || question.type === 'short') && !revealed && (
        <div className="mb-4">
          <textarea
            value={Array.isArray(selectedAnswer) ? selectedAnswer.join(', ') : selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            placeholder="请输入你的答案..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 min-h-[80px] resize-y"
          />
        </div>
      )}

      {!revealed && (
        <Button onClick={handleCheck} className="w-full">
          确认答案
        </Button>
      )}

      {revealed && (
        <div className="mt-4 space-y-3">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
              isCorrectAnswer() ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            )}
          >
            {isCorrectAnswer() ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {isCorrectAnswer() ? '回答正确！' : '回答错误'}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-1">正确答案</p>
            <p className="text-sm text-amber-600 font-semibold">
              {Array.isArray(question.answer) ? question.answer.join(', ') : question.answer}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-1">解析</p>
            <p className="text-sm text-gray-600 leading-relaxed">{question.explanation}</p>
          </div>

          {onReExplain && (
            <Button variant="outline" size="sm" onClick={() => onReExplain(question)}>
              <RotateCcw size={14} className="mr-1.5" />
              AI 重新讲解
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
