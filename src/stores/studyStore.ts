import { create } from 'zustand';
import type { StudyStats, DailyRecord } from '@/types/study';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage, saveToStorage } from '@/utils/storage';
import { getToday } from '@/utils/format';

interface StudyState {
  stats: StudyStats;
  updateStudyTime: (seconds: number) => void;
  recordAnswer: (isCorrect: boolean) => void;
  getTodayRecord: () => DailyRecord;
}

function ensureTodayRecord(stats: StudyStats): StudyStats {
  const today = getToday();
  const hasToday = stats.dailyRecords.some((r) => r.date === today);
  if (!hasToday) {
    return {
      ...stats,
      dailyRecords: [...stats.dailyRecords, { date: today, studyTime: 0, completedCount: 0, correctCount: 0 }],
    };
  }
  return stats;
}

function calculateStreak(records: DailyRecord[]): number {
  if (records.length === 0) return 0;
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = getToday();
  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - i);
    const expectedStr = `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(2, '0')}-${String(expected.getDate()).padStart(2, '0')}`;
    if (sorted[i]?.date === expectedStr && sorted[i]?.completedCount > 0) {
      streak++;
    } else if (i === 0 && sorted[i]?.date !== today) {
      break;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

const defaultStats: StudyStats = {
  todayStudyTime: 0,
  todayCompletedCount: 0,
  totalCorrectRate: 0,
  streakDays: 0,
  chapterMastery: [],
  weeklyData: [],
  dailyRecords: [{ date: getToday(), studyTime: 0, completedCount: 0, correctCount: 0 }],
};

export const useStudyStore = create<StudyState>((set, get) => ({
  stats: ensureTodayRecord(getFromStorage(STORAGE_KEYS.STUDY_STATS, defaultStats)),

  updateStudyTime: (seconds) => {
    set((state) => {
      const today = getToday();
      const stats = ensureTodayRecord(state.stats);
      const dailyRecords = stats.dailyRecords.map((r) =>
        r.date === today ? { ...r, studyTime: r.studyTime + seconds } : r
      );
      const todayRecord = dailyRecords.find((r) => r.date === today);
      const newStats: StudyStats = {
        ...stats,
        todayStudyTime: todayRecord?.studyTime || 0,
        dailyRecords,
        streakDays: calculateStreak(dailyRecords),
      };
      saveToStorage(STORAGE_KEYS.STUDY_STATS, newStats);
      return { stats: newStats };
    });
  },

  recordAnswer: (isCorrect) => {
    set((state) => {
      const today = getToday();
      const stats = ensureTodayRecord(state.stats);
      const dailyRecords = stats.dailyRecords.map((r) =>
        r.date === today
          ? {
              ...r,
              completedCount: r.completedCount + 1,
              correctCount: isCorrect ? r.correctCount + 1 : r.correctCount,
            }
          : r
      );
      const todayRecord = dailyRecords.find((r) => r.date === today);
      const totalCompleted = dailyRecords.reduce((s, r) => s + r.completedCount, 0);
      const totalCorrect = dailyRecords.reduce((s, r) => s + r.correctCount, 0);
      const newStats: StudyStats = {
        ...stats,
        todayStudyTime: todayRecord?.studyTime || 0,
        todayCompletedCount: todayRecord?.completedCount || 0,
        totalCorrectRate: totalCompleted > 0 ? totalCorrect / totalCompleted : 0,
        dailyRecords,
        streakDays: calculateStreak(dailyRecords),
      };
      saveToStorage(STORAGE_KEYS.STUDY_STATS, newStats);
      return { stats: newStats };
    });
  },

  getTodayRecord: () => {
    const today = getToday();
    const record = get().stats.dailyRecords.find((r) => r.date === today);
    return record || { date: today, studyTime: 0, completedCount: 0, correctCount: 0 };
  },
}));
