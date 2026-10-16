import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  ShieldCheck,
  Store,
  Bike,
  CreditCard,
  ChefHat,
  ArrowRight,
  Sparkles,
  MapPin,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { useMshwar } from '../../context/MshwarContext';
import { AppRole } from '../../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    login,
    registerUser,
    showToast,
  } = useMshwar();

  const [identifier, setIdentifier] = useState<string>('customer@mshwar.ps');
  const [password, setPassword] = useState<string>('••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<AppRole>('customer');

  // Register fields
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regAddress, setRegAddress] = useState<string>('غزة، الرمال');
  const [regRole, setRegRole] = useState<AppRole>('customer');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(identifier, password, selectedRole);
    setIsLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await registerUser({
      name: regName,
      phone: regPhone,
      email: regEmail,
      address: regAddress,
      role: regRole,
    });
    setIsLoading(false);
  };

  const handleSocialSignIn = (provider: 'google' | 'apple') => {
    showToast(`تم تسجيل الدخول بنجاح عبر حساب ${provider === 'google' ? 'Google' : 'Apple'}`);
    login(provider === 'google' ? 'mohammed.google@mshwar.ps' : 'apple.user@mshwar.ps', undefined, 'customer');
  };

  // Quick Switch Roles helper buttons for demo/dev inspection
  const demoAccounts: { role: AppRole; titleAr: string; email: string; icon: React.ReactNode; color: string }[] = [
    { role: 'customer', titleAr: 'عميل', email: 'customer@mshwar.ps', icon: <UserIcon className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { role: 'captain', titleAr: 'كابتن', email: 'ahmed.cap@mshwar.ps', icon: <Bike className="w-3.5 h-3.5" />, color: 'bg-blue-50 text-blue-800 border-blue-200' },
    { role: 'restaurant', titleAr: 'مطعم', email: 'burger@mshwar.ps', icon: <Store className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { role: 'cashier', titleAr: 'كاشير', email: 'cashier@mshwar.ps', icon: <CreditCard className="w-3.5 h-3.5" />, color: 'bg-purple-50 text-purple-800 border-purple-200' },
    { role: 'kds', titleAr: 'شيف KDS', email: 'chef@mshwar.ps', icon: <ChefHat className="w-3.5 h-3.5" />, color: 'bg-rose-50 text-rose-800 border-rose-200' },
    { role: 'admin', titleAr: 'إدارة', email: 'admin@mshwar.ps', icon: <ShieldCheck className="w-3.5 h-3.5" />, color: 'bg-slate-900 text-white border-slate-900' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn text-right">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[94vh] flex flex-col">
        {/* Modal Header: Green Hero Section exactly matching reference video */}
        <div className="relative bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 p-6 text-white overflow-hidden shadow-md">
          {/* Decorative ambient blobs */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-6 left-0 w-32 h-32 bg-teal-400/20 rounded-full blur-xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-3 left-3 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer z-20"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="space-y-1 max-w-[65%]">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white font-sans">
                  مشوار<span className="text-emerald-300">.</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  Mshwar
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                وجبات ساخنة، تصلك حتى باب منزلك.
              </p>
              <p className="text-[11px] text-emerald-200/90 font-sans">
                Hot meals, right at your door.
              </p>
            </div>

            {/* Courier Delivery Scooter Illustration from video reference */}
            <div className="w-20 h-20 shrink-0 relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                <span className="text-4xl">🛵</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Login / Register */}
        <div className="flex border-b border-slate-100 p-1.5 bg-slate-50">
          <button
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            تسجيل الدخول (Welcome Back)
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            حساب جديد (Sign Up)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center pb-1">
                <h3 className="text-lg font-black text-slate-900">أهلاً بك مجدداً</h3>
                <p className="text-xs text-slate-500">سجّل الدخول لمتابعة طلباتك أو إدارة خدماتك</p>
              </div>

              {/* Quick Role Fillers (Development & RBAC inspection) */}
              <div className="space-y-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>تجربة سريعة للأدوار الوظيفية:</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => {
                        setIdentifier(acc.email);
                        setSelectedRole(acc.role);
                      }}
                      className={`p-1.5 rounded-xl border text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        selectedRole === acc.role
                          ? `${acc.color} ring-2 ring-emerald-500/40 shadow-xs scale-102`
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {acc.icon}
                      <span className="truncate">{acc.titleAr}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Identifier Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  البريد الإلكتروني أو رقم الهاتف
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    placeholder="example@mshwar.ps أو 0599..."
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-right"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">كلمة المرور</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="أدخل كلمة المرور..."
                    className="w-full pr-10 pl-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-right font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                  <span>تذكرني على هذا الجهاز</span>
                </label>
                <button
                  type="button"
                  onClick={() => showToast('يرجى مراجعة إدارة مشوار لإعادة ضبط كلمة المرور')}
                  className="text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>

              {/* Prominent Green Login Button (from video) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'جاري التحقق...' : 'تسجيل الدخول (Log In)'}</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>

              {/* Social Login Options from video */}
              <div className="pt-2">
                <div className="relative flex items-center justify-center mb-3">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[11px] text-slate-400 font-medium absolute">
                    أو المتابعة باستخدام
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSocialSignIn('google')}
                    className="py-2.5 px-3 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialSignIn('apple')}
                    className="py-2.5 px-3 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <svg className="w-4 h-4 fill-current text-slate-900" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.85-11.7-14.43-6.22-9.98-11.07-21.57-14.56-34.78-3.48-13.2-5.23-25.13-5.23-35.79 0-16.74 4.13-30.43 12.39-41.06 8.26-10.64 18.73-16.09 31.4-16.34 4.58 0 9.8 1.19 15.66 3.59 5.86 2.39 9.68 3.59 11.47 3.59 1.34 0 5.4-1.29 12.18-3.87 6.78-2.58 12.28-3.71 16.5-3.39 12.83.65 23.3 5.39 31.41 14.21-11.33 6.85-16.89 16.4-16.68 28.66.22 9.67 4 17.75 11.35 24.23 7.35 6.48 16.03 10.13 26.04 10.96-2.17 6.53-4.8 13.2-7.89 20.02zm-35.34-106.6c0-6.74 2.5-13.1 7.51-19.07 5.01-5.97 11.21-9.74 18.6-11.31.22 1.31.33 2.5.33 3.59 0 6.63-2.52 13.06-7.55 19.28-5.04 6.22-11.46 9.97-19.28 11.25-.43-1.3-.61-2.54-.61-3.74z" />
                    </svg>
                    <span>Apple</span>
                  </button>
                </div>
              </div>

              {/* Sign up prompt footer */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-600">
                  ليس لديك حساب بعد؟{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="text-emerald-700 hover:text-emerald-800 font-black cursor-pointer underline"
                  >
                    إنشاء حساب جديد (Sign Up)
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="text-center pb-1">
                <h3 className="text-base font-black text-slate-900">إنشاء حساب جديد في مشوار</h3>
                <p className="text-xs text-slate-500">انضم لعائلة مشوار واستمتع بأسرع خدمة توصيل</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">الاسم الكامل:</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    placeholder="مثال: محمد أحمد"
                    className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-right"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">رقم الهاتف (للتوصيل والإشعارات):</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                    placeholder="0599123456"
                    className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-mono text-right"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">البريد الإلكتروني (اختياري):</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.ps"
                    className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-right"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">العنوان الافتراضي للتسليم:</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="غزة، الرمال الجنوبي، شارع عمر المختار"
                    className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-right"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">نوع الحساب:</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as AppRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none text-right"
                >
                  <option value="customer">عميل (طلب وجبات وطرود)</option>
                  <option value="captain">كابتن توصيل (استلام ونقل الطلبات)</option>
                  <option value="restaurant">شريك مطعم (إدارة الوجبات والطلبات)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'جاري إنشاء الحساب...' : 'تأكيد التسجيل والانطلاق'}</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-slate-600 hover:text-emerald-700 font-semibold"
                >
                  لديك حساب بالفعل؟ <strong className="text-emerald-700">تسجيل الدخول</strong>
                </button>
              </div>
            </form>
          )}

          {/* Security & Privacy Notice */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl flex items-center gap-2 text-[10px] text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>بياناتك محمية بالكامل ومشفرة طبقا لمعايير الأمان المالي.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
