import { create } from 'zustand';
import type { Question, AnswerRecord } from '@/types/question';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage, saveToStorage } from '@/utils/storage';

interface QuestionState {
  questions: Record<string, Question[]>;
  answerRecords: AnswerRecord[];
  wrongQuestionIds: string[];
  favoriteIds: string[];

  getQuestions: (pdfId: string) => Question[];
  saveQuestions: (pdfId: string, questions: Question[]) => void;

  addAnswerRecord: (record: AnswerRecord) => void;
  getRecordsByPdf: (pdfId: string) => AnswerRecord[];

  toggleWrong: (questionId: string) => void;
  isWrong: (questionId: string) => boolean;
  getWrongQuestions: () => Question[];

  toggleFavorite: (questionId: string) => void;
  isFavorite: (questionId: string) => boolean;
  getFavoriteQuestions: () => Question[];

  getAllQuestions: () => Question[];
}

export const useQuestionStore = create<QuestionState>((set, get) => ({
  questions: {},
  answerRecords: getFromStorage<AnswerRecord[]>(STORAGE_KEYS.ANSWER_RECORDS, []),
  wrongQuestionIds: getFromStorage<string[]>(STORAGE_KEYS.WRONG_QUESTIONS, []),
  favoriteIds: getFromStorage<string[]>(STORAGE_KEYS.FAVORITES, []),

  getQuestions: (pdfId) => {
    if (get().questions[pdfId]) return get().questions[pdfId];
    const stored = getFromStorage<Question[]>(STORAGE_KEYS.QUESTIONS + pdfId, []);
    if (stored.length > 0) {
      set((s) => ({ questions: { ...s.questions, [pdfId]: stored } }));
    }
    return stored;
  },

  saveQuestions: (pdfId, questions) => {
    saveToStorage(STORAGE_KEYS.QUESTIONS + pdfId, questions);
    set((s) => ({ questions: { ...s.questions, [pdfId]: questions } }));
  },

  addAnswerRecord: (record) => {
    const newRecords = [...get().answerRecords, record];
    saveToStorage(STORAGE_KEYS.ANSWER_RECORDS, newRecords);
    set({ answerRecords: newRecords });

    if (!record.isCorrect) {
      const { wrongQuestionIds } = get();
      if (!wrongQuestionIds.includes(record.questionId)) {
        const newWrong = [...wrongQuestionIds, record.questionId];
        saveToStorage(STORAGE_KEYS.WRONG_QUESTIONS, newWrong);
        set({ wrongQuestionIds: newWrong });
      }
    }
  },

  getRecordsByPdf: (pdfId) => {
    return get().answerRecords.filter((r) => r.pdfId === pdfId);
  },

  toggleWrong: (questionId) => {
    const { wrongQuestionIds } = get();
    const newWrong = wrongQuestionIds.includes(questionId)
      ? wrongQuestionIds.filter((id) => id !== questionId)
      : [...wrongQuestionIds, questionId];
    saveToStorage(STORAGE_KEYS.WRONG_QUESTIONS, newWrong);
    set({ wrongQuestionIds: newWrong });
  },

  isWrong: (questionId) => get().wrongQuestionIds.includes(questionId),

  getWrongQuestions: () => {
    const all = get().getAllQuestions();
    return all.filter((q) => get().wrongQuestionIds.includes(q.id));
  },

  toggleFavorite: (questionId) => {
    const { favoriteIds } = get();
    const newFav = favoriteIds.includes(questionId)
      ? favoriteIds.filter((id) => id !== questionId)
      : [...favoriteIds, questionId];
    saveToStorage(STORAGE_KEYS.FAVORITES, newFav);
    set({ favoriteIds: newFav });
  },

  isFavorite: (questionId) => get().favoriteIds.includes(questionId),

  getFavoriteQuestions: () => {
    const all = get().getAllQuestions();
    return all.filter((q) => get().favoriteIds.includes(q.id));
  },

  getAllQuestions: () => {
    const { questions } = get();
    const all: Question[] = [];
    for (const key of Object.keys(questions)) {
      all.push(...questions[key]);
    }
    if (all.length === 0) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_KEYS.QUESTIONS)) {
          const stored = getFromStorage<Question[]>(key, []);
          all.push(...stored);
        }
      }
    }
    return all;
  },
}));
