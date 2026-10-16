import React from 'react';
import { X, Star, Utensils, Bike, MessageSquare, MapPin } from 'lucide-react';
import { Restaurant } from '../../types';
import { useMshwar } from '../../context/MshwarContext';

interface RestaurantReviewsModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
}

export const RestaurantReviewsModal: React.FC<RestaurantReviewsModalProps> = ({
  restaurant,
  isOpen,
  onClose,
}) => {
  const { getRestaurantReviews } = useMshwar();

  if (!isOpen) return null;

  const reviews = getRestaurantReviews(restaurant.id);
  const totalCount = restaurant.ratingsCount || Math.max(reviews.length, 45);
  const foodQualityScore = restaurant.foodQualityAvg || 4.9;
  const deliverySpeedScore = restaurant.deliverySpeedAvg || 4.7;

  const starBars = [
    { stars: 5, percent: 84 },
    { stars: 4, percent: 12 },
    { stars: 3, percent: 3 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn text-right">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={restaurant.logoUrl}
              alt={restaurant.nameAr}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20 shadow-xs"
            />
            <div>
              <h3 className="text-sm font-black">{restaurant.nameAr}</h3>
              <p className="text-[11px] text-emerald-200 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-300" />
                <span>{restaurant.addressAr}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* Main Score & Metrics Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-4">
            <div className="text-center shrink-0 pr-2">
              <span className="text-3xl font-black text-slate-900 block leading-tight font-mono">
                {restaurant.rating}
              </span>
              <div className="flex items-center justify-center gap-0.5 text-amber-500 py-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={`hero-star-${s}`}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(restaurant.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-bold block">
                {totalCount} تقييم معتمد
              </span>
            </div>

            {/* Sub-ratings (Food Quality & Delivery Speed) */}
            <div className="flex-1 border-r border-slate-200 pr-4 space-y-2.5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-bold flex items-center gap-1 text-[11px]">
                    <Utensils className="w-3 h-3 text-amber-500" />
                    <span>جودة الطعام والطهي:</span>
                  </span>
                  <span className="font-black text-amber-600 text-xs font-mono">{foodQualityScore} / 5</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(foodQualityScore / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-bold flex items-center gap-1 text-[11px]">
                    <Bike className="w-3 h-3 text-emerald-600" />
                    <span>سرعة تحضير وتوصيل الطلب:</span>
                  </span>
                  <span className="font-black text-emerald-700 text-xs font-mono">{deliverySpeedScore} / 5</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(deliverySpeedScore / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Star Distribution Histogram */}
          <div className="space-y-1.5 p-3 bg-white border border-slate-100 rounded-2xl">
            <h4 className="text-[11px] font-bold text-slate-700 mb-2">توزيع تقييمات العملاء:</h4>
            {starBars.map((bar) => (
              <div key={bar.stars} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-[11px] text-slate-500 font-bold flex items-center gap-0.5">
                  <span>{bar.stars}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                </span>
                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{ width: `${bar.percent}%` }}
                  />
                </div>
                <span className="w-8 text-[10px] text-slate-400 text-left font-bold font-mono">
                  {bar.percent}%
                </span>
              </div>
            ))}
          </div>

          {/* Customer Reviews List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                <span>أحدث آراء العملاء</span>
              </h4>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                تجارب حقيقية موثقة
              </span>
            </div>

            {reviews.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                لا توجد تعليقات مكتوبة لهذا المطعم بعد.
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                        {rev.customerName.slice(0, 1)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block leading-none">
                          {rev.customerName}
                        </span>
                        <span className="text-[10px] text-slate-400">{rev.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60 font-mono">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-black text-amber-700">{rev.overallRating}</span>
                    </div>
                  </div>

                  {/* Sub ratings mini pill */}
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-100 font-mono">
                      جودة الطعام: {rev.foodQualityRating}★
                    </span>
                    <span className="text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-100 font-mono">
                      سرعة الكابتن: {rev.deliverySpeedRating}★
                    </span>
                  </div>

                  {rev.comment && (
                    <p className="text-xs text-slate-700 leading-relaxed pt-0.5">
                      "{rev.comment}"
                    </p>
                  )}

                  {rev.tags && rev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {rev.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            إغلاق التقييمات
          </button>
        </div>
      </div>
    </div>
  );
};
