import { Course, Assignment, Exam, CampusLink, CampusAnnouncement, PeriodInfo, UserProfile, FoodMerchant } from '../types';

export const CHAOYANG_PERIODS: PeriodInfo[] = [
  { period: 1, label: '第 1 節', startTime: '08:10', endTime: '09:00' },
  { period: 2, label: '第 2 節', startTime: '09:10', endTime: '10:00' },
  { period: 3, label: '第 3 節', startTime: '10:10', endTime: '11:00' },
  { period: 4, label: '第 4 節', startTime: '11:10', endTime: '12:00' },
  { period: 5, label: '第 5 節', startTime: '13:30', endTime: '14:20' },
  { period: 6, label: '第 6 節', startTime: '14:30', endTime: '15:20' },
  { period: 7, label: '第 7 節', startTime: '15:30', endTime: '16:20' },
  { period: 8, label: '第 8 節', startTime: '16:30', endTime: '17:20' },
  { period: 9, label: '第 9 節', startTime: '17:25', endTime: '18:15' },
];

export const CHAOYANG_DEPARTMENTS = [
  // 資訊學院
  '資訊工程系',
  '資訊管理系',
  '資訊與通訊系',
  // 設計學院
  '視覺傳達設計系',
  '工業設計系',
  '建築系',
  '景觀及都市設計系',
  // 管理學院
  '企業管理系',
  '財務金融系',
  '保險金融管理系',
  '會計系',
  '行銷與流通管理系',
  '休閒事業管理系',
  // 人文暨社會學院
  '傳播藝術系',
  '幼兒保育系',
  '社會工作系',
  '應用英語系',
  // 航空學院
  '航空機械系',
  '飛行與民航人員技術系',
  '航空運務系',
  // 理工學院
  '應用化學系',
  '環境工程與管理系',
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: '王小陽',
  studentId: '11124108',
  school: '朝陽科技大學',
  department: '資訊工程系',
  grade: '三年級',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
  isLoggedIn: true,
};

