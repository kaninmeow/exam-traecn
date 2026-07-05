import ReactECharts from 'echarts-for-react';
import { BarChart3, Clock, Target, Flame, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useStudyStats } from '@/hooks/useStudyStats';
import { useQuestionStore } from '@/stores/questionStore';
import { formatDuration } from '@/utils/format';

export default function Statistics() {
  const { stats, weeklyChartData, todayStudyTime, todayCompletedCount, totalCorrectRate, streakDays } = useStudyStats();
  const { wrongQuestionIds, answerRecords } = useQuestionStore();

  const weeklyBarOption = {
    tooltip: { trigger: 'axis' as const },
    xAxis: {
      type: 'category' as const,
      data: weeklyChartData.map((d) => d.date),
      axisLabel: { fontSize: 11, color: '#9ca3af' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { fontSize: 11, color: '#9ca3af' },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [
      {
        name: '完成题数',
        type: 'bar',
        data: weeklyChartData.map((d) => d.count),
        itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] },
        barWidth: '40%',
      },
    ],
    grid: { left: 40, right: 16, top: 16, bottom: 30 },
  };

  const rateLineOption = {
    tooltip: { trigger: 'axis' as const, formatter: '{b}: {c}%' },
    xAxis: {
      type: 'category' as const,
      data: weeklyChartData.map((d) => d.date),
      axisLabel: { fontSize: 11, color: '#9ca3af' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: {
      type: 'value' as const,
      max: 100,
      axisLabel: { fontSize: 11, color: '#9ca3af', formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [
      {
        name: '正确率',
        type: 'line',
        data: weeklyChartData.map((d) => Math.round(d.correctRate * 100)),
        smooth: true,
        lineStyle: { color: '#10b981', width: 2 },
        itemStyle: { color: '#10b981' },
        areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(16,185,129,0.15)' }, { offset: 1, color: 'rgba(16,185,129,0)' }] } },
      },
    ],
    grid: { left: 45, right: 16, top: 16, bottom: 30 },
  };

  const typePieData = (() => {
    const counts: Record<string, number> = {};
    answerRecords.forEach((r) => {
      const q = answerRecords.find(() => true);
      counts['答题'] = (counts['答题'] || 0) + 1;
    });
    return [
      { name: '正确', value: answerRecords.filter((r) => r.isCorrect).length, itemStyle: { color: '#10b981' } },
      { name: '错误', value: answerRecords.filter((r) => !r.isCorrect).length, itemStyle: { color: '#ef4444' } },
    ];
  })();

  const pieOption = {
    tooltip: { trigger: 'item' as const },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        data: typePieData,
        label: { fontSize: 12, color: '#6b7280' },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' } },
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h2 className="text-base font-semibold text-gray-800">学习统计</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4 text-center">
          <Clock size={20} className="text-amber-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{formatDuration(todayStudyTime)}</p>
          <p className="text-xs text-gray-500">今日学习</p>
        </Card>
        <Card className="p-4 text-center">
          <Target size={20} className="text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{todayCompletedCount}</p>
          <p className="text-xs text-gray-500">今日完成</p>
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp size={20} className="text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{(totalCorrectRate * 100).toFixed(0)}%</p>
          <p className="text-xs text-gray-500">总正确率</p>
        </Card>
        <Card className="p-4 text-center">
          <Flame size={20} className="text-red-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{streakDays}</p>
          <p className="text-xs text-gray-500">连续学习</p>
        </Card>
        <Card className="p-4 text-center">
          <BarChart3 size={20} className="text-purple-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{answerRecords.length}</p>
          <p className="text-xs text-gray-500">总答题数</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">近 7 天答题量</h3>
          <ReactECharts option={weeklyBarOption} style={{ height: 220 }} />
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">近 7 天正确率</h3>
          <ReactECharts option={rateLineOption} style={{ height: 220 }} />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">答题统计</h3>
          {answerRecords.length > 0 ? (
            <ReactECharts option={pieOption} style={{ height: 220 }} />
          ) : (
            <div className="text-center py-12 text-sm text-gray-400">暂无数据</div>
          )}
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">错题统计</h3>
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">总错题数</span>
              <span className="text-sm font-semibold text-red-500">{wrongQuestionIds.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">总答题数</span>
              <span className="text-sm font-semibold text-gray-800">{answerRecords.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">正确率</span>
              <span className="text-sm font-semibold text-emerald-600">{(totalCorrectRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">连续学习天数</span>
              <span className="text-sm font-semibold text-amber-600">{streakDays} 天</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
