import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  User,
  GraduationCap,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Course, Assignment, Exam } from '../types';
import { Modal } from './Modal';
import {
  parseIcsCalendar,
  parseScheduleText,
  CYUT_PRESETS,
  ParsedScheduleResult,
} from '../utils/syllabusParser';
import confetti from 'canvas-confetti';

interface ImportScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCourses: (courses: Course[], replace: boolean) => void;
  onImportAssignments?: (assignments: Omit<Assignment, 'id' | 'createdAt'>[]) => void;
  onImportExams?: (exams: Omit<Exam, 'id'>[]) => void;
}

export const ImportScheduleModal: React.FC<ImportScheduleModalProps> = ({
  isOpen,
  onClose,
  onImportCourses,
  onImportAssignments,
  onImportExams,
}) => {
  const [activeTab, setActiveTab] = useState<'ics' | 'text' | 'preset'>('ics');
  const [replaceMode, setReplaceMode] = useState<boolean>(true);

  // ICS file state
  const [icsFile, setIcsFile] = useState<File | null>(null);
  const [icsParsing, setIcsParsing] = useState(false);

  // Text parser state
  const [rawText, setRawText] = useState(
    `雲端運算與架構實務 (一) 2-4節 T2-405 張教授 3學分
使用者介面設計 週二 5-7節 D-308 林主任
演算法設計 星期三 1-3節 T2-201 3學分
期中考：雲端架構大會考 2025/11/15 T2-405
作業：Docker Compose 微服務實作 2025/11/10`
  );

  // Parsed results ready for import
  const [parsedData, setParsedData] = useState<ParsedScheduleResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Handle ICS file read
  const handleIcsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIcsFile(file);
    setIcsParsing(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const result = parseIcsCalendar(content);
        if (result.courses.length === 0 && result.exams.length === 0) {
          setErrorMessage('無法從 ICS 檔案解析出課表或考試事件，請檢查檔案格式。');
        } else {
          setParsedData(result);
        }
      } catch (err) {
        setErrorMessage('解析 ICS 檔案失敗，請確認檔案格式是否正確。');
      } finally {
        setIcsParsing(false);
      }
    };
    reader.onerror = () => {
      setErrorMessage('讀取檔案失敗');
      setIcsParsing(false);
    };
    reader.readAsText(file);
  };

  // Handle Text Parser
  const handleParseText = () => {
    setErrorMessage(null);
    if (!rawText.trim()) {
      setErrorMessage('請貼上包含課程名稱與節次的文字內容');
      return;
    }
    const result = parseScheduleText(rawText);
    if (result.courses.length === 0 && result.exams.length === 0) {
      setErrorMessage('未能辨識出有效課程，請確認文字內含有「星期/週」與「第X~X節」');
    } else {
      setParsedData(result);
    }
  };

  // Handle Preset Select
  const handleSelectPreset = (presetId: string) => {
    const found = CYUT_PRESETS.find((p) => p.id === presetId);
    if (!found) return;

    const dummyCourses: Course[] = found.courses.map((c, index) => ({
      ...c,
      id: 'c_preset_' + index + '_' + Date.now().toString(36),
    }));

    setParsedData({
      courses: dummyCourses,
      assignments: [
        {
          title: `${found.courses[0].name} - 期中實作作業`,
          courseName: found.courses[0].name,
          dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
          completed: false,
          priority: 'high',
          note: '依課堂規定繳交',
        },
      ],
      exams: [
        {
          subject: `${found.courses[0].name} 期中會考`,
          examDate: new Date(Date.now() + 86400000 * 12).toISOString(),
          location: found.courses[0].classroom,
          type: '期中考',
          note: '統一筆試與實機測驗',
        },
      ],
      warnings: [],
    });
  };

  // Execute Import
  const handleConfirmImport = () => {
    if (!parsedData || parsedData.courses.length === 0) {
      setErrorMessage('沒有可供匯入的課程資料');
      return;
    }

    onImportCourses(parsedData.courses, replaceMode);

    if (onImportAssignments && parsedData.assignments.length > 0) {
      onImportAssignments(parsedData.assignments);
    }
    if (onImportExams && parsedData.exams.length > 0) {
      onImportExams(parsedData.exams);
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore if confetti not available
    }

    setSuccessToast(`成功匯入 ${parsedData.courses.length} 門課程！`);
    setTimeout(() => {
      onClose();
      setParsedData(null);
      setSuccessToast(null);
    }, 1200);
  };

  const dayLabels = ['', '週一', '週二', '週三', '週四', '週五', '週六', '週日'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="智慧匯入朝陽課表與時程">
      <div className="space-y-4">
        {/* Toast / Alert */}
        {successToast && (
          <div className="p-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab switchers */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 dark:bg-[#1C1C1E] rounded-2xl border border-neutral-200/80 dark:border-[#2C2C2E]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('ics');
              setErrorMessage(null);
            }}
            className={`py-2 px-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
              activeTab === 'ics'
                ? 'bg-white dark:bg-[#2C2C2E] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>上傳 ICS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('text');
              setErrorMessage(null);
            }}
            className={`py-2 px-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
              activeTab === 'text'
                ? 'bg-white dark:bg-[#2C2C2E] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>貼上文字</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('preset');
              setErrorMessage(null);
            }}
            className={`py-2 px-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
              activeTab === 'preset'
                ? 'bg-white dark:bg-[#2C2C2E] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>系所範本</span>
          </button>
        </div>

        {/* TAB 1: ICS FILE UPLOAD */}
        {activeTab === 'ics' && (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-neutral-300 dark:border-[#38383A] hover:border-blue-500 rounded-3xl p-6 text-center cursor-pointer transition-colors relative bg-neutral-50 dark:bg-[#1C1C1E]">
              <input
                type="file"
                accept=".ics,text/calendar"
                onChange={handleIcsFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100">
                {icsFile ? icsFile.name : '點擊或將 .ics 行事曆檔案拖曳至此'}
              </h4>
              <p className="text-[11px] text-neutral-400 mt-1">
                支援朝陽 e-Campus、TronClass 學習歷程或 Google Calendar 匯出檔
              </p>
              {icsParsing && (
                <div className="mt-2 text-xs font-semibold text-blue-500 flex items-center justify-center gap-1.5">
                  <span className="animate-spin">⏳</span>
                  <span>正在智慧剖析行事曆中...</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 text-[11px] text-blue-700 dark:text-blue-300">
              💡 <strong>小撇步：</strong>至朝陽 TronClass 或數位學習平台登入後，點選「行事曆」→「匯出日曆 (ICS)」，即可在此一鍵匯入整學期課程！
            </div>
          </div>
        )}

        {/* TAB 2: TEXT PARSE */}
        {activeTab === 'text' && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  貼上課表或選課結果文字
                </label>
                <span className="text-[10px] text-neutral-400">自動識別星期、節次、教室</span>
              </div>
              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="直接將學生資訊系統或課表文字整段貼上..."
                className="w-full p-3 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-neutral-200 dark:border-[#2C2C2E] text-xs font-mono text-neutral-800 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={handleParseText}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>智慧解析文字內容</span>
            </button>
          </div>
        )}

        {/* TAB 3: CYUT DEPARTMENT PRESETS */}
        {activeTab === 'preset' && (
          <div className="space-y-2.5">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              挑選朝陽科技大學熱門學院官方範本，立即自動載入專屬課表與作業：
            </p>

            <div className="space-y-2">
              {CYUT_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-neutral-200 dark:border-[#2C2C2E] hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-[#2C2C2E] cursor-pointer transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                        {preset.college}
                      </span>
                      <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 group-hover:text-blue-600 transition-colors">
                        {preset.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {preset.description} ({preset.courses.length} 門核心課程)
                    </p>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#2C2C2E] group-hover:bg-blue-600 group-hover:text-white text-neutral-700 dark:text-neutral-200 text-xs font-bold shrink-0 transition-colors flex items-center gap-1"
                  >
                    <span>選擇載入</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PARSED PREVIEW SECTION */}
        {parsedData && parsedData.courses.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#1C1C1E] border border-neutral-200 dark:border-[#2C2C2E] space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-200/80 dark:border-[#2C2C2E]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-extrabold text-neutral-800 dark:text-neutral-100">
                  成功識別 {parsedData.courses.length} 門課程
                </span>
              </div>
              <div className="text-[11px] text-neutral-400">
                {parsedData.assignments.length > 0 && `${parsedData.assignments.length} 項作業 `}
                {parsedData.exams.length > 0 && `${parsedData.exams.length} 場考試`}
              </div>
            </div>

            {/* Courses mini list */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {parsedData.courses.map((c, i) => (
                <div
                  key={i}
                  className="p-2 rounded-xl bg-white dark:bg-[#242426] border border-neutral-200/60 dark:border-[#38383A] text-xs flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-white block truncate text-[13px] leading-relaxed">
                      {c.name}
                    </span>
                    <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5 font-normal">
                      <span>{dayLabels[c.dayOfWeek]} 第 {c.startPeriod}~{c.endPeriod} 節</span>
                      <span>·</span>
                      <span className="truncate">{c.classroom}</span>
                      <span>·</span>
                      <span>{c.instructor}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-medium text-[10px] shrink-0">
                    {c.credits} 學分
                  </span>
                </div>
              ))}
            </div>

            {/* Import Mode Options */}
            <div className="pt-2 border-t border-neutral-200/60 dark:border-[#2C2C2E] flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceMode}
                  onChange={(e) => setReplaceMode(e.target.checked)}
                  className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500 border-neutral-300"
                />
                <span>清空並替換現有課表 (建議初次使用勾選)</span>
              </label>
            </div>

            {/* Submit Import Button */}
            <button
              type="button"
              onClick={handleConfirmImport}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>確認匯入至我的朝陽課表</span>
            </button>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-xs font-bold"
          >
            關閉
          </button>
        </div>
      </div>
    </Modal>
  );
};
