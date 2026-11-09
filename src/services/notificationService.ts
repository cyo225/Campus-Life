import { Assignment, Exam, AppNotification } from '../types';

const STORAGE_KEY = 'campus_life_notifications_v1';
const LAST_SLOTS_KEY = 'campus_life_last_dispatched_slots_v1';

// Get all notifications from localStorage
export function getStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultNotifications();
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load notifications from storage:', e);
    return getDefaultNotifications();
  }
}

// Initial demo notifications so the notification drawer is immediately informative
function getDefaultNotifications(): AppNotification[] {
  const now = new Date();
  return [
    {
      id: 'demo-notif-1',
      title: '🌟 歡迎使用 Campus Life 智慧提醒系統',
      body: '系統已自動啟動每天 09:00、12:00、18:00 定時作業提醒與考前 24H 雙倍密集推播。',
      type: 'system',
      timestamp: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      read: false,
      slot: 'manual',
      linkTab: 'todo',
    },
    {
      id: 'demo-notif-2',
      title: '🤖 AI 智慧助教模組已就緒',
      body: '作業解題步驟拆解與考前重點三合一精華包已上線，歡迎在待辦與考試頁面體驗！',
      type: 'system',
      timestamp: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
      read: true,
      slot: 'manual',
      linkTab: 'todo',
    },
  ];
}

// Save notifications to localStorage
export function saveNotifications(notifications: AppNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notifications to storage:', e);
  }
}

// Request Web Notification permission
export async function requestWebPushPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (e) {
    console.error('Error requesting notification permission:', e);
    return 'denied';
  }
}

export function getWebPushPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

// Dispatch a notification (Browser Web Notification + In-App Store)
export function dispatchNotification(
  title: string,
  body: string,
  type: AppNotification['type'] = 'todo',
  slot?: AppNotification['slot'],
  linkTab?: AppNotification['linkTab']
): AppNotification {
  const newNotif: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    body,
    type,
    timestamp: new Date().toISOString(),
    read: false,
    slot,
    linkTab: linkTab || 'todo',
  };

  // 1. Add to In-app store
  const list = getStoredNotifications();
  const updated = [newNotif, ...list.slice(0, 49)]; // keep max 50
  saveNotifications(updated);

  // 2. Trigger Browser Web Notification if allowed
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
      });
    } catch (e) {
      console.warn('Native notification instantiation failed:', e);
    }
  }

  // Trigger custom window event so open modals/headers update live
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('campus_life_notification_added', { detail: newNotif }));
  }

  return newNotif;
}

// Check scheduled notifications (runs on interval)
export function runScheduledCheck(assignments: Assignment[], exams: Exam[]): void {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Load last dispatched records
  let lastDispatched: Record<string, boolean> = {};
  try {
    const raw = localStorage.getItem(LAST_SLOTS_KEY);
    if (raw) lastDispatched = JSON.parse(raw);
  } catch {
    lastDispatched = {};
  }

  const incompleteCount = assignments.filter((a) => !a.completed).length;

  // 1. Check 09:00 slot (window: 9:00 ~ 9:15)
  if (currentHour === 9 && currentMinute < 15) {
    const key = `${todayStr}_09:00`;
    if (!lastDispatched[key]) {
      lastDispatched[key] = true;
      dispatchNotification(
        '📋 晨間待辦提醒 (09:00)',
        `朝陽早安！目前有 ${incompleteCount} 項待辦作業尚未完成，請合理安排今日課堂與複習時間！`,
        'todo',
        '09:00',
        'todo'
      );
    }
  }

  // 2. Check 12:00 slot (window: 12:00 ~ 12:15)
  if (currentHour === 12 && currentMinute < 15) {
    const key = `${todayStr}_12:00`;
    if (!lastDispatched[key]) {
      lastDispatched[key] = true;
      dispatchNotification(
        '🍱 午間進度提醒 (12:00)',
        `午休時間！今天還有 ${incompleteCount} 項作業等待處理，吃飽飯後別忘了打開 TronClass 檢查進度。`,
        'todo',
        '12:00',
        'todo'
      );
    }
  }

  // 3. Check 18:00 slot (window: 18:00 ~ 18:15)
  if (currentHour === 18 && currentMinute < 15) {
    const key = `${todayStr}_18:00`;
    if (!lastDispatched[key]) {
      lastDispatched[key] = true;
      dispatchNotification(
        '🌙 傍晚盤點推播 (18:00)',
        `今日傍晚盤點：尚有 ${incompleteCount} 項未結清作業，若有即將截止項目請優先完成！`,
        'todo',
        '18:00',
        'todo'
      );
    }
  }

  // 4. Check Exam notifications:
  // - Tomorrow (< 24 hours): 2x daily (at 09:00 and 18:00)
  // - Upcoming (normal): 1x daily
  exams.forEach((exam) => {
    const examTime = new Date(exam.examDate).getTime();
    const diffHours = (examTime - now.getTime()) / (1000 * 60 * 60);

    // If exam is within the next 24 hours (Tomorrow / Coming up)
    if (diffHours > 0 && diffHours <= 28) {
      // Slot 1: Morning intensive reminder
      if (currentHour >= 8 && currentHour <= 13) {
        const key = `${todayStr}_exam_intensive_am_${exam.id}`;
        if (!lastDispatched[key]) {
          lastDispatched[key] = true;
          dispatchNotification(
            `⚠️ 【明天考試】倒數備戰：${exam.subject}`,
            `明天將舉行「${exam.subject} (${exam.type})」！考場位於 ${exam.location}。請點擊查看 AI 考前重點進行最後衝刺！`,
            'exam',
            'exam-tomorrow',
            'todo'
          );
        }
      }
      // Slot 2: Evening intensive reminder
      if (currentHour >= 18 && currentHour <= 23) {
        const key = `${todayStr}_exam_intensive_pm_${exam.id}`;
        if (!lastDispatched[key]) {
          lastDispatched[key] = true;
          dispatchNotification(
            `🔥 【今晚考前衝刺】明天考試：${exam.subject}`,
            `距離「${exam.subject}」考試只剩不到數小時！確認筆記、計算機與應考用具，今晚充分睡眠保證最佳狀態！`,
            'exam',
            'exam-tomorrow',
            'todo'
          );
        }
      }
    }
  });

  // Save updated slots
  try {
    localStorage.setItem(LAST_SLOTS_KEY, JSON.stringify(lastDispatched));
  } catch (e) {
    console.error('Failed to save last dispatched slots:', e);
  }
}
