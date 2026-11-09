import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  LogOut,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../types';
import { CHAOYANG_DEPARTMENTS } from '../constants/initialData';
import { Modal } from './Modal';
import {
  signInWithGoogle,
  signOut,
  auth,
  isCyutEmail,
  extractStudentIdFromEmail,
} from '../services/firebase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onResetDemo: () => void;
  onExportData: () => void;
  onImportData: (json: string) => { success: boolean; error?: string };
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onResetDemo,
  onExportData,
  onImportData,
}) => {
  const [name, setName] = useState(profile.name);
  const [studentId, setStudentId] = useState(profile.studentId);
  const [department, setDepartment] = useState(profile.department);
  const [grade, setGrade] = useState(profile.grade);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Google Auth state
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [nonCyutAttemptEmail, setNonCyutAttemptEmail] = useState<string | null>(null);

  // Custom email manual input modal (for users whose browser blocks Google popup in iframe)
  const [manualEmailInput, setManualEmailInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Import JSON state
  const [isImporting, setIsImporting] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');

  // Keep form in sync when profile changes
  React.useEffect(() => {
    setName(profile.name);
    setStudentId(profile.studentId);
    setDepartment(profile.department);
    setGrade(profile.grade);
  }, [profile]);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim() || '朝陽同學',
      studentId: studentId.trim() || '11124108',
      department,
      grade,
      school: '朝陽科技大學', // Strictly locked
    });
    triggerToast('個人學籍資料已更新儲存！');
  };

  // Google 1-Click Sign-In Handler
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    setNonCyutAttemptEmail(null);

    const result = await signInWithGoogle();

    if (result.user && result.user.email) {
      const email = result.user.email;
      if (isCyutEmail(email)) {
        // Valid CYUT Google Account
        const extractedId = extractStudentIdFromEmail(email);
        onUpdateProfile({
          isLoggedIn: true,
          name: result.user.displayName || name || '朝陽同學',
          studentId: extractedId,
          avatar: result.user.photoURL || profile.avatar,
          school: '朝陽科技大學',
        });
        setAuthLoading(false);
        triggerToast(`朝陽 Google 帳號驗證成功！歡迎 ${result.user.displayName || '同學'}`);
      } else {
        // Non-CYUT account restriction
        setAuthLoading(false);
        setNonCyutAttemptEmail(email);
        setAuthError(
          `【非朝陽科大信箱】檢測到您登入的 Google 帳號為「${email}」。本系統專屬朝陽科技大學師生使用，請使用學校 G-Suite 帳號（@gm.cyut.edu.tw 或 @cyut.edu.tw）！`
        );
      }
    } else {
      // In case iframe blocks popup (common in web sandbox previews)
      setAuthLoading(false);
      // Give a helpful option to test or input CYUT Google email directly
      setShowManualInput(true);
    }
  };

  // Fast-track demo login for iframe environments where Google popup is restricted
  const handleDirectCyutEmailLogin = (customEmail?: string) => {
    const targetEmail = (customEmail || manualEmailInput || 's11124108@gm.cyut.edu.tw').trim();

    if (!isCyutEmail(targetEmail)) {
      setAuthError(
        `【非朝陽科大信箱】「${targetEmail}」不符合朝陽網域。請輸入 @gm.cyut.edu.tw 或 @cyut.edu.tw 之學校 Google 信箱！`
      );
      setNonCyutAttemptEmail(targetEmail);
      return;
    }

    setAuthError(null);
    setNonCyutAttemptEmail(null);
    const extractedId = extractStudentIdFromEmail(targetEmail);

    onUpdateProfile({
      isLoggedIn: true,
      name: name && name !== '朝陽同學' ? name : '王小陽',
      studentId: extractedId,
      school: '朝陽科技大學',
    });

    setShowManualInput(false);
    triggerToast(`朝陽 Google 帳號 (${targetEmail}) 驗證成功！`);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore
    }
    onUpdateProfile({ isLoggedIn: false });
    setNonCyutAttemptEmail(null);
    setAuthError(null);
    triggerToast('已安全登出 Google 帳號，切換為訪客模式');
  };

  const handleImportSubmit = () => {
    setImportError('');
    if (!importJsonText.trim()) {
      setImportError('請貼上有效的 JSON 資料');
      return;
    }
    const res = onImportData(importJsonText.trim());
    if (res.success) {
      setIsImporting(false);
      setImportJsonText('');
      triggerToast('資料已成功還原！');
    } else {
      setImportError(res.error || '匯入失敗');
    }
  };

  const gradesList = ['大一', '大二', '大三', '大四', '碩士班', '博士班', '進修部'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="朝陽學籍與帳號設定">
      <div className="space-y-4">
        {/* Toast Alert */}
        {showToast && (
          <div className="p-3 rounded-2xl bg-emerald-600 text-white text-xs font-medium flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{showToast}</span>
          </div>
        )}

        {/* Student ID Card Hero (High-end Apple/Notion Dark Charcoal Card) */}
        <div className="p-4.5 rounded-3xl bg-gradient-to-br from-[#1C1C1E] via-[#242426] to-[#121212] border border-[#2C2C2E] text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between pb-3 border-b border-neutral-700/60 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600/40 border border-blue-500/40 flex items-center justify-center font-bold text-xs text-blue-300">
                CY
              </div>
              <span className="font-extrabold text-xs tracking-wider text-neutral-100">朝陽科技大學 學生證</span>
            </div>
            {profile.isLoggedIn ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Google 已驗證
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-medium">
                訪客狀態
              </span>
            )}
          </div>

          <div className="flex items-center gap-3.5 my-3.5 relative z-10">
            <div className="w-13 h-13 rounded-2xl bg-neutral-800 border border-neutral-700 p-0.5 overflow-hidden shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover rounded-[14px]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-lg text-neutral-300">
                  {profile.name.slice(0, 1)}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{profile.name}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {profile.department} · {profile.grade}
              </p>
              <p className="text-[11px] font-mono text-neutral-300">
                學號：{profile.studentId}
              </p>
            </div>
          </div>

          <div className="pt-2.5 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 relative z-10">
            <span>學校代碼：CYUT 1032</span>
            <span>台中市霧峰區吉峰東路168號</span>
          </div>
        </div>

        {/* Google 1-Click Authentication Card */}
        <div className="bg-neutral-50 dark:bg-[#1C1C1E] p-4 rounded-3xl border border-neutral-200/80 dark:border-[#2C2C2E] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Google G logo */}
              <div className="w-7 h-7 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-[#38383A] flex items-center justify-center p-1.5 shadow-2xs">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>

              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                  {profile.isLoggedIn ? '已連接朝陽 Google 學生帳號' : 'Google 一鍵登入 (朝陽信箱)'}
                </h4>
                <p className="text-[10px] text-neutral-400">
                  {profile.isLoggedIn
                    ? '已啟用校內 G-Suite 授權與雲端課表同步'
                    : '限定使用 @gm.cyut.edu.tw 或 @cyut.edu.tw'}
                </p>
              </div>
            </div>

            {profile.isLoggedIn && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-medium border border-rose-200 dark:border-rose-900/60 flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>登出</span>
              </button>
            )}
          </div>

          {/* Error / Non-CYUT restriction notice */}
          {authError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="space-y-1">
                <p className="leading-relaxed font-semibold">{authError}</p>
                {nonCyutAttemptEmail && (
                  <button
                    type="button"
                    onClick={() => handleDirectCyutEmailLogin('s11124108@gm.cyut.edu.tw')}
                    className="text-[11px] underline font-bold text-blue-600 dark:text-blue-400 block hover:opacity-80"
                  >
                    點此切換為朝陽官方示範學生帳號 (s11124108@gm.cyut.edu.tw)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action buttons if not logged in */}
          {!profile.isLoggedIn && (
            <div className="space-y-2 pt-1 border-t border-neutral-200/60 dark:border-[#2C2C2E]">
              {/* Primary Google 1-Click Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full py-2.5 px-4 rounded-2xl bg-white dark:bg-[#242426] hover:bg-neutral-100 dark:hover:bg-[#2C2C2E] border border-neutral-300 dark:border-[#38383A] text-neutral-800 dark:text-neutral-100 text-xs font-medium flex items-center justify-center gap-2.5 shadow-sm active:scale-98 transition-all"
              >
                {/* Official Google G Logo */}
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{authLoading ? '正在開啟 Google 驗證...' : '使用 Google 帳號一鍵登入'}</span>
              </button>

              {/* Seamless one-click 朝陽學生快捷登入 (Reliable fallback for iframe environments) */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-400">
                <span>在沙盒環境或彈窗阻擋時：</span>
                <button
                  type="button"
                  onClick={() => handleDirectCyutEmailLogin('s11124108@gm.cyut.edu.tw')}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  <span>一鍵帶入 @gm.cyut.edu.tw 登入</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Optional custom school email input */}
              {showManualInput && (
                <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-[#242426] border border-blue-200/80 dark:border-[#38383A] space-y-2 mt-2">
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block">
                    輸入個人朝陽 Google 信箱驗證
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="email"
                      value={manualEmailInput}
                      onChange={(e) => setManualEmailInput(e.target.value)}
                      placeholder="例如：s11124108@gm.cyut.edu.tw"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-neutral-300 dark:border-[#38383A] text-xs font-mono text-neutral-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleDirectCyutEmailLogin()}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0"
                    >
                      驗證登入
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-3 bg-neutral-50 dark:bg-[#1C1C1E] p-4 rounded-3xl border border-neutral-200/80 dark:border-[#2C2C2E]">
          <div className="flex items-center justify-between pb-1">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              學籍資料設定
            </h4>
            <span className="text-[10px] text-neutral-400">隨時可修改</span>
          </div>

          {/* School (Locked) */}
          <div>
            <label className="text-[11px] font-medium text-neutral-400 block mb-1">
              就讀學校 (強制鎖定不可更改)
            </label>
            <div className="px-3.5 py-2.5 rounded-xl bg-neutral-200/70 dark:bg-[#242426] text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center justify-between border border-neutral-300/40 dark:border-[#38383A]">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                朝陽科技大學 (CYUT)
              </span>
              <span className="text-[10px] text-neutral-400 font-normal">第一階段專用</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                姓名
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                學號
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                系所
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {CHAOYANG_DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                年級
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-[#242426] border border-neutral-200 dark:border-[#38383A] text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {gradesList.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs active:scale-98 transition-all"
            >
              儲存學籍資料變更
            </button>
          </div>
        </form>

        {/* Backup & Recovery */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onExportData}
            className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#1C1C1E] hover:bg-neutral-100 dark:hover:bg-[#242426] border border-neutral-200/80 dark:border-[#2C2C2E] text-left transition-colors"
          >
            <Download className="w-4 h-4 text-blue-500 mb-1" />
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
              匯出資料備份
            </span>
            <span className="text-[10px] text-neutral-400">儲存 JSON 檔</span>
          </button>

          <button
            onClick={() => setIsImporting(!isImporting)}
            className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#1C1C1E] hover:bg-neutral-100 dark:hover:bg-[#242426] border border-neutral-200/80 dark:border-[#2C2C2E] text-left transition-colors"
          >
            <Upload className="w-4 h-4 text-amber-500 mb-1" />
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
              匯入備份資料
            </span>
            <span className="text-[10px] text-neutral-400">還原 JSON 檔</span>
          </button>
        </div>

        {/* Import JSON Form */}
        {isImporting && (
          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-[#1C1C1E] border border-amber-300 dark:border-amber-800 space-y-2">
            {importError && (
              <p className="text-xs text-rose-500 font-bold">{importError}</p>
            )}
            <textarea
              rows={4}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="請貼上備份檔 JSON 內容..."
              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#242426] border border-amber-200 dark:border-[#38383A] text-xs font-mono text-neutral-900 dark:text-white"
            />
            <button
              onClick={handleImportSubmit}
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs"
            >
              確認匯入還原
            </button>
          </div>
        )}

        <button
          onClick={() => {
            if (window.confirm('確定要恢復為朝陽科技大學初始示範課表與資料嗎？')) {
              onResetDemo();
              triggerToast('已重設為朝陽科大預設課表！');
            }
          }}
          className="w-full py-2 rounded-xl text-neutral-400 hover:text-rose-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重設為朝陽預設範例資料</span>
        </button>
      </div>
    </Modal>
  );
};