// Course Colors palette - Solid color fill with crisp pure white text (clean medium weight)
export const COURSE_COLOR_OPTIONS = [
  { id: 'blue', name: '深海藍', bg: 'bg-blue-600', text: 'text-white font-medium', solidBg: 'bg-blue-600 dark:bg-blue-600', lightBg: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-blue-500' },
  { id: 'indigo', name: '曜石靛', bg: 'bg-indigo-600', text: 'text-white font-medium', solidBg: 'bg-indigo-600 dark:bg-indigo-600', lightBg: 'bg-indigo-50 dark:bg-indigo-950/40', border: 'border-indigo-500' },
  { id: 'amber', name: '活力橘', bg: 'bg-amber-600', text: 'text-white font-medium', solidBg: 'bg-amber-600 dark:bg-amber-600', lightBg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-500' },
  { id: 'emerald', name: '青翠綠', bg: 'bg-emerald-600', text: 'text-white font-medium', solidBg: 'bg-emerald-600 dark:bg-emerald-600', lightBg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-500' },
  { id: 'violet', name: '星空紫', bg: 'bg-purple-600', text: 'text-white font-medium', solidBg: 'bg-purple-600 dark:bg-purple-600', lightBg: 'bg-purple-50 dark:bg-purple-950/40', border: 'border-purple-500' },
  { id: 'rose', name: '玫瑰紅', bg: 'bg-rose-600', text: 'text-white font-medium', solidBg: 'bg-rose-600 dark:bg-rose-600', lightBg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-500' },
  { id: 'teal', name: '湖水碧', bg: 'bg-teal-600', text: 'text-white font-medium', solidBg: 'bg-teal-600 dark:bg-teal-600', lightBg: 'bg-teal-50 dark:bg-teal-950/40', border: 'border-teal-500' },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    name: '雲端運算與架構實務',
    code: 'CS3021',
    dayOfWeek: 1, // 週一
    startPeriod: 2,
    endPeriod: 4,
    classroom: 'T2-405 (科技大樓)',
    instructor: '張教授',
    color: 'blue',
    credits: 3,
    note: '需攜帶筆電進行 Docker 實驗',
  },
  {
    id: 'c2',
    name: '使用者介面與體驗設計 (UI/UX)',
    code: 'CS3055',
    dayOfWeek: 2, // 週二
    startPeriod: 5,
    endPeriod: 7,
    classroom: 'D-308 (設計大樓)',
    instructor: '林主任',
    color: 'amber',
    credits: 3,
    note: 'Figma 專案進度發表',
  },
  {
    id: 'c3',
    name: '演算法分析與設計',
    code: 'CS2014',
    dayOfWeek: 3, // 週三
    startPeriod: 1,
    endPeriod: 3,
    classroom: 'T2-301 (科技大樓)',
    instructor: '陳講座教授',
    color: 'indigo',
    credits: 3,
    note: '每週三課後有助教實習課',
  },
  {
    id: 'c4',
    name: '校園羽球進階',
    code: 'PE1002',
    dayOfWeek: 3, // 週三
    startPeriod: 5,
    endPeriod: 6,
    classroom: '體育館 3F 球場',
    instructor: '李教練',
    color: 'emerald',
    credits: 1,
    note: '著運動服與室內球鞋',
  },
  {
    id: 'c5',
    name: '行動應用程式開發 (Mobile PWA)',
    code: 'CS3102',
    dayOfWeek: 4, // 週四
    startPeriod: 2,
    endPeriod: 4,
    classroom: 'T2-502 專業電腦室',
    instructor: '黃博士',
    color: 'teal',
    credits: 3,
    note: '期末專題發表',
  },
  {
    id: 'c6',
    name: '科技英文簡報',
    code: 'EN2041',
    dayOfWeek: 5, // 週五
    startPeriod: 3,
    endPeriod: 4,
    classroom: 'G-201 (人文大樓)',
    instructor: 'Prof. Miller',
    color: 'violet',
    credits: 2,
    note: '小組 5 分鐘 Pitch',
  },
];

// Helper to compute dynamic relative dates for realistic demo experience
const now = new Date();
const getFutureDate = (daysAhead: number, hours: number, minutes: number = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString().slice(0, 16);
};

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'a1',
    title: 'PWA 校園生活 App 介面架構圖繪製',
    courseName: '使用者介面與體驗設計 (UI/UX)',
    dueDate: getFutureDate(1, 23, 59),
    completed: false,
    priority: 'high',
    note: '繳交 Figma 連結至 E-Learning',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a2',
    title: '動態規劃 (Dynamic Programming) 程式碼實作',
    courseName: '演算法分析與設計',
    dueDate: getFutureDate(3, 17, 0),
    completed: false,
    priority: 'high',
    note: '通過 LeetCode 測試案例並截圖',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a3',
    title: 'Docker Compose 多容器架構配置文件',
    courseName: '雲端運算與架構實務',
    dueDate: getFutureDate(5, 23, 59),
    completed: false,
    priority: 'medium',
    note: '包含 PostgreSQL 與 Redis 服務連線',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a4',
    title: '英文科技論文摘要 250 字閱讀報告',
    courseName: '科技英文簡報',
    dueDate: getFutureDate(-2, 23, 59),
    completed: true,
    priority: 'low',
    note: '已於課堂繳交紙本並完成線上填報',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'e1',
    subject: '演算法分析與設計 期中大考',
    examDate: getFutureDate(4, 10, 10),
    location: '科技大樓 T2-301 演講廳',
    type: '期中考',
    note: '範圍：Ch1 ~ Ch5（含紅黑樹與貪婪演算法）。可帶一張 A4 雙面大抄，禁止使用電子計算機。',
  },
  {
    id: 'e2',
    subject: '雲端運算與架構證照實機測驗',
    examDate: getFutureDate(12, 13, 30),
    location: 'T2-502 電腦教室',
    type: '證照考',
    note: '需攜帶學生證核對身份，測驗時間共 90 分鐘。',
  },
  {
    id: 'e3',
    subject: '使用者經驗研究隨堂測驗',
    examDate: getFutureDate(18, 14, 30),
    location: '設計大樓 D-308',
    type: '隨堂測驗',
    note: '題目為啟發式評估十準則案例分析。',
  },
];

export const INITIAL_CAMPUS_LINKS: CampusLink[] = [
  {
    id: 'l1',
    title: '學生資訊系統',
    category: '校務系統',
    url: 'https://ecampus.cyut.edu.tw/',
    description: '查詢歷年成績、選課、學雜費繳費單與請假申請',
    iconName: 'GraduationCap',
    badge: '最常用',
  },
  {
    id: 'l2',
    title: 'E-Learning 數位學習網',
    category: '學習資源',
    url: 'https://tronclass.cyut.edu.tw/',
    description: '課程講義下載、作業上傳、線上測驗與師生討論區',
    iconName: 'BookOpen',
    badge: '課業必備',
  },
  {
    id: 'l3',
    title: '波錠紀念圖書館',
    category: '學習資源',
    url: 'https://lib.cyut.edu.tw/',
    description: '館藏查詢、電子書資源、自修室預約與還書期限提醒',
    iconName: 'Library',
  },
  {
    id: 'l4',
    title: '校園公車即時動態',
    category: '交通資訊',
    url: 'https://citybus.taichung.gov.tw/',
    description: '151 (經高鐵站)、131, 132, 133, 158 等即時到站查詢',
    iconName: 'Bus',
    badge: '即時路況',
  },
  {
    id: 'l5',
    title: '朝陽官方網站',
    category: '校務系統',
    url: 'https://www.cyut.edu.tw/',
    description: '朝陽科技大學全球資訊網、各學院系所導覽',
    iconName: 'Globe',
  },
  {
    id: 'l6',
    title: '朝陽校園地圖與導航',
    category: '校園生活',
    url: 'https://www.google.com/maps/search/?api=1&query=%E6%9C%9D%E9%99%BD%E7%A7%91%E6%8A%80%E5%A4%A7%E5%AD%B8',
    description: '科技大樓、設計大樓、紅磚廣場、學生餐廳實景定位導航',
    iconName: 'MapPin',
    badge: '地圖導航',
  },
  {
    id: 'l7',
    title: '課外活動與社團資訊',
    category: '校園生活',
    url: 'https://stafdep.cyut.edu.tw/',
    description: '學生會、各系學會最新活動與藝文表演資訊',
    iconName: 'Calendar',
  },
  {
    id: 'l8',
    title: '24小時校安緊急專線',
    category: '校園生活',
    url: 'tel:0423320600',
    description: '校內警衛室暨校安中心：(04) 2332-0600，隨時守護安全',
    iconName: 'PhoneCall',
    badge: '緊急電話',
  },
];

export const INITIAL_ANNOUNCEMENTS: CampusAnnouncement[] = [
  {
    id: 'an1',
    title: '【重要】113學年度第2學期選課作業日程及注意事項公告',
    category: '教務處',
    date: '2026-11-05',
    isImportant: true,
    content: '請全體同學注意：第一階段網路初選將於下週一上午 09:00 開跑，請務必先至學生資訊系統確認通識與系所核心學分進度。',
  },
  {
    id: 'an2',
    title: '波錠紀念圖書館期中考期間 24 小時自習室開放辦法',
    category: '學務處',
    date: '2026-11-03',
    isImportant: false,
    content: '配合期中考週，圖書館地下自修室自即日起連續三週 24 小時開放，憑學生證刷卡感應入場，夜間請注意交通安全。',
  },
  {
    id: 'an3',
    title: '校內紅磚廣場「朝陽青創市集」熱烈報名中',
    category: '活動專區',
    date: '2026-10-30',
    isImportant: false,
    content: '由學生會與創育中心合辦，邀請對文創手作、數位設計周邊有興趣的各系同學踴躍設攤，名額有限額滿為止！',
  },
  {
    id: 'an4',
    title: '【公車異動】校門口公車站候車亭整修期間乘車動線說明',
    category: '總務處',
    date: '2026-10-25',
    isImportant: true,
    content: '配合候車月台智慧顯示螢幕升級工程，151路公車臨時站牌暫移至科技大樓前圓環，請搭車同學提早至現場等候。',
  },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly' as const,
    name: '體驗月費方案',
    price: 299,
    period: '月',
    badge: '無約彈性',
    description: '新店開幕試水溫、單月檔期促銷的最佳試用方案',
    features: [
      '周邊店家地圖標記與店家主頁',
      '顯示朝陽專屬學生優惠',
      '店家菜單與 Google 導航直連',
      '每週店家瀏覽流量簡報',
    ],
  },
  {
    id: 'quarterly' as const,
    name: '熱門季費方案',
    price: 799,
    period: '季',
    badge: '最推薦 · 現省 NT$98',
    highlight: true,
    description: '完整學期持續曝光，平均每月只要 NT$ 266',
    features: [
      '包含月費方案所有功能',
      '「今日吃什麼」抽籤權重優先推薦',
      '朝陽特約店家尊爵金標徽章',
      '店家最新優惠即時推播通知',
    ],
  },
  {
    id: 'annual' as const,
    name: '全年旗艦方案',
    price: 2499,
    period: '年',
    badge: '超值首選 · 平均$208/月',
    description: '全年度雙學期強力進駐，學生客源穩定長青首選',
    features: [
      '包含季費方案所有核心特權',
      '首頁精選店家輪播橫幅 (Banner)',
      '開學季「朝陽新生特刊」優先收錄',
      '專屬店內特約立牌與數位海報設計',
      '一年內無限次自由更新菜單與優惠',
    ],
  },
];

