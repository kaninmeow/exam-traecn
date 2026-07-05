import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, BrainCircuit, BookOpen, Lightbulb, AlertTriangle, FileText } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Skeleton from '@/components/ui/Skeleton';
import MarkdownViewer from '@/components/shared/MarkdownViewer';
import MindMap from '@/components/shared/MindMap';
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
  const { loading, error, generateSummary, generateMindMap } = useAi();
  const [activeTab, setActiveTab] = useState('keyPoints');
  const [summary, setSummary] = useState<AiSummaryType | null>(null);
  const [mindMapLoading, setMindMapLoading] = useState(false);

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

    /** 提取 ## 标题下的原始 markdown 文本（去掉标题行本身） */
    const extractSection = (text: string, header: string): string => {
      // 匹配 ## 标题 到下一个 ## 标题或结尾
      const regex = new RegExp(`##\\s*${header}[\\s\\S]*?(?=\\n##\\s|$)`);
      const match = text.match(regex);
      if (!match) return '';
      return match[0].replace(new RegExp(`^##\\s*${header}\\s*`), '').trim();
    };

    const parseItems = (sectionMd: string): string[] => {
      return sectionMd
        .split('\n')
        .filter((line) => line.match(/^\s*[-*]\s+/) || line.match(/^\s*\d+\.\s+/))
        .map((line) => line.replace(/^\s*[-*\d.]\s+/, '').trim())
        .filter(Boolean);
    };

    const rawKP = extractSection(result, '高频考点');
    const rawKN = extractSection(result, '必背知识');
    const rawCC = extractSection(result, '核心概念');
    const rawEM = extractSection(result, '易错点');
    const rawMM = extractSection(result, '思维导图');
    const rawCS = extractSection(result, '章节总结');

    const chapterMatch = result.match(/## 章节总结[\s\S]*/);
    const chapterSummaries: { chapter: string; summary: string }[] = [];
    if (chapterMatch) {
      const chapters = chapterMatch[0].replace(/^## 章节总结\s*/, '').split(/###\s+/).filter(Boolean);
      for (const ch of chapters) {
        const lines = ch.split('\n').filter(Boolean);
        chapterSummaries.push({
          chapter: lines[0]?.trim() || '',
          summary: lines.slice(1).join('\n').trim(),
        });
      }
    }

    const newSummary: AiSummaryType = {
      pdfId: id,
      keyPoints: parseItems(rawKP),
      knowledgePoints: parseItems(rawKN),
      coreConcepts: parseItems(rawCC),
      easyMistakes: parseItems(rawEM),
      mindMap: rawMM,
      chapterSummaries,
      rawSections: {
        keyPoints: rawKP,
        knowledgePoints: rawKN,
        coreConcepts: rawCC,
        easyMistakes: rawEM,
        mindMap: rawMM,
        chapterSummaries: rawCS,
      },
      generatedAt: Date.now(),
    };

    saveSummary(id, newSummary);
    setSummary(newSummary);
  };

  /** 单独重新生成思维导图 */
  const handleRegenerateMindMap = async () => {
    if (!id || !summary) return;
    setMindMapLoading(true);
    const result = await generateMindMap(id);
    if (result) {
      const updatedSummary = {
        ...summary,
        mindMap: result,
        rawSections: {
          ...summary.rawSections,
          mindMap: result,
        },
      };
      saveSummary(id, updatedSummary);
      setSummary(updatedSummary);
    }
    setMindMapLoading(false);
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

    const sectionIcons: Record<string, React.ReactNode> = {
      keyPoints: <Sparkles size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />,
      knowledgePoints: <Lightbulb size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />,
      coreConcepts: <BookOpen size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />,
      easyMistakes: <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />,
    };

    /** 优先使用 rawSections 的原始 markdown 渲染，兼容旧数据回退到数组 */
    const renderMarkdownSection = (key: keyof typeof sectionIcons) => {
      const rawMd = summary.rawSections?.[key];
      if (rawMd) {
        return <MarkdownViewer content={rawMd} />;
      }
      // 兼容旧缓存数据（没有 rawSections 的情况）
      const items = summary[key as keyof AiSummaryType] as string[];
      if (!Array.isArray(items) || items.length === 0) {
        return <p className="text-sm text-gray-400">暂无数据</p>;
      }
      return (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              {sectionIcons[key]}
              {item}
            </li>
          ))}
        </ul>
      );
    };

    const contentMap: Record<string, React.ReactNode> = {
      keyPoints: renderMarkdownSection('keyPoints'),
      knowledgePoints: renderMarkdownSection('knowledgePoints'),
      coreConcepts: renderMarkdownSection('coreConcepts'),
      easyMistakes: renderMarkdownSection('easyMistakes'),
      mindMap: (
        <div>
          <div className="flex justify-end mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateMindMap}
              disabled={mindMapLoading || loading}
            >
              <RefreshCw size={12} className={`mr-1 ${(mindMapLoading || loading) ? 'animate-spin' : ''}`} />
              {mindMapLoading ? '生成中...' : '重新生成思维导图'}
            </Button>
          </div>
          {mindMapLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <MindMap markdown={summary.rawSections?.mindMap || summary.mindMap || ''} />
          )}
        </div>
      ),
      chapterSummaries: summary.chapterSummaries.length > 0 ? (
        <div className="space-y-4">
          {summary.chapterSummaries.map((ch, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">{ch.chapter}</h4>
              <MarkdownViewer content={ch.summary} />
            </div>
          ))}
        </div>
      ) : summary.rawSections?.chapterSummaries ? (
        <MarkdownViewer content={summary.rawSections.chapterSummaries} />
      ) : (
        <p className="text-sm text-gray-400">暂无章节总结数据</p>
      ),
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
