import React from 'react';
import { Moon, Sun, GraduationCap, WifiOff, Sparkles, Bell } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { UserProfile } from '../types';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  activeTabTitle: string;
  profile: UserProfile;
  onOpenProfile: () => void;
  unreadNotifCount?: number;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  activeTabTitle,
  profile,
  onOpenProfile,
  unreadNotifCount = 0,
  onOpenNotifications,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-[#2C2C2E] transition-colors">
      <div className="max-w-md mx-auto px-4 h-15 flex items-center justify-between gap-2">
        {/* Left: Redesigned Elevated Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-700/25 ring-2 ring-white/60 dark:ring-[#2C2C2E]">
              <GraduationCap className="w-5 h-5 text-white drop-shadow-xs" />
            </div>
            {/* Subtle campus golden star badge */}
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-[8px] font-black text-slate-950 flex items-center justify-center border-2 border-white dark:border-[#1C1C1E] shadow-xs">
              ★
            </span>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[15px] tracking-tight text-slate-900 dark:text-white font-sans">
                Campus Life
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black tracking-wider uppercase shadow-2xs">
                CYUT
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {activeTabTitle}
              </span>
              <span aria-hidden="true">·</span>
              <span className="truncate max-w-[90px]">{profile.department}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Profile Avatar Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isOnline && (
            <span
              className="p-1.5 rounded-xl text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40"
              title="離線中"
            >
              <WifiOff className="w-4 h-4" />
            </span>
          )}

          <PWAInstallButton />

          {/* Notification Center Trigger */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              aria-label="查看通知中心"
              title="智慧定時推播提醒中心"
              className="relative w-8.5 h-8.5 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#2C2C2E] border border-neutral-200/70 dark:border-[#2C2C2E] transition-colors"
            >
              <Bell className="w-4 h-4 text-neutral-300" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white dark:border-[#1C1C1E] shadow-xs">
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </span>
              )}
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            aria-label={isDark ? '切換為淺色模式' : '切換為深色模式'}
            className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#2C2C2E] border border-neutral-200/70 dark:border-[#2C2C2E] transition-colors"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
          </button>

          {/* User Profile Avatar with Click-to-Edit */}
          <button
            onClick={onOpenProfile}
            title="點擊編輯個人資料與帳號"
            aria-label="開啟個人設定"
            className="w-8.5 h-8.5 rounded-xl p-0.5 bg-gradient-to-tr from-blue-600 to-amber-500 hover:ring-2 hover:ring-blue-500/50 transition-all shrink-0 overflow-hidden"
          >
            <div className="w-full h-full rounded-[9px] bg-white dark:bg-[#1C1C1E] overflow-hidden flex items-center justify-center">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                  {profile.name.slice(0, 1)}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
