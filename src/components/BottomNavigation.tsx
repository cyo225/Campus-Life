import React from 'react';
import {
  Home,
  CalendarDays,
  CheckSquare,
  Utensils,
} from 'lucide-react';
import { TabKey } from '../types';

interface BottomNavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  pendingAssignmentsCount: number;
  upcomingExamsCount: number;
}

interface NavItem {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  pendingAssignmentsCount,
  upcomingExamsCount,
}) => {
  const totalTodoCount = pendingAssignmentsCount + upcomingExamsCount;

  const navItems: NavItem[] = [
    { key: 'home', label: '首頁', icon: Home },
    { key: 'schedule', label: '課表', icon: CalendarDays },
    { key: 'todo', label: '待辦', icon: CheckSquare, badge: totalTodoCount },
    { key: 'food', label: '美食優惠', icon: Utensils },
  ];

  return (
    <nav
      aria-label="主要底部導覽"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-lg border-t border-neutral-200/90 dark:border-[#2C2C2E] pb-safe transition-colors"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 items-center px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-all group ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {/* Active Pill Accent Top Bar */}
              {isActive && (
                <span className="absolute -top-2 w-8 h-1 rounded-full bg-blue-600 dark:bg-blue-400 animate-in fade-in zoom-in-50 duration-200" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'group-hover:scale-105 stroke-[1.8]'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 truncate ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
