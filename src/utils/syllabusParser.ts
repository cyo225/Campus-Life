import { Course, Assignment, Exam } from '../types';
import { CHAOYANG_PERIODS, COURSE_COLOR_OPTIONS } from '../constants/initialData';

// Map standard time string (e.g. "08:10", "13:30") to CYUT period 1..9
export function timeToPeriod(timeStr: string): number {
  const clean = timeStr.replace(/[^0-9:]/g, '');
  const [hStr, mStr] = clean.split(':');
  if (!hStr) return 1;
  const totalMin = parseInt(hStr, 10) * 60 + (mStr ? parseInt(mStr, 10) : 0);

  // Periods:
  // 1: 08:10 - 09:00 (490 - 540)
  // 2: 09:10 - 10:00 (550 - 600)
  // 3: 10:10 - 11:00 (610 - 660)
  // 4: 11:10 - 12:00 (670 - 720)
  // 5: 13:30 - 14:20 (810 - 860)
  // 6: 14:30 - 15:20 (870 - 920)
  // 7: 15:30 - 16:20 (930 - 980)
  // 8: 16:30 - 17:20 (990 - 1040)
  // 9: 17:25 - 18:15 (1045 - 1095)
  if (totalMin <= 540) return 1;
  if (totalMin <= 600) return 2;
  if (totalMin <= 660) return 3;
  if (totalMin <= 750) return 4;
  if (totalMin <= 860) return 5;
  if (totalMin <= 920) return 6;
  if (totalMin <= 980) return 7;
  if (totalMin <= 1040) return 8;
  return 9;
}

const COLOR_KEYS = ['blue', 'indigo', 'amber', 'emerald', 'violet', 'rose', 'teal'];

export interface ParsedScheduleResult {
  courses: Course[];
  assignments: Omit<Assignment, 'id' | 'createdAt'>[];
  exams: Omit<Exam, 'id'>[];
  warnings: string[];
}

/**
 * Parse an .ics iCalendar file exported from school systems, TronClass, or Google Calendar.
 */
