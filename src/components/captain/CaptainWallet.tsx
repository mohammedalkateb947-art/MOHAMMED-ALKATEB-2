import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  CreditCard,
  Building,
  Smartphone,
  X,
  FileText,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useMshwar } from '../../context/MshwarContext';
import { WalletTransaction } from '../../types';
import { validateWithdrawalRequest, calculateWalletMetrics } from '../../utils/mshwarLogic';

const WEEKLY_EARNINGS_DATA = [
  { day: 'السبت', earnings: 45, trips: 4 },
  { day: 'الأحد', earnings: 70, trips: 6 },
  { day: 'الإثنين', earnings: 55, trips: 5 },
  { day: 'الثلاثاء', earnings: 85, trips: 7 },
  { day: 'الأربعاء', earnings: 60, trips: 5 },
  { day: 'الخميس', earnings: 95, trips: 8 },
  { day: 'الجمعة', earnings: 68, trips: 6 },
];

export const CaptainWallet: React.FC = () => {
  const {
    activeCaptain,
    requestCaptainWithdrawal,
    showToast,
  } = useMshwar();

  const [filterType, setFilterType] = useState<'all' | 'earnings' | 'withdrawals' | 'pending'>('all');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [selectedTxDetail, setSelectedTxDetail] = useState<WalletTransaction | null>(null);

  // Withdrawal form state
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [withdrawMethod, setWithdrawMethod] = useState<'jawwal_pay' | 'bank_of_palestine' | 'palpay' | 'cash_office'>('jawwal_pay');
  const [accountInput, setAccountInput] = useState<string>(activeCaptain.phone);
  const [formError, setFormError] = useState<string | null>(null);

  const metrics = calculateWalletMetrics(
    activeCaptain.walletBalance,
    activeCaptain.pendingTransfersAmount,
    activeCaptain.dailyDeliveryRevenue,
    activeCaptain.commissionRatePercent
  );

  const transactions = activeCaptain.transactions || [];

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'all') return true;
    if (filterType === 'earnings') return tx.type === 'earning' || tx.type === 'bonus';
    if (filterType === 'withdrawals') return tx.type === 'withdrawal' && tx.status === 'completed';
    if (filterType === 'pending') return tx.status === 'pending';
    return true;
  });

  const pendingTransfers = transactions.filter((tx) => tx.status === 'pending');

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateWithdrawalRequest(activeCaptain.walletBalance, withdrawAmount, 20);
    if (!validation.isValid) {
      setFormError(validation.errorMessage || 'خطأ في المبلغ المدخل');
      return;
    }
    setFormError(null);

    const success = await requestCaptainWithdrawal(
      validation.sanitizedAmount,
      withdrawMethod,
      accountInput.trim() || undefined
    );

    if (success) {
      setIsWithdrawModalOpen(false);
      setWithdrawAmount(50);
    }
  };

  const getMethodBadge = (method: WalletTransaction['method']) => {
    switch (method) {
      case 'jawwal_pay':
        return { label: 'جوال باي', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'bank_of_palestine':
        return { label: 'بنك فلسطين', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'palpay':
        return { label: 'بال بي', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'cash_office':
        return { label: 'مكتب مشوار', color: 'bg-slate-100 text-slate-800 border-slate-200' };
      default:
        return { label: 'تحويل', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-4 text-right">
      {/* 1. HERO BALANCE CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-5 text-white shadow-xl">
        <div className="absolute top-0 left-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">المحفظة الرقمية للكابتن</h3>
                <p className="text-[11px] text-slate-300">نظام الأرباح والمسحوبات اليومي المباشر</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>حساب كابتن موثق</span>
            </span>
          </div>

          {/* Big Balance Display */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs text-slate-300 block font-semibold mb-1">
                الرصيد القابل للسحب الفوري
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight text-white font-mono">
                  {metrics.availableBalance.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-emerald-400">شيكل (ILS)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                إجمالي المحفظة (شاملاً المعلق): {metrics.totalFinancialHoldings.toFixed(2)} ₪
              </p>
            </div>

            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>طلب سحب أرباح</span>
            </button>
          </div>

          {/* 3 Metrics Mini Cards */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
            <div className="p-2.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] text-slate-400 block font-semibold">إجمالي أرباح اليوم</span>
              <span className="text-xs font-black text-emerald-300 font-mono">
                {metrics.dailyGrossEarnings.toFixed(1)} ₪
              </span>
              <span className="text-[9px] text-slate-400 block">
                صافي لك: {metrics.dailyNetEarnings.toFixed(1)} ₪
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] text-slate-400 block font-semibold">حوالات قيد المعالجة</span>
              <span className="text-xs font-black text-amber-300 font-mono">
                {metrics.pendingTransfersAmount.toFixed(1)} ₪
              </span>
              <span className="text-[9px] text-slate-400 block">
                {pendingTransfers.length} طلبات سحب
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] text-slate-400 block font-semibold">
                عمولة مشوار ({metrics.commissionRatePercent}%)
              </span>
              <span className="text-xs font-black text-rose-300 font-mono">
                {metrics.dailyPlatformCommission.toFixed(1)} ₪
              </span>
              <span className="text-[9px] text-slate-400 block">
                {activeCaptain.isCommissionSettledToday ? 'تمت التسوية' : 'مستحقة نهاية اليوم'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PENDING TRANSFERS ALERT & TRACKER */}
      {pendingTransfers.length > 0 && (
        <div className="p-4 rounded-3xl bg-amber-50/90 border border-amber-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center">
                <Clock className="w-4 h-4 animate-spin text-amber-700" />
              </div>
              <div>
                <h4 className="text-xs font-black text-amber-950">
                  طلبات سحب قيد التحويل المالي ({pendingTransfers.length})
                </h4>
                <p className="text-[11px] text-amber-800">
                  يتم التحقق من الحساب والتحويل المالي بواسطة الإدارة خلال ساعات العمل
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 text-[11px] font-black">
              {pendingTransfers.reduce((sum, tx) => sum + Math.abs(tx.amount), 0).toFixed(1)} ₪
            </span>
          </div>

          {pendingTransfers.map((pTx) => (
            <div key={pTx.id} className="p-3 bg-white rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-slate-900">
                    {Math.abs(pTx.amount).toFixed(2)} ₪
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">#{pTx.referenceId}</span>
                </div>
                <span className="text-[11px] font-bold text-slate-600">
                  {pTx.method === 'jawwal_pay'
                    ? 'جوال باي'
                    : pTx.method === 'bank_of_palestine'
                    ? 'بنك فلسطين'
                    : pTx.method === 'palpay'
                    ? 'بال بي'
                    : 'نقدي'}
                </span>
              </div>

              {/* Progress Stepper */}
              <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold pt-1">
                <div className="p-1 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center gap-0.5">
                  <Check className="w-3 h-3" />
                  <span>تم التقديم</span>
                </div>
                <div className="p-1 rounded bg-amber-100 text-amber-900 animate-pulse flex items-center justify-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  <span>مراجعة الإدارة</span>
                </div>
                <div className="p-1 rounded bg-slate-100 text-slate-400">
                  <span>إرسال الحوالة</span>
                </div>
                <div className="p-1 rounded bg-slate-100 text-slate-400">
                  <span>تم الإيداع</span>
                </div>
              </div>

              <div className="text-[10px] text-amber-800 flex items-center justify-between pt-1">
                <span>تاريخ التقديم: {pTx.date}</span>
                <span>الوقت المتوقع: 2 - 24 ساعة</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. WEEKLY EARNINGS CHART */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div>
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>مخطط الأرباح الأسبوعي</span>
            </h4>
            <p className="text-[11px] text-slate-500">متابعة إيرادات التوصيل خلال الـ 7 أيام الماضية</p>
          </div>
          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            إجمالي الأسبوع: 478 ₪
          </span>
        </div>

        <div className="w-full h-36">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={WEEKLY_EARNINGS_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="captainEarningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit=" ₪" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-[11px] p-2 rounded-xl shadow-lg text-right font-sans">
                        <div className="font-bold text-emerald-400">{data.day}</div>
                        <div>الأرباح: {data.earnings} ₪</div>
                        <div className="text-slate-400">{data.trips} رحلات توصيل</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#captainEarningsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. WITHDRAWAL & TRANSACTION HISTORY */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-700" />
              <span>سجل المعاملات والمسحوبات</span>
            </h4>
            <p className="text-[11px] text-slate-500">تفاصيل جميع عمليات الإيداع والسحب والمكافآت</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'earnings', label: 'أرباح' },
              { id: 'withdrawals', label: 'مسحوبات' },
              { id: 'pending', label: 'معلقة' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl">
            لا توجد معاملات مسجلة في هذا القسم حالياً.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((tx) => {
              const isPositive = tx.amount > 0;
              const badge = getMethodBadge(tx.method);
              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTxDetail(tx)}
                  className="p-3 bg-white hover:bg-slate-50/80 border border-slate-200 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : tx.type === 'bonus'
                          ? 'bg-purple-100 text-purple-700'
                          : isPositive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {tx.status === 'pending' ? (
                        <Clock className="w-4 h-4 animate-spin text-amber-600" />
                      ) : tx.type === 'bonus' ? (
                        <Sparkles className="w-4 h-4" />
                      ) : isPositive ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 leading-snug">
                          {tx.titleAr}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span className="font-mono">#{tx.referenceId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span
                      className={`text-xs font-black font-mono block ${
                        isPositive ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isPositive ? `+${tx.amount.toFixed(2)}` : `${tx.amount.toFixed(2)}`} ₪
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md inline-block ${
                        tx.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-800'
                          : tx.status === 'pending'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {tx.status === 'completed'
                        ? 'مكتمل'
                        : tx.status === 'pending'
                        ? 'قيد المعالجة'
                        : 'مرفوض'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. MODAL: WITHDRAWAL REQUEST FORM */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs text-right animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">طلب سحب رصيد وأرباح</h3>
                  <p className="text-[11px] text-slate-300">
                    الرصيد المتاح للسحب: {activeCaptain.walletBalance.toFixed(2)} ₪
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsWithdrawModalOpen(false);
                  setFormError(null);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleWithdrawSubmit} className="p-5 space-y-4 overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Step 1: Payment Method Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  1. اختر طريقة استلام الأرباح:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: 'jawwal_pay',
                      label: 'جوال باي (Jawwal Pay)',
                      sub: 'تحويل فوري لرقم المحفظة',
                      icon: Smartphone,
                      color: 'border-emerald-500 bg-emerald-50 text-emerald-900',
                    },
                    {
                      id: 'bank_of_palestine',
                      label: 'بنك فلسطين (BOP)',
                      sub: 'تحويل بنكي IBAN',
                      icon: Building,
                      color: 'border-blue-500 bg-blue-50 text-blue-900',
                    },
                    {
                      id: 'palpay',
                      label: 'بال بي (PalPay)',
                      sub: 'تحويل لمحفظة بال بي',
                      icon: CreditCard,
                      color: 'border-purple-500 bg-purple-50 text-purple-900',
                    },
                    {
                      id: 'cash_office',
                      label: 'مكتب مشوار الرئيسي',
                      sub: 'استلام كاش نقدي فوري',
                      icon: DollarSign,
                      color: 'border-slate-800 bg-slate-50 text-slate-900',
                    },
                  ].map((method) => {
                    const isSelected = withdrawMethod === method.id;
                    const IconComponent = method.icon;
                    return (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => {
                          setWithdrawMethod(method.id as any);
                          if (method.id === 'jawwal_pay') setAccountInput(activeCaptain.phone);
                          else if (method.id === 'bank_of_palestine') setAccountInput('PS29PALS00001234567890');
                          else if (method.id === 'palpay') setAccountInput('0599123456');
                          else setAccountInput('استلام يدوي');
                        }}
                        className={`p-3 rounded-2xl border-2 text-right transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? method.color
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <IconComponent className="w-4 h-4 text-slate-700" />
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <span className="text-xs font-black block">{method.label}</span>
                        <span className="text-[10px] text-slate-500">{method.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Amount input & Quick Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    2. المبلغ المطلوب سحبه:
                  </label>
                  <span className="text-[11px] text-slate-500">الحد الأدنى: 20 ₪</span>
                </div>

                {/* Quick Chips */}
                <div className="flex items-center gap-1.5">
                  {[25, 50, 100, 200].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setWithdrawAmount(amt)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        withdrawAmount === amt
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {amt} ₪
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(Math.floor(activeCaptain.walletBalance))}
                    className="flex-1 py-1.5 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer"
                  >
                    كامل الرصيد
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min={20}
                    max={activeCaptain.walletBalance}
                    value={withdrawAmount || ''}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-lg font-black text-slate-900 font-mono focus:bg-white focus:outline-emerald-500"
                    placeholder="0.00"
                    required
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    شيكل (ILS)
                  </span>
                </div>
              </div>

              {/* Step 3: Account / Phone Detail */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  3.{' '}
                  {withdrawMethod === 'jawwal_pay'
                    ? 'رقم محفظة جوال باي المسجل:'
                    : withdrawMethod === 'bank_of_palestine'
                    ? 'رقم الحساب البنكي (IBAN):'
                    : withdrawMethod === 'palpay'
                    ? 'رقم محفظة بال بي:'
                    : 'اسم المستلم:'}
                </label>
                <input
                  type="text"
                  value={accountInput}
                  onChange={(e) => setAccountInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-emerald-500 font-mono"
                  placeholder="أدخل البيانات بدقة..."
                  required
                />
              </div>

              {/* Fee and Policy Notice */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] space-y-1">
                <div className="flex justify-between font-bold">
                  <span>رسوم التحويل الإدارية:</span>
                  <span className="text-emerald-700 font-black">0.00 ₪ (مجاني 100%)</span>
                </div>
                <p className="text-[10px] text-emerald-700">
                  تتم مراجعة الطلب وتحويل المبلغ إلى حسابك المعتمد خلال أوقات دوام الإدارة الرسمية.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>تأكيد طلب السحب ({withdrawAmount} ₪)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: TRANSACTION AUDIT RECEIPT */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs text-right animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-slate-900">سند المعاملة المالية</h4>
              </div>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <span className="text-[11px] text-slate-400 block font-semibold">مبلغ المعاملة:</span>
              <div className="text-2xl font-black font-mono text-slate-900">
                {selectedTxDetail.amount > 0
                  ? `+${selectedTxDetail.amount.toFixed(2)}`
                  : `${selectedTxDetail.amount.toFixed(2)}`}{' '}
                ₪
              </div>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedTxDetail.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {selectedTxDetail.status === 'completed' ? 'معاملة مكتملة' : 'قيد المعالجة'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">رقم المرجع:</span>
                <span className="font-mono font-bold text-slate-900">
                  #{selectedTxDetail.referenceId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">البيان:</span>
                <span className="font-bold text-slate-800">{selectedTxDetail.titleAr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">طريقة التحويل:</span>
                <span className="font-bold text-slate-800">
                  {getMethodBadge(selectedTxDetail.method).label}
                </span>
              </div>
              {selectedTxDetail.accountDetail && (
                <div className="flex justify-between">
                  <span className="text-slate-500">الحساب المودع له:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedTxDetail.accountDetail}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">التاريخ والوقت:</span>
                <span className="text-slate-700">{selectedTxDetail.date}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTxDetail(null)}
              className="w-full py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              إغلاق السند
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
