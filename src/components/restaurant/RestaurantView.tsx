import React, { useState } from 'react';
import {
  Store,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Utensils,
  Plus,
  Trash2,
  Edit,
  Eye,
  Bike,
  X,
  Save,
  Check,
} from 'lucide-react';
import { useMshwar } from '../../context/MshwarContext';
import { FoodItem } from '../../types';

export const RestaurantView: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    foodItems,
    toggleFoodAvailability,
    updateFoodPrice,
    addFoodItem,
    deleteFoodItem,
    restaurants,
    currentUser,
    showToast,
  } = useMshwar();

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'analytics'>('orders');
  const [selectedRestId, setSelectedRestId] = useState<string>(
    currentUser.restaurantId || restaurants[0]?.id || 'rest-1'
  );

  // New Meal Modal state
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState<boolean>(false);
  const [newMealNameAr, setNewMealNameAr] = useState<string>('');
  const [newMealNameEn, setNewMealNameEn] = useState<string>('');
  const [newMealDescAr, setNewMealDescAr] = useState<string>('');
  const [newMealPrice, setNewMealPrice] = useState<number>(30);
  const [newMealCalories, setNewMealCalories] = useState<number>(450);
  const [newMealPrepTime, setNewMealPrepTime] = useState<number>(15);
  const [newMealCategory, setNewMealCategory] = useState<FoodItem['category']>('burger');
  const [newMealImageUrl, setNewMealImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'
  );

  const activeRestaurant = restaurants.find((r) => r.id === selectedRestId) || restaurants[0];
  const restaurantOrders = orders.filter((o) => o.restaurantId === activeRestaurant.id);
  const restaurantMenu = foodItems.filter((f) => f.restaurantId === activeRestaurant.id);

  const pendingOrders = restaurantOrders.filter((o) => o.status === 'placed');
  const preparingOrders = restaurantOrders.filter(
    (o) => o.status === 'confirmed' || o.status === 'preparing'
  );
  const readyOrders = restaurantOrders.filter((o) => o.status === 'ready_for_pickup');
  const deliveringOrders = restaurantOrders.filter((o) => o.status === 'on_the_way');
  const deliveredOrders = restaurantOrders.filter((o) => o.status === 'delivered');

  const todayRevenue = restaurantOrders.reduce((sum, o) => sum + o.subtotal, 0);

  const handleAddNewMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealNameAr || !newMealPrice) {
      showToast('يرجى ملء الحقول الإلزامية');
      return;
    }

    await addFoodItem({
      nameAr: newMealNameAr.trim(),
      nameEn: newMealNameEn.trim() || 'Delicious Meal',
      descriptionAr: newMealDescAr.trim() || 'وجبة طازجة وشهية معدة بأفضل المكونات',
      category: newMealCategory,
      price: Number(newMealPrice),
      calories: Number(newMealCalories),
      prepTimeMinutes: Number(newMealPrepTime),
      imageUrl: newMealImageUrl,
      restaurantId: activeRestaurant.id,
      restaurantNameAr: activeRestaurant.nameAr,
      isAvailable: true,
      isPopular: true,
    });

    setIsAddMealModalOpen(false);
    setNewMealNameAr('');
    setNewMealNameEn('');
    setNewMealDescAr('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-right">
      {/* Restaurant Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={activeRestaurant.logoUrl}
            alt={activeRestaurant.nameAr}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{activeRestaurant.nameAr}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {activeRestaurant.isOpen ? 'المطعم مفتوح الآن' : 'مغلق مؤقتاً'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeRestaurant.cuisineAr} • {activeRestaurant.addressAr} • تقييم العملاء: {activeRestaurant.rating}★
            </p>
          </div>
        </div>

        {/* Quick Stats & Restaurant Selector if admin */}
        <div className="flex items-center gap-3">
          {currentUser.role === 'admin' && (
            <select
              value={selectedRestId}
              onChange={(e) => setSelectedRestId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nameAr}
                </option>
              ))}
            </select>
          )}

          <div className="px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 text-right">
            <span className="text-[10px] text-emerald-800 font-semibold block">مبيعات اليوم</span>
            <span className="text-base font-black text-emerald-900">{todayRevenue} ₪</span>
          </div>

          <div className="px-4 py-2 bg-slate-100 rounded-2xl text-right">
            <span className="text-[10px] text-slate-600 font-semibold block">الطلبات النشطة</span>
            <span className="text-base font-black text-slate-900">
              {pendingOrders.length + preparingOrders.length + readyOrders.length + deliveringOrders.length}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>إدارة الطلبات ({pendingOrders.length + preparingOrders.length + readyOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'menu'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>قائمة الطعام والأسعار ({restaurantMenu.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>تقارير الأداء والمبيعات</span>
        </button>
      </div>

      {/* TAB: ORDERS PIPELINE */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Incoming / Pending Orders */}
          <div className="bg-slate-50/80 rounded-3xl p-4 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">طلبات جديدة واردة</h3>
              </div>
              <span className="text-xs font-black bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-slate-700">
                {pendingOrders.length}
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">لا توجد طلبات جديدة معلقة</div>
            ) : (
              pendingOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-slate-900">#{ord.orderNumber}</span>
                    <span className="text-[11px] text-slate-500">{ord.createdAt}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{ord.customerName}</h4>
                    <p className="text-[11px] text-slate-500">{ord.customerPhone}</p>
                    <p className="text-[10px] text-slate-400">{ord.customerAddress}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-700">
                        <span>
                          {it.quantity}x {it.foodItem.nameAr}
                        </span>
                        <span className="font-bold">{it.foodItem.price * it.quantity} ₪</span>
                      </div>
                    ))}
                  </div>

                  {ord.notes && (
                    <p className="text-[11px] bg-amber-50 p-2 rounded-lg text-amber-900 border border-amber-200">
                      ملاحظة العميل: {ord.notes}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => updateOrderStatus(ord.id, 'confirmed')}
                      className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      قبول وإرسال للمطبخ
                    </button>
                    <button
                      onClick={() => updateOrderStatus(ord.id, 'cancelled')}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      اعتذار
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 2: In Preparation (Kitchen) */}
          <div className="bg-slate-50/80 rounded-3xl p-4 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <h3 className="text-sm font-bold text-slate-900">قيد التحضير في المطبخ</h3>
              </div>
              <span className="text-xs font-black bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-slate-700">
                {preparingOrders.length}
              </span>
            </div>

            {preparingOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">لا توجد طلبات قيد التجهيز الآن</div>
            ) : (
              preparingOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-slate-900">#{ord.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                      الوقت المستغرق: {Math.floor(ord.elapsedSeconds / 60)} دقيقة
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{ord.customerName}</h4>
                    <p className="text-[11px] text-slate-500">
                      {ord.items.map((i) => `${i.quantity}x ${i.foodItem.nameAr}`).join(' • ')}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => updateOrderStatus(ord.id, 'ready_for_pickup')}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      تم التجهيز، بانتظار الكابتن
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 3: Ready for pickup / Out for delivery */}
          <div className="bg-slate-50/80 rounded-3xl p-4 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900">جاهز / تم الاستلام للتوصيل</h3>
              </div>
              <span className="text-xs font-black bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-slate-700">
                {readyOrders.length + deliveringOrders.length}
              </span>
            </div>

            {readyOrders.length === 0 && deliveringOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">لا توجد طلبات خارجة للتوصيل</div>
            ) : (
              [...readyOrders, ...deliveringOrders].map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs space-y-3"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-emerald-800">#{ord.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                      {ord.status === 'ready_for_pickup' ? 'جاهز للاستلام' : 'في الطريق مع الكابتن'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Bike className="w-4 h-4 text-emerald-700" />
                    <span>الكابتن: {ord.captainName || 'جاري التعيين'}</span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    حساب الطلب: <span className="font-bold text-slate-900">{ord.total} ₪</span> (
                    {ord.paymentMethod === 'cash' ? 'نقداً' : 'تحويل بنكي / محفظة'} )
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: MENU MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">أصناف قائمة طعام {activeRestaurant.nameAr}</h3>
              <p className="text-xs text-slate-500">
                يمكنك تعديل الأسعار مباشرة أو تبديل حالة توفر الصنف للعملاء فورياً
              </p>
            </div>
            <button
              onClick={() => setIsAddMealModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurantMenu.map((food) => (
              <div
                key={food.id}
                className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <img
                  src={food.imageUrl}
                  alt={food.nameAr}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0 text-right space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{food.nameAr}</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={food.price}
                      onBlur={(e) => updateFoodPrice(food.id, Number(e.target.value) || food.price)}
                      className="w-16 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-emerald-800 focus:bg-white focus:outline-emerald-600"
                    />
                    <span className="text-xs text-slate-600 font-semibold">شيكل</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  {/* Availability Toggle */}
                  <button
                    onClick={() => toggleFoodAvailability(food.id)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
                      food.isAvailable
                        ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    {food.isAvailable ? 'متوفر' : 'غير متوفر'}
                  </button>

                  <button
                    onClick={() => deleteFoodItem(food.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="حذف الصنف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold">إجمالي الطلبات المستلمة</span>
            <h4 className="text-2xl font-black text-slate-900">{restaurantOrders.length}</h4>
            <p className="text-[11px] text-emerald-700">نسبة الإنجاز 98%</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold">متوسط وقت التجهيز بالمطبخ</span>
            <h4 className="text-2xl font-black text-slate-900">12 دقيقة</h4>
            <p className="text-[11px] text-emerald-700">أسرع بنسبة 15% من المعتاد</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold">متوسط تقييم الطعام العام</span>
            <h4 className="text-2xl font-black text-slate-900">★ {activeRestaurant.rating} / 5.0</h4>
            <p className="text-[11px] text-amber-600">بناءً على {activeRestaurant.ratingsCount || 45} تقييم حقيقي</p>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW MEAL */}
      {isAddMealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-right animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">إضافة وجبة جديدة للقائمة</h3>
              <button
                onClick={() => setIsAddMealModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewMeal} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">اسم الوجبة بالعربية:</label>
                <input
                  type="text"
                  value={newMealNameAr}
                  onChange={(e) => setNewMealNameAr(e.target.value)}
                  required
                  placeholder="مثال: برغر مشروم سويسري"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">الاسم الإنجليزي (اختياري):</label>
                <input
                  type="text"
                  value={newMealNameEn}
                  onChange={(e) => setNewMealNameEn(e.target.value)}
                  placeholder="Swiss Mushroom Burger"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">السعر (شيكل):</label>
                  <input
                    type="number"
                    value={newMealPrice}
                    onChange={(e) => setNewMealPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">السعرات:</label>
                  <input
                    type="number"
                    value={newMealCalories}
                    onChange={(e) => setNewMealCalories(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">التحضير (دقيقة):</label>
                  <input
                    type="number"
                    value={newMealPrepTime}
                    onChange={(e) => setNewMealPrepTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">التصنيف:</label>
                <select
                  value={newMealCategory}
                  onChange={(e) => setNewMealCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="burger">برغر</option>
                  <option value="pizza">بيتزا</option>
                  <option value="chicken">دجاج</option>
                  <option value="sushi">سوشي</option>
                  <option value="shawarma">شاورما</option>
                  <option value="grills">مشاوي</option>
                  <option value="pasta">مكرونة</option>
                  <option value="dessert">حلويات</option>
                  <option value="drinks">مشروبات</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">الوصف:</label>
                <textarea
                  value={newMealDescAr}
                  onChange={(e) => setNewMealDescAr(e.target.value)}
                  rows={2}
                  placeholder="وصف المكونات والنكهة..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">رابط صورة الوجبة:</label>
                <input
                  type="text"
                  value={newMealImageUrl}
                  onChange={(e) => setNewMealImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  حفظ الصنف ونشره
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddMealModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