export function parseIcsCalendar(icsText: string): ParsedScheduleResult {
  const courses: Course[] = [];
  const assignments: Omit<Assignment, 'id' | 'createdAt'>[] = [];
  const exams: Omit<Exam, 'id'>[] = [];
  const warnings: string[] = [];

  // Split into VEVENT blocks
  const events = icsText.split(/BEGIN:VEVENT/i).slice(1);

  if (events.length === 0) {
    warnings.push('找不到任何行事曆事件 (VEVENT)。請確認檔案為有效的 .ics 檔案。');
    return { courses, assignments, exams, warnings };
  }

  const courseMap = new Map<string, Course>();

  events.forEach((rawEvent, index) => {
    const eventBlock = rawEvent.split(/END:VEVENT/i)[0] || '';

    // Extract fields
    const summaryMatch = eventBlock.match(/SUMMARY(?::|;[^\n]*:)([^\r\n]+)/i);
    const locationMatch = eventBlock.match(/LOCATION(?::|;[^\n]*:)([^\r\n]+)/i);
    const descMatch = eventBlock.match(/DESCRIPTION(?::|;[^\n]*:)([^\r\n]+)/i);
    const dtstartMatch = eventBlock.match(/DTSTART(?::|;[^\n]*:)([0-9TZ]+)/i);
    const dtendMatch = eventBlock.match(/DTEND(?::|;[^\n]*:)([0-9TZ]+)/i);
    const rruleMatch = eventBlock.match(/RRULE:([^\r\n]+)/i);

    const summary = summaryMatch ? summaryMatch[1].trim() : `未命名事件 ${index + 1}`;
    const location = locationMatch ? locationMatch[1].trim() : '未指定教室';
    const description = descMatch ? descMatch[1].trim().replace(/\\n/g, ' ') : '';

    // Check if it's an assignment or exam
    const isExam = /期中|期末|考試|測驗|Exam|Quiz|Midterm|Final/i.test(summary + ' ' + description);
    const isAssignment = /作業|報告|專案繳交|Homework|Assignment|Project|HW/i.test(summary + ' ' + description);

    // Parse date/time
    let dayOfWeek = 1;
    let startPeriod = 1;
    let endPeriod = 2;
    let isoDateTime = new Date().toISOString();

    if (dtstartMatch) {
      const dt = dtstartMatch[1]; // e.g. 20250915T081000Z or 20250915T081000
      const year = parseInt(dt.substring(0, 4), 10);
      const month = parseInt(dt.substring(4, 6), 10) - 1;
      const day = parseInt(dt.substring(6, 8), 10);
      let hour = 8;
      let min = 10;
      if (dt.includes('T')) {
        const timePart = dt.split('T')[1];
        hour = parseInt(timePart.substring(0, 2), 10);
        min = parseInt(timePart.substring(2, 4), 10);
      }
      const dateObj = new Date(year, month, day, hour, min);
      isoDateTime = dateObj.toISOString();
      const rawDay = dateObj.getDay();
      dayOfWeek = rawDay === 0 ? 7 : rawDay;

      const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      startPeriod = timeToPeriod(timeStr);
      endPeriod = Math.min(startPeriod + 1, 9);
    }

    if (dtendMatch) {
      const dt = dtendMatch[1];
      if (dt.includes('T')) {
        const timePart = dt.split('T')[1];
        const hour = parseInt(timePart.substring(0, 2), 10);
        const min = parseInt(timePart.substring(2, 4), 10);
        const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        const calculatedEnd = timeToPeriod(timeStr);
        if (calculatedEnd >= startPeriod) {
          endPeriod = calculatedEnd;
        }
      }
    }

    // Check RRULE for day of week if repeating
    if (rruleMatch) {
      const rule = rruleMatch[1];
      if (rule.includes('BYDAY=MO')) dayOfWeek = 1;
      else if (rule.includes('BYDAY=TU')) dayOfWeek = 2;
      else if (rule.includes('BYDAY=WE')) dayOfWeek = 3;
      else if (rule.includes('BYDAY=TH')) dayOfWeek = 4;
      else if (rule.includes('BYDAY=FR')) dayOfWeek = 5;
      else if (rule.includes('BYDAY=SA')) dayOfWeek = 6;
      else if (rule.includes('BYDAY=SU')) dayOfWeek = 7;
    }

    if (isExam) {
      exams.push({
        subject: summary,
        examDate: isoDateTime,
        location: location || '朝陽指定試場',
        type: summary.includes('期末') ? '期末考' : summary.includes('期中') ? '期中考' : '隨堂測驗',
        note: description || '由行事曆 ICS 自動匯入',
      });
    } else if (isAssignment) {
      assignments.push({
        title: summary,
        courseName: location || '朝陽專業課程',
        dueDate: isoDateTime,
        completed: false,
        priority: 'high',
        note: description || '由行事曆 ICS 自動匯入',
      });
    } else {
      // It's a recurring course
      const key = `${summary}_${dayOfWeek}_${startPeriod}`;
      if (!courseMap.has(key)) {
        const colorKey = COLOR_KEYS[courseMap.size % COLOR_KEYS.length];
        const newCourse: Course = {
          id: 'c_' + Math.random().toString(36).substring(2, 9),
          name: summary,
          code: summary.match(/[A-Z]{2,4}[0-9]{3,4}/)?.[0] || 'CYUT',
          dayOfWeek,
          startPeriod,
          endPeriod,
          classroom: location,
          instructor: description.match(/老師|教師|教授|Prof[:\s]*([^\s,;]+)/i)?.[1] || '授課教師',
          color: colorKey,
          credits: endPeriod - startPeriod + 1 > 0 ? endPeriod - startPeriod + 1 : 2,
          note: description || '由行事曆 ICS 匯入',
        };
        courseMap.set(key, newCourse);
      }
    }
  });

  return {
    courses: Array.from(courseMap.values()),
    assignments,
    exams,
    warnings,
  };
}

/**
 * Smart natural language text parser for copied syllabus/timetable text.
 * Students can copy directly from the CYUT Student Web System or TronClass.
 */
