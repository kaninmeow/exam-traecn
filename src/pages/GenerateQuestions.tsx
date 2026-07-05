import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { BrainCircuit, Play, Sparkles } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Skeleton from '@/components/ui/Skeleton';
import { usePdfStore } from '@/stores/pdfStore';
import { useQuestionStore } from '@/stores/questionStore';
import { useAi } from '@/hooks/useAi';
import { QUESTION_TYPE_LABELS } from '@/constants';
import { generateId } from '@/utils/id';
import type { Question, QuestionType } from '@/types/question';

const typeTabs = [
  { key: 'single', label: '单选题' },
  { key: 'multiple', label: '多选题' },
  { key: 'judge', label: '判断题' },
  { key: 'fill', label: '填空题' },
  { key: 'short', label: '简答题' },
];

export default function GenerateQuestions() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pdfFiles } = usePdfStore();
  const { saveQuestions, getQuestions } = useQuestionStore();
  const { loading, error, generateQuestions } = useAi();

  const [selectedTypes, setSelectedTypes] = useState<string[]>(['single']);
  const [count, setCount] = useState(5);
  const [generated, setGenerated] = useState<Question[]>([]);

  const pdf = pdfFiles.find((f) => f.id === id);
  const existingQuestions = id ? getQuestions(id) : [];

  const handleToggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleGenerate = async () => {
    if (!id || selectedTypes.length === 0) return;
    const result = await generateQuestions(id, selectedTypes, count);
    if (!result) return;

    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return;
      const parsed: Omit<Question, 'id' | 'pdfId'>[] = JSON.parse(jsonMatch[0]);
      const questions: Question[] = parsed.map((q) => ({
        ...q,
        id: generateId(),
        pdfId: id,
        type: q.type as QuestionType,
      }));
      const all = [...existingQuestions, ...questions];
      saveQuestions(id, all);
      setGenerated(questions);
    } catch (e) {
      console.error('Parse questions error:', e);
    }
  };

  if (!pdf) {
    return <div className="text-center py-20"><p className="text-gray-500">PDF 未找到</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-base font-semibold text-gray-800 truncate">{pdf.name} - 生成题目</h2>

      <Card className="p-5 space-y-5">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">选择题型</p>
          <div className="flex flex-wrap gap-2">
            {typeTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleToggleType(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedTypes.includes(tab.key)
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">生成数量</p>
          <div className="flex items-center gap-2">
            {[3, 5, 10, 15, 20].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  count === n ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <Button onClick={handleGenerate} disabled={loading || selectedTypes.length === 0}>
            {loading ? (
              <>
                <Sparkles size={16} className="mr-1.5 animate-pulse" />
                AI 生成中...
              </>
            ) : (
              <>
                <BrainCircuit size={16} className="mr-1.5" />
                生成题目
              </>
            )}
          </Button>
          {existingQuestions.length > 0 && (
            <Button variant="outline" onClick={() => navigate(`/practice/${id}/sequential`)}>
              <Play size={16} className="mr-1.5" />
              开始练习 ({existingQuestions.length} 题)
            </Button>
          )}
        </div>
      </Card>

      {loading && (
        <Card className="p-5 space-y-4">
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-3 w-3/4" />
        </Card>
      )}

      {generated.length > 0 && !loading && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">生成了 {generated.length} 道题目</p>
          {generated.map((q, i) => (
            <Card key={q.id} className="p-4">
              <p className="text-xs text-gray-400 mb-1">
                {i + 1}. {QUESTION_TYPE_LABELS[q.type]} · {q.chapter}
              </p>
              <p className="text-sm text-gray-800">{q.question}</p>
            </Card>
          ))}
          <Button onClick={() => navigate(`/practice/${id}/sequential`)} className="w-full">
            <Play size={16} className="mr-1.5" />
            开始刷题
          </Button>
        </div>
      )}
    </div>
  );
}
