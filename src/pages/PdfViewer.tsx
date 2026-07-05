import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, BrainCircuit, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import { usePdfStore } from '@/stores/pdfStore';

export default function PdfViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pdfFiles } = usePdfStore();
  const pdf = pdfFiles.find((f) => f.id === id);

  if (!pdf) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">PDF 文件未找到</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-base font-semibold text-gray-800 flex-1 min-w-0 truncate">{pdf.name}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/pdf/${id}/summary`)}>
            <Sparkles size={14} className="mr-1" />AI 总结
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/pdf/${id}/generate`)}>
            <BrainCircuit size={14} className="mr-1" />生成题目
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/chat/${id}`)}>
            <MessageSquare size={14} className="mr-1" />AI 问答
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {pdf.blobUrl ? (
          <iframe
            src={pdf.blobUrl}
            className="w-full h-[calc(100vh-200px)]"
            title={pdf.name}
          />
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p>PDF 预览不可用</p>
          </div>
        )}
      </div>
    </div>
  );
}