export function parseScheduleText(rawText: string): ParsedScheduleResult {
  const courses: Course[] = [];
  const assignments: Omit<Assignment, 'id' | 'createdAt'>[] = [];
  const exams: Omit<Exam, 'id'>[] = [];
  const warnings: string[] = [];

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    warnings.push('請貼上包含課程名稱與節次的文字內容');
    return { courses, assignments, exams, warnings };
  }

  // Weekday mapping regex
  const dayPatterns = [
    { regex: /週一|星期一|禮拜一|\(一\)|\[一\]|W1|Mon/i, day: 1 },
    { regex: /週二|星期二|禮拜二|\(二\)|\[二\]|W2|Tue/i, day: 2 },
    { regex: /週三|星期三|禮拜三|\(三\)|\[三\]|W3|Wed/i, day: 3 },
    { regex: /週四|星期四|禮拜四|\(四\)|\[四\]|W4|Thu/i, day: 4 },
    { regex: /週五|星期五|禮拜五|\(五\)|\[五\]|W5|Fri/i, day: 5 },
    { regex: /週六|星期六|禮拜六|\(六\)|\[六\]|W6|Sat/i, day: 6 },
    { regex: /週日|星期日|禮拜日|\(日\)|\[日\]|W7|Sun/i, day: 7 },
  ];

  lines.forEach((line) => {
    // Check if line mentions exam
    if (/期中考|期末考|隨堂考|考試|會考/i.test(line)) {
      exams.push({
        subject: line.split(/[\s,]+/)[0] || '專業科目考試',
        examDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        location: line.match(/[TDMGE][0-9]-[0-9]{3}/i)?.[0] || '朝陽指定教室',
        type: line.includes('期末') ? '期末考' : '期中考',
        note: line,
      });
      return;
    }

    // Check if line mentions assignment
    if (/作業|報告|專題|HW|Homework/i.test(line)) {
      assignments.push({
        title: line.replace(/^(作業|報告)[:：\s]*/, ''),
        courseName: '校內課程',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        completed: false,
        priority: 'medium',
        note: line,
      });
      return;
    }

    // Parse Course
    let detectedDay = 1;
    let dayMatched = false;
    for (const dp of dayPatterns) {
      if (dp.regex.test(line)) {
        detectedDay = dp.day;
        dayMatched = true;
        break;
      }
    }

    // Period pattern: "2-4節", "5~7", "1,2,3", "第2節"
    let startPeriod = 1;
    let endPeriod = 2;
    const periodRangeMatch = line.match(/(?:第)?([1-9])\s*[-~至到]\s*(?:第)?([1-9])\s*節?/);
    const singlePeriodMatch = line.match(/(?:第)?([1-9])\s*節/);

    if (periodRangeMatch) {
      startPeriod = parseInt(periodRangeMatch[1], 10);
      endPeriod = parseInt(periodRangeMatch[2], 10);
    } else if (singlePeriodMatch) {
      startPeriod = parseInt(singlePeriodMatch[1], 10);
      endPeriod = startPeriod;
    } else {
      // Default guess if line has tokens
      startPeriod = (courses.length % 4) * 2 + 1;
      endPeriod = Math.min(startPeriod + 2, 9);
    }

    // Extract classroom (e.g. T2-405, D-308, M-101, G-202, E-102)
    const classroomMatch = line.match(/([TDMGE][0-9]?-[0-9]{3}[A-Za-z]?|[A-Za-z]{1,2}[0-9]{3}|科技大樓|設計大樓|管理大樓|人文大樓|理工大樓)/i);
    const classroom = classroomMatch ? classroomMatch[0] : '未指定教室';

    // Extract instructor (e.g. 張教授, 林老師, 老師: xxx, 授課: xxx)
    const instructorMatch = line.match(/(?:老師|教授|教師)[:\s]*([^\s,;]+)|([^\s,;]+)(?:老師|教授)/);
    const instructor = instructorMatch ? instructorMatch[1] || instructorMatch[2] : '授課教師';

    // Extract course name by removing day, period, classroom tokens
    let cleanedName = line
      .replace(periodRangeMatch ? periodRangeMatch[0] : '', '')
      .replace(singlePeriodMatch ? singlePeriodMatch[0] : '', '')
      .replace(classroomMatch ? classroomMatch[0] : '', '')
      .replace(/(?:週[一二三四五六日]|星期[一二三四五六日]|\([一二三四五六日]\))/g, '')
      .replace(/(?:老師|教授|教師)[:\s]*[^\s,;]+/g, '')
      .replace(/[0-9]學分/g, '')
      .replace(/[，,;、\t]/g, ' ')
      .trim();

    // Clean extra symbols
    cleanedName = cleanedName.replace(/\s+/g, ' ').trim();
    if (!cleanedName || cleanedName.length < 2) {
      cleanedName = `朝陽課程 ${courses.length + 1}`;
    }

    // Course code
    const codeMatch = line.match(/([A-Z]{2,4}[0-9]{3,4})/);
    const code = codeMatch ? codeMatch[1] : 'CYUT';

    const colorKey = COLOR_KEYS[courses.length % COLOR_KEYS.length];

    courses.push({
      id: 'c_' + Math.random().toString(36).substring(2, 9),
      name: cleanedName,
      code,
      dayOfWeek: dayMatched ? detectedDay : (courses.length % 5) + 1,
      startPeriod: Math.min(Math.max(startPeriod, 1), 9),
      endPeriod: Math.min(Math.max(endPeriod, startPeriod), 9),
      classroom,
      instructor,
      color: colorKey,
      credits: endPeriod - startPeriod + 1 > 0 ? endPeriod - startPeriod + 1 : 2,
      note: '由文字智慧解析匯入',
    });
  });

  return { courses, assignments, exams, warnings };
}

/**
 * Official CYUT Department Presets for 1-click loading.
 */
