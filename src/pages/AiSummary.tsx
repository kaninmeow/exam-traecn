import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, BrainCircuit, BookOpen, Lightbulb, AlertTriangle, Network, FileText } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Skeleton from '@/components/ui/Skeleton';
import MarkdownViewer from '@/components/shared/MarkdownViewer';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { usePdfStore } from '@/stores/pdfStore';
import { useAi } from '@/hooks/useAi';
import type { AiSummary as AiSummaryType } from '@/types/pdf';

const summaryTabs = [
  { key: 'keyPoints', label: '高频考点' },
  { key: 'knowledgePoints', label: '必背知识' },
  { key: 'coreConcepts', label: '核心概念' },
  { key: 'easyMistakes', label: '易错点' },
  { key: 'mindMap', label: '思维导图' },
  { key: 'chapterSummaries', label: '章节总结' },
];

export default function AiSummary() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pdfFiles, getSummary, saveSummary } = usePdfStore();
  const { loading, error, generateSummary } = useAi();
  const [activeTab, setActiveTab] = useState('keyPoints');
  const [summary, setSummary] = useState<AiSummaryType | null>(null);

  const pdf = pdfFiles.find((f) => f.id === id);

  useEffect(() => {
    if (id) {
      const cached = getSummary(id);
      if (cached) setSummary(cached);
    }
  }, [id, getSummary]);

  const handleGenerate = async () => {
    if (!id) return;
    const result = await generateSummary(id);
    if (!result) return;

    const parseSection = (text: string, header: string): string[] => {
      const regex = new RegExp(`## ${header}[\\s\\S]*?(?=## |$)`);
      const match = text.match(regex);
      if (!match) return [];
      return match[0]
        .split('\n')
        .filter((line) => line.startsWith('- ') || line.startsWith('* '))
        .map((line) => line.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean);
    };

    const newSummary: AiSummaryType = {
      pdfId: id,
      keyPoints: parseSection(result, '高频考点'),
      knowledgePoints: parseSection(result, '必背知识'),
      coreConcepts: parseSection(result, '核心概念'),
      easyMistakes: parseSection(result, '易错点'),
      mindMap: result.match(/## 思维导图[\s\S]*?(?=## |$)/)?.[0]?.replace(/## 思维导图\s*/, '') || '',
      chapterSummaries: [],
      generatedAt: Date.now(),
    };

    const chapterMatch = result.match(/## 章节总结[\s\S]*/);
    if (chapterMatch) {
      const chapters = chapterMatch[0].split(/###\s+/).filter(Boolean);
      newSummary.chapterSummaries = chapters.map((ch) => {
        const lines = ch.split('\n').filter(Boolean);
        return { chapter: lines[0]?.trim() || '', summary: lines.slice(1).join('\n').trim() };
      });
    }

    saveSummary(id, newSummary);
    setSummary(newSummary);
  };

  if (!pdf) {
    return <div className="text-center py-20"><p className="text-gray-500">PDF 未找到</p></div>;
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      );
    }

    if (!summary) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-amber-600" />
          </div>
          <p className="text-sm text-gray-500 mb-4">点击下方按钮，AI 将为你提炼考试重点</p>
          <Button onClick={handleGenerate}>
            <Sparkles size={16} className="mr-1.5" />
            生成考试重点
          </Button>
        </div>
      );
    }

    const contentMap: Record<string, React.ReactNode> = {
      keyPoints: (
        <ul className="space-y-2">
          {summary.keyPoints.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="w-5 h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
              {item}
            </li>
          ))}
        </ul>
      ),
      knowledgePoints: (
        <ul className="space-y-2">
          {summary.knowledgePoints.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <Lightbulb size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      ),
      coreConcepts: (
        <ul className="space-y-2">
          {summary.coreConcepts.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <BookOpen size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      ),
      easyMistakes: (
        <ul className="space-y-2">
          {summary.easyMistakes.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      ),
      mindMap: <MarkdownViewer content={summary.mindMap || '暂无思维导图数据'} />,
      chapterSummaries: summary.chapterSummaries.length > 0 ? (
        <div className="space-y-4">
          {summary.chapterSummaries.map((ch, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">{ch.chapter}</h4>
              <MarkdownViewer content={ch.summary} />
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-gray-400">暂无章节总结数据</p>,
    };

    return contentMap[activeTab] || null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800 truncate">{pdf.name} - AI 总结</h2>
        {summary && (
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
            <RefreshCw size={14} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
            重新生成
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <Card className="p-5">
        <Tabs tabs={summaryTabs} activeKey={activeTab} onChange={setActiveTab} className="mb-5" />
        {renderContent()}
      </Card>

      {summary && (
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(`/pdf/${id}/generate`)}>
            <BrainCircuit size={16} className="mr-1.5" />生成练习题
          </Button>
          <Button variant="outline" onClick={() => navigate(`/chat/${id}`)}>
            <FileText size={16} className="mr-1.5" />AI 问答
          </Button>
        </div>
      )}
    </div>
  );
}
