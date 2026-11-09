import React, { useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Bus,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Utensils,
} from 'lucide-react';
import { Course, Assignment, Exam, UserProfile, TabKey } from '../../types';
import { CHAOYANG_PERIODS } from '../../constants/initialData';

interface HomeDashboardProps {
  profile: UserProfile;
  courses: Course[];
  assignments: Assignment[];
  exams: Exam[];
  onNavigateTab: (tab: TabKey) => void;
  onToggleAssignment: (id: string) => void;
  onOpenProfile: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  courses,
  assignments,
  exams,
  onNavigateTab,
  onToggleAssignment,
  onOpenProfile,
}) => {
  const today = useMemo(() => new Date(), []);
  // In JS: 0 = Sun, 1 = Mon ... 6 = Sat. In our model: 1 = Mon ... 7 = Sun
  const jsDay = today.getDay();
  const currentDayOfWeek = jsDay === 0 ? 7 : jsDay;

  const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const todayString = `${today.getMonth() + 1} 月 ${today.getDate()} 日 ${dayNames[jsDay]}`;

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = today.getHours();
    if (hour < 11) return '早安，祝今天學習順利！';
    if (hour < 14) return '午安，別忘了吃午餐充飽電！';
    if (hour < 18) return '下午好，持續專注衝刺！';
    return '晚安，適度休息迎接明天！';
  }, [today]);

  // Today's courses sorted by startPeriod
  const todayCourses = useMemo(() => {
    return courses
      .filter((c) => c.dayOfWeek === currentDayOfWeek)
      .sort((a, b) => a.startPeriod - b.startPeriod);
  }, [courses, currentDayOfWeek]);

  // Find next upcoming course today based on current time
  const currentPeriodInfo = useMemo(() => {
    const nowTimeStr = `${String(today.getHours()).padStart(2, '0')}:${String(
      today.getMinutes()
    ).padStart(2, '0')}`;

    // Find first course whose endTime hasn't passed
    for (const c of todayCourses) {
      const pInfo = CHAOYANG_PERIODS.find((p) => p.period === c.endPeriod);
      if (pInfo && pInfo.endTime >= nowTimeStr) {
        const startPInfo = CHAOYANG_PERIODS.find((p) => p.period === c.startPeriod);
        return { course: c, startPInfo, endPInfo: pInfo };
      }
    }
    return null;
  }, [today, todayCourses]);

  // Pending assignments sorted by due date
  const pendingAssignments = useMemo(() => {
    return assignments
      .filter((a) => !a.completed)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [assignments]);

  // Next upcoming exam
  const nextExam = useMemo(() => {
    const futureExams = exams
      .filter((e) => new Date(e.examDate).getTime() > today.getTime())
      .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
    return futureExams[0] || exams[0] || null;
  }, [exams, today]);

  // Compute days until next exam
  const examDaysLeft = useMemo(() => {
    if (!nextExam) return null;
    const diffTime = new Date(nextExam.examDate).getTime() - today.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days;
  }, [nextExam, today]);

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Student Welcome Card */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white p-5 shadow-lg shadow-blue-900/20 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-12 -top-12 w-28 h-28 rounded-full bg-amber-400/10 pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-200 tracking-wide">
              <span>{todayString}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-300 font-bold">{profile.department}</span>
            </div>
            <h1 className="text-xl font-bold mt-1 text-white tracking-tight">
              {profile.name} 同學
            </h1>
            <p className="text-xs text-blue-100/90 mt-0.5">{greeting}</p>
          </div>

          <button
            onClick={onOpenProfile}
            className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white overflow-hidden shrink-0 hover:ring-2 hover:ring-white/40 transition-all"
            aria-label="查看個人檔案"
          >
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-sm font-bold">{profile.name.slice(0, 1)}</span>
            )}
          </button>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-white/15 relative z-10 text-center">
          <div
            onClick={() => onNavigateTab('schedule')}
            className="cursor-pointer py-1 rounded-xl hover:bg-white/10 transition-colors"
          >
            <span className="text-[11px] text-blue-200 block">今日課程</span>
            <span className="text-lg font-extrabold tabular-nums tracking-tight text-white">
              {todayCourses.length}{' '}
              <span className="text-[10px] font-normal text-blue-200">堂</span>
            </span>
          </div>
          <div
            onClick={() => onNavigateTab('todo')}
            className="cursor-pointer py-1 rounded-xl hover:bg-white/10 transition-colors border-x border-white/15"
          >
            <span className="text-[11px] text-blue-200 block">待辦作業</span>
            <span className="text-lg font-extrabold tabular-nums tracking-tight text-amber-300">
              {pendingAssignments.length}{' '}
              <span className="text-[10px] font-normal text-blue-200">項</span>
            </span>
          </div>
          <div
            onClick={() => onNavigateTab('todo')}
            className="cursor-pointer py-1 rounded-xl hover:bg-white/10 transition-colors"
          >
            <span className="text-[11px] text-blue-200 block">最近大考</span>
            <span className="text-lg font-extrabold tabular-nums tracking-tight text-white">
              {examDaysLeft !== null ? (
                <>
                  {examDaysLeft > 0 ? examDaysLeft : '今日'}{' '}
                  <span className="text-[10px] font-normal text-blue-200">
                    {examDaysLeft > 0 ? '天' : ''}
                  </span>
                </>
              ) : (
                '無'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Class Card: Next Class or Status */}
      <section className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-4.5 border border-neutral-200/80 dark:border-[#2C2C2E] shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              {currentPeriodInfo ? '即將到來課程' : '今日課堂概況'}
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('schedule')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-0.5"
          >
            <span>完整週課表</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {currentPeriodInfo ? (
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">
                  第 {currentPeriodInfo.course.startPeriod}
                  {currentPeriodInfo.course.startPeriod !== currentPeriodInfo.course.endPeriod
                    ? `~${currentPeriodInfo.course.endPeriod}`
                    : ''}{' '}
                  節 · {currentPeriodInfo.startPInfo?.startTime} ~{' '}
                  {currentPeriodInfo.endPInfo?.endTime}
                </span>
                <h3 className="text-base font-medium text-white mt-0.5 tracking-normal leading-relaxed">
                  {currentPeriodInfo.course.name}
                </h3>
              </div>
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 shrink-0">
                {currentPeriodInfo.course.instructor}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-blue-200/50 dark:border-blue-900/30 text-xs text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {currentPeriodInfo.course.classroom}
                </span>
              </div>
              {currentPeriodInfo.course.note && (
                <div className="flex items-center gap-1.5 truncate text-neutral-500">
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{currentPeriodInfo.course.note}</span>
                </div>
              )}
            </div>
          </div>
        ) : todayCourses.length > 0 ? (
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200/60 dark:border-[#2C2C2E] text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              今日的所有課程均已上課完畢！
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              可利用晚間時間複習或著手完成待辦作業。
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200/60 dark:border-[#2C2C2E] text-center">
            <Sparkles className="w-7 h-7 text-amber-500 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              今日沒有排定的課堂
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              享受美好的自主學習或校園生活時光。
            </p>
          </div>
        )}
      </section>

      {/* Campus Food & Deals Quick Banner */}
      <div
        onClick={() => onNavigateTab('food')}
        className="p-3.5 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white shadow-xs cursor-pointer hover:shadow-md transition-all flex items-center justify-between gap-3 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight">今日吃什麼？朝陽美食抽籤</span>
              <span className="px-1.5 py-0.2 rounded-md bg-white text-orange-600 text-[10px] font-extrabold">
                學生優惠
              </span>
            </div>
            <p className="text-[11px] text-amber-100 mt-0.5">
              吉峰路 · 樹仁商圈 · 學餐憑證滿百折 $10
            </p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
          <ChevronRight className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Urgent Assignments (Due within 72 hours) */}
      <section className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-4.5 border border-neutral-200/80 dark:border-[#2C2C2E] shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">待繳作業提醒</h2>
          </div>
          <button
            onClick={() => onNavigateTab('todo')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-0.5"
          >
            <span>全部待辦 ({pendingAssignments.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingAssignments.length > 0 ? (
          <div className="space-y-2">
            {pendingAssignments.slice(0, 3).map((item) => {
              const due = new Date(item.dueDate);
              const isUrgent =
                due.getTime() - today.getTime() < 48 * 60 * 60 * 1000 &&
                due.getTime() - today.getTime() > 0;
              const isOverdue = due.getTime() < today.getTime();

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-[#242426] hover:bg-neutral-100 dark:hover:bg-[#2C2C2E] border border-neutral-200/60 dark:border-[#38383A] transition-colors"
                >
                  <button
                    onClick={() => onToggleAssignment(item.id)}
                    aria-label={`完成作業：${item.title}`}
                    className="w-6 h-6 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 hover:border-blue-600 flex items-center justify-center shrink-0 transition-colors"
                  >
                    {item.completed && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate tracking-normal leading-relaxed">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-0.5">
                      <span className="truncate max-w-[130px] font-normal text-neutral-300">{item.courseName}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`tabular-nums font-normal ${
                          isOverdue
                            ? 'text-rose-400 font-medium'
                            : isUrgent
                            ? 'text-amber-400 font-medium'
                            : 'text-neutral-400'
                        }`}
                      >
                        {isOverdue ? '已逾期 ' : ''}
                        {due.getMonth() + 1}/{due.getDate()} {String(due.getHours()).padStart(2, '0')}:
                        {String(due.getMinutes()).padStart(2, '0')}
                      </span>
                      {item.aiSolution && (
                        <span className="px-1 py-0.2 rounded bg-blue-900/40 text-blue-300 text-[9px] font-mono">
                          ✨AI詳解
                        </span>
                      )}
                    </div>
                  </div>

                  {isUrgent && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-medium shrink-0">
                      即將截止
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-5 text-center text-xs text-neutral-400">
            太棒了！目前沒有未完成的作業。
          </div>
        )}
      </section>

      {/* Exam Countdown Highlight */}
      {nextExam && (
        <section className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-4.5 border border-neutral-200/80 dark:border-[#2C2C2E] shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">重點考試倒數</h2>
            </div>
            <button
              onClick={() => onNavigateTab('todo')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>所有考試</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 border border-rose-200/60 dark:border-rose-900/30 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400 tracking-wide uppercase">
                {nextExam.type}
              </span>
              <h3 className="text-[15px] font-medium text-white mt-0.5 tracking-normal leading-relaxed">
                {nextExam.subject}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{nextExam.location}</span>
              </p>
            </div>

            <div className="text-center px-3 py-2 rounded-2xl bg-white dark:bg-[#242426] shadow-xs border border-rose-100 dark:border-[#38383A] shrink-0">
              <span className="text-[10px] text-neutral-400 block font-medium">倒數</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
                {examDaysLeft !== null && examDaysLeft > 0 ? examDaysLeft : '0'}
              </span>
              <span className="text-[10px] text-neutral-500 block font-semibold">天</span>
            </div>
          </div>
        </section>
      )}

      {/* Chaoyang Campus Quick Portals */}
      <section className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-4.5 border border-neutral-200/80 dark:border-[#2C2C2E] shadow-xs transition-colors">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">朝陽生活快捷入口</h2>

        <div className="grid grid-cols-3 gap-2.5">
          <a
            href="https://ecampus.cyut.edu.tw/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-50 dark:bg-[#242426] hover:bg-blue-50 dark:hover:bg-[#2C2C2E] border border-neutral-200/60 dark:border-[#38383A] transition-colors text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">學生系統</span>
            <span className="text-[10px] text-neutral-400">選課/成績</span>
          </a>

          <a
            href="https://tronclass.cyut.edu.tw/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-50 dark:bg-[#242426] hover:bg-amber-50 dark:hover:bg-[#2C2C2E] border border-neutral-200/60 dark:border-[#38383A] transition-colors text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">E-Learning</span>
            <span className="text-[10px] text-neutral-400">講義/作業</span>
          </a>

          <a
            href="https://citybus.taichung.gov.tw/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-50 dark:bg-[#242426] hover:bg-emerald-50 dark:hover:bg-[#2C2C2E] border border-neutral-200/60 dark:border-[#38383A] transition-colors text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Bus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">校園公車</span>
            <span className="text-[10px] text-neutral-400">151/131/132</span>
          </a>
        </div>
      </section>
    </div>
  );
};
