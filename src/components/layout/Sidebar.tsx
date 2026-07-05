import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  BookOpen,
  XCircle,
  Star,
  BarChart3,
  Settings,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/pdf', icon: FileText, label: 'PDF 管理' },
  { path: '/wrong-book', icon: XCircle, label: '错题本' },
  { path: '/favorites', icon: Star, label: '收藏夹' },
  { path: '/statistics', icon: BarChart3, label: '学习统计' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
          <BookOpen size={18} className="text-white" />
        </div>
        <span className="text-lg font-semibold text-gray-900">考试助手</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">AI 智能考试助手 v1.0</p>
      </div>
    </aside>
  );
}
