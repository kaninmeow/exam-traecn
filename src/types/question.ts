export type QuestionType = 'single' | 'multiple' | 'judge' | 'fill' | 'short';

export interface Question {
  id: string;
  pdfId: string;
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string | string[];
  explanation: string;
  chapter: string;
}

export interface AnswerRecord {
  questionId: string;
  pdfId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  answeredAt: number;
  timeSpent: number;
}