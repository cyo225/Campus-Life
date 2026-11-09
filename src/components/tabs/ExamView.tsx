import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Clock,
  MapPin,
  AlertCircle,
  FileText,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Exam } from '../../types';
import { Modal } from '../Modal';

interface ExamViewProps {
  exams: Exam[];
  onAddExam: (item: Omit<Exam, 'id'>) => void;
  onUpdateExam: (id: string, updates: Partial<Exam>) => void;
  onDeleteExam: (id: string) => void;
}

export const ExamView: React.FC<ExamViewProps> = ({
  exams,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [now, setNow] = useState<Date>(new Date());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form State
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<Exam['type']>('期中考');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');

  // Live timer tick every 10 seconds to update countdowns smoothly
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const openAddModal = () => {
    setEditingExam(null);
    setSubject('');
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(10, 10, 0, 0);
    setExamDate(d.toISOString().slice(0, 16));
    setLocation('');
    setType('期中考');
    setNote('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (e: Exam) => {
    setEditingExam(e);
    setSubject(e.subject);
    setExamDate(e.examDate.slice(0, 16));
    setLocation(e.location);
    setType(e.type);
    setNote(e.note || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setFormError('請輸入測驗/考試科目名稱');
      return;
    }
    if (!examDate) {
      setFormError('請設定考試日期與時間');
      return;
    }

    if (editingExam) {
      onUpdateExam(editingExam.id, {
        subject: subject.trim(),
        examDate,
        location: location.trim() || '未公佈考場',
        type,
        note: note.trim(),
      });
    } else {
      onAddExam({
        subject: subject.trim(),
        examDate,
        location: location.trim() || '未公佈考場',
        type,
        note: note.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除這筆考試排程嗎？')) {
      onDeleteExam(id);
    }
  };

  // Filtered exams sorted by date
  const sortedExams = useMemo(() => {
    return exams
      .filter((e) => (filterType === 'all' ? true : e.type === filterType))
      .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
  }, [exams, filterType]);

  const getCountdownParts = (targetIso: string) => {
    const diff = new Date(targetIso).getTime() - now.getTime();
    if (diff <= 0) {
      return { isPast: true, text: '已結束或測驗中' };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    return {
      isPast: false,
      days,
      hours,
      minutes,
    };
  };

  const getTypeBadgeStyle = (t: Exam['type']) => {
    switch (t) {
      case '期中考':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900';
      case '期末考':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900';
      case '證照考':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900';
      default:
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900';
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Type Filter */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto">
          {['all', '期中考', '期末考', '隨堂測驗', '證照考'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                filterType === t
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t === 'all' ? '全部' : t}
            </button>
          ))}
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/20 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>加考程</span>
        </button>
      </div>

      {/* Exam Cards */}
      <div className="space-y-3">
        {sortedExams.length > 0 ? (
          sortedExams.map((exam) => {
            const examTime = new Date(exam.examDate);
            const countdown = getCountdownParts(exam.examDate);
            const badgeClass = getTypeBadgeStyle(exam.type);

            return (
              <div
                key={exam.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeClass} mb-1`}
                    >
                      {exam.type}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {exam.subject}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(exam)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                      aria-label="編輯考試"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(exam.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                      aria-label="刪除考試"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Countdown Grid Strip */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="tabular-nums">
                      {examTime.getFullYear()}/{examTime.getMonth() + 1}/{examTime.getDate()}{' '}
                      {String(examTime.getHours()).padStart(2, '0')}:
                      {String(examTime.getMinutes()).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Countdown Digital Counter */}
                  {!countdown.isPast ? (
                    <div className="flex items-center gap-1 text-center shrink-0">
                      <div className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 shadow-2xs border border-slate-200/60 dark:border-slate-700 min-w-[32px]">
                        <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 tabular-nums block leading-none">
                          {countdown.days}
                        </span>
                        <span className="text-[9px] text-slate-400 block scale-90">天</span>
                      </div>
                      <span className="text-slate-300 font-bold">:</span>
                      <div className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 shadow-2xs border border-slate-200/60 dark:border-slate-700 min-w-[32px]">
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tabular-nums block leading-none">
                          {countdown.hours}
                        </span>
                        <span className="text-[9px] text-slate-400 block scale-90">時</span>
                      </div>
                      <span className="text-slate-300 font-bold">:</span>
                      <div className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 shadow-2xs border border-slate-200/60 dark:border-slate-700 min-w-[32px]">
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tabular-nums block leading-none">
                          {countdown.minutes}
                        </span>
                        <span className="text-[9px] text-slate-400 block scale-90">分</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                      {countdown.text}
                    </span>
                  )}
                </div>

                {/* Location & Details */}
                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="font-semibold">{exam.location}</span>
                </div>

                {exam.note && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl leading-relaxed">
                    範圍備註：{exam.note}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-14 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center p-6">
            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              尚無符合條件的考試排程
            </h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              可隨時將期中、期末或證照測驗加入倒數計時。
            </p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            >
              新增考試日程
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Exam Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? '編輯考試資訊' : '新增考試日程'}
      >
        <form onSubmit={handleSave} className="space-y-3.5">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              測驗科目名稱 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="例如：演算法分析與設計 期中考"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                考試日期與時間 <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                required
                className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                考試類型
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Exam['type'])}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="期中考">期中考</option>
                <option value="期末考">期末考</option>
                <option value="隨堂測驗">隨堂測驗</option>
                <option value="證照考">證照考</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              考場教室 / 地點
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例如：科技大樓 T2-301 演講廳"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              測驗範圍與攜帶工具備註
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如：範圍 Ch1~Ch5，可帶一張 A4 雙面大抄，禁止使用工程型計算機"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs shadow-blue-500/20 transition-all"
            >
              {editingExam ? '儲存變更' : '確認新增'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
