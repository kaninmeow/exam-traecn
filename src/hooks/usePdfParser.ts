import { useCallback, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { generateId } from '@/utils/id';
import { usePdfStore } from '@/stores/pdfStore';
import { STORAGE_KEYS } from '@/constants';
import { saveToStorage } from '@/utils/storage';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export function usePdfParser() {
  const [parsing, setParsing] = useState(false);
  const { addPdfFile, updatePdfFile } = usePdfStore();

  const parsePdf = useCallback(async (file: File) => {
    const id = generateId();
    const blobUrl = URL.createObjectURL(file);

    addPdfFile({
      id,
      name: file.name,
      size: file.size,
      uploadTime: Date.now(),
      status: 'parsing',
      blobUrl,
    });

    setParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ');
        fullText += pageText + '\n\n';
      }

      saveToStorage(STORAGE_KEYS.PDF_TEXT + id, fullText);
      updatePdfFile(id, { status: 'ready', pageCount: pdf.numPages });
      return id;
    } catch (error) {
      console.error('PDF parse error:', error);
      updatePdfFile(id, { status: 'error' });
      return null;
    } finally {
      setParsing(false);
    }
  }, [addPdfFile, updatePdfFile]);

  return { parsePdf, parsing };
}
