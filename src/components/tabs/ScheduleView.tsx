import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  MapPin,
  User,
  Clock,
  BookOpen,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  UploadCloud,
} from 'lucide-react';
import { Course, Assignment, Exam } from '../../types';
import { CHAOYANG_PERIODS, COURSE_COLOR_OPTIONS } from '../../constants/initialData';
import { Modal } from '../Modal';
import { ImportScheduleModal } from '../ImportScheduleModal';

interface ScheduleViewProps {
  courses: Course[];
  onAddCourse: (course: Omit<Course, 'id'>) => void;
  onUpdateCourse: (id: string, updates: Partial<Course>) => void;
  onDeleteCourse: (id: string) => void;
  onImportCourses: (courses: Course[], replace: boolean) => void;
  onImportAssignments?: (assignments: Omit<Assignment, 'id' | 'createdAt'>[]) => void;
  onImportExams?: (exams: Omit<Exam, 'id'>[]) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  courses,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onImportCourses,
  onImportAssignments,
  onImportExams,
}) => {
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [showWeekend, setShowWeekend] = useState<boolean>(false);

  // Default to today's day of week (1..7)
  const today = new Date();
  const currentDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
  const [selectedDay, setSelectedDay] = useState<number>(currentDayOfWeek > 5 ? 1 : currentDayOfWeek);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startPeriod, setStartPeriod] = useState<number>(1);
  const [endPeriod, setEndPeriod] = useState<number>(2);
  const [classroom, setClassroom] = useState('');
  const [instructor, setInstructor] = useState('');
  const [color, setColor] = useState('blue');
  const [credits, setCredits] = useState<number>(3);
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');

  // Course Detail Bottom Sheet
  const [inspectCourse, setInspectCourse] = useState<Course | null>(null);

  const days = showWeekend
    ? [
        { num: 1, name: '週一' },
        { num: 2, name: '週二' },
        { num: 3, name: '週三' },
        { num: 4, name: '週四' },
        { num: 5, name: '週五' },
        { num: 6, name: '週六' },
        { num: 7, name: '週日' },
      ]
    : [
        { num: 1, name: '週一' },
        { num: 2, name: '週二' },
        { num: 3, name: '週三' },
        { num: 4, name: '週四' },
        { num: 5, name: '週五' },
      ];

  const openAddModal = (defaultDay?: number, defaultPeriod?: number) => {
    setEditingCourse(null);
    setName('');
    setCode('');
    setDayOfWeek(defaultDay || selectedDay);
    setStartPeriod(defaultPeriod || 1);
    setEndPeriod(defaultPeriod ? Math.min(defaultPeriod + 1, 9) : 2);
    setClassroom('');
    setInstructor('');
    setColor(COURSE_COLOR_OPTIONS[Math.floor(Math.random() * COURSE_COLOR_OPTIONS.length)].id);
    setCredits(3);
    setNote('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setName(c.name);
    setCode(c.code);
    setDayOfWeek(c.dayOfWeek);
    setStartPeriod(c.startPeriod);
    setEndPeriod(c.endPeriod);
    setClassroom(c.classroom);
    setInstructor(c.instructor);
    setColor(c.color);
    setCredits(c.credits);
    setNote(c.note || '');
    setFormError('');
    setInspectCourse(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('請填寫課程名稱');
      return;
    }
    if (startPeriod > endPeriod) {
      setFormError('開始節次不可大於結束節次');
      return;
    }

    // Check conflict (excluding current editing course)
    const conflict = courses.find((c) => {
      if (editingCourse && c.id === editingCourse.id) return false;
      if (c.dayOfWeek !== dayOfWeek) return false;
      return Math.max(c.startPeriod, startPeriod) <= Math.min(c.endPeriod, endPeriod);
    });

    if (conflict) {
      setFormError(`與現有課程「${conflict.name}」在週${dayOfWeek} 第 ${conflict.startPeriod}~${conflict.endPeriod} 節衝突`);
      return;
    }

    if (editingCourse) {
      onUpdateCourse(editingCourse.id, {
        name: name.trim(),
        code: code.trim() || 'CYUT',
        dayOfWeek,
        startPeriod,
        endPeriod,
        classroom: classroom.trim() || '未定教室',
        instructor: instructor.trim() || '授課教師',
        color,
        credits: Number(credits) || 2,
        note: note.trim(),
      });
    } else {
      onAddCourse({
        name: name.trim(),
        code: code.trim() || 'CYUT',
        dayOfWeek,
        startPeriod,
        endPeriod,
        classroom: classroom.trim() || '未定教室',
        instructor: instructor.trim() || '授課教師',
        color,
        credits: Number(credits) || 2,
        note: note.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除此堂課程嗎？此操作無法還原。')) {
      onDeleteCourse(id);
      setInspectCourse(null);
    }
  };

  // Helper color map with solid fill background & pure white medium text
  const getColorClasses = (colorId: string) => {
    const found = COURSE_COLOR_OPTIONS.find((c) => c.id === colorId);
    return (
      found || {
        bg: 'bg-blue-600',
        text: 'text-white font-medium',
        solidBg: 'bg-blue-600 dark:bg-blue-600',
        lightBg: 'bg-blue-600',
        border: 'border-blue-700 dark:border-blue-500',
      }
    );
  };

  // Day View courses
  const dayCourses = useMemo(() => {
    return courses
      .filter((c) => c.dayOfWeek === selectedDay)
      .sort((a, b) => a.startPeriod - b.startPeriod);
  }, [courses, selectedDay]);

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Top Controls Toolbar */}
      <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#1C1C1E] p-3 rounded-3xl border border-neutral-200/80 dark:border-[#2C2C2E] shadow-sm">
        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#2C2C2E] p-1 rounded-2xl">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'week'
                ? 'bg-white dark:bg-[#1C1C1E] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            週課表
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'day'
                ? 'bg-white dark:bg-[#1C1C1E] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            單日卡片
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5">
          {viewMode === 'week' && (
            <button
              onClick={() => setShowWeekend(!showWeekend)}
              className={`px-2 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                showWeekend
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900'
                  : 'bg-transparent text-neutral-400 border-neutral-200 dark:border-[#38383A] hover:bg-neutral-50 dark:hover:bg-[#2C2C2E]'
              }`}
            >
              {showWeekend ? '隱藏週末' : '含週末'}
            </button>
          )}

          {/* Smart Import Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#2C2C2E] hover:bg-neutral-200 dark:hover:bg-[#38383A] text-neutral-700 dark:text-neutral-200 text-xs font-bold transition-all border border-neutral-200/60 dark:border-[#38383A]"
            title="智慧匯入課表（支援 ICS、貼上文字與系所範本）"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>匯入課表</span>
          </button>

          {/* Manual Add Button */}
          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>加課</span>
          </button>
        </div>
      </div>

      {/* WEEK VIEW MODE: Solid color filled course cards with crisp pure white bold text */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-3 border border-neutral-200/80 dark:border-[#2C2C2E] shadow-sm overflow-x-auto">
          <div className="min-w-[340px]">
            {/* Days Header */}
            <div
              className="grid gap-1 pb-2 border-b border-neutral-100 dark:border-[#2C2C2E] text-center"
              style={{
                gridTemplateColumns: `44px repeat(${days.length}, minmax(0, 1fr))`,
              }}
            >
              <div className="text-[10px] font-bold text-neutral-400 py-1">節次</div>
              {days.map((d) => (
                <div
                  key={d.num}
                  className={`py-1 rounded-xl text-xs font-extrabold ${
                    d.num === currentDayOfWeek
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {d.name}
                </div>
              ))}
            </div>

            {/* Timetable Rows (CYUT Periods 1 to 9) */}
            <div className="divide-y divide-neutral-100 dark:divide-[#2C2C2E] mt-1">
              {CHAOYANG_PERIODS.map((p) => {
                return (
                  <div
                    key={p.period}
                    className="grid gap-1.5 py-1 min-h-[54px] items-stretch"
                    style={{
                      gridTemplateColumns: `44px repeat(${days.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {/* Period Time Column */}
                    <div className="flex flex-col items-center justify-center text-center pr-1 border-r border-neutral-100 dark:border-[#2C2C2E]">
                      <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-200 tabular-nums">
                        {p.period}
                      </span>
                      <span className="text-[9px] text-neutral-400 font-mono scale-90">
                        {p.startTime}
                      </span>
                    </div>

                    {/* Columns for each day */}
                    {days.map((d) => {
                      const activeCourse = courses.find(
                        (c) =>
                          c.dayOfWeek === d.num &&
                          p.period >= c.startPeriod &&
                          p.period <= c.endPeriod
                      );

                      if (!activeCourse) {
                        return (
                          <div
                            key={d.num}
                            onClick={() => openAddModal(d.num, p.period)}
                            className="rounded-xl border border-transparent hover:border-dashed hover:border-neutral-300 dark:hover:border-[#38383A] hover:bg-neutral-50 dark:hover:bg-[#242426] cursor-pointer flex items-center justify-center transition-colors group"
                            title={`點擊於 週${d.num} 第${p.period}節 新增課程`}
                          >
                            <span className="opacity-0 group-hover:opacity-100 text-neutral-300 dark:text-neutral-600 text-xs">
                              +
                            </span>
                          </div>
                        );
                      }

                      // Only render full info on startPeriod box
                      const isFirstPeriodOfCourse = activeCourse.startPeriod === p.period;
                      const colors = getColorClasses(activeCourse.color);

                      return (
                        <div
                          key={d.num}
                          onClick={() => setInspectCourse(activeCourse)}
                          className={`rounded-xl p-1.5 cursor-pointer text-left transition-all hover:scale-[1.02] shadow-sm ${
                            colors.bg
                          } text-white flex flex-col justify-between`}
                        >
                          {isFirstPeriodOfCourse ? (
                            <>
                              <div>
                                <span className="text-[10.5px] font-medium tracking-normal line-clamp-2 leading-[1.35] text-white">
                                  {activeCourse.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-0.5 mt-1 text-[9px] text-white/90 truncate font-normal tracking-tight">
                                <MapPin className="w-2.5 h-2.5 shrink-0 text-white/90" />
                                <span className="truncate">{activeCourse.classroom}</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-[9px] font-medium text-white/80">
                                續
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DAY VIEW MODE */}
      {viewMode === 'day' && (
        <div className="space-y-3">
          {/* Day Selector Buttons */}
          <div className="flex items-center justify-between gap-1 bg-white dark:bg-[#1C1C1E] p-2 rounded-2xl border border-neutral-200/80 dark:border-[#2C2C2E] shadow-sm overflow-x-auto">
            {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
              const dName = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'][dayNum - 1];
              const isSelected = selectedDay === dayNum;
              const isToday = currentDayOfWeek === dayNum;
              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`flex-1 min-w-[42px] py-2 px-1 rounded-xl text-center transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#2C2C2E]'
                  }`}
                >
                  <span className="text-[11px] block">{dName}</span>
                  {isToday && (
                    <span
                      className={`text-[8px] block font-bold ${
                        isSelected ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      今天
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Courses List for this Day */}
          <div className="space-y-2.5">
            {dayCourses.length > 0 ? (
              dayCourses.map((c) => {
                const colors = getColorClasses(c.color);
                const startP = CHAOYANG_PERIODS.find((p) => p.period === c.startPeriod);
                const endP = CHAOYANG_PERIODS.find((p) => p.period === c.endPeriod);

                return (
                  <div
                    key={c.id}
                    onClick={() => setInspectCourse(c)}
                    className="p-4 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-[#2C2C2E] hover:border-blue-500 cursor-pointer transition-all flex items-start justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {/* Solid color indicator badge with pure white text */}
                        <span className={`px-2 py-0.5 rounded-md ${colors.bg} text-white font-medium text-[10.5px] tracking-tight`}>
                          第 {c.startPeriod}{c.startPeriod !== c.endPeriod ? `~${c.endPeriod}` : ''} 節
                        </span>
                        <span className="text-xs font-normal text-neutral-400">
                          {startP?.startTime} ~ {endP?.endTime}
                        </span>
                      </div>

                      <h3 className="text-[15px] font-medium text-white tracking-normal leading-relaxed truncate">
                        {c.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300 pt-0.5">
                        <div className="flex items-center gap-1 font-medium text-white">
                          <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{c.classroom}</span>
                        </div>
                        <div className="flex items-center gap-1 text-neutral-300 font-normal">
                          <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{c.instructor}</span>
                        </div>
                        <div className="flex items-center gap-1 text-neutral-400 font-normal">
                          <span>{c.credits} 學分</span>
                        </div>
                      </div>

                      {c.note && (
                        <p className="text-xs text-neutral-300 bg-neutral-50 dark:bg-[#242426] p-2 rounded-xl mt-1 font-normal leading-relaxed">
                          備註：{c.note}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(c);
                      }}
                      className="p-2 rounded-xl text-neutral-400 hover:text-blue-500 hover:bg-neutral-100 dark:hover:bg-[#2C2C2E] transition-colors"
                      aria-label="編輯課程"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="py-12 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/80 dark:border-[#2C2C2E] text-center p-6">
                <Calendar className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                  今天沒有排定課程
                </h4>
                <p className="text-xs text-neutral-400 mt-1 mb-4">
                  點選下方按鈕即可在此星期新增或智慧匯入課程。
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => openAddModal(selectedDay)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                  >
                    新增當日課程
                  </button>
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-[#2C2C2E] hover:bg-neutral-200 dark:hover:bg-[#38383A] text-neutral-800 dark:text-neutral-200 font-bold text-xs"
                  >
                    智慧匯入
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inspect Course Modal */}
      {inspectCourse && (
        <Modal
          isOpen={!!inspectCourse}
          onClose={() => setInspectCourse(null)}
          title="課程資訊詳細"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  課程代碼：{inspectCourse.code}
                </span>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                  {inspectCourse.name}
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs">
                {inspectCourse.credits} 學分
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 border-y border-neutral-100 dark:border-[#2C2C2E] text-xs">
              <div className="space-y-1">
                <span className="text-neutral-400">上課時間</span>
                <p className="font-bold text-neutral-800 dark:text-neutral-200">
                  週{inspectCourse.dayOfWeek} 第 {inspectCourse.startPeriod}~{inspectCourse.endPeriod} 節
                </p>
                <p className="text-[11px] text-neutral-500">
                  {CHAOYANG_PERIODS.find((p) => p.period === inspectCourse.startPeriod)?.startTime} ~{' '}
                  {CHAOYANG_PERIODS.find((p) => p.period === inspectCourse.endPeriod)?.endTime}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-neutral-400">上課教室</span>
                <p className="font-bold text-neutral-800 dark:text-neutral-200">
                  {inspectCourse.classroom}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-neutral-400">授課老師</span>
                <p className="font-bold text-neutral-800 dark:text-neutral-200">
                  {inspectCourse.instructor}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-neutral-400">學校名稱</span>
                <p className="font-bold text-neutral-800 dark:text-neutral-200">朝陽科技大學</p>
              </div>
            </div>

            {inspectCourse.note && (
              <div className="bg-neutral-50 dark:bg-[#242426] p-3 rounded-2xl">
                <span className="text-[11px] font-bold text-neutral-400 block mb-1">課程備註</span>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {inspectCourse.note}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => openEditModal(inspectCourse)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>編輯課程</span>
              </button>
              <button
                onClick={() => handleDelete(inspectCourse.id)}
                className="py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>刪除</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? '編輯課程資訊' : '新增排定課程'}
      >
        <form onSubmit={handleSave} className="space-y-3.5">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
              課程名稱 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：雲端運算與架構實務"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                課程代碼
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="例如：CS3021"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                學分數
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                星期
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>週一</option>
                <option value={2}>週二</option>
                <option value={3}>週三</option>
                <option value={4}>週四</option>
                <option value={5}>週五</option>
                <option value={6}>週六</option>
                <option value={7}>週日</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                開始節次
              </label>
              <select
                value={startPeriod}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setStartPeriod(val);
                  if (endPeriod < val) setEndPeriod(val);
                }}
                className="w-full px-2 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {CHAOYANG_PERIODS.map((p) => (
                  <option key={p.period} value={p.period}>
                    第{p.period}節 ({p.startTime})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                結束節次
              </label>
              <select
                value={endPeriod}
                onChange={(e) => setEndPeriod(Number(e.target.value))}
                className="w-full px-2 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {CHAOYANG_PERIODS.map((p) => (
                  <option key={p.period} value={p.period} disabled={p.period < startPeriod}>
                    第{p.period}節 ({p.endTime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                上課教室
              </label>
              <input
                type="text"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder="例如：T2-405 科技大樓"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                授課教師
              </label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="例如：張教授"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">
              課堂卡片顏色 (純色填滿)
            </label>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {COURSE_COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={`w-7 h-7 rounded-full shrink-0 ${c.bg} transition-transform ${
                    color === c.id ? 'ring-3 ring-offset-2 ring-blue-600 scale-110' : 'opacity-80'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
              課堂備註
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如：需自備筆電實作、期末發表"
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-[#38383A] text-neutral-600 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-100 dark:hover:bg-[#2C2C2E] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs shadow-blue-500/20 transition-all"
            >
              {editingCourse ? '儲存變更' : '確認新增'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Smart Timetable Importer Modal */}
      <ImportScheduleModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportCourses={onImportCourses}
        onImportAssignments={onImportAssignments}
        onImportExams={onImportExams}
      />
    </div>
  );
};
