import React, { useState } from 'react';
import { Star, CheckCircle, MessageSquare, ThumbsUp, Sparkles, Edit3, Bike, Utensils } from 'lucide-react';
import { Order, OrderRating } from '../../types';
import { useMshwar } from '../../context/MshwarContext';
import { getRatingDescriptionAr } from '../../utils/mshwarLogic';

interface OrderRatingCardProps {
  order: Order;
  onRatingSubmitted?: (rating: OrderRating) => void;
  className?: string;
}

const PRESET_TAGS = [
  'طعام ساخن ♨️',
  'توصيل فائق السرعة ⚡',
  'كابتن مهذب ومحترم 🤝',
  'تغليف ممتاز ومحكم 📦',
  'طعم استثنائي 😋',
  'كمية وفيرة 🍲',
];

export const OrderRatingCard: React.FC<OrderRatingCardProps> = ({
  order,
  onRatingSubmitted,
  className = '',
}) => {
  const { submitOrderRating, getOrderRating } = useMshwar();
  const existingRating = order.rating || getOrderRating(order.id);

  const [isEditing, setIsEditing] = useState<boolean>(!existingRating);
  const [foodQuality, setFoodQuality] = useState<number>(existingRating?.foodQualityRating || 5);
  const [hoveredFood, setHoveredFood] = useState<number | null>(null);
  const [deliverySpeed, setDeliverySpeed] = useState<number>(existingRating?.deliverySpeedRating || 5);
  const [hoveredDelivery, setHoveredDelivery] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    existingRating?.tags || ['طعام ساخن ♨️', 'توصيل فائق السرعة ⚡']
  );
  const [comment, setComment] = useState<string>(existingRating?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const activeFoodRating = hoveredFood !== null ? hoveredFood : foodQuality;
  const activeDeliveryRating = hoveredDelivery !== null ? hoveredDelivery : deliverySpeed;
  const currentOverall = Math.round(((foodQuality + deliverySpeed) / 2) * 10) / 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await submitOrderRating({
      orderId: order.id,
      foodQualityRating: foodQuality,
      deliverySpeedRating: deliverySpeed,
      comment,
      tags: selectedTags,
    });
    setIsSubmitting(false);
    if (success) {
      setIsEditing(false);
    }
  };

  if (existingRating && !isEditing) {
    return (
      <div className={`p-4 bg-gradient-to-br from-amber-50/90 to-emerald-50/90 border border-amber-200/80 rounded-3xl shadow-sm text-right space-y-3.5 ${className}`}>
        <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">تم تسجيل تقييمك بنجاح</h4>
              <span className="text-[10px] text-slate-500">شكراً لمشاركتك رأيك لتحسين تجربة الجميع</span>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-300 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>تعديل</span>
          </button>
        </div>

        {/* Rating Breakdown Cards */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 bg-white rounded-2xl border border-slate-100 shadow-2xs space-y-1">
            <span className="text-[10px] text-slate-500 font-bold block">جودة الطعام ({order.restaurantNameAr})</span>
            <div className="flex items-center justify-center gap-0.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={`show-food-${star}`}
                  className={`w-3.5 h-3.5 ${
                    star <= existingRating.foodQualityRating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-black text-slate-800">
              {existingRating.foodQualityRating} / 5 نجوم
            </span>
          </div>

          <div className="p-2.5 bg-white rounded-2xl border border-slate-100 shadow-2xs space-y-1">
            <span className="text-[10px] text-slate-500 font-bold block">
              سرعة الكابتن ({order.captainName || 'كابتن مشوار'})
            </span>
            <div className="flex items-center justify-center gap-0.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={`show-del-${star}`}
                  className={`w-3.5 h-3.5 ${
                    star <= existingRating.deliverySpeedRating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-black text-slate-800">
              {existingRating.deliverySpeedRating} / 5 نجوم
            </span>
          </div>
        </div>

        {existingRating.tags && existingRating.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {existingRating.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded-lg border border-emerald-200"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {existingRating.comment && (
          <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/50 text-xs text-slate-700 italic">
            "{existingRating.comment}"
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 bg-white border-2 border-amber-300 rounded-3xl shadow-sm text-right space-y-4 ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">
              كيف كانت تجربتك مع الطلب #{order.orderNumber}؟
            </h4>
            <p className="text-[10px] text-slate-500">
              تقييمك المزدوج يساعد المطعم والكابتن على تقديم أفضل خدمة
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
          تقييم 5/5
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Food Quality Rating */}
        <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-900 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-600" />
              <span>جودة ولذة الطعام ({order.restaurantNameAr}):</span>
            </span>
            <span className="text-[10px] font-bold text-amber-700">
              {getRatingDescriptionAr(activeFoodRating)}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 py-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= activeFoodRating;
              return (
                <button
                  type="button"
                  key={`star-food-${star}`}
                  onMouseEnter={() => setHoveredFood(star)}
                  onMouseLeave={() => setHoveredFood(null)}
                  onClick={() => setFoodQuality(star)}
                  className="p-1 text-slate-300 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                  aria-label={`تقييم جودة الطعام ${star} من 5`}
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      isFilled ? 'fill-amber-400 text-amber-400 drop-shadow-xs' : 'text-slate-200'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Delivery Speed & Captain Rating */}
        <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-900 flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-emerald-600" />
              <span>سرعة واحترافية التوصيل ({order.captainName || 'كابتن التوصيل'}):</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-800">
              {getRatingDescriptionAr(activeDeliveryRating)}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 py-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= activeDeliveryRating;
              return (
                <button
                  type="button"
                  key={`star-del-${star}`}
                  onMouseEnter={() => setHoveredDelivery(star)}
                  onMouseLeave={() => setHoveredDelivery(null)}
                  onClick={() => setDeliverySpeed(star)}
                  className="p-1 text-slate-300 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                  aria-label={`تقييم سرعة التوصيل ${star} من 5`}
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      isFilled ? 'fill-amber-400 text-amber-400 drop-shadow-xs' : 'text-slate-200'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Quick Compliment Tags */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-700 block">
            ما الذي أعجبك أكثر في هذه التجربة؟
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs scale-102'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Customer Review / Comment */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
            <span>ملاحظات إضافية (اختياري):</span>
            <span className="text-[10px] text-slate-400">{comment.length}/200</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 200))}
            placeholder="اكتب تعليقك هنا لمساعدة الآخرين في اختيار أفضل الأطباق..."
            rows={2}
            className="w-full p-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all resize-none text-right"
          />
        </div>

        {/* Overall score preview and submit button */}
        <div className="pt-1 flex items-center justify-between gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">التقييم العام النهائي:</span>
            <div className="flex items-center gap-1 text-sm font-black text-slate-900">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{currentOverall} / 5</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {existingRating && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{existingRating ? 'تحديث التقييم' : 'إرسال التقييم'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
