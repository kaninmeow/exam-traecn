import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu, BookOpen } from 'lucide-react';
import { useState } from 'react';
import BottomNav from './BottomNav';

const pageTitles: Record<string, string> = {
  '/': '首页',
  '/pdf': 'PDF 管理',
  '/wrong-book': '错题本',
  '/favorites': '收藏夹',
  '/statistics': '学习统计',
  '/settings': '设置',
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathParts = location.pathname.split('/').filter(Boolean);
  const basePath = '/' + (pathParts[0] || '');
  const title = pageTitles[basePath] || '考试助手';
  const showBack = location.pathname !== '/';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14 md:hidden">
          {showBack ? (
            <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100">
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
                <BookOpen size={14} className="text-white" />
              </div>
              <span className="font-semibold text-gray-900">考试助手</span>
            </div>
          )}
          <span className="text-sm font-medium text-gray-900 absolute left-1/2 -translate-x-1/2">
            {showBack ? title : ''}
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} className="text-gray-700" />
          </button>
        </div>
        <div className="hidden md:flex items-center px-6 h-14">
          <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
          <BottomNav mobile onClose={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
}
