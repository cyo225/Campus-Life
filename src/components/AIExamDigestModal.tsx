import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Loader2,
  FileText,
  CheckCircle2,
  HelpCircle,
  Hash,
  Upload,
  X,
  BookmarkCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Modal } from './Modal';
import { Exam, AIExamDigest, AIQuizQuestion } from '../types';

interface AIExamDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetExam?: Exam | null;
  exams: Exam[];
  onSaveDigest: (examId: string, digest: AIExamDigest) => void;
}

export const AIExamDigestModal: React.FC<AIExamDigestModalProps> = ({
  isOpen,
  onClose,
  targetExam,
  exams,
  onSaveDigest,
}) => {
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('期中考');
  const [bindExamId, setBindExamId] = useState('');
  const [materialText, setMaterialText] = useState('');
  const [fileName, setFileName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [digest, setDigest] = useState<AIExamDigest | null>(null);
  const [activeTab, setActiveTab] = useState<'concepts' | 'formulas' | 'quiz'>('concepts');

  // Interactive Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (targetExam) {
        setBindExamId(targetExam.id);
        setSubject(targetExam.subject);
        setExamType(targetExam.type);
        setMaterialText(targetExam.note || '');
        if (targetExam.aiDigest) {
          setDigest(targetExam.aiDigest);
        } else {
          setDigest(null);
        }
      } else {
        setBindExamId(exams[0]?.id || '');
        setSubject(exams[0]?.subject || '作業系統與系統程式');
        setExamType('期中考');
        setMaterialText('');
        setDigest(null);
      }
      setFileName('');
      setErrorMsg('');
      setSelectedAnswers({});
      setSavedSuccess(false);
      setActiveTab('concepts');
    }
  }, [isOpen, targetExam, exams]);

  // Quick preset sample text
  const handleInsertSample = (type: 'os' | 'net' | 'ai') => {
    if (type === 'os') {
      setSubject('作業系統原理');
      setExamType('期中考');
      setMaterialText(
        '第3章：行程管理與處理器排程。\n- Process Control Block (PCB) 結構與狀態轉換 (Ready, Running, Waiting, Terminated)\n- CPU Scheduling 演算法比較：FCFS, SJF (最短工作優先), SRTF, Round Robin (時間片段大小影響)\n- 行程同步與互斥：Race Condition, Critical Section 三大要件 (Mutual Exclusion, Progress, Bounded Waiting), Peterson Algorithm, Semaphores 號誌與死結 (Deadlock) 四大必要條件 (互斥、持有並等待、不可搶奪、循環等待)。'
      );
    } else if (type === 'net') {
      setSubject('計算機網路');
      setExamType('期末考');
      setMaterialText(
        '第4章至第5章：網路層與傳輸層精華。\n- TCP vs UDP 標頭結構與三向交握 (Three-way handshake: SYN, SYN-ACK, ACK)\n- 流量控制 (Flow Control: Sliding Window) 與擁塞控制 (Congestion Control: Slow Start, Congestion Avoidance, Fast Retransmit, Fast Recovery)\n- IPv4 與 IPv6 封包位址、子網路遮罩 (Subnetting, CIDR) 計算、NAT 與 ARP 原理。'
      );
    } else {
      setSubject('人工智慧與機器學習導論');
      setExamType('期中考');
      setMaterialText(
        '機器學習基礎模型：\n- 監督式學習 vs 非監督式學習 vs 強化學習\n- 梯度下降法 (Gradient Descent) 與學習率 (Learning Rate) 設定、過擬合 (Overfitting) 與正規化 (L1/L2 Regularization)\n- 評估指標：Confusion Matrix, Precision, Recall, F1-Score, ROC-AUC 曲線之解讀。'
      );
    }
  };

  // Upload file text
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setMaterialText(text.slice(0, 15000)); // Cap to safe size
      setErrorMsg('');
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!materialText.trim()) {
      setErrorMsg('請輸入教材投影片重點大綱或上傳筆記檔案');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/ai/exam-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialText: materialText.trim(),
          subject,
          examType,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `考前重點生成失敗 (${res.status})`);
      }

      const data = await res.json();
      const generatedDigest: AIExamDigest = {
        concepts: Array.isArray(data.concepts) ? data.concepts : [],
        formulas: Array.isArray(data.formulas) ? data.formulas : [],
        quiz: Array.isArray(data.quiz) ? data.quiz : [],
        generatedAt: new Date().toISOString(),
      };

      setDigest(generatedDigest);
      setSelectedAnswers({});

      // Auto-save if bound to an exam
      if (bindExamId) {
        onSaveDigest(bindExamId, generatedDigest);
        setSavedSuccess(true);
      }
    } catch (err: any) {
      console.error('Exam Digest Error:', err);
      setErrorMsg(err.message || '生成失敗，請稍後重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuizAnswer = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleManualSave = () => {
    if (!bindExamId || !digest) return;
    onSaveDigest(bindExamId, digest);
    setSavedSuccess(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📚 AI 考前教材重點自動生成 (3合1衝刺包)"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/30 via-neutral-900 to-amber-950/30 border border-rose-500/30 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-600/30 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-medium text-white tracking-wide">
              考前教材/投影片自動解析生成
            </h4>
            <p className="text-neutral-400 leading-relaxed font-normal">
              上傳老師投影片重點或期末大綱，Gemini 即時萃取【核心考點精華】、【公式速記表】與【隨堂測驗題】，一鍵儲存隨身複習！
            </p>
          </div>
        </div>

        {/* Input Parameters */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                考試科目
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="例如：計算機網路"
                className="w-full px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                綁定考試時程
              </label>
              <select
                value={bindExamId}
                onChange={(e) => setBindExamId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-white"
              >
                <option value="">(獨立生成，不綁定)</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.subject} ({ex.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-neutral-300">
                教材文字 / 課堂筆記 / 大綱重點
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-neutral-500">快速填入範例：</span>
                <button
                  type="button"
                  onClick={() => handleInsertSample('os')}
                  className="text-[10px] text-rose-400 hover:underline font-normal"
                >
                  作業系統
                </button>
                <span className="text-neutral-600">·</span>
                <button
                  type="button"
                  onClick={() => handleInsertSample('net')}
                  className="text-[10px] text-rose-400 hover:underline font-normal"
                >
                  計網
                </button>
                <span className="text-neutral-600">·</span>
                <button
                  type="button"
                  onClick={() => handleInsertSample('ai')}
                  className="text-[10px] text-rose-400 hover:underline font-normal"
                >
                  機器學習
                </button>
              </div>
            </div>
            <textarea
              rows={4}
              value={materialText}
              onChange={(e) => setMaterialText(e.target.value)}
              placeholder="請直接貼上老師投影片文字、章節重點或複習大綱..."
              className="w-full p-3 rounded-2xl bg-neutral-100 dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-white leading-relaxed placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-rose-500 font-normal"
            />
          </div>

          {/* Upload file */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-100/60 dark:bg-[#202022] border border-neutral-200/60 dark:border-[#2C2C2E]">
            <div className="flex items-center gap-2 text-xs text-neutral-300 font-normal">
              <Upload className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>上傳教材筆記檔 (.txt / .md)</span>
            </div>
            <div>
              {fileName ? (
                <div className="flex items-center gap-2 text-xs text-rose-400">
                  <span className="truncate max-w-[140px] font-mono text-[11px]">{fileName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFileName('');
                      setMaterialText('');
                    }}
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
                    accept=".txt,.md"
                    onChange={handleFileChange}
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

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.99] disabled:opacity-50 text-white text-xs font-medium flex items-center justify-center gap-2 shadow-md shadow-rose-900/20 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI 正在濃縮教材並生成測驗題...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>一鍵生成 3 合 1 考前衝刺精華包</span>
              </>
            )}
          </button>
        </div>

        {/* RESULTS SECTION */}
        {digest && (
          <div className="space-y-3 pt-3 border-t border-neutral-200 dark:border-[#2C2C2E] animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-white">
                  衝刺包生成完成
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  ({new Date(digest.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </span>
              </div>

              {bindExamId && !savedSuccess && (
                <button
                  type="button"
                  onClick={handleManualSave}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-normal flex items-center gap-1 transition-colors"
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>儲存至考試</span>
                </button>
              )}
            </div>

            {savedSuccess && (
              <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-[11px] flex items-center gap-1.5 font-normal">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>已儲存至考試卡片！可隨時在待辦考試清單中重溫重點與練習測驗。</span>
              </div>
            )}

            {/* Segmented sub-tabs for 3-in-1 pack */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-900/90 dark:bg-[#202022] border border-neutral-200 dark:border-[#2C2C2E]">
              <button
                type="button"
                onClick={() => setActiveTab('concepts')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors text-center ${
                  activeTab === 'concepts'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                📌 核心考點 ({digest.concepts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('formulas')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors text-center ${
                  activeTab === 'formulas'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                ⚡ 公式速記 ({digest.formulas.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('quiz')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors text-center ${
                  activeTab === 'quiz'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                📝 隨堂自測 ({digest.quiz.length})
              </button>
            </div>

            {/* TAB 1: CONCEPTS */}
            {activeTab === 'concepts' && (
              <div className="space-y-2">
                {digest.concepts.map((concept, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-neutral-900/90 dark:bg-[#202022] border border-neutral-200 dark:border-[#2C2C2E] flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-rose-600/30 text-rose-300 text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-white leading-relaxed font-normal flex-1">
                      {concept}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: FORMULAS & CHEATSHEET */}
            {activeTab === 'formulas' && (
              <div className="space-y-2">
                {digest.formulas.map((formula, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-neutral-900/90 dark:bg-[#202022] border border-neutral-200 dark:border-[#2C2C2E] space-y-1"
                  >
                    <p className="text-xs text-white leading-relaxed font-normal font-mono">
                      {formula}
                    </p>
                  </div>
                ))}
                {digest.formulas.length === 0 && (
                  <p className="text-xs text-neutral-400 text-center py-4">無特殊公式，以文字概念為主。</p>
                )}
              </div>
            )}

            {/* TAB 3: INTERACTIVE QUIZ */}
            {activeTab === 'quiz' && (
              <div className="space-y-3.5">
                {digest.quiz.map((q, qIdx) => {
                  const userAnswer = selectedAnswers[qIdx];
                  const hasAnswered = userAnswer !== undefined;
                  const isCorrect = userAnswer === q.answerIndex;

                  return (
                    <div
                      key={qIdx}
                      className="p-3.5 rounded-2xl bg-neutral-900/90 dark:bg-[#202022] border border-neutral-200 dark:border-[#2C2C2E] space-y-2.5"
                    >
                      <div className="flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded-md bg-rose-600/30 text-rose-300 text-[10px] font-mono shrink-0 mt-0.5">
                          Q{qIdx + 1}
                        </span>
                        <h5 className="text-xs font-medium text-white leading-relaxed">
                          {q.question}
                        </h5>
                      </div>

                      {/* Options */}
                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = userAnswer === optIdx;
                          const isCorrectOption = q.answerIndex === optIdx;

                          let btnStyle = 'border-neutral-700 bg-neutral-800/40 text-neutral-300 hover:border-neutral-500';
                          if (hasAnswered) {
                            if (isCorrectOption) {
                              btnStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200';
                            } else if (isOptionSelected && !isCorrect) {
                              btnStyle = 'border-rose-500 bg-rose-950/40 text-rose-200';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectQuizAnswer(qIdx, optIdx)}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs font-normal transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {hasAnswered && isCorrectOption && (
                                <span className="text-[10px] font-bold text-emerald-400 shrink-0">✓ 正確答案</span>
                              )}
                              {hasAnswered && isOptionSelected && !isCorrect && (
                                <span className="text-[10px] font-bold text-rose-400 shrink-0">✗ 你的選擇</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {hasAnswered && (
                        <div
                          className={`p-2.5 rounded-xl text-xs space-y-1 border ${
                            isCorrect
                              ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                              : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
                          }`}
                        >
                          <span className="text-[10px] font-medium block">
                            {isCorrect ? '🎉 答對了！' : '💡 解析與觀念釐清：'}
                          </span>
                          <p className="text-[11px] leading-relaxed font-normal text-white">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
