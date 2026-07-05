import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Star, BookOpen, RotateCcw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import { usePractice } from '@/hooks/usePractice';
import { useQuestionStore } from '@/stores/questionStore';
import { useAi } from '@/hooks/useAi';
import { cn } from '@/lib/utils';
import { QUESTION_TYPE_LABELS, PRACTICE_MODES, type PracticeMode } from '@/constants';
import MarkdownViewer from '@/components/shared/MarkdownViewer';

export default function Practice() {
  const { pdfId, mode } = useParams<{ pdfId: string; mode?: string }>();
  const navigate = useNavigate();
  const practiceMode = (mode as PracticeMode) || 'sequential';
  const { reExplain } = useAi();
  const { toggleFavorite, isFavorite } = useQuestionStore();

  const {
    questions,
    currentIndex,
    currentQuestion,
    userAnswer,
    setUserAnswer,
    answered,
    correctCount,
    checkAnswer,
    nextQuestion,
    totalQuestions,
    isLast,
  } = usePractice(pdfId || '', practiceMode);

  const [reExplanation, setReExplanation] = useState<string | null>(null);
  const [reExplainLoading, setReExplainLoading] = useState(false);

  if (!pdfId) {
    return <div className="text-center py-20"><p className="text-gray-500">参数错误</p></div>;
  }

  if (totalQuestions === 0) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen size={28} className="text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {practiceMode === 'wrong' ? '还没有错题' : practiceMode === 'favorite' ? '还没有收藏题目' : '还没有生成题目'}
        </p>
        <Button onClick={() => navigate(`/pdf/${pdfId}/generate`)}>
          生成题目
        </Button>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const handleOptionClick = (option: string) => {
    if (answered) return;
    if (currentQuestion.type === 'multiple') {
      const current = Array.isArray(userAnswer) ? userAnswer : [];
      const letter = option.charAt(0);
      setUserAnswer(current.includes(letter) ? current.filter((a) => a !== letter) : [...current, letter]);
    } else {
      setUserAnswer(option.charAt(0));
    }
  };

  const getOptionClass = (option: string) => {
    const letter = option.charAt(0);
    if (!answered) {
      const isSelected = Array.isArray(userAnswer) ? userAnswer.includes(letter) : userAnswer === letter;
      return isSelected ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
    }
    const correctAnswers = Array.isArray(currentQuestion.answer) ? currentQuestion.answer : [currentQuestion.answer];
    const isCorrect = correctAnswers.includes(letter);
    const userSelected = Array.isArray(userAnswer) ? userAnswer.includes(letter) : userAnswer === letter;
    if (isCorrect) return 'border-emerald-500 bg-emerald-50 text-emerald-800';
    if (userSelected && !isCorrect) return 'border-red-400 bg-red-50 text-red-700';
    return 'border-gray-200 opacity-60';
  };

  const isCorrect = (() => {
    if (!answered) return null;
    const correctAnswers = Array.isArray(currentQuestion.answer) ? currentQuestion.answer.sort() : [currentQuestion.answer];
    const userAns = Array.isArray(userAnswer) ? [...userAnswer].sort() : [userAnswer];
    return JSON.stringify(correctAnswers) === JSON.stringify(userAns);
  })();

  const handleReExplain = async () => {
    if (!currentQuestion) return;
    setReExplainLoading(true);
    const result = await reExplain(
      currentQuestion.question,
      Array.isArray(currentQuestion.answer) ? currentQuestion.answer.join(', ') : currentQuestion.answer,
      currentQuestion.explanation
    );
    if (result) setReExplanation(result);
    setReExplainLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag>{PRACTICE_MODES.find((m) => m.key === practiceMode)?.label || '练习'}</Tag>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-emerald-600 font-medium">{correctCount} 正确</span>
          <button
            onClick={() => toggleFavorite(currentQuestion.id)}
            className={cn('p-1.5 rounded-lg', isFavorite(currentQuestion.id) ? 'text-amber-500' : 'text-gray-300 hover:text-gray-400')}
          >
            <Star size={18} fill={isFavorite(currentQuestion.id) ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Tag variant="info">{QUESTION_TYPE_LABELS[currentQuestion.type]}</Tag>
          {currentQuestion.chapter && <Tag>{currentQuestion.chapter}</Tag>}
        </div>

        <p className="text-gray-800 font-medium mb-4 leading-relaxed">{currentQuestion.question}</p>

        {currentQuestion.options && currentQuestion.options.length > 0 && (
          <div className="space-y-2 mb-4">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                disabled={answered}
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

        {(currentQuestion.type === 'fill' || currentQuestion.type === 'short') && !answered && (
          <textarea
            value={Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="请输入你的答案..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 min-h-[80px] resize-y mb-4"
          />
        )}

        {!answered && (
          <Button onClick={checkAnswer} className="w-full">确认答案</Button>
        )}

        {answered && (
          <div className="space-y-3 mt-4">
            <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium', isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
              {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {isCorrect ? '回答正确！' : '回答错误'}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-1">正确答案</p>
              <p className="text-sm text-amber-600 font-semibold">
                {Array.isArray(currentQuestion.answer) ? currentQuestion.answer.join(', ') : currentQuestion.answer}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-1">解析</p>
              <p className="text-sm text-gray-600 leading-relaxed">{currentQuestion.explanation}</p>
            </div>

            {reExplanation && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-700 mb-2">AI 重新讲解</p>
                <MarkdownViewer content={reExplanation} />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleReExplain} disabled={reExplainLoading}>
                <RotateCcw size={14} className={`mr-1 ${reExplainLoading ? 'animate-spin' : ''}`} />
                AI 重新讲解
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={16} className="mr-1" />上一题
        </Button>
        {answered && (
          isLast ? (
            <Button onClick={() => navigate(`/pdf/${pdfId}`)}>
              练习完成！查看结果
            </Button>
          ) : (
            <Button onClick={nextQuestion}>
              下一题 <ChevronRight size={16} className="ml-1" />
            </Button>
          )
        )}
      </div>
    </div>
  );
}
