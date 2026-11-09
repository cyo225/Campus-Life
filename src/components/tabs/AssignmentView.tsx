import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Calendar,
  AlertCircle,
  Filter,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Assignment, Course } from '../../types';
import { Modal } from '../Modal';

interface AssignmentViewProps {
  assignments: Assignment[];
  courses: Course[];
  onAddAssignment: (item: Omit<Assignment, 'id' | 'createdAt'>) => void;
  onUpdateAssignment: (id: string, updates: Partial<Assignment>) => void;
  onToggleAssignment: (id: string) => void;
  onDeleteAssignment: (id: string) => void;
}

export const AssignmentView: React.FC<AssignmentViewProps> = ({
  assignments,
  courses,
  onAddAssignment,
  onUpdateAssignment,
  onToggleAssignment,
  onDeleteAssignment,
}) => {
  const [filterMode, setFilterMode] = useState<'pending' | 'completed' | 'all'>('pending');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Assignment | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [courseName, setCourseName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');

  const today = useMemo(() => new Date(), []);

  // Filter and sort assignments
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((a) => {
        if (filterMode === 'pending' && a.completed) return false;
        if (filterMode === 'completed' && !a.completed) return false;
        if (selectedCourseFilter !== 'all' && a.courseName !== selectedCourseFilter) return false;
        return true;
      })
      .sort((a, b) => {
        // Pending first, then by dueDate asc
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [assignments, filterMode, selectedCourseFilter]);

  const courseNames = useMemo(() => {
    const names = new Set<string>();
    courses.forEach((c) => names.add(c.name));
    assignments.forEach((a) => names.add(a.courseName));
    return Array.from(names);
  }, [courses, assignments]);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setCourseName(courses[0]?.name || '自主學習專案');
    // Default dueDate: 3 days ahead at 23:59
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 0, 0);
    setDueDate(d.toISOString().slice(0, 16));
    setPriority('medium');
    setNote('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (a: Assignment) => {
    setEditingItem(a);
    setTitle(a.title);
    setCourseName(a.courseName);
    setDueDate(a.dueDate.slice(0, 16));
    setPriority(a.priority);
    setNote(a.note || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleToggle = (id: string, wasCompleted: boolean) => {
    onToggleAssignment(id);
    if (!wasCompleted) {
      // Check if all pending were cleared
      const remainingPending = assignments.filter((a) => !a.completed && a.id !== id);
      if (remainingPending.length === 0) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('請輸入作業名稱');
      return;
    }
    if (!dueDate) {
      setFormError('請設定截止時間');
      return;
    }

    if (editingItem) {
      onUpdateAssignment(editingItem.id, {
        title: title.trim(),
        courseName: courseName.trim() || '未指定科目',
        dueDate,
        priority,
        note: note.trim(),
      });
    } else {
      onAddAssignment({
        title: title.trim(),
        courseName: courseName.trim() || '未指定科目',
        dueDate,
        completed: false,
        priority,
        note: note.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除這筆作業嗎？')) {
      onDeleteAssignment(id);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Top Header & Add Button */}
      <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterMode === 'pending'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            待繳
          </button>
          <button
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterMode === 'completed'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            已完成
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterMode === 'all'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            全部
          </button>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>新增作業</span>
        </button>
      </div>

      {/* Course Filter Dropdown if multiple courses exist */}
      {courseNames.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCourseFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
              selectedCourseFilter === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            所有科目
          </button>
          {courseNames.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedCourseFilter(name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                selectedCourseFilter === name
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Assignment List */}
      <div className="space-y-2.5">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((item) => {
            const due = new Date(item.dueDate);
            const diffHours = (due.getTime() - today.getTime()) / (1000 * 60 * 60);
            const isOverdue = diffHours < 0 && !item.completed;
            const isUrgent = diffHours >= 0 && diffHours <= 72 && !item.completed;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-xs ${
                  item.completed
                    ? 'border-slate-200/50 dark:border-slate-800/60 opacity-60'
                    : isOverdue
                    ? 'border-rose-300 dark:border-rose-900/60'
                    : isUrgent
                    ? 'border-amber-300 dark:border-amber-900/60'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggle(item.id, item.completed)}
                    aria-label={item.completed ? '標記為未完成' : '標記為已完成'}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      item.completed
                        ? 'bg-emerald-500 text-white'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-blue-600'
                    }`}
                  >
                    {item.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`text-sm font-bold text-slate-900 dark:text-white leading-snug ${
                          item.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                          aria-label="編輯作業"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                          aria-label="刪除作業"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.courseName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <div className="flex items-center gap-1 tabular-nums font-semibold">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span
                          className={
                            isOverdue
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : isUrgent
                              ? 'text-amber-600 dark:text-amber-400 font-bold'
                              : 'text-slate-600 dark:text-slate-400'
                          }
                        >
                          {isOverdue && '逾期 '}
                          {due.getMonth() + 1}/{due.getDate()} {String(due.getHours()).padStart(2, '0')}:
                          {String(due.getMinutes()).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {item.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl mt-2 leading-relaxed">
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-14 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center p-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {filterMode === 'completed' ? '目前尚無已完成的作業' : '沒有待處理的作業清單'}
            </h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              所有的課堂作業均已妥善管理。
            </p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            >
              新增一筆作業
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? '編輯作業事項' : '新增課堂作業'}
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
              作業項目名稱 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：PWA 校園生活架構報告"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              關聯課程科目
            </label>
            <div className="flex gap-2">
              <select
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {courseNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
                <option value="自主學習專案">自主學習專案</option>
                <option value="系所學術演講">系所學術演講</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                截止時間 <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                優先級別
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="high">高 (重要急迫)</option>
                <option value="medium">中 (標準日常)</option>
                <option value="low">低 (充裕彈性)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              繳交說明與備註
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如：上傳 PDF 至 E-Learning 數位學習平台，檔案小於 20MB"
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
              {editingItem ? '儲存變更' : '確認新增'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
