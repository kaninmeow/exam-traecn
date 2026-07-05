import { NavLink, useLocation } from 'react-router-dom';
import { Home, FileText, XCircle, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/pdf', icon: FileText, label: '题库' },
  { path: '/wrong-book', icon: XCircle, label: '错题' },
  { path: '/statistics', icon: BarChart3, label: '统计' },
  { path: '/settings', icon: Settings, label: '设置' },
];

interface BottomNavProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function BottomNav({ mobile, onClose }: BottomNavProps) {
  const location = useLocation();

  if (mobile) {
    return (
      <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl">
        <nav className="p-4 space-y-1">
          {mobileNavItems.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 text-xs transition-colors',
                isActive ? 'text-amber-600' : 'text-gray-400'
              )}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
