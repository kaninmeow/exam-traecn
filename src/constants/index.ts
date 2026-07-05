export const STORAGE_KEYS = {
  PDF_FILES: 'exam_pdf_files',
  PDF_TEXT: 'exam_pdf_text_',
  AI_SUMMARY: 'exam_ai_summary_',
  QUESTIONS: 'exam_questions_',
  ANSWER_RECORDS: 'exam_answer_records',
  WRONG_QUESTIONS: 'exam_wrong_questions',
  FAVORITES: 'exam_favorites',
  CHAT_HISTORY: 'exam_chat_history_',
  STUDY_STATS: 'exam_study_stats',
  SETTINGS: 'exam_settings',
} as const;

export const DEFAULT_SETTINGS = {
  apiKey: '',
  apiBaseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  darkMode: false,
};

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  single: '单选题',
  multiple: '多选题',
  judge: '判断题',
  fill: '填空题',
  short: '简答题',
};

export const PRACTICE_MODES = [
  { key: 'sequential', label: '顺序练习', icon: 'ListOrdered' },
  { key: 'random', label: '随机练习', icon: 'Shuffle' },
  { key: 'chapter', label: '章节练习', icon: 'BookOpen' },
  { key: 'wrong', label: '错题练习', icon: 'XCircle' },
  { key: 'favorite', label: '收藏练习', icon: 'Star' },
] as const;

export type PracticeMode = typeof PRACTICE_MODES[number]['key'];