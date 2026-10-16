import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Users,
  Store,
  Bike,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Search,
  BadgePercent,
  Receipt,
  FileCheck,
  Clock,
  ArrowDownLeft,
  BarChart3,
  Navigation,
  MapPin,
  Settings,
  AlertCircle,
  Check,
  CreditCard,
  Building,
  Smartphone,
  Save,
} from 'lucide-react';
import { useMshwar } from '../../context/MshwarContext';
import { AdminAnalyticsCharts } from './AdminAnalyticsCharts';
import { OrderLiveTrackingMap } from '../common/OrderLiveTrackingMap';
import { AppRole } from '../../types';

export const AdminView: React.FC = () => {
  const {
    orders,
    restaurants,
    captains,
    allUsers,
    updateOrderStatus,
    settleCaptainDailyCommission,
    reviewCaptainWithdrawal,
    platformSettings,
    updatePlatformSettings,
    deliveryZones,
    updateDeliveryZones,
    auditLogs,
    showToast,
  } = useMshwar();

  const [activeTab, setActiveTab] = useState<
    'analytics' | 'withdrawals_review' | 'commission_ledger' | 'users_rbac' | 'zones_settings' | 'orders_table' | 'live_map' | 'audit_log'
  >('analytics');

  const [selectedAdminMapOrderId, setSelectedAdminMapOrderId] = useState<string>(orders[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Settings form state
  const [jawwalPayInput, setJawwalPayInput] = useState<string>(platformSettings.jawwalPayNumber);
  const [palPayInput, setPalPayInput] = useState<string>(platformSettings.palPayNumber);
  const [bopIbanInput, setBopIbanInput] = useState<string>(platformSettings.bopIban);
  const [bopAccountNameInput, setBopAccountNameInput] = useState<string>(platformSettings.bopAccountName);
  const [commissionRateInput, setCommissionRateInput] = useState<number>(platformSettings.commissionRatePercent);

  // Financial metrics
  const totalGMV = orders.reduce((sum, o) => sum + o.total, 0);
  const totalDailyDeliveryRevenue = captains.reduce((sum, c) => sum + c.dailyDeliveryRevenue, 0);
  const totalPlatformOwed = captains.reduce((sum, c) => sum + c.platformOwedAmount, 0);
  const totalSettledToday = captains
    .filter((c) => c.isCommissionSettledToday)
    .reduce((sum, c) => sum + c.platformOwedAmount, 0);
  const totalPendingSettlement = totalPlatformOwed - totalSettledToday;

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  const biddingOrdersCount = orders.filter(
    (o) => o.status === 'bidding_open' && o.biddingStatus === 'open'
  ).length;

  // Pending withdrawals collected from all captains
  const allPendingWithdrawals = captains.flatMap((c) =>
    (c.transactions || [])
      .filter((t) => t.status === 'pending')
      .map((t) => ({ ...t, captainName: c.name, captainPhone: c.phone, captainBalance: c.walletBalance }))
  );

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filterStatus === 'all' || o.status === filterStatus;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.restaurantNameAr.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePlatformSettings({
      jawwalPayNumber: jawwalPayInput,
      palPayNumber: palPayInput,
      bopIban: bopIbanInput,
      bopAccountName: bopAccountNameInput,
      commissionRatePercent: Number(commissionRateInput),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-right">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">
              لوحة التحكم والإدارة المركزية (Admin Command Center)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              إدارة العمليات المباشرة
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            مراقبة الأداء المالي، تسوية عمولات الكباتن، إدارة الصلاحيات ومناطق التغطية
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-right">
            <span className="text-[10px] text-emerald-800 font-bold block">إجمالي عمولة مشوار المستحقة:</span>
            <span className="text-base font-black text-emerald-950 font-mono">
              {totalPlatformOwed.toFixed(2)} ₪
            </span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-right">
            <span className="text-[10px] text-amber-800 font-bold block">متبقي قيد التحصيل:</span>
            <span className="text-base font-black text-amber-950 font-mono">
              {totalPendingSettlement.toFixed(2)} ₪
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">دخل التوصيل الكلي</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-mono">
            {totalDailyDeliveryRevenue.toFixed(2)} ₪
          </h3>
          <p className="text-[11px] text-emerald-700 font-bold">
            محقق بواسطة {captains.length} كباتن اليوم
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">طلبات المزايدة (حمامة)</span>
            <BadgePercent className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-mono">{biddingOrdersCount}</h3>
          <p className="text-[11px] text-purple-700 font-bold">طلبات طعام وطرود معروضة للمناقصة</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">الطلبات النشطة حالياً</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-mono">{activeOrdersCount}</h3>
          <p className="text-[11px] text-blue-700 font-bold">من أصل {orders.length} طلب إجمالي</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">طلبات السحب المعلقة</span>
            <ArrowDownLeft className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-mono">
            {allPendingWithdrawals.length}
          </h3>
          <p className="text-[11px] text-amber-700 font-bold">بانتظار التحويل المالي للكباتن</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>المؤشرات والرسوم البيانية (Recharts)</span>
        </button>

        <button
          onClick={() => setActiveTab('withdrawals_review')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'withdrawals_review'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>اعتماد سحوبات الكباتن ({allPendingWithdrawals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('commission_ledger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'commission_ledger'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>دفتر تسوية العمولات</span>
        </button>

        <button
          onClick={() => setActiveTab('users_rbac')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'users_rbac'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>دليل المستخدمين والصلاحيات ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('zones_settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'zones_settings'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>المناطق وإعدادات الدفع</span>
        </button>

        <button
          onClick={() => setActiveTab('orders_table')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'orders_table'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>جدول كافة الطلبات ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('live_map')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'live_map'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>رادار الأسطول الحي (GPS)</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_log')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'audit_log'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>سجل التدقيق الأمني (Audit)</span>
        </button>
      </div>

      {/* TAB 1: RECHARTS ANALYTICS */}
      {activeTab === 'analytics' && <AdminAnalyticsCharts captains={captains} />}

      {/* TAB 2: WITHDRAWALS REVIEW */}
      {activeTab === 'withdrawals_review' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">
                مراجعة وتأكيد طلبات سحب الأرباح للكباتن
              </h3>
              <p className="text-xs text-slate-500">
                يتم خصم المبلغ من رصيد الكابتن فور الطلب، والاعتماد هنا يكمل التحويل المالي للحساب
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl font-bold text-xs">
              {allPendingWithdrawals.length} طلبات معلقة
            </span>
          </div>

          {allPendingWithdrawals.length === 0 ? (
            <div className="py-16 text-center space-y-2 bg-slate-50 rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">لا توجد طلبات سحب معلقة حالياً</h4>
              <p className="text-xs text-slate-400">جميع مستحقات الكباتن المحولة تمت معالجتها بالكامل.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold">
                    <th className="pb-3 pr-2">الكابتن</th>
                    <th className="pb-3">المبلغ المطلوب</th>
                    <th className="pb-3">طريقة التحويل</th>
                    <th className="pb-3">رقم الحساب / IBAN</th>
                    <th className="pb-3">تاريخ الطلب</th>
                    <th className="pb-3 pl-2 text-left">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allPendingWithdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 pr-2">
                        <span className="font-bold text-slate-900 block">{w.captainName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{w.captainPhone}</span>
                      </td>
                      <td className="py-3.5 font-black text-sm text-emerald-800 font-mono">
                        {Math.abs(w.amount).toFixed(2)} ₪
                      </td>
                      <td className="py-3.5 font-bold text-slate-700">
                        {w.method === 'jawwal_pay'
                          ? 'جوال باي'
                          : w.method === 'bank_of_palestine'
                          ? 'بنك فلسطين'
                          : w.method === 'palpay'
                          ? 'بال بي'
                          : 'مكتب مشوار'}
                      </td>
                      <td className="py-3.5 font-mono text-[11px] text-slate-600">
                        {w.accountDetail || '-'}
                      </td>
                      <td className="py-3.5 text-slate-500">{w.date}</td>
                      <td className="py-3.5 pl-2 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => reviewCaptainWithdrawal(w.id, 'approve')}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            تأكيد التحويل
                          </button>
                          <button
                            onClick={() => reviewCaptainWithdrawal(w.id, 'reject')}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            رفض وإرجاع الرصيد
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMMISSION LEDGER */}
      {activeTab === 'commission_ledger' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">
                دفتر الأستاذ وتصفية عمولات التوصيل اليومية
              </h3>
              <p className="text-xs text-slate-500">
                احتساب عمولة المنصة المباشرة (15%) على كل عملية توصيل منفذة
              </p>
            </div>
            <span className="font-bold px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
              نسبة عمولة مشوار: {platformSettings.commissionRatePercent}%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold">
                  <th className="pb-3 pr-2">الكابتن</th>
                  <th className="pb-3">المركبة والهاتف</th>
                  <th className="pb-3 text-center">رحلات اليوم</th>
                  <th className="pb-3">إيراد التوصيل</th>
                  <th className="pb-3">كاش طعام محصل</th>
                  <th className="pb-3 font-black text-emerald-900">عمولة مشوار (15%)</th>
                  <th className="pb-3">صافي الكابتن</th>
                  <th className="pb-3">حالة التسوية</th>
                  <th className="pb-3 pl-2 text-left">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {captains.map((cap) => (
                  <tr key={cap.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 pr-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                          {cap.name.slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{cap.name}</span>
                          <span className="text-[11px] text-amber-600 font-bold">
                            ★ {cap.rating}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-slate-800 font-semibold block">{cap.vehicle}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{cap.phone}</span>
                    </td>
                    <td className="py-4 text-center font-bold text-slate-900">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg">
                        {cap.dailyDeliveriesCount} رحلات
                      </span>
                    </td>
                    <td className="py-4 font-black text-slate-900 font-mono">
                      {cap.dailyDeliveryRevenue.toFixed(2)} ₪
                    </td>
                    <td className="py-4 font-bold text-slate-600 font-mono">
                      {cap.dailyFoodCashCollected.toFixed(2)} ₪
                    </td>
                    <td className="py-4 font-black text-sm text-emerald-800 font-mono">
                      {cap.platformOwedAmount.toFixed(2)} ₪
                    </td>
                    <td className="py-4 font-bold text-slate-700 font-mono">
                      {(cap.dailyDeliveryRevenue - cap.platformOwedAmount).toFixed(2)} ₪
                    </td>
                    <td className="py-4">
                      {cap.isCommissionSettledToday ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>تمت التسوية اليوم</span>
                          </span>
                          {cap.lastSettlementTime && (
                            <span className="text-[9px] text-slate-400 block font-mono">
                              {cap.lastSettlementTime}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          <Clock className="w-3 h-3" />
                          <span>مستحقة للدفع</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 pl-2 text-left">
                      {cap.isCommissionSettledToday ? (
                        <span className="text-[11px] text-slate-400 font-medium">مسوى بالكامل</span>
                      ) : (
                        <button
                          onClick={() => settleCaptainDailyCommission(cap.id)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                        >
                          تأكيد تسوية ({cap.platformOwedAmount.toFixed(2)} ₪)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS & RBAC */}
      {activeTab === 'users_rbac' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">
                سجل الحسابات والأدوار الوظيفية (RBAC User Directory)
              </h3>
              <p className="text-xs text-slate-500">
                التحكم في وصول المستخدمين حسب الدور: عميل، كابتن، مطعم، كاشير، كيتشن، وإدارة
              </p>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-xl font-bold text-xs">
              {allUsers.length} مستخدمين مسجلين
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="pb-3 pr-2">الاسم</th>
                  <th className="pb-3">البريد الإلكتروني</th>
                  <th className="pb-3">رقم الهاتف</th>
                  <th className="pb-3">الدور الوظيفي (Role)</th>
                  <th className="pb-3">تاريخ الانضمام</th>
                  <th className="pb-3 pl-2 text-left">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map((u) => {
                  const roleColors: Record<AppRole, string> = {
                    admin: 'bg-slate-900 text-white',
                    restaurant: 'bg-amber-100 text-amber-900',
                    captain: 'bg-blue-100 text-blue-900',
                    cashier: 'bg-purple-100 text-purple-900',
                    kds: 'bg-rose-100 text-rose-900',
                    customer: 'bg-emerald-100 text-emerald-900',
                  };
                  const roleLabels: Record<AppRole, string> = {
                    admin: 'إدارة عليا (Admin)',
                    restaurant: 'مدير مطعم (Restaurant)',
                    captain: 'كابتن توصيل (Captain)',
                    cashier: 'محاسب كاشير (Cashier)',
                    kds: 'شيف مطبخ (KDS)',
                    customer: 'عميل (Customer)',
                  };
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 pr-2 font-bold text-slate-900">{u.name}</td>
                      <td className="py-3.5 text-slate-600 font-mono">{u.email}</td>
                      <td className="py-3.5 text-slate-600 font-mono">{u.phone}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${roleColors[u.role]}`}>
                          {roleLabels[u.role]}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-400">{u.createdAt}</td>
                      <td className="py-3.5 pl-2 text-left">
                        <span className="text-emerald-700 font-bold">نشط ومفعل</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ZONES & PAYMENT SETTINGS */}
      {activeTab === 'zones_settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings form */}
          <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-700" />
                <span>إعدادات العمولات والتحويلات المالية</span>
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  نسبة عمولة المنصة على التوصيل (%):
                </label>
                <input
                  type="number"
                  value={commissionRateInput}
                  onChange={(e) => setCommissionRateInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  رقم محفظة جوال باي (Jawwal Pay) المعتمد:
                </label>
                <input
                  type="text"
                  value={jawwalPayInput}
                  onChange={(e) => setJawwalPayInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  رقم محفظة بال بي (PalPay) المعتمد:
                </label>
                <input
                  type="text"
                  value={palPayInput}
                  onChange={(e) => setPalPayInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  رقم الآيبان لبنك فلسطين (BOP IBAN):
                </label>
                <input
                  type="text"
                  value={bopIbanInput}
                  onChange={(e) => setBopIbanInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  اسم الحساب البنكي الرسمي:
                </label>
                <input
                  type="text"
                  value={bopAccountNameInput}
                  onChange={(e) => setBopAccountNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات في النظام</span>
              </button>
            </div>
          </form>

          {/* Delivery Zones List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>مناطق التوصيل ورسوم الخدمة الجغرافية</span>
              </h3>
              <span className="text-xs text-slate-500 font-bold">{deliveryZones.length} مناطق معرفة</span>
            </div>

            <div className="space-y-2.5">
              {deliveryZones.map((z, idx) => (
                <div
                  key={z.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900">{z.nameAr}</h4>
                    <span className="text-[10px] text-slate-500">{z.estimatedMinutes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-emerald-800 text-sm">{z.deliveryFee} ₪</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      نشطة
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ALL ORDERS TABLE */}
      {activeTab === 'orders_table' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">سجل كافة الطلبات المنفذة</h3>
              <p className="text-xs text-slate-500">
                متابعة حركة الطلبات، الكباتن المعينين، الإجماليات، وإمكانية تعديل الحالة يدوياً
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث برقم الطلب أو الاسم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">كافة الحالات</option>
                <option value="bidding_open">مزايدة مفتوحة</option>
                <option value="confirmed">مؤكد</option>
                <option value="preparing">قيد التحضير</option>
                <option value="ready_for_pickup">جاهز للتسليم</option>
                <option value="on_the_way">في الطريق</option>
                <option value="delivered">تم التسليم</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="pb-3 pr-2">رقم الطلب</th>
                  <th className="pb-3">العميل</th>
                  <th className="pb-3">المطعم</th>
                  <th className="pb-3">التوصيل</th>
                  <th className="pb-3">الإجمالي</th>
                  <th className="pb-3">الكابتن المعين</th>
                  <th className="pb-3">الحالة</th>
                  <th className="pb-3 pl-2 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 pr-2 font-mono font-bold text-slate-900">
                      #{ord.orderNumber}
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{ord.customerPhone}</span>
                    </td>
                    <td className="py-3.5 font-semibold text-slate-800">{ord.restaurantNameAr}</td>
                    <td className="py-3.5 font-bold text-emerald-800 font-mono">{ord.deliveryFee} ₪</td>
                    <td className="py-3.5 font-bold text-slate-900 font-mono">{ord.total} ₪</td>
                    <td className="py-3.5 text-slate-700">
                      {ord.captainName || (
                        <span className="text-purple-600 font-bold">
                          {ord.bids.length > 0 ? `${ord.bids.length} عروض كباتن` : 'بانتظار العروض'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'bidding_open'
                            ? 'bg-purple-100 text-purple-800'
                            : ord.status === 'on_the_way'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'preparing'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ord.status === 'bidding_open' && 'مزايدة مفتوحة'}
                        {ord.status === 'placed' && 'جديد'}
                        {ord.status === 'confirmed' && 'مؤكد'}
                        {ord.status === 'preparing' && 'قيد التحضير'}
                        {ord.status === 'ready_for_pickup' && 'جاهز للتسليم'}
                        {ord.status === 'on_the_way' && 'في الطريق'}
                        {ord.status === 'delivered' && 'تم التسليم'}
                        {ord.status === 'cancelled' && 'ملغي'}
                      </span>
                    </td>
                    <td className="py-3.5 pl-2 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedAdminMapOrderId(ord.id);
                            setActiveTab('live_map');
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          title="تتبع مباشر على الخريطة"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                        </button>
                        {ord.status !== 'delivered' && ord.status !== 'cancelled' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'delivered')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            إنهاء الطلب
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: LIVE FLEET GPS MAP */}
      {activeTab === 'live_map' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>رادار تحركات أسطول الكباتن (Fleet GPS Radar)</span>
              </h3>
              <p className="text-xs text-slate-500">
                متابعة حركة الطلبات الجارية، مسار الدراجة، والمسافة المتبقية حتى وجهة العميل
              </p>
            </div>

            {/* Order Selector Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
              <span className="text-xs text-slate-400 font-bold shrink-0">اختر الرحلة:</span>
              {orders.slice(0, 6).map((ord) => {
                const isSelected = ord.id === selectedAdminMapOrderId;
                return (
                  <button
                    key={`admin-map-select-${ord.id}`}
                    onClick={() => setSelectedAdminMapOrderId(ord.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-400/40'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    #{ord.orderNumber} ({ord.restaurantNameAr.split(' ')[0]})
                  </button>
                );
              })}
            </div>
          </div>

          {(() => {
            const currentOrder =
              orders.find((o) => o.id === selectedAdminMapOrderId) || orders[0];
            if (!currentOrder) {
              return (
                <div className="p-8 text-center bg-white rounded-3xl text-slate-500 text-xs">
                  لا توجد طلبات لعرضها على الخريطة
                </div>
              );
            }
            return <OrderLiveTrackingMap order={currentOrder} />;
          })()}
        </div>
      )}

      {/* TAB 8: AUDIT LOGS */}
      {activeTab === 'audit_log' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>سجل التدقيق الأمني والعمليات (Audit Trail)</span>
              </h3>
              <p className="text-xs text-slate-500">
                تسجيل كافة العمليات المالية والإدارية مع التوقيت وهوية المستخدم لمنع التلاعب
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="px-2 py-0.2 rounded-md bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-700">
                      {log.userName} ({log.userRole})
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
