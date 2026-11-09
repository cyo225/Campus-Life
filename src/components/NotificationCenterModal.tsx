import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  CheckCheck,
  Trash2,
  Clock,
  AlertTriangle,
  Sparkles,
  Calendar,
  Send,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from './Modal';
import { AppNotification, Assignment, Exam } from '../types';
import {
  getStoredNotifications,
  saveNotifications,
  requestWebPushPermission,
  getWebPushPermission,
  dispatchNotification,
} from '../services/notificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignments: Assignment[];
  exams: Exam[];
  onSelectTab: (tab: 'schedule' | 'todo' | 'home') => void;
  onNotificationUpdate: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  assignments,
  exams,
  onSelectTab,
  onNotificationUpdate,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  const loadData = () => {
    setNotifications(getStoredNotifications());
    setPermission(getWebPushPermission());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleRequestPermission = async () => {
    const res = await requestWebPushPermission();
    setPermission(res);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
    setNotifications(updated);
    onNotificationUpdate();
  };

  const handleClearAll = () => {
    saveNotifications([]);
    setNotifications([]);
    onNotificationUpdate();
  };

  const handleTestDispatch = (slot: '09:00' | '12:00' | '18:00' | 'exam-tomorrow') => {
    const pendingCount = assignments.filter((a) => !a.completed).length;

    if (slot === '09:00') {
      dispatchNotification(
        '📋 晨間待辦提醒 (09:00 模擬)',
        `朝陽早安！目前有 ${pendingCount} 項待辦作業尚未完成，請把握時間安排課後進度！`,
        'todo',
        '09:00',
        'todo'
      );
    } else if (slot === '12:00') {
      dispatchNotification(
        '🍱 午間進度提醒 (12:00 模擬)',
        `午休時間！今天還有 ${pendingCount} 項作業等待處理，記得登入 TronClass 確認繳交截止！`,
        'todo',
        '12:00',
        'todo'
      );
    } else if (slot === '18:00') {
      dispatchNotification(
        '🌙 傍晚盤點推播 (18:00 模擬)',
        `今日傍晚盤點：尚有 ${pendingCount} 項未結清作業，若有即將截止項目請優先完成！`,
        'todo',
        '18:00',
        'todo'
      );
    } else {
      const targetExam = exams[0] || { subject: '演算法與高階程式設計', type: '期中考', location: 'T2-401' };
      dispatchNotification(
        `⚠️ 【明天考試】雙倍密集提醒：${targetExam.subject}`,
        `明天將進行「${targetExam.subject} (${targetExam.type})」！考場：${targetExam.location}。請點擊查看 AI 考前重點進行最後衝刺！`,
        'exam',
        'exam-tomorrow',
        'todo'
      );
    }
    loadData();
    onNotificationUpdate();
  };

  const handleItemClick = (n: AppNotification) => {
    // Mark as read
    const updated = notifications.map((item) => (item.id === n.id ? { ...item, read: true } : item));
    saveNotifications(updated);
    setNotifications(updated);
    onNotificationUpdate();

    if (n.linkTab) {
      onSelectTab(n.linkTab);
      onClose();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🔔 智慧定時推播提醒中心"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Permission & Schedule Status Banner */}
        <div className="p-3.5 rounded-2xl bg-neutral-900/90 dark:bg-[#202022] border border-neutral-200 dark:border-[#2C2C2E] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-white">
                瀏覽器 Web 推播權限
              </span>
            </div>
            <div>
              {permission === 'granted' ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[10px] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  已允許推播
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium transition-colors"
                >
                  點擊啟用推播
                </button>
              )}
            </div>
          </div>

          {/* Schedule Blueprint explanation */}
          <div className="pt-2 border-t border-neutral-800/80 space-y-1.5 text-[11px] text-neutral-300 font-normal leading-relaxed">
            <div className="flex items-center gap-2 text-white font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>自動定時排程邏輯：</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1 text-center font-mono">
              <div className="p-1.5 rounded-xl bg-neutral-800/40 border border-neutral-800">
                <span className="text-white block text-xs">09:00</span>
                <span className="text-[10px] text-neutral-400">晨間進度盤點</span>
              </div>
              <div className="p-1.5 rounded-xl bg-neutral-800/40 border border-neutral-800">
                <span className="text-white block text-xs">12:00</span>
                <span className="text-[10px] text-neutral-400">午間待辦提醒</span>
              </div>
              <div className="p-1.5 rounded-xl bg-neutral-800/40 border border-neutral-800">
                <span className="text-white block text-xs">18:00</span>
                <span className="text-[10px] text-neutral-400">傍晚截止預警</span>
              </div>
            </div>
            <p className="text-[10px] text-amber-300/90 pt-1 font-normal">
              ⚡ 考試特別機制：平時每日 1 次，【考試前一天】自動啟動早晚 2 次密集倒數提醒！
            </p>
          </div>
        </div>

        {/* Demo Fast Triggers */}
        <div className="p-3 rounded-2xl bg-neutral-900/40 dark:bg-[#18181A] border border-neutral-200/50 dark:border-[#28282A] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
              即時測試推播效果 (Test Triggers)
            </span>
            <span className="text-[10px] text-neutral-500">點擊立即模擬發送</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleTestDispatch('09:00')}
              className="py-1.5 px-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-white text-[11px] font-normal border border-neutral-700/60 flex items-center justify-center gap-1 transition-colors"
            >
              <span>🌅 測試 09:00 提醒</span>
            </button>
            <button
              type="button"
              onClick={() => handleTestDispatch('12:00')}
              className="py-1.5 px-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-white text-[11px] font-normal border border-neutral-700/60 flex items-center justify-center gap-1 transition-colors"
            >
              <span>🍱 測試 12:00 提醒</span>
            </button>
            <button
              type="button"
              onClick={() => handleTestDispatch('18:00')}
              className="py-1.5 px-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-white text-[11px] font-normal border border-neutral-700/60 flex items-center justify-center gap-1 transition-colors"
            >
              <span>🌙 測試 18:00 提醒</span>
            </button>
            <button
              type="button"
              onClick={() => handleTestDispatch('exam-tomorrow')}
              className="py-1.5 px-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-[11px] font-normal border border-rose-800/50 flex items-center justify-center gap-1 transition-colors"
            >
              <span>⚠️ 測試考前 24H 密集</span>
            </button>
          </div>
        </div>

        {/* Notifications List Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-white">歷史提醒紀錄</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {unreadCount} 未讀
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-normal"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>全部已讀</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] text-neutral-400 hover:text-rose-400 flex items-center gap-1 font-normal"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清空</span>
              </button>
            )}
          </div>
        </div>

        {/* List of items */}
        <div className="space-y-2">
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                  item.read
                    ? 'bg-neutral-900/40 dark:bg-[#18181A] border-neutral-800/80 opacity-70'
                    : 'bg-neutral-900 dark:bg-[#202022] border-blue-500/40 shadow-xs'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.type === 'exam'
                      ? 'bg-rose-950/60 text-rose-400'
                      : item.type === 'system'
                      ? 'bg-purple-950/60 text-purple-400'
                      : 'bg-blue-950/60 text-blue-400'
                  }`}
                >
                  {item.type === 'exam' ? (
                    <Calendar className="w-3.5 h-3.5" />
                  ) : item.type === 'system' ? (
                    <Sparkles className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="text-xs font-medium text-white truncate">
                      {item.title}
                    </h5>
                    <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed font-normal">
                    {item.body}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center space-y-1">
              <Bell className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-xs text-neutral-400">目前沒有任何推播提醒通知</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
