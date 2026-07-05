import { useNavigate } from 'react-router-dom';
import { FileText, BookOpen, XCircle, BarChart3, Star, MessageSquare, ArrowRight, Flame, Target, TrendingUp, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import { usePdfStore } from '@/stores/pdfStore';
import { useQuestionStore } from '@/stores/questionStore';
import { useStudyStore } from '@/stores/studyStore';
import { formatDuration } from '@/utils/format';

export default function Home() {
  const navigate = useNavigate();
  const { pdfFiles } = usePdfStore();
  const { answerRecords, wrongQuestionIds } = useQuestionStore();
  const { stats } = useStudyStore();

  const todayRecords = stats.dailyRecords.find((r) => {
    const today = new Date();
    const ds = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return r.date === ds;
  });

  const quickActions = [
    { icon: FileText, label: 'PDF 管理', desc: '上传和管理题库', path: '/pdf', color: 'bg-blue-50 text-blue-600' },
    { icon: BookOpen, label: '开始刷题', desc: '练习题目提升成绩', path: '/pdf', color: 'bg-emerald-50 text-emerald-600' },
    { icon: XCircle, label: '错题本', desc: '复习错题巩固知识', path: '/wrong-book', color: 'bg-red-50 text-red-600' },
    { icon: Star, label: '收藏夹', desc: '收藏的重点题目', path: '/favorites', color: 'bg-amber-50 text-amber-600' },
    { icon: BarChart3, label: '学习统计', desc: '查看学习进度', path: '/statistics', color: 'bg-purple-50 text-purple-600' },
    { icon: MessageSquare, label: 'AI 问答', desc: '智能解答你的疑问', path: pdfFiles.length > 0 ? `/chat/${pdfFiles[0].id}` : '/pdf', color: 'bg-cyan-50 text-cyan-600' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">AI 智能考试助手</h1>
        <p className="text-sm text-gray-500">上传 PDF 题库，AI 帮你高效复习</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Clock size={20} className="text-amber-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">{formatDuration(todayRecords?.studyTime || 0)}</p>
          <p className="text-xs text-gray-500">今日学习</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Target size={20} className="text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">{todayRecords?.completedCount || 0}</p>
          <p className="text-xs text-gray-500">今日完成</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">{(stats.totalCorrectRate * 100).toFixed(0)}%</p>
          <p className="text-xs text-gray-500">正确率</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Flame size={20} className="text-red-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">{stats.streakDays}</p>
          <p className="text-xs text-gray-500">连续学习</p>
        </Card>
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">快速入口</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Card
              key={action.label}
              hover
              onClick={() => navigate(action.path)}
              className="p-4"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${action.color}`}>
                  <action.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{action.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{action.desc}</p>
                </div>
                <ArrowRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {pdfFiles.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-3">最近的题库</h2>
          <div className="space-y-2">
            {pdfFiles.slice(-3).reverse().map((pdf) => (
              <Card
                key={pdf.id}
                hover
                onClick={() => navigate(`/pdf/${pdf.id}/summary`)}
                className="p-4"
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-amber-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{pdf.name}</p>
                    <p className="text-xs text-gray-400">{pdf.pageCount || '?'} 页</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${pdf.status === 'ready' ? 'bg-emerald-50 text-emerald-600' : pdf.status === 'error' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                    {pdf.status === 'ready' ? '已就绪' : pdf.status === 'error' ? '解析失败' : '解析中'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
