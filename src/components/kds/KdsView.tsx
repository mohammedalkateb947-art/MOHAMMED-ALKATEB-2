import React, { useState } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertTriangle,
  Flame,
  Volume2,
  RefreshCw,
  Utensils,
  Filter,
} from 'lucide-react';
import { useMshwar } from '../../context/MshwarContext';
import { getKdsUrgency } from '../../utils/mshwarLogic';

export const KdsView: React.FC = () => {
  const { orders, updateOrderStatus, showToast, refreshOrders } = useMshwar();
  const [completedItemKeys, setCompletedItemKeys] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'delivery' | 'dine_in' | 'takeaway'>('all');

  const kitchenOrders = orders
    .filter((o) => o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready_for_pickup')
    .filter((o) => filterType === 'all' || o.orderType === filterType);

  const toggleItemDone = (key: string) => {
    setCompletedItemKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
      showToast('تم تشغيل تنبيه المطبخ الصوتي');
    } catch {
      showToast('تنبيه صوتي للمطبخ');
    }
  };

  return (
    <div className="bg-slate-950 text-white min-h-[calc(100vh-4rem)] p-4 sm:p-6 text-right">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* KDS Header Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white">
                  شاشة تحضير طلبات المطبخ (Kitchen Display System - KDS)
                </h1>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
                  تحديث مباشر لكل ثانية
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                متابعة تذاكر الوجبات، وتحديد وقت التحضير، وتنبيهات التأخير للطهي الفوري
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  filterType === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterType('delivery')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  filterType === 'delivery' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                توصيل
              </button>
              <button
                onClick={() => setFilterType('dine_in')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  filterType === 'dine_in' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                صالة
              </button>
            </div>

            <button
              onClick={playChime}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-700"
              title="رنين جرس المطبخ"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>جرس تنبيه</span>
            </button>

            <button
              onClick={refreshOrders}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
              title="تحديث فوري"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="px-3 py-1.5 bg-emerald-950 border border-emerald-800 rounded-xl text-xs font-bold text-emerald-300">
              {kitchenOrders.length} تذاكر نشطة
            </div>
          </div>
        </div>

        {/* Tickets Grid */}
        {kitchenOrders.length === 0 ? (
          <div className="py-24 text-center space-y-3 bg-slate-900/50 rounded-3xl border border-slate-900">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">جميع الطلبات تم إنجازها بنجاح!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              المطبخ جاهز لاستقبال أي طلب جديد من الصالة أو عبر كباتن التوصيل.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kitchenOrders.map((ord) => {
              const urgency = getKdsUrgency(ord.elapsedSeconds);
              const minutes = Math.floor(ord.elapsedSeconds / 60);
              const seconds = ord.elapsedSeconds % 60;
              const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

              return (
                <div
                  key={ord.id}
                  className={`bg-slate-900 rounded-3xl p-4 border-2 flex flex-col justify-between transition-all shadow-lg ${
                    urgency === 'critical'
                      ? 'border-rose-500 shadow-rose-950/30'
                      : urgency === 'warning'
                      ? 'border-amber-500 shadow-amber-950/30'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Ticket Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <span className="text-sm font-mono font-black text-amber-400 block">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {ord.orderType === 'dine_in'
                            ? 'طاولة صالة'
                            : ord.orderType === 'takeaway'
                            ? 'سفري استلام'
                            : 'توصيل ديليفري'}
                        </span>
                      </div>

                      {/* Elapsed Timer */}
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                          urgency === 'critical'
                            ? 'bg-rose-500 text-white animate-pulse'
                            : urgency === 'warning'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-emerald-400'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formattedTime}</span>
                      </div>
                    </div>

                    {/* Items Checklist for Chef */}
                    <div className="space-y-2">
                      {ord.items.map((item, idx) => {
                        const itemKey = `${ord.id}-${item.foodItem.id}-${idx}`;
                        const isDone = completedItemKeys.includes(itemKey);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleItemDone(itemKey)}
                            className={`w-full p-2.5 rounded-xl text-right flex items-center justify-between transition-all cursor-pointer ${
                              isDone
                                ? 'bg-emerald-950/40 text-slate-500 line-through'
                                : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-slate-700 text-white font-bold text-xs flex items-center justify-center">
                                {item.quantity}
                              </span>
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold block">{item.foodItem.nameAr}</span>
                                {item.selectedOptions && item.selectedOptions.length > 0 && (
                                  <span className="text-[10px] text-amber-300 block">
                                    {item.selectedOptions.join(' • ')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-slate-400">{isDone ? '✓' : '○'}</span>
                          </button>
                        );
                      })}
                    </div>

                    {ord.notes && (
                      <div className="p-2 bg-amber-950/40 border border-amber-800/60 rounded-xl text-[11px] text-amber-200">
                        ملاحظة: {ord.notes}
                      </div>
                    )}
                  </div>

                  {/* Ticket Action Button */}
                  <div className="pt-4 border-t border-slate-800 mt-4">
                    {ord.status === 'confirmed' ? (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'preparing')}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        بدء التحضير (Start Prep)
                      </button>
                    ) : ord.status === 'preparing' ? (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'ready_for_pickup')}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                      >
                        جاهز للتسليم (Mark Ready)
                      </button>
                    ) : (
                      <div className="p-2 bg-emerald-950 text-emerald-400 text-center rounded-xl text-xs font-bold border border-emerald-800">
                        جاهز وفي انتظار استلام الكابتن
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
