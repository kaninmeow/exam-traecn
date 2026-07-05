import { useMemo } from 'react';
import { useStudyStore } from '@/stores/studyStore';
import { useQuestionStore } from '@/stores/questionStore';
import { getToday } from '@/utils/format';

export function useStudyStats() {
  const { stats } = useStudyStore();
  const { answerRecords } = useQuestionStore();

  const todayStr = getToday();

  const todayRecords = useMemo(
    () => answerRecords.filter((r) => {
      const d = new Date(r.answeredAt);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return dateStr === todayStr;
    }),
    [answerRecords, todayStr]
  );

  const weeklyChartData = useMemo(() => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
    return days.map((date) => {
      const record = stats.dailyRecords.find((r) => r.date === date);
      const dayRecords = answerRecords.filter((r) => {
        const d = new Date(r.answeredAt);
        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return ds === date;
      });
      const correct = dayRecords.filter((r) => r.isCorrect).length;
      return {
        date: date.slice(5),
        count: record?.completedCount || 0,
        correctRate: dayRecords.length > 0 ? correct / dayRecords.length : 0,
        studyTime: record?.studyTime || 0,
      };
    });
  }, [stats.dailyRecords, answerRecords]);

  return {
    stats,
    todayRecords,
    weeklyChartData,
    todayStudyTime: stats.todayStudyTime,
    todayCompletedCount: stats.todayCompletedCount,
    totalCorrectRate: stats.totalCorrectRate,
    streakDays: stats.streakDays,
  };
}
