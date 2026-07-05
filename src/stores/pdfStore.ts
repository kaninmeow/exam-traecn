import { create } from 'zustand';
import type { PdfFile, AiSummary } from '@/types/pdf';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage, saveToStorage } from '@/utils/storage';

interface PdfState {
  pdfFiles: PdfFile[];
  currentPdfId: string | null;
  addPdfFile: (file: PdfFile) => void;
  removePdfFile: (id: string) => void;
  updatePdfFile: (id: string, partial: Partial<PdfFile>) => void;
  setCurrentPdfId: (id: string | null) => void;
  getCurrentPdf: () => PdfFile | undefined;
  getSummary: (pdfId: string) => AiSummary | null;
  saveSummary: (pdfId: string, summary: AiSummary) => void;
}

export const usePdfStore = create<PdfState>((set, get) => ({
  pdfFiles: getFromStorage<PdfFile[]>(STORAGE_KEYS.PDF_FILES, []),
  currentPdfId: null,

  addPdfFile: (file) => {
    const newFiles = [...get().pdfFiles, file];
    saveToStorage(STORAGE_KEYS.PDF_FILES, newFiles);
    set({ pdfFiles: newFiles });
  },

  removePdfFile: (id) => {
    const newFiles = get().pdfFiles.filter((f) => f.id !== id);
    saveToStorage(STORAGE_KEYS.PDF_FILES, newFiles);
    localStorage.removeItem(STORAGE_KEYS.PDF_TEXT + id);
    localStorage.removeItem(STORAGE_KEYS.AI_SUMMARY + id);
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS + id);
    set({ pdfFiles: newFiles, currentPdfId: get().currentPdfId === id ? null : get().currentPdfId });
  },

  updatePdfFile: (id, partial) => {
    const newFiles = get().pdfFiles.map((f) => (f.id === id ? { ...f, ...partial } : f));
    saveToStorage(STORAGE_KEYS.PDF_FILES, newFiles);
    set({ pdfFiles: newFiles });
  },

  setCurrentPdfId: (id) => set({ currentPdfId: id }),

  getCurrentPdf: () => {
    const { pdfFiles, currentPdfId } = get();
    return pdfFiles.find((f) => f.id === currentPdfId);
  },

  getSummary: (pdfId) => {
    return getFromStorage<AiSummary | null>(STORAGE_KEYS.AI_SUMMARY + pdfId, null);
  },

  saveSummary: (pdfId, summary) => {
    saveToStorage(STORAGE_KEYS.AI_SUMMARY + pdfId, summary);
  },
}));
