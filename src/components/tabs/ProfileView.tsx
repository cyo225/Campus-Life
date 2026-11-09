import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Building,
  Hash,
  Download,
  Upload,
  RotateCcw,
  Smartphone,
  Moon,
  Sun,
  ShieldCheck,
  LogOut,
  LogIn,
  Check,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { CHAOYANG_DEPARTMENTS } from '../../constants/initialData';
import { Modal } from '../Modal';

interface ProfileViewProps {
  profile: UserProfile;
  isDark: boolean;
  onToggleTheme: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onResetDemo: () => void;
  onExportData: () => void;
  onImportData: (json: string) => { success: boolean; error?: string };
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  isDark,
  onToggleTheme,
  onUpdateProfile,
  onResetDemo,
  onExportData,
  onImportData,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [studentId, setStudentId] = useState(profile.studentId);
  const [department, setDepartment] = useState(profile.department);
  const [grade, setGrade] = useState(profile.grade);
  const [savedToast, setSavedToast] = useState(false);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('student@gm.cyut.edu.tw');
  const [authPassword, setAuthPassword] = useState('••••••••');

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim() || '朝陽同學',
      studentId: studentId.trim() || '11124108',
      department,
      grade,
      school: '朝陽科技大學', // Locked
    });
    setIsEditing(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      isLoggedIn: true,
      name: name || '朝陽同學',
    });
    setIsAuthModalOpen(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleLogout = () => {
    if (window.confirm('確定要登出目前帳號嗎？資料仍會安全保存在本機中。')) {
      onUpdateProfile({ isLoggedIn: false });
    }
  };

  const handleImportSubmit = () => {
    setImportError('');
    if (!importJsonText.trim()) {
      setImportError('請貼上有效的 JSON 資料');
      return;
    }
    const res = onImportData(importJsonText.trim());
    if (res.success) {
      setIsImportModalOpen(false);
      setImportJsonText('');
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    } else {
      setImportError(res.error || '匯入失敗');
    }
  };

  const gradesList = ['大一', '大二', '大三', '大四', '碩士班', '博士班', '進修部'];

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg animate-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4" />
          <span>個人資料已成功儲存！</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-amber-500 p-0.5 shadow-sm">
              <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-7 h-7 text-slate-400" />
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {profile.name}
                </h2>
                {profile.isLoggedIn ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900">
                    已認證
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                    訪客離線
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                {profile.department} · {profile.grade}
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                學號：{profile.studentId}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setName(profile.name);
              setStudentId(profile.studentId);
              setDepartment(profile.department);
              setGrade(profile.grade);
              setIsEditing(!isEditing);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors shrink-0"
          >
            {isEditing ? '取消' : '編輯資料'}
          </button>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in duration-150"
          >
            {/* School field (Forced locked) */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                學校名稱 (強制鎖定不可更改)
              </label>
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-blue-700 dark:text-blue-400">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  朝陽科技大學 (CYUT)
                </span>
                <span className="text-[10px] text-slate-400 font-normal">第一階段專屬</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  姓名
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  學號
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  朝陽科大系所
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {CHAOYANG_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  年級別
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {gradesList.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs shadow-blue-500/20 transition-all"
              >
                儲存學籍資料
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Account & App Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors space-y-3">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
          系統偏好與帳號
        </h3>

        {/* Theme Mode Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-200/80 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200">
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">外觀深色模式</h4>
              <p className="text-[11px] text-slate-400">適應夜間教室與自習室省電護眼</p>
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              isDark ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                isDark ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Auth Action */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {profile.isLoggedIn ? '已連接朝陽學生帳號' : '訪客模式 / 未登入'}
              </h4>
              <p className="text-[11px] text-slate-400">支援模擬註冊登入與離線資料保存</p>
            </div>
          </div>

          {profile.isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>登出</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>登入</span>
            </button>
          )}
        </div>
      </div>

      {/* Backup & Recovery */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors space-y-3">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
          資料備份與還原
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onExportData}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-left transition-colors group"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              匯出資料備份
            </span>
            <span className="text-[10px] text-slate-400">下載 JSON 檔保存</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-left transition-colors group"
          >
            <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              匯入備份還原
            </span>
            <span className="text-[10px] text-slate-400">讀取備份檔案復原</span>
          </button>
        </div>

        <button
          onClick={() => {
            if (window.confirm('確定要重設為初始朝陽科大示範課表與資料嗎？這將覆蓋現有修改。')) {
              onResetDemo();
              setSavedToast(true);
              setTimeout(() => setSavedToast(false), 2000);
            }
          }}
          className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>恢復朝陽科大預設課表與範例資料</span>
        </button>
      </div>

      {/* PWA & Version Info */}
      <div className="p-4 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 text-center space-y-1 text-xs text-slate-500 dark:text-slate-400">
        <p className="font-bold text-slate-700 dark:text-slate-300">
          Campus Life · 朝陽科技大學行動專版
        </p>
        <p className="text-[11px]">
          PWA 漸進式網頁應用 · 離線可用 · 免下載商店即裝即用
        </p>
        <p className="text-[10px] text-slate-400 pt-1">
          Designed for Chaoyang University of Technology Students
        </p>
      </div>

      {/* Auth Modal */}
      <Modal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title={authMode === 'login' ? '朝陽學生登入' : '註冊新學號帳號'}
      >
        <form onSubmit={handleAuthSubmit} className="space-y-3.5">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs">
            學校欄位預設綁定為「<strong>朝陽科技大學</strong>」，登入後可同步個人課表與作業進度。
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              學校學生信箱
            </label>
            <input
              type="email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              placeholder="s11124108@gm.cyut.edu.tw"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              登入密碼
            </label>
            <input
              type="password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="請輸入密碼"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              {authMode === 'login' ? '沒有帳號？立即註冊' : '已有帳號？返回登入'}
            </button>
          </div>

          <div className="flex items-center gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs shadow-blue-500/20"
            >
              {authMode === 'login' ? '確認登入' : '完成註冊'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="貼上備份 JSON 還原"
      >
        <div className="space-y-3.5">
          {importError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          <p className="text-xs text-slate-500">
            請將先前匯出的備份 JSON 文字內容貼在下方文字方塊中：
          </p>

          <textarea
            rows={6}
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            placeholder='{"app": "CampusLife-CYUT", "courses": [...], ...}'
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleImportSubmit}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            >
              開始還原
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
