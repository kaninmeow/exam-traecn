export interface StudyStats {
  todayStudyTime: number;
  todayCompletedCount: number;
  totalCorrectRate: number;
  streakDays: number;
  chapterMastery: { chapter: string; rate: number }[];
  weeklyData: { date: string; count: number; correctRate: number }[];
  dailyRecords: { date: string; studyTime: number; completedCount: number; correctCount: number }[];
}

export interface DailyRecord {
  date: string;
  studyTime: number;
  completedCount: number;
  correctCount: number;
}