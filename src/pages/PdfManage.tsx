import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Eye, Sparkles, BrainCircuit, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import PdfUploader from '@/components/shared/PdfUploader';
import { usePdfParser } from '@/hooks/usePdfParser';
import { usePdfStore } from '@/stores/pdfStore';
import { formatFileSize, formatDateTime } from '@/utils/format';

export default function PdfManage() {
  const navigate = useNavigate();
  const { parsePdf, parsing } = usePdfParser();
  const { pdfFiles, removePdfFile } = usePdfStore();

  const handleUpload = useCallback(
    async (file: File) => {
      const id = await parsePdf(file);
      if (id) {
        navigate(`/pdf/${id}/summary`);
      }
    },
    [parsePdf, navigate]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      removePdfFile(id);
    },
    [removePdfFile]
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PdfUploader onUpload={handleUpload} disabled={parsing} />

      {pdfFiles.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">还没有上传任何 PDF 文件</p>
          <p className="text-xs text-gray-400 mt-1">上传 PDF 题库开始学习吧</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-800">已上传文件 ({pdfFiles.length})</h2>
          {pdfFiles.map((pdf) => (
            <Card key={pdf.id} hover className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{pdf.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{formatFileSize(pdf.size)}</span>
                    {pdf.pageCount && <span className="text-xs text-gray-400">{pdf.pageCount} 页</span>}
                    <span className="text-xs text-gray-400">{formatDateTime(pdf.uploadTime)}</span>
                  </div>
                </div>
                <Tag
                  variant={pdf.status === 'ready' ? 'success' : pdf.status === 'error' ? 'danger' : 'warning'}
                >
                  {pdf.status === 'ready' ? '已就绪' : pdf.status === 'error' ? '解析失败' : pdf.status === 'parsing' ? '解析中' : '上传中'}
                </Tag>
              </div>

              {pdf.status === 'ready' && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/pdf/${pdf.id}`)}>
                    <Eye size={14} className="mr-1" />预览
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/pdf/${pdf.id}/summary`)}>
                    <Sparkles size={14} className="mr-1" />AI 总结
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/pdf/${pdf.id}/generate`)}>
                    <BrainCircuit size={14} className="mr-1" />生成题目
                  </Button>
                  <div className="flex-1" />
                  <Button variant="ghost" size="sm" onClick={(e) => handleDelete(e, pdf.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 size={14} className="mr-1" />删除
                  </Button>
                </div>
              )}

              {pdf.status === 'error' && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 text-red-500">
                  <AlertCircle size={14} />
                  <span className="text-xs">PDF 解析失败，请重新上传</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
