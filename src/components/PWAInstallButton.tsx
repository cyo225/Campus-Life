import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 3000);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        aria-label="安裝 Campus Life PWA 應用程式"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 active:scale-95 transition-all ${className}`}
      >
        {justInstalled ? (
          <>
            <Check className="w-3.5 h-3.5 text-white" />
            <span>已安裝</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            <span>安裝 App</span>
          </>
        )}
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          aria-label="iOS 加入主畫面說明"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200/80 dark:border-slate-700 transition-all ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>加到主畫面</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    朝陽
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">安裝至 iPhone / iPad</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">如同原生 App 全螢幕極速開啟</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="關閉"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0 text-xs">
                    1
                  </span>
                  <p>
                    請點選 Safari 底部工具列的「<strong>分享</strong>」圖示 <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" />
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0 text-xs">
                    2
                  </span>
                  <p>
                    在選單中向下滑動，找到並點選「<strong>加入主畫面</strong>」選項。
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0 text-xs">
                    3
                  </span>
                  <p>點選右上角「<strong>新增</strong>」即完成！桌面將出現 Campus Life 捷徑。</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                我知道了
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for desktop browser or standard display
  return (
    <button
      onClick={() => {
        alert('請點擊瀏覽器網址列右側的「安裝圖示」，或使用手機開啟加入主畫面體驗最佳效果！');
      }}
      aria-label="PWA 安裝說明"
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-all ${className}`}
      title="支援 PWA 安裝至桌面或手機"
    >
      <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
      <span>PWA 支援</span>
    </button>
  );
};
