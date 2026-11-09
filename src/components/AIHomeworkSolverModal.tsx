import React, { useState } from 'react';
import {
  Sparkles,
  Loader2,
  CheckCircle,
  Copy,
  AlertTriangle,
  Lightbulb,
  BookmarkCheck,
  Upload,
  X,
  FileCheck2,
  HelpCircle,
  Code2,
} from 'lucide-react';
import { Modal } from './Modal';
import { Assignment, Course, AISolution } from '../types';

interface AIHomeworkSolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAssignment?: Assignment | null;
  courses: Course[];
  assignments: Assignment[];
  onSaveSolution: (assignmentId: string, solution: AISolution) => void;
}

export const AIHomeworkSolverModal: React.FC<AIHomeworkSolverModalProps> = ({
  isOpen,
  onClose,
  targetAssignment,
  courses,
  assignments,
  onSaveSolution,
}) => {
  const [problemText, setProblemText] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [bindAssignmentId, setBindAssignmentId] = useState('');
  const [fileData, setFileData] = useState<{ name: string; base64: string; mimeType: string } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [solution, setSolution] = useState<AISolution | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeView, setActiveView] = useState<'both' | 'answer' | 'breakdown'>('both');

  // Sync initial state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (targetAssignment) {
        setBindAssignmentId(targetAssignment.id);
        setSelectedCourse(targetAssignment.courseName);
        setProblemText(targetAssignment.note || targetAssignment.title || '');
        if (targetAssignment.aiSolution) {
          setSolution(targetAssignment.aiSolution);
        } else {
          setSolution(null);
        }
      } else {
        setBindAssignmentId('');
        setSelectedCourse(courses[0]?.name || '資訊工程專業實務');
        setProblemText('');
        setSolution(null);
      }
      setFileData(null);
      setErrorMsg('');
      setSavedSuccess(false);
    }
  }, [isOpen, targetAssignment, courses]);

  // Insert authentic homework sample prompts
  const handleInsertSample = (type: 'swot' | 'algo' | 'db' | 'calc') => {
    if (type === 'swot') {
      setSelectedCourse('軟體工程與專業職涯');
      setProblemText(
        '【個人職涯發展與軟體工程實務 SWOT 分析作業】\n請以資訊工程 / 軟體開發學生之背景，將下列 SWOT 空格填滿並完成完整分析：\n1. Strengths (內部優勢填空):\n   - [填空 1: 核心技術棧與編程語言]\n   - [填空 2: 開發工具與實作經驗]\n2. Weaknesses (內部劣勢填空):\n   - [填空 3: 缺乏之高階系統架構經驗]\n   - [填空 4: 個人軟實力待加強處]\n3. Opportunities (外部機會填空):\n   - [填空 5: 科技產業趨勢與市場需求]\n   - [填空 6: 校園資源與產學實習機會]\n4. Threats (外部威脅填空):\n   - [填空 7: AI 自動化生成代碼的衝擊]\n   - [填空 8: 初階軟體工程職缺市場競爭]'
      );
    } else if (type === 'algo') {
      setSelectedCourse('資料結構與演算法');
      setProblemText(
        '請解釋二元搜尋樹 (Binary Search Tree) 的搜尋、插入與刪除之時間複雜度分析，並說明在最差情況（退化為鏈結串列）下之成因，以及 AVL 樹四種旋轉平衡機制。'
      );
    } else if (type === 'db') {
      setSelectedCourse('資料庫系統原理');
      setProblemText(
        '給定資料表 StudentCourse(StudentID, CourseID, StudentName, Instructor, Classroom)，請指出其可能存在的更新異常與刪除異常，並逐步正規化分解至第三正規化 (3NF)。'
      );
    } else {
      setSelectedCourse('微積分與工程數學');
      setProblemText(
        '求函數 f(x) = x^3 - 3x^2 + 2 的極值點與反曲點，並描繪在區間 [-2, 4] 上的凹凸性變化。'
      );
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('檔案過大，請上傳 8MB 以下的題目照片或文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileData({
        name: file.name,
        base64: reader.result as string,
        mimeType: file.type || 'image/jpeg',
      });
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleSolve = async () => {
    if (!problemText.trim() && !fileData) {
      setErrorMsg('請輸入作業題目內容或上傳檔案照片');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/ai/solve-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemText: problemText.trim(),
          courseName: selectedCourse,
          imageBase64: fileData?.base64,
          mimeType: fileData?.mimeType,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `解題伺服器回應錯誤 (${res.status})`);
      }

      const data = await res.json();
      const generatedSolution: AISolution = {
        title: data.title || '作業題目實質解析與擬答',
        completeAnswer: data.completeAnswer || data.finalAnswer || '完整擬答處理完成',
        detailedBreakdown: Array.isArray(data.detailedBreakdown)
          ? data.detailedBreakdown
          : Array.isArray(data.steps)
          ? data.steps.map((st: string, idx: number) => ({
              target: `步驟 ${idx + 1}`,
              answer: st,
              explanation: '詳細演算與作法推導',
            }))
          : [],
        keyTakeaways: data.keyTakeaways || data.tips || '',
        solvedAt: new Date().toISOString(),
      };

      setSolution(generatedSolution);

      // Auto-save if bound to an assignment
      if (bindAssignmentId) {
        onSaveSolution(bindAssignmentId, generatedSolution);
        setSavedSuccess(true);
      }
    } catch (err: any) {
      console.error('AI Solve error:', err);
      setErrorMsg(err.message || '解題過程發生異常，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!solution) return;
    navigator.clipboard.writeText(solution.completeAnswer);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSaveToSelected = () => {
    if (!bindAssignmentId || !solution) return;
    onSaveSolution(bindAssignmentId, solution);
    setSavedSuccess(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🤖 AI 智慧解題與精準擬答"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-950/20 to-purple-950/30 border border-blue-500/30 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-medium text-white tracking-wide">
              TronClass 題目精準解答 · 填空全填滿
            </h4>
            <p className="text-neutral-400 leading-relaxed font-normal">
              杜絕抽象空泛罐頭！直接產出【可一鍵複製的完整擬答】（填空題自動以資工專業背景填滿），並提供【逐題/逐格詳細解題理由】。
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                所屬課程名稱
              </label>
              <input
                type="text"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                placeholder="例如：軟體工程與專業職涯"
                className="w-full px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                儲存綁定至作業卡片
              </label>
              <select
                value={bindAssignmentId}
                onChange={(e) => setBindAssignmentId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-white"
              >
                <option value="">(獨立求解，不綁定)</option>
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.courseName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <label className="text-[11px] font-medium text-neutral-300">
                作業題目 / 填空模板內容
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-neutral-500">真實題目範例：</span>
                <button
                  type="button"
                  onClick={() => handleInsertSample('swot')}
                  className="px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-800 text-[10px] text-blue-300 hover:text-white font-normal"
                >
                  SWOT 填空 (資工範例)
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSample('algo')}
                  className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300 hover:text-white font-normal"
                >
                  BST/AVL 樹
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSample('db')}
                  className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300 hover:text-white font-normal"
                >
                  3NF 正規化
                </button>
              </div>
            </div>
            <textarea
              rows={4}
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="請直接從 TronClass 複製貼上作業題目、問答題或填空模板..."
              className="w-full p-3 rounded-2xl bg-neutral-100 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-white leading-relaxed placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-normal font-mono"
            />
          </div>

          {/* Upload Screenshot / File */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-100/60 dark:bg-[#202022] border border-neutral-200/60 dark:border-[#2C2C2E]">
            <div className="flex items-center gap-2 text-xs text-neutral-300 font-normal">
              <Upload className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>附加題目圖片或講義檔案</span>
            </div>
            <div>
              {fileData ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <span className="truncate max-w-[140px] font-mono text-[11px]">{fileData.name}</span>
                  <button
                    type="button"
                    onClick={() => setFileData(null)}
                    className="p-1 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-neutral-200 dark:bg-[#2C2C2E] hover:bg-neutral-300 dark:hover:bg-[#38383A] text-[11px] font-medium text-white transition-colors">
                  選擇檔案
                  <input
                    type="file"
                    accept="image/*,.pdf,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={handleSolve}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 text-white text-xs font-medium flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI 助教正在深入分析題目並填寫解答...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>產出實質擬答與逐格解析</span>
              </>
            )}
          </button>
        </div>

        {/* RESULTS SECTION: DISTINCT TWO BLOCKS */}
        {solution && (
          <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-[#2C2C2E] animate-in fade-in duration-300">
            {/* Header of results */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-blue-400 font-mono block">
                  {solution.title || '題目深度解析成果'}
                </span>
                <span className="text-xs font-medium text-white">
                  實質擬答已生成
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {bindAssignmentId && !savedSuccess && (
                  <button
                    type="button"
                    onClick={handleSaveToSelected}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-normal flex items-center gap-1 transition-colors"
                  >
                    <BookmarkCheck className="w-3 h-3" />
                    <span>儲存至作業</span>
                  </button>
                )}
              </div>
            </div>

            {savedSuccess && (
              <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-[11px] flex items-center gap-1.5 font-normal">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>已自動儲存至作業卡片！隨時可在待辦清單中展開查閱。</span>
              </div>
            )}

            {/* BLOCK 1: 完整擬答內容 (直接可複製) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h4 className="text-xs font-medium text-white tracking-wide">
                    【1. 完整擬答內容（直接可複製，含填空填滿）】
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-[11px] font-medium flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isCopied ? '✓ 已複製至剪貼簿！' : '一鍵複製完整擬答'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-900 dark:bg-[#18181A] border border-neutral-700/60 dark:border-[#2C2C2E] shadow-inner">
                <pre className="text-xs text-white leading-relaxed font-normal whitespace-pre-wrap font-sans selection:bg-blue-600">
                  {solution.completeAnswer}
                </pre>
              </div>
            </div>

            {/* BLOCK 2: 逐題/逐格詳細解題說明 */}
            {solution.detailedBreakdown && solution.detailedBreakdown.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <h4 className="text-xs font-medium text-white tracking-wide">
                    【2. 逐題 / 逐格詳細解題說明 (Why & How)】
                  </h4>
                </div>

                <div className="space-y-2">
                  {solution.detailedBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-neutral-900/90 dark:bg-[#202022] border border-neutral-200 dark:border-[#2C2C2E] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-950/70 border border-blue-800/80 text-blue-300 text-[10px] font-mono font-medium">
                          {item.target}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-neutral-800/50 border border-neutral-700/50 space-y-1">
                        <span className="text-[10px] font-medium text-emerald-400 block">
                          填入擬答 / 求解結果：
                        </span>
                        <p className="text-xs text-white font-normal leading-relaxed">
                          {item.answer}
                        </p>
                      </div>

                      <div className="space-y-0.5 pt-0.5">
                        <span className="text-[10px] font-medium text-neutral-400 block">
                          詳細解題理由與學術依據：
                        </span>
                        <p className="text-xs text-neutral-300 font-normal leading-relaxed">
                          {item.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Takeaways */}
            {solution.keyTakeaways && (
              <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">TronClass 繳交與評分高分叮嚀</span>
                </div>
                <p className="text-xs text-neutral-200 leading-relaxed font-normal">
                  {solution.keyTakeaways}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
