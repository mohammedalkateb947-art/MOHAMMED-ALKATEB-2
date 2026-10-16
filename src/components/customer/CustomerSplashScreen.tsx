import React from 'react';
import { ArrowRight, Sparkles, Bike } from 'lucide-react';
import { HERO_IMAGE } from '../../data/mockData';

interface CustomerSplashScreenProps {
  onDismiss: () => void;
  onOpenLogin: () => void;
}

export const CustomerSplashScreen: React.FC<CustomerSplashScreenProps> = ({
  onDismiss,
  onOpenLogin,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-[36px] shadow-2xl border border-slate-200/80 flex flex-col justify-between p-6 sm:p-8 text-center max-h-[94vh] overflow-y-auto no-scrollbar relative">
        {/* Top skip link */}
        <div className="flex justify-between items-center pb-2">
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>مشوار توصيل 2026</span>
          </span>
          <button
            onClick={onDismiss}
            className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            تخطي الشاشة
          </button>
        </div>

        {/* Center Delivery Illustration matching video */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 my-4">
          <div className="relative">
            {/* Animated gentle halo */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-emerald-100/60 animate-pulse absolute -inset-2 blur-md" />

            {/* Clean courier illustration container */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-b from-emerald-50 to-emerald-100 border-4 border-emerald-200/80 flex items-center justify-center shadow-xl overflow-hidden group">
              <img
                src={HERO_IMAGE}
                alt="Mshwar Delivery Courier"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-2 right-2 bg-emerald-700 text-white p-2 rounded-full shadow-lg border-2 border-white">
                <Bike className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Brand Wordmark & Dot */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight font-sans">
                مشوار
              </h1>
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 animate-pulse mt-2" />
            </div>
            <p className="text-sm font-black text-emerald-800">
              طعام لذيذ، توصيل فائق السرعة
            </p>
            <p className="text-xs text-slate-400 font-sans tracking-wide">
              Delicious food, delivered fast
            </p>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onDismiss}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>ابدأ الطلب الآن (Start Ordering)</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>

          <button
            onClick={onOpenLogin}
            className="w-full py-3 bg-slate-50 hover:bg-slate-100 active:scale-[0.98] text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 transition-colors cursor-pointer"
          >
            تسجيل الدخول لحسابك (Log In)
          </button>
        </div>
      </div>
    </div>
  );
};
