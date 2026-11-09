export interface UserProfile {
  name: string;
  studentId: string;
  school: string; // Locked to '朝陽科技大學'
  department: string;
  grade: string;
  avatar: string;
  isLoggedIn: boolean;
}

export interface PeriodInfo {
  period: number;
  label: string;
  startTime: string;
  endTime: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  dayOfWeek: number; // 1 = 週一, 2 = 週二, ..., 7 = 週日
  startPeriod: number; // 1 ~ 9
  endPeriod: number; // 1 ~ 9
  classroom: string; // e.g. "T2-301", "D-102"
  instructor: string;
  color: string; // Tailwind color class key
  credits: number;
  note?: string;
}

export interface AISolutionBreakdownItem {
  target: string;
  answer: string;
  explanation: string;
}

export interface AISolution {
  title?: string;
  summary?: string;
  completeAnswer: string; // 【1. 完整擬答內容（直接可複製）】
  detailedBreakdown: AISolutionBreakdownItem[]; // 【2. 逐題/逐格詳細解題說明】
  finalAnswer?: string;
  steps?: string[];
  tips?: string;
  keyTakeaways?: string;
  solvedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  courseName: string;
  dueDate: string; // ISO string YYYY-MM-DDTHH:mm
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  note?: string;
  createdAt: string;
  aiSolution?: AISolution;
}

export interface AIQuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface AIExamDigest {
  concepts: string[];
  formulas: string[];
  quiz: AIQuizQuestion[];
  generatedAt: string;
}

export interface Exam {
  id: string;
  subject: string;
  examDate: string; // ISO string YYYY-MM-DDTHH:mm
  location: string;
  type: '期中考' | '期末考' | '隨堂測驗' | '證照考';
  note?: string;
  aiDigest?: AIExamDigest;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'todo' | 'exam' | 'system';
  timestamp: string;
  read: boolean;
  slot?: '09:00' | '12:00' | '18:00' | 'exam-tomorrow' | 'manual';
  linkTab?: 'schedule' | 'todo' | 'home';
}

export interface CampusLink {
  id: string;
  title: string;
  category: '校務系統' | '學習資源' | '校園生活' | '交通資訊';
  url: string;
  description: string;
  iconName: string;
  badge?: string;
}

export interface CampusAnnouncement {
  id: string;
  title: string;
  category: '教務處' | '學務處' | '總務處' | '活動專區';
  date: string;
  isImportant?: boolean;
  content: string;
  link?: string;
}

export interface FoodMerchant {
  id: string;
  name: string;
  category: '主餐便當' | '朝陽早午餐' | '手搖飲冰品' | '炸物小吃' | '校內學餐';
  area: '吉峰東路商圈' | '樹仁商圈' | '校內紅磚美食街' | '中興路夜市';
  distanceText: string;
  discountHeadline: string; // e.g. "憑 App 滿百現折 $10"
  discountDetail: string; // e.g. "出示 Campus Life 畫面，任點主餐享免費加大與私房紅茶一杯"
  image: string;
  rating: number;
  averagePrice: string;
  address: string;
  openingHours: string;
  signatureDish: string;
  menuImages: string[];
  phone?: string;
}

export interface MerchantSubscription {
  id: string;
  planId: 'monthly' | 'quarterly' | 'annual';
  planName: string;
  planPrice: number;
  storeName: string;
  contactName: string;
  phone: string;
  bankLast5: string;
  transferAmount: number;
  transferDate: string;
  receiptImage?: string;
  status: 'pending' | 'approved';
  submittedAt: string;
}

export type TabKey = 'home' | 'schedule' | 'todo' | 'food';
