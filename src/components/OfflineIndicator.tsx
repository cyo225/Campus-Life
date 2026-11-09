import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-500/95 dark:bg-amber-600/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg animate-in slide-in-from-top-2 duration-200"
    >
      <WifiOff className="w-3.5 h-3.5 animate-pulse text-amber-100" />
      <span>離線模式：所有課表與資料皆已快取，無網亦可查閱</span>
    </div>
  );
};
