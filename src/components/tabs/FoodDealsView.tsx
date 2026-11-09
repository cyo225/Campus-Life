import React, { useState, useMemo } from 'react';
import {
  Utensils,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  Navigation,
  CheckCircle2,
  Tag,
  Star,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ShieldCheck,
  Store,
  DollarSign,
  ChevronRight,
  RotateCw,
  Search,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FoodMerchant, MerchantSubscription, UserProfile } from '../../types';
import { SUBSCRIPTION_PLANS, OFFICIAL_BANK_INFO } from '../../constants/initialData';
import { Modal } from '../Modal';

interface FoodDealsViewProps {
  profile: UserProfile;
  merchants: FoodMerchant[];
  subscriptions: MerchantSubscription[];
  onAddSubscription: (data: Omit<MerchantSubscription, 'id' | 'submittedAt' | 'status'>) => void;
}

export const FoodDealsView: React.FC<FoodDealsViewProps> = ({
  profile,
  merchants,
  subscriptions,
  onAddSubscription,
}) => {
  // Mode: 'student' (Deals & Gacha) | 'merchant' (Subscription & Portal)
  const [activeMode, setActiveMode] = useState<'student' | 'merchant'>('student');

  // Student Mode State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectMerchant, setInspectMerchant] = useState<FoodMerchant | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState<FoodMerchant | null>(null);
  const [voucherRedeemed, setVoucherRedeemed] = useState(false);

  // Gacha "What to Eat Today" State
  const [gachaArea, setGachaArea] = useState<string>('all');
  const [isSpinning, setIsSpinning] = useState(false);
  const [gachaResult, setGachaResult] = useState<FoodMerchant | null>(null);

  // Merchant Mode Form State
  const [selectedPlanId, setSelectedPlanId] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly');
  const [storeName, setStoreName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [bankLast5, setBankLast5] = useState('');
  const [transferDate, setTransferDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [copiedBank, setCopiedBank] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Live timer for digital anti-counterfeit voucher
  const [liveVoucherTime, setLiveVoucherTime] = useState('');
  React.useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setLiveVoucherTime(
        `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(
          d.getDate()
        ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(
          d.getMinutes()
        ).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter merchants
  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.signatureDish.toLowerCase().includes(q) ||
          m.area.toLowerCase().includes(q) ||
          m.discountHeadline.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [merchants, selectedCategory, searchQuery]);

  // Handle Gacha spin (Strictly excludes pure drink/beverage shops for substantial meals)
  const handleSpinGacha = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setGachaResult(null);

    // Strictly filter out pure beverages/drinks, keeping only meals/substantial foods
    const mealPool = merchants.filter(
      (m) =>
        m.category !== '手搖飲冰品' &&
        !m.category.includes('手搖') &&
        !m.category.includes('飲品') &&
        !m.name.includes('鮮果茶') &&
        !m.name.includes('手搖')
    );

    const pool = mealPool.filter((m) => (gachaArea === 'all' ? true : m.area.includes(gachaArea)));
    const targetPool = pool.length > 0 ? pool : mealPool;

    let counter = 0;
    const maxTicks = 12;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * targetPool.length);
      setGachaResult(targetPool[randomIdx]);
      counter++;
      if (counter >= maxTicks) {
        clearInterval(interval);
        setIsSpinning(false);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    }, 100);
  };

  // Copy bank account
  const handleCopyBank = () => {
    navigator.clipboard.writeText(`${OFFICIAL_BANK_INFO.bankCode} ${OFFICIAL_BANK_INFO.accountNumber}`);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  // Image upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Merchant Subscription Submit
  const handleMerchantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!storeName.trim()) {
      setFormError('請輸入店家名稱');
      return;
    }
    if (!contactName.trim() || !phone.trim()) {
      setFormError('請輸入負責人姓名與聯絡電話');
      return;
    }
    if (!bankLast5.trim() || bankLast5.trim().length < 4) {
      setFormError('請輸入正確的匯款帳號後五碼（至少 4~5 碼）');
      return;
    }

    const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId)!;

    onAddSubscription({
      planId: selectedPlanId,
      planName: currentPlan.name,
      planPrice: currentPlan.price,
      storeName: storeName.trim(),
      contactName: contactName.trim(),
      phone: phone.trim(),
      bankLast5: bankLast5.trim(),
      transferAmount: currentPlan.price,
      transferDate,
      receiptImage,
    });

    setSubmitSuccess(true);
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId)!;

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Top Segmented Mode Switcher */}
      <div className="bg-white dark:bg-[#1C1C1E] p-1.5 rounded-2xl border border-slate-200/80 dark:border-[#2C2C2E] shadow-xs flex items-center">
        <button
          onClick={() => setActiveMode('student')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'student'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>朝陽學生美食優惠</span>
        </button>

        <button
          onClick={() => setActiveMode('merchant')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'merchant'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>商家合作入駐方案</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* STUDENT MODE (Deals & Gacha) */}
      {/* ============================================================== */}
      {activeMode === 'student' && (
        <div className="space-y-4">
          {/* "What to Eat Today" Gacha Card */}
          <section className="rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white p-4.5 shadow-md shadow-orange-500/15 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-extrabold tracking-tight">今日吃什麼？朝陽美食抽籤機</h2>
              </div>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>正餐限定</span>
                <span className="opacity-80">· 已排飲料</span>
              </span>
            </div>

            <p className="text-xs text-amber-50/90 mb-3">
              吉峰路還是樹仁商圈？已嚴格排除手搖飲，一鍵為你決定能吃飽的正餐！
            </p>

            {/* Area Filter Tags */}
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto text-[11px]">
              {[
                { id: 'all', label: '所有商圈' },
                { id: '吉峰', label: '吉峰路' },
                { id: '樹仁', label: '樹仁商圈' },
                { id: '校內', label: '紅磚學餐' },
              ].map((area) => (
                <button
                  key={area.id}
                  onClick={() => setGachaArea(area.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                    gachaArea === area.id
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {area.label}
                </button>
              ))}
            </div>

            {/* Result Area */}
            {gachaResult ? (
              <div className="p-3.5 rounded-2xl bg-white text-slate-900 shadow-sm animate-in zoom-in-95 duration-200">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-orange-600 tracking-wide uppercase">
                      中籤推薦：{gachaResult.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {gachaResult.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      招牌必點：{gachaResult.signatureDish}
                    </p>
                    <div className="inline-block mt-2 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                      🎁 {gachaResult.discountHeadline}
                    </div>
                  </div>

                  <button
                    onClick={() => setInspectMerchant(gachaResult)}
                    className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shrink-0 shadow-xs"
                  >
                    查看詳情
                  </button>
                </div>
              </div>
            ) : null}

            {/* Spin Trigger Button */}
            <button
              onClick={handleSpinGacha}
              disabled={isSpinning}
              className={`w-full mt-3 py-2.5 rounded-xl bg-white text-orange-600 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all ${
                isSpinning ? 'opacity-80' : 'hover:bg-amber-50'
              }`}
            >
              <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? '正在尋找美味...' : gachaResult ? '不滿意？再抽一次' : '開始抽籤！決定今天午晚餐'}</span>
            </button>
          </section>

          {/* Deals Search & Category Tabs */}
          <div className="bg-white dark:bg-[#1C1C1E] p-3.5 rounded-3xl border border-slate-200/80 dark:border-[#2C2C2E] shadow-xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋吉峰東路、排骨飯、手搖飲、優惠..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#242426] border border-slate-200 dark:border-[#38383A] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
              {[
                { id: 'all', label: '全部' },
                { id: '主餐便當', label: '主餐便當' },
                { id: '朝陽早午餐', label: '早午餐' },
                { id: '校內學餐', label: '紅磚學餐' },
                { id: '手搖飲冰品', label: '手搖飲' },
                { id: '炸物小吃', label: '宵夜小吃' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 dark:bg-[#242426] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#38383A] hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Merchants Listing Cards */}
          <div className="space-y-3">
            {filteredMerchants.length > 0 ? (
              filteredMerchants.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setInspectMerchant(item)}
                  className="rounded-3xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-[#2C2C2E] shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all overflow-hidden cursor-pointer group"
                >
                  {/* Photo with Overlay Badge */}
                  <div className="relative h-36 w-full bg-slate-100 dark:bg-[#242426] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-white/90 dark:bg-[#1C1C1E]/90 text-slate-800 dark:text-white text-[10px] font-bold backdrop-blur-xs">
                        {item.area}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-600/90 text-white text-[10px] font-bold backdrop-blur-xs">
                        {item.distanceText}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
                      <div>
                        <h3 className="text-base font-bold drop-shadow-xs">{item.name}</h3>
                        <p className="text-xs text-slate-200 font-medium">均消 {item.averagePrice}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-xs text-xs font-bold text-amber-300">
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        <span>{item.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Discount & Action Footer */}
                  <div className="p-3.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400 block truncate">
                          {item.discountHeadline}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                          招牌：{item.signatureDish}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowVoucherModal(item);
                        setVoucherRedeemed(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs shrink-0 active:scale-95 transition-all"
                    >
                      出示優惠
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200/80 dark:border-[#2C2C2E] text-center p-6">
                <Utensils className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  沒有找到符合的美食商家
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  請嘗試切換其他商圈標籤或清除搜尋字串。
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MERCHANT PARTNER MODE */}
      {/* ============================================================== */}
      {activeMode === 'merchant' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Hero Banner for Merchant */}
          <div className="rounded-3xl bg-gradient-to-br from-[#1C1C1E] via-[#242426] to-[#121212] text-white p-5 border border-[#2C2C2E] shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Store className="w-4 h-4" />
              <span>朝陽科技大學特約商圈合作</span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white">
              精準觸及全校 17,000+ 名朝陽師生
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              朝陽科技大學學生每日必開的校園課表與生活 App，立即入駐特約店家，在校園生活圈佔領首選曝光！
            </p>
          </div>

          {/* Pricing Tiers */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              選擇商家訂閱合作方案
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-4 rounded-3xl border-2 transition-all cursor-pointer relative bg-white dark:bg-[#1C1C1E] shadow-xs ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/20'
                        : 'border-slate-200/80 dark:border-[#2C2C2E] hover:border-slate-300'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold shadow-xs">
                        {plan.badge}
                      </span>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {plan.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {plan.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                          NT$ {plan.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 block font-normal">
                          / {plan.period}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#2C2C2E] space-y-1.5">
                      {plan.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Bank Info Box */}
          <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                官方指定轉帳匯款帳戶
              </span>
              <button
                onClick={handleCopyBank}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBank ? '已複製！' : '複製帳號'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-slate-400 text-[11px]">銀行代碼</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{OFFICIAL_BANK_INFO.bankCode} 臺灣銀行</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">受款帳號</span>
                <p className="font-bold font-mono text-slate-800 dark:text-slate-200 tracking-wide">
                  {OFFICIAL_BANK_INFO.accountNumber}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 text-[11px]">帳戶戶名</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{OFFICIAL_BANK_INFO.accountHolder}</p>
              </div>
            </div>

            <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 pt-1">
              ※ 完成 ATM 或網路銀行轉帳後，請填寫下方表單並上傳證明，將由專人於 24 小時內審核上架。
            </p>
          </div>

          {/* Remittance Submission Form */}
          <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-3xl border border-slate-200/80 dark:border-[#2C2C2E] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              回傳匯款資訊與商家資料
            </h3>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs border border-rose-200">
                {formError}
              </div>
            )}

            {submitSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  匯款申報已成功送出！
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  感謝您的合作支持！工作人員正在核對款項與店家資訊，完成審核後將立即發送簡訊通知並將您的特約好康推薦給朝陽學生！
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  填寫下一筆店家
                </button>
              </div>
            ) : (
              <form onSubmit={handleMerchantSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    合作店家名稱 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="例如：霧峰吉峰排骨飯"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#242426] border border-slate-200 dark:border-[#38383A] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      負責人 / 聯絡姓名 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="陳老闆"
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#242426] border border-slate-200 dark:border-[#38383A] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      聯絡手機 / 電話 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912-345-678"
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#242426] border border-slate-200 dark:border-[#38383A] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      匯款帳號後五碼 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={bankLast5}
                      onChange={(e) => setBankLast5(e.target.value)}
                      placeholder="例如：54321"
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#242426] border border-slate-200 dark:border-[#38383A] text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      轉帳日期
                    </label>
                    <input
                      type="date"
                      value={transferDate}
                      onChange={(e) => setTransferDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#242426] border border-slate-200 dark:border-[#38383A] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    應付方案金額
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#242426] text-xs font-bold text-amber-600 dark:text-amber-400">
                    {selectedPlan.name}：NT$ {selectedPlan.price.toLocaleString()} 元
                  </div>
                </div>

                {/* Receipt Image Upload */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    上傳轉帳明細截圖 (選填)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-[#38383A] rounded-2xl p-4 text-center hover:bg-slate-50 dark:hover:bg-[#2C2C2E]/40 transition-colors">
                    {receiptImage ? (
                      <div className="relative inline-block">
                        <img
                          src={receiptImage}
                          alt="匯款收據預覽"
                          className="h-28 rounded-xl object-contain mx-auto shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setReceiptImage(undefined)}
                          className="mt-2 text-[11px] font-bold text-rose-500 hover:underline block mx-auto"
                        >
                          移除更換截圖
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block">
                          點擊選取或拖曳匯款截圖
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          支援 JPG / PNG / 網銀截圖
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 active:scale-98 transition-all"
                  >
                    送出合作申請與匯款確認
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Existing Submissions List */}
          {subscriptions.length > 0 && (
            <div className="bg-white dark:bg-[#1C1C1E] p-4.5 rounded-3xl border border-slate-200/80 dark:border-[#2C2C2E] shadow-xs space-y-2.5">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                您的合作申請紀錄
              </h4>
              <div className="space-y-2">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-[#242426] border border-slate-200/60 dark:border-[#2C2C2E] flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                          {sub.storeName}
                        </h5>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          審核中
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {sub.planName} · 帳號末碼：{sub.bankLast5} · NT$ {sub.transferAmount}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {sub.submittedAt.slice(0, 10)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* STORE DETAIL MODAL */}
      {/* ============================================================== */}
      {inspectMerchant && (
        <Modal
          isOpen={!!inspectMerchant}
          onClose={() => setInspectMerchant(null)}
          title={inspectMerchant.name}
        >
          <div className="space-y-4">
            {/* Store Cover Image */}
            <div className="relative h-44 rounded-2xl overflow-hidden shadow-xs">
              <img
                src={inspectMerchant.image}
                alt={inspectMerchant.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-black/60 text-amber-300 text-xs font-bold backdrop-blur-xs flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                <span>{inspectMerchant.rating} 顆星好評</span>
              </div>
            </div>

            {/* Discount Highlight Card */}
            <div className="p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-orange-800 dark:text-orange-300">
                  朝陽特約專屬學生好康
                </h4>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {inspectMerchant.discountHeadline}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {inspectMerchant.discountDetail}
                </p>
              </div>
            </div>

            {/* Store Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs py-2 border-y border-slate-100 dark:border-[#2C2C2E]">
              <div className="space-y-1">
                <span className="text-slate-400">商圈與距離</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{inspectMerchant.area} ({inspectMerchant.distanceText})</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">平均消費</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {inspectMerchant.averagePrice}
                </p>
              </div>

              <div className="space-y-1 col-span-2">
                <span className="text-slate-400">店家地址</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {inspectMerchant.address}
                </p>
              </div>

              <div className="space-y-1 col-span-2">
                <span className="text-slate-400">營業時間</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{inspectMerchant.openingHours}</span>
                </p>
              </div>

              <div className="space-y-1 col-span-2">
                <span className="text-slate-400">人氣必吃招牌</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {inspectMerchant.signatureDish}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  inspectMerchant.name + ' ' + inspectMerchant.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#38383A] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-[#2C2C2E] transition-colors"
              >
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>Google 導航</span>
              </a>

              <button
                onClick={() => {
                  setShowVoucherModal(inspectMerchant);
                  setVoucherRedeemed(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-orange-500/20 active:scale-95 transition-all"
              >
                <Tag className="w-4 h-4" />
                <span>出示朝陽學生優惠</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* DIGITAL STUDENT VOUCHER MODAL (電子學生優惠憑證) */}
      {/* ============================================================== */}
      {showVoucherModal && (
        <Modal
          isOpen={!!showVoucherModal}
          onClose={() => setShowVoucherModal(null)}
          title="朝陽科大特約學生優惠憑證"
        >
          <div className="space-y-4 text-center">
            {/* Animated Anti-Counterfeit Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 text-white shadow-xl relative overflow-hidden border-2 border-amber-400/40">
              {/* Dynamic light pulse */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-white text-blue-800 font-black text-xs flex items-center justify-center">
                    CY
                  </div>
                  <span className="font-extrabold text-xs tracking-wider">
                    朝陽科技大學特約驗證
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-amber-400 text-blue-950 px-2 py-0.5 rounded-full">
                  即時防偽有效
                </span>
              </div>

              <div className="my-4">
                <span className="text-[11px] text-blue-200 block">特約店家</span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {showVoucherModal.name}
                </h3>

                <div className="mt-3 p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
                  <span className="text-[11px] text-amber-300 font-bold block">
                    【學生獨享特惠】
                  </span>
                  <p className="text-base font-extrabold text-white mt-1">
                    {showVoucherModal.discountHeadline}
                  </p>
                  <p className="text-xs text-blue-100 mt-1">
                    {showVoucherModal.discountDetail}
                  </p>
                </div>
              </div>

              {/* Watermark with Student Info */}
              <div className="pt-3 border-t border-white/20 grid grid-cols-2 gap-2 text-left text-xs text-blue-100">
                <div>
                  <span className="text-[10px] text-blue-300 block">學生姓名</span>
                  <span className="font-bold text-white">{profile.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-300 block">朝陽學號</span>
                  <span className="font-bold font-mono text-white">{profile.studentId}</span>
                </div>
                <div className="col-span-2 pt-1 flex items-center justify-between text-[10px] text-amber-300 font-mono">
                  <span>防偽動態時間戳</span>
                  <span>{liveVoucherTime}</span>
                </div>
              </div>
            </div>

            {/* Confirmation Action */}
            {voucherRedeemed ? (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>店員已核對折抵，感謝光臨！</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  setVoucherRedeemed(true);
                  confetti({
                    particleCount: 60,
                    spread: 60,
                    origin: { y: 0.7 },
                  });
                }}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>結帳出示完畢（店員點擊確認折抵）</span>
              </button>
            )}

            <button
              onClick={() => setShowVoucherModal(null)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              關閉憑證
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
