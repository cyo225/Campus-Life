import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Clock,
  ClockAlert,
  BookOpen,
  Calendar,
  AlertCircle,
  MapPin,
  Sparkles,
  Filter,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Assignment, Exam, Course } from '../../types';
import { Modal } from '../Modal';

interface TodoViewProps {
  assignments: Assignment[];
  exams: Exam[];
  courses: Course[];
  onAddAssignment: (item: Omit<Assignment, 'id' | 'createdAt'>) => void;
  onUpdateAssignment: (id: string, updates: Partial<Assignment>) => void;
  onToggleAssignment: (id: string) => void;
  onDeleteAssignment: (id: string) => void;
  onAddExam: (item: Omit<Exam, 'id'>) => void;
  onUpdateExam: (id: string, updates: Partial<Exam>) => void;
  onDeleteExam: (id: string) => void;
  onOpenAISolver?: (assignment?: Assignment) => void;
  onOpenAIDigest?: (exam?: Exam) => void;
}

export const TodoView: React.FC<TodoViewProps> = ({
  assignments,
  exams,
  courses,
  onAddAssignment,
  onUpdateAssignment,
  onToggleAssignment,
  onDeleteAssignment,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
  onOpenAISolver,
  onOpenAIDigest,
}) => {
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  // Mode: 'all' | 'assignments' | 'exams'
  const [activeTab, setActiveTab] = useState<'all' | 'assignments' | 'exams'>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [now, setNow] = useState<Date>(new Date());

  // Assignment Modal
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignCourse, setAssignCourse] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignPriority, setAssignPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [assignNote, setAssignNote] = useState('');

  // Exam Modal
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [examSubject, setExamSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examLocation, setExamLocation] = useState('');
  const [examType, setExamType] = useState<Exam['type']>('期中考');
  const [examNote, setExamNote] = useState('');

  const [formError, setFormError] = useState('');

  // Live timer tick every 10s
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const pendingAssignments = useMemo(() => assignments.filter((a) => !a.completed), [assignments]);
  const upcomingExams = useMemo(
    () => exams.filter((e) => new Date(e.examDate).getTime() > now.getTime()),
    [exams, now]
  );

  const courseNames = useMemo(() => {
    const names = new Set<string>();
    courses.forEach((c) => names.add(c.name));
    assignments.forEach((a) => names.add(a.courseName));
    return Array.from(names);
  }, [courses, assignments]);

  // Open Assignment Modal
  const openAddAssignment = () => {
    setEditingAssignment(null);
    setAssignTitle('');
    setAssignCourse(courses[0]?.name || '自主學習專案');
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 0, 0);
    setAssignDueDate(d.toISOString().slice(0, 16));
    setAssignPriority('medium');
    setAssignNote('');
    setFormError('');
    setIsAssignmentModalOpen(true);
  };

  const openEditAssignment = (a: Assignment) => {
    setEditingAssignment(a);
    setAssignTitle(a.title);
    setAssignCourse(a.courseName);
    setAssignDueDate(a.dueDate.slice(0, 16));
    setAssignPriority(a.priority);
    setAssignNote(a.note || '');
    setFormError('');
    setIsAssignmentModalOpen(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim()) {
      setFormError('請輸入作業名稱');
      return;
    }
    if (!assignDueDate) {
      setFormError('請設定截止時間');
      return;
    }

    if (editingAssignment) {
      onUpdateAssignment(editingAssignment.id, {
        title: assignTitle.trim(),
        courseName: assignCourse.trim() || '自主學習',
        dueDate: assignDueDate,
        priority: assignPriority,
        note: assignNote.trim(),
      });
    } else {
      onAddAssignment({
        title: assignTitle.trim(),
        courseName: assignCourse.trim() || '自主學習',
        dueDate: assignDueDate,
        completed: false,
        priority: assignPriority,
        note: assignNote.trim(),
      });
    }
    setIsAssignmentModalOpen(false);
  };

  // Open Exam Modal
  const openAddExam = () => {
    setEditingExam(null);
    setExamSubject('');
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(10, 10, 0, 0);
    setExamDate(d.toISOString().slice(0, 16));
    setExamLocation('');
    setExamType('期中考');
    setExamNote('');
    setFormError('');
    setIsExamModalOpen(true);
  };

  const openEditExam = (e: Exam) => {
    setEditingExam(e);
    setExamSubject(e.subject);
    setExamDate(e.examDate.slice(0, 16));
    setExamLocation(e.location);
    setExamType(e.type);
    setExamNote(e.note || '');
    setFormError('');
    setIsExamModalOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examSubject.trim()) {
      setFormError('請輸入測驗科目名稱');
      return;
    }
    if (!examDate) {
      setFormError('請設定考試日期與時間');
      return;
    }

    if (editingExam) {
      onUpdateExam(editingExam.id, {
        subject: examSubject.trim(),
        examDate,
        location: examLocation.trim() || '未公佈考場',
        type: examType,
        note: examNote.trim(),
      });
    } else {
      onAddExam({
        subject: examSubject.trim(),
        examDate,
        location: examLocation.trim() || '未公佈考場',
        type: examType,
        note: examNote.trim(),
      });
    }
    setIsExamModalOpen(false);
  };

  const handleToggleAssign = (id: string, wasCompleted: boolean) => {
    onToggleAssignment(id);
    if (!wasCompleted) {
      const remaining = assignments.filter((a) => !a.completed && a.id !== id);
      if (remaining.length === 0) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    }
  };

  const getCountdownDays = (iso: string) => {
    const diff = new Date(iso).getTime() - now.getTime();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Top Segmented Controls */}
      <div className="bg-white dark:bg-[#1C1C1E] p-1.5 rounded-2xl border border-neutral-200/80 dark:border-[#2C2C2E] shadow-xs flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 flex-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            全部總覽
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
              activeTab === 'assignments'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            作業 ({pendingAssignments.length})
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
              activeTab === 'exams'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            考試 ({upcomingExams.length})
          </button>
        </div>

        {/* Add Actions */}
        <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-neutral-100 dark:border-[#2C2C2E]">
          {activeTab === 'exams' ? (
            <button
              onClick={openAddExam}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>加考試</span>
            </button>
          ) : (
            <button
              onClick={openAddAssignment}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>加作業</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Academic Assistant Hub Banner */}
      <div className="p-3.5 rounded-3xl bg-neutral-900/90 dark:bg-[#1C1C1E] border border-blue-500/30 shadow-xs flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8.5 h-8.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-white tracking-tight">
                AI 智慧助教中心
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-blue-600/30 text-blue-300 text-[9px] font-mono border border-blue-500/40">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 truncate font-normal">
              作業一步驟步拆解 · 考前衝刺 3合1 重點
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onOpenAISolver?.()}
            className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-normal flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>解題</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAIDigest?.()}
            className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-normal flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-3 h-3" />
            <span>考前衝刺</span>
          </button>
        </div>
      </div>

      {/* EXAMS SECTION */}
      {(activeTab === 'all' || activeTab === 'exams') && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h3 className="text-xs font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">
                考試時程與倒數
              </h3>
            </div>
            <span className="text-[11px] text-neutral-400">
              {upcomingExams.length} 場即將進行
            </span>
          </div>

          <div className="space-y-2">
            {exams.length > 0 ? (
              exams.map((item) => {
                const daysLeft = getCountdownDays(item.examDate);
                const isPast = new Date(item.examDate).getTime() <= now.getTime();
                const examD = new Date(item.examDate);

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-[#2C2C2E] shadow-xs flex items-start justify-between gap-3 hover:border-rose-400 transition-all"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-medium tracking-tight">
                          {item.type}
                        </span>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {examD.getMonth() + 1}/{examD.getDate()} ({['日', '一', '二', '三', '四', '五', '六'][examD.getDay()]}){' '}
                          {String(examD.getHours()).padStart(2, '0')}:{String(examD.getMinutes()).padStart(2, '0')}
                        </span>
                      </div>

                      <h4 className="text-[15px] font-medium text-white tracking-normal leading-relaxed truncate">
                        {item.subject}
                      </h4>

                      <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-normal">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>考場：{item.location}</span>
                      </div>

                      {item.note && (
                        <p className="text-[11px] text-neutral-300 bg-neutral-50 dark:bg-[#242426] p-2 rounded-xl font-normal leading-relaxed">
                          備註：{item.note}
                        </p>
                      )}

                      {/* AI Digest Action & Badge */}
                      <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                        {item.aiDigest ? (
                          <button
                            type="button"
                            onClick={() => onOpenAIDigest?.(item)}
                            className="px-2.5 py-1 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-[11px] font-normal flex items-center gap-1 transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>查看 3合1 衝刺重點 ({item.aiDigest.concepts.length}考點 · {item.aiDigest.quiz.length}測驗)</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenAIDigest?.(item)}
                            className="px-2.5 py-1 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700 text-neutral-300 hover:text-white text-[11px] font-normal flex items-center gap-1 transition-colors"
                          >
                            <BookOpen className="w-3 h-3 text-rose-400" />
                            <span>生成 AI 考前重點</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right side countdown & actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-center px-3 py-1.5 rounded-2xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200/80 dark:border-[#38383A]">
                        {isPast ? (
                          <span className="text-[10px] font-bold text-neutral-400">已結束</span>
                        ) : (
                          <>
                            <span className="text-xl font-black text-rose-600 dark:text-rose-400 tabular-nums block">
                              {daysLeft}
                            </span>
                            <span className="text-[9px] text-neutral-400 block font-semibold">天倒數</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditExam(item)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-neutral-100 dark:hover:bg-[#2C2C2E]"
                          aria-label="編輯考試"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('確定要刪除這場考試嗎？')) onDeleteExam(item.id);
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-[#2C2C2E]"
                          aria-label="刪除考試"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/80 dark:border-[#2C2C2E] text-center p-4">
                <Calendar className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-1.5" />
                <p className="text-xs text-neutral-400">目前沒有排定任何考試時程。</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ASSIGNMENTS SECTION */}
      {(activeTab === 'all' || activeTab === 'assignments') && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h3 className="text-xs font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">
                課堂作業清單
              </h3>
            </div>

            {/* Sub-filter for assignments */}
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <button
                onClick={() => setAssignmentFilter('pending')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  assignmentFilter === 'pending'
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                未完成 ({pendingAssignments.length})
              </button>
              <button
                onClick={() => setAssignmentFilter('completed')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  assignmentFilter === 'completed'
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                已完成
              </button>
              <button
                onClick={() => setAssignmentFilter('all')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  assignmentFilter === 'all'
                    ? 'bg-neutral-200 dark:bg-[#2C2C2E] text-neutral-800 dark:text-white'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                全部
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {assignments
              .filter((a) => {
                if (assignmentFilter === 'pending') return !a.completed;
                if (assignmentFilter === 'completed') return a.completed;
                return true;
              })
              .map((item) => {
                const due = new Date(item.dueDate);
                const isOverdue = due.getTime() < now.getTime() && !item.completed;
                const isUrgent =
                  due.getTime() - now.getTime() < 48 * 60 * 60 * 1000 &&
                  due.getTime() - now.getTime() > 0 &&
                  !item.completed;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-3xl bg-white dark:bg-[#1C1C1E] border transition-all shadow-xs flex items-start gap-3 ${
                      item.completed
                        ? 'border-neutral-200/50 dark:border-[#2C2C2E]/60 opacity-60'
                        : isOverdue
                        ? 'border-rose-300 dark:border-rose-900/60'
                        : isUrgent
                        ? 'border-amber-300 dark:border-amber-900/60'
                        : 'border-neutral-200/80 dark:border-[#2C2C2E]'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleAssign(item.id, item.completed)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        item.completed
                          ? 'bg-emerald-500 text-white'
                          : 'border-2 border-neutral-300 dark:border-neutral-600 hover:border-blue-600'
                      }`}
                      aria-label="切換完成狀態"
                    >
                      {item.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`text-[14.5px] font-medium leading-relaxed tracking-normal text-white ${
                            item.completed ? 'line-through text-neutral-400 opacity-80' : ''
                          }`}
                        >
                          {item.title}
                        </h4>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEditAssignment(item)}
                            className="p-1 rounded-lg text-neutral-400 hover:text-blue-500"
                            aria-label="編輯作業"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('確定要刪除這筆作業嗎？'))
                                onDeleteAssignment(item.id);
                            }}
                            className="p-1 rounded-lg text-neutral-400 hover:text-rose-500"
                            aria-label="刪除作業"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mt-1">
                        <span className="font-medium text-neutral-200">
                          {item.courseName}
                        </span>
                        <span>·</span>
                        <span
                          className={`tabular-nums font-normal ${
                            isOverdue
                              ? 'text-rose-400 font-medium'
                              : isUrgent
                              ? 'text-amber-400 font-medium'
                              : 'text-neutral-400'
                          }`}
                        >
                          {isOverdue ? '已逾期 ' : '截止：'}
                          {due.getMonth() + 1}/{due.getDate()} {String(due.getHours()).padStart(2, '0')}:
                          {String(due.getMinutes()).padStart(2, '0')}
                        </span>

                        {isUrgent && (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-medium">
                            即將到期
                          </span>
                        )}
                      </div>

                      {item.note && (
                        <p className="text-[11px] text-neutral-300 bg-neutral-50 dark:bg-[#242426] p-2 rounded-xl mt-2 leading-relaxed font-normal">
                          備註：{item.note}
                        </p>
                      )}

                      {/* AI Solution Section */}
                      <div className="pt-2">
                        {item.aiSolution ? (
                          <div className="space-y-2 rounded-2xl bg-neutral-900/90 dark:bg-[#202022] border border-blue-500/30 p-2.5">
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedSolutions((prev) => ({
                                    ...prev,
                                    [item.id]: !prev[item.id],
                                  }))
                                }
                                className="flex items-center gap-1.5 text-xs text-blue-400 font-medium hover:text-blue-300"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>AI 實質擬答與解題說明</span>
                                {expandedSolutions[item.id] ? (
                                  <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => onOpenAISolver?.(item)}
                                className="text-[10px] text-neutral-400 hover:text-white font-normal"
                              >
                                開啟完整詳解
                              </button>
                            </div>

                            {/* Collapsible Content */}
                            {expandedSolutions[item.id] && (
                              <div className="space-y-2.5 pt-2 border-t border-neutral-800 text-xs animate-in fade-in duration-200">
                                {/* Complete Answer Preview */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-medium text-emerald-400">
                                      【1. 完整擬答內容】
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(item.aiSolution?.completeAnswer || item.aiSolution?.finalAnswer || '');
                                        alert('已複製完整擬答！');
                                      }}
                                      className="text-[10px] text-blue-400 hover:text-blue-300"
                                    >
                                      複製擬答
                                    </button>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-neutral-800/60 text-[11px] text-white leading-relaxed font-normal whitespace-pre-wrap max-h-48 overflow-y-auto font-sans">
                                    {item.aiSolution.completeAnswer || item.aiSolution.finalAnswer}
                                  </div>
                                </div>

                                {/* Detailed Breakdown Preview */}
                                {item.aiSolution.detailedBreakdown && item.aiSolution.detailedBreakdown.length > 0 && (
                                  <div className="space-y-1.5 pt-1">
                                    <span className="text-[10px] font-medium text-blue-400">
                                      【2. 逐格 / 逐題詳細解題說明】
                                    </span>
                                    {item.aiSolution.detailedBreakdown.map((b, bIdx) => (
                                      <div key={bIdx} className="p-2 rounded-xl bg-neutral-800/40 text-[11px] space-y-0.5">
                                        <span className="text-[10px] text-blue-300 font-mono block">{b.target}</span>
                                        <p className="text-white font-normal">{b.answer}</p>
                                        <p className="text-neutral-400 font-normal text-[10px]">{b.explanation}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenAISolver?.(item)}
                            className="px-2.5 py-1 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700 text-neutral-300 hover:text-white text-[11px] font-normal flex items-center gap-1 transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>AI 智慧解題拆解</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

            {assignments.length === 0 && (
              <div className="py-8 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/80 dark:border-[#2C2C2E] text-center p-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                <p className="text-xs text-neutral-400">恭喜！目前沒有任何作業紀錄。</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Assignment Modal */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        title={editingAssignment ? '編輯課堂作業' : '新增課堂作業'}
      >
        <form onSubmit={handleSaveAssignment} className="space-y-3.5">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
              作業標題 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={assignTitle}
              onChange={(e) => setAssignTitle(e.target.value)}
              placeholder="例如：雲端運算 Docker 實驗報告三"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
              所屬課程
            </label>
            <input
              type="text"
              value={assignCourse}
              onChange={(e) => setAssignCourse(e.target.value)}
              list="courses-datalist"
              placeholder="選擇或直接輸入課程名稱"
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white"
            />
            <datalist id="courses-datalist">
              {courseNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                截止時間
              </label>
              <input
                type="datetime-local"
                value={assignDueDate}
                onChange={(e) => setAssignDueDate(e.target.value)}
                required
                className="w-full px-2.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                重要優先級
              </label>
              <select
                value={assignPriority}
                onChange={(e) => setAssignPriority(e.target.value as any)}
                className="w-full px-2.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white"
              >
                <option value="high">高 (需優先完成)</option>
                <option value="medium">一般 (中等優先)</option>
                <option value="low">低 (自主練習)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
              作業細節或繳交要求
            </label>
            <textarea
              rows={2}
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
              placeholder="例如：需上傳至 TronClass PDF 檔案格式"
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAssignmentModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-[#38383A] text-neutral-600 dark:text-neutral-300 text-xs font-bold"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
            >
              確認儲存
            </button>
          </div>
        </form>
      </Modal>

      {/* Exam Modal */}
      <Modal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        title={editingExam ? '編輯考試時程' : '新增重點考試'}
      >
        <form onSubmit={handleSaveExam} className="space-y-3.5">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
              考試科目名稱 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={examSubject}
              onChange={(e) => setExamSubject(e.target.value)}
              placeholder="例如：演算法與高階資料結構"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                考試日期與時間
              </label>
              <input
                type="datetime-local"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                required
                className="w-full px-2.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                考試類別
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as any)}
                className="w-full px-2.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white"
              >
                <option value="期中考">期中考</option>
                <option value="期末考">期末考</option>
                <option value="隨堂測驗">隨堂測驗</option>
                <option value="證照考">證照考</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
              考試教室 / 地點
            </label>
            <input
              type="text"
              value={examLocation}
              onChange={(e) => setExamLocation(e.target.value)}
              placeholder="例如：T2-405 科技大樓"
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
              考試範圍或注意事項
            </label>
            <textarea
              rows={2}
              value={examNote}
              onChange={(e) => setExamNote(e.target.value)}
              placeholder="例如：涵蓋第 1-5 章、需帶工程計算機"
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsExamModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-[#38383A] text-neutral-600 dark:text-neutral-300 text-xs font-bold"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              確認儲存
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