export const CYUT_PRESETS = [
  {
    id: 'cs',
    name: '資訊工程系 (資工大三)',
    college: '資訊學院',
    description: '涵蓋雲端運算、人工智慧、全端工程與演算法架構',
    courses: [
      {
        name: '雲端運算與容器架構實務',
        code: 'CS3021',
        dayOfWeek: 1,
        startPeriod: 2,
        endPeriod: 4,
        classroom: 'T2-405 (科技大樓)',
        instructor: '張教授',
        color: 'blue',
        credits: 3,
        note: 'Docker & Kubernetes 實作',
      },
      {
        name: '使用者介面與體驗設計 (UI/UX)',
        code: 'CS3055',
        dayOfWeek: 2,
        startPeriod: 5,
        endPeriod: 7,
        classroom: 'D-308 (設計大樓)',
        instructor: '林主任',
        color: 'amber',
        credits: 3,
        note: 'Figma 專案原型發表',
      },
      {
        name: '演算法分析與高階資料結構',
        code: 'CS2014',
        dayOfWeek: 3,
        startPeriod: 1,
        endPeriod: 3,
        classroom: 'T2-201 (科技大樓)',
        instructor: '陳講座教授',
        color: 'indigo',
        credits: 3,
        note: 'LeetCode 實機解題',
      },
      {
        name: '人工智慧與深度學習應用',
        code: 'CS4012',
        dayOfWeek: 4,
        startPeriod: 5,
        endPeriod: 7,
        classroom: 'T2-408 (AI實驗室)',
        instructor: '黃博士',
        color: 'emerald',
        credits: 3,
        note: 'PyTorch 模型訓練',
      },
      {
        name: '網路通訊協定與系統安全',
        code: 'CS3088',
        dayOfWeek: 5,
        startPeriod: 2,
        endPeriod: 4,
        classroom: 'T2-302 (科技大樓)',
        instructor: '李副教授',
        color: 'violet',
        credits: 3,
        note: 'Wireshark 封包剖析',
      },
    ],
  },
  {
    id: 'design',
    name: '視覺傳達設計系 (視傳大二)',
    college: '設計學院',
    description: '視覺識別系統、介面互動、動態影像與包裝設計',
    courses: [
      {
        name: '品牌識別設計與企劃',
        code: 'VD2011',
        dayOfWeek: 1,
        startPeriod: 5,
        endPeriod: 7,
        classroom: 'D-205 (設計大樓)',
        instructor: '王名譽教授',
        color: 'rose',
        credits: 3,
        note: 'CIS 品牌識別手冊製作',
      },
      {
        name: '動態識別與後製合成',
        code: 'VD2033',
        dayOfWeek: 2,
        startPeriod: 2,
        endPeriod: 4,
        classroom: 'D-401 (電腦繪圖教室)',
        instructor: '周老師',
        color: 'violet',
        credits: 3,
        note: 'After Effects 動態識別演練',
      },
      {
        name: '包裝結構與材料實驗',
        code: 'VD2089',
        dayOfWeek: 4,
        startPeriod: 1,
        endPeriod: 3,
        classroom: 'D-102 (實作工坊)',
        instructor: '趙總監',
        color: 'teal',
        credits: 3,
        note: '雷射切割機刀模實作',
      },
      {
        name: '介面設計與使用者心理學',
        code: 'VD3002',
        dayOfWeek: 5,
        startPeriod: 5,
        endPeriod: 7,
        classroom: 'D-308 (設計大樓)',
        instructor: '郭老師',
        color: 'blue',
        credits: 3,
        note: '設計易用性測試',
      },
    ],
  },
  {
    id: 'management',
    name: '企業管理系 (企管大二)',
    college: '管理學院',
    description: '行銷大數據、財務管理、商務談判與組織經營',
    courses: [
      {
        name: '行銷大數據分析與實務',
        code: 'BA2044',
        dayOfWeek: 1,
        startPeriod: 1,
        endPeriod: 3,
        classroom: 'M-204 (管理大樓)',
        instructor: '劉特聘教授',
        color: 'indigo',
        credits: 3,
        note: 'Python 輿情爬蟲實作',
      },
      {
        name: '財務管理與投資決策',
        code: 'BA2015',
        dayOfWeek: 2,
        startPeriod: 2,
        endPeriod: 4,
        classroom: 'M-301 (管理大樓)',
        instructor: '孫主任',
        color: 'amber',
        credits: 3,
        note: '財務報表個案研討',
      },
      {
        name: '商務溝通與談判簡報技巧',
        code: 'BA2090',
        dayOfWeek: 3,
        startPeriod: 5,
        endPeriod: 7,
        classroom: 'M-102 (個案教室)',
        instructor: '徐客座講師',
        color: 'emerald',
        credits: 3,
        note: '外商模擬商務競標',
      },
      {
        name: '組織行為與領導策略',
        code: 'BA2038',
        dayOfWeek: 4,
        startPeriod: 2,
        endPeriod: 4,
        classroom: 'M-405 (管理大樓)',
        instructor: '何教授',
        color: 'rose',
        credits: 3,
        note: '團隊行為實地觀察報告',
      },
    ],
  },
];
