import { useCallback, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfUploaderProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

export default function PdfUploader({ onUpload, disabled, className }: PdfUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        onUpload(file);
      }
    },
    [onUpload, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [onUpload]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        'border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition-colors duration-200',
        'hover:border-amber-400 hover:bg-amber-50/30',
        disabled && 'opacity-50 cursor-not-allowed hover:border-gray-300 hover:bg-transparent',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
          <Upload size={24} className="text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">
            拖拽 PDF 文件到此处，或点击选择文件
          </p>
          <p className="text-xs text-gray-400 mt-1">支持 .pdf 格式</p>
        </div>
      </div>
    </div>
  );
}