export const OFFICIAL_BANK_INFO = {
  bankName: '臺灣銀行 (004) 霧峰分行',
  bankCode: '004',
  accountNumber: '058-001-238899',
  accountHolder: '朝陽校園生活圈推廣中心',
  note: '匯款後請填寫下方表單並上傳證明截圖，我們將於 24 小時內完成商家開通。',
};

export const INITIAL_MERCHANTS: FoodMerchant[] = [
  {
    id: 'm1',
    name: '吉峰老牌炭烤燒肉便當',
    category: '主餐便當',
    area: '吉峰東路商圈',
    distanceText: '步行 3 分鐘',
    discountHeadline: '憑 App 滿百現折 $10',
    discountDetail: '出示 Campus Life 學生畫面，任點主餐便當現折 $10，並享白飯與熱湯無限續加！',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    averagePrice: '$85 - $120',
    address: '台中市霧峰區吉峰東路 68 號',
    openingHours: '10:30 - 14:00, 16:30 - 20:30 (週日公休)',
    signatureDish: '特選炭火照燒烤雞腿飯、香酥厚切排骨便當',
    menuImages: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80',
    ],
    phone: '04-2330-1122',
  },
  {
    id: 'm2',
    name: '晨光吐司坊 (朝陽創始店)',
    category: '朝陽早午餐',
    area: '吉峰東路商圈',
    distanceText: '步行 2 分鐘',
    discountHeadline: '套餐免費升級大杯紅茶',
    discountDetail: '出示學生憑證，點任一款蛋餅或漢堡套餐，中杯飲品直接免費升級為特調大杯錫蘭紅茶！',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    averagePrice: '$50 - $95',
    address: '台中市霧峰區吉峰東路 102 號',
    openingHours: '06:00 - 13:30 (每日營業)',
    signatureDish: '酥皮起司培根蛋餅、花生手作純牛堡',
    menuImages: [
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80',
    ],
    phone: '04-2339-5566',
  },
  {
    id: 'm3',
    name: '霧峰老街紅燒牛肉麵',
    category: '主餐便當',
    area: '樹仁商圈',
    distanceText: '機車 4 分鐘',
    discountHeadline: '朝陽同學免費加湯加麵一次',
    discountDetail: '憑 Campus Life App 畫面，點任一大碗或中碗牛肉麵，享有免費續麵與牛骨湯一次。',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    averagePrice: '$110 - $160',
    address: '台中市霧峰區樹仁路 88 號',
    openingHours: '11:00 - 21:00',
    signatureDish: '半筋半肉紅燒牛肉麵、秘製滷牛肚拼盤',
    menuImages: [
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80',
    ],
    phone: '04-2332-9988',
  },
  {
    id: 'm4',
    name: '校內紅磚美食街 · 日月丼屋',
    category: '校內學餐',
    area: '校內紅磚美食街',
    distanceText: '校內學生餐廳 2F',
    discountHeadline: '全品項現折 $5 兼贈味噌湯',
    discountDetail: '免出校門！出示本 App 點主食丼飯直接折 $5，每日限量鮮魚味噌湯免費自取。',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
    averagePrice: '$75 - $110',
    address: '朝陽科技大學學生活動中心 2F 美食街 3 號櫃位',
    openingHours: '10:30 - 18:30 (週末公休)',
    signatureDish: '日式黃金炸豬排丼、和風洋蔥牛丼',
    menuImages: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80',
    ],
    phone: '校內分機 2058',
  },
  {
    id: 'm5',
    name: '茶韻手作鮮果茶 (霧峰吉峰店)',
    category: '手搖飲冰品',
    area: '吉峰東路商圈',
    distanceText: '步行 4 分鐘',
    discountHeadline: '同品項第二杯半價',
    discountDetail: '朝陽學生專屬優惠：純茶系列同品項第二杯享半價優惠，外送滿 $150 即可直送校門口！',
    image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    averagePrice: '$35 - $65',
    address: '台中市霧峰區吉峰東路 128 號',
    openingHours: '09:30 - 22:00',
    signatureDish: '甘蔗青茶、厚焙珍珠黑糖鮮奶',
    menuImages: [
      'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=400&q=80',
    ],
    phone: '04-2333-8765',
  },
  {
    id: 'm6',
    name: '深夜炸雞俱樂部 · 蒜香鹽酥雞',
    category: '炸物小吃',
    area: '中興路夜市',
    distanceText: '機車 5 分鐘',
    discountHeadline: '消費滿 $120 贈酥炸甜不辣一份',
    discountDetail: '期末趕專題宵夜必備！出示 Campus Life 畫面，滿額即免費贈送現炸酥脆甜不辣一份。',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    averagePrice: '$60 - $150',
    address: '台中市霧峰區中興路 352 號',
    openingHours: '17:00 - 01:00 (宵夜場)',
    signatureDish: '無骨蒜香鹽酥雞、九層塔香酥魷魚',
    menuImages: [
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80',
    ],
    phone: '04-2339-1234',
  },
];
