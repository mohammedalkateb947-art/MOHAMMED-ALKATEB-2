import React from 'react';
import {
  ShoppingBag,
  Store,
  Bike,
  ShieldCheck,
  CreditCard,
  ChefHat,
  Smartphone,
  Monitor,
  Database,
  Download,
  User as UserIcon,
  LogOut,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useMshwar } from '../context/MshwarContext';
import { AppRole } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const RoleNavbar: React.FC = () => {
  const {
    role,
    setRole,
    currentUser,
    logout,
    setIsAuthModalOpen,
    isMobileSimulator,
    setIsMobileSimulator,
    setIsTechModalOpen,
    setIsStoreModalOpen,
    orders,
    cartSummary,
  } = useMshwar();

  const { isInstallable, install } = usePWAInstall();

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  const biddingOrdersCount = orders.filter(
    (o) => o.status === 'bidding_open' && o.biddingStatus === 'open'
  ).length;

  const pendingReceiptsCount = orders.filter(
    (o) => o.paymentStatus === 'pending_review'
  ).length;

  const kitchenTicketsCount = orders.filter(
    (o) => o.status === 'confirmed' || o.status === 'preparing'
  ).length;

  const rolesConfig: { id: AppRole; titleAr: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'customer',
      titleAr: 'تطبيق العميل',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: cartSummary.itemCount > 0 ? cartSummary.itemCount : undefined,
    },
    {
      id: 'captain',
      titleAr: 'تطبيق الكابتن',
      icon: <Bike className="w-4 h-4" />,
      badge: biddingOrdersCount > 0 ? biddingOrdersCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      id: 'restaurant',
      titleAr: 'لوحة المطعم',
      icon: <Store className="w-4 h-4" />,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
    },
    {
      id: 'cashier',
      titleAr: 'الكاشير (POS)',
      icon: <CreditCard className="w-4 h-4" />,
      badge: pendingReceiptsCount > 0 ? pendingReceiptsCount : undefined,
      badgeColor: 'bg-purple-600 text-white animate-pulse',
    },
    {
      id: 'kds',
      titleAr: 'المطبخ (KDS)',
      icon: <ChefHat className="w-4 h-4" />,
      badge: kitchenTicketsCount > 0 ? kitchenTicketsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'admin',
      titleAr: 'الإدارة العامة',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Wordmark & Tag */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 text-white shadow-md shadow-emerald-900/20">
              <span className="font-black text-lg">🛵</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900">مشوار</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Mshwar Delivery
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden xl:block">
                طعام لذيذ، توصيل فائق السرعة
              </p>
            </div>
          </div>

          {/* Interactive Role Switcher Tabs */}
          <nav
            aria-label="تبديل الأدوار الوظيفية"
            className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl overflow-x-auto no-scrollbar max-w-[50%]"
          >
            {rolesConfig.map((item) => {
              const isActive = role === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setRole(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.titleAr}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 text-[10px] font-black rounded-full ${
                        item.badgeColor || (isActive ? 'bg-white text-emerald-900' : 'bg-emerald-600 text-white')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Zone: User Profile + Simulator + Install PWA + Tech Architecture */}
          <div className="flex items-center gap-2 shrink-0">
            {/* User Profile Chip */}
            <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl transition-colors">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-slate-800 font-bold cursor-pointer"
                title="إدارة الحساب والمصادقة"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-[11px]">
                  {currentUser.name.slice(0, 1)}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate">{currentUser.name}</span>
              </button>
              <button
                onClick={logout}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Direct PWA install if available */}
            {isInstallable && (
              <button
                onClick={install}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-colors cursor-pointer"
                title="تثبيت التطبيق على جهازك"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تثبيت PWA</span>
              </button>
            )}

            {/* Mobile / Desktop frame toggle */}
            {(role === 'customer' || role === 'captain') && (
              <button
                onClick={() => setIsMobileSimulator(!isMobileSimulator)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                title="تبديل محاكي شاشة الجوال الذكي"
              >
                {isMobileSimulator ? (
                  <>
                    <Monitor className="w-3.5 h-3.5 text-slate-600" />
                    <span className="hidden md:inline">عرض سطح المكتب</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="hidden md:inline">محاكي الهاتف</span>
                  </>
                )}
              </button>
            )}

            {/* Store & PWA deployment modal button */}
            <button
              onClick={() => setIsStoreModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="نشر التطبيق على Google Play و Chrome"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>المتجر & PWA</span>
            </button>

            {/* Tech Architecture & Database Info */}
            <button
              onClick={() => setIsTechModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
              title="معلومات البنية وقاعدة البيانات"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">قاعدة البيانات & API</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
