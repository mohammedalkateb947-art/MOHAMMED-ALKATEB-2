import React, { useState } from 'react';
import {
  MapPin,
  Bell,
  Search,
  SlidersHorizontal,
  Flame,
  Clock,
  Plus,
  Minus,
  Star,
  Check,
  Percent,
  Bike,
  Heart,
  ChevronLeft,
  X,
  CreditCard,
  Wallet,
  Phone,
  ArrowRight,
  ShieldCheck,
  Tag,
  ShoppingBag,
  Package,
  Send,
  Sparkles,
  Upload,
  FileCheck,
  AlertCircle,
  Building,
  Smartphone,
  Navigation,
} from 'lucide-react';
import { useMshwar } from '../../context/MshwarContext';
import { FoodItem, Restaurant, PaymentMethod } from '../../types';
import { HERO_IMAGE } from '../../data/mockData';
import { OrderLiveTrackingMap } from '../common/OrderLiveTrackingMap';
import { OrderRatingCard } from './OrderRatingCard';
import { RestaurantReviewsModal } from '../common/RestaurantReviewsModal';
import { CustomerSplashScreen } from './CustomerSplashScreen';

export const CustomerView: React.FC = () => {
  const {
    customerTab,
    setCustomerTab,
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    appliedPromo,
    setAppliedPromo,
    cartSummary,
    savedFoodIds,
    toggleSaveFood,
    currentUser,
    setIsAuthModalOpen,
    showSplashScreen,
    setShowSplashScreen,
    deliveryArea,
    setDeliveryArea,
    deliveryStreet,
    setDeliveryStreet,
    deliveryLandmark,
    setDeliveryLandmark,
    deliveryZones,
    platformSettings,
    orders,
    activeCustomerOrder,
    placeCustomerOrder,
    createCustomParcelOrder,
    acceptCaptainBid,
    foodItems,
    restaurants,
    captains,
    activeCaptain,
    isMobileSimulator,
    showToast,
  } = useMshwar();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFoodForModal, setSelectedFoodForModal] = useState<FoodItem | null>(null);
  const [foodModalQuantity, setFoodModalQuantity] = useState<number>(1);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Checkout state
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isBiddingPreferred, setIsBiddingPreferred] = useState<boolean>(true);
  const [receiptImageBase64, setReceiptImageBase64] = useState<string | null>(null);
  const [receiptRefNumber, setReceiptRefNumber] = useState<string>('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Custom parcel delivery state (Hamama Delivery model)
  const [parcelPickup, setParcelPickup] = useState<string>('مكتبة الأمل، شارع الرمال');
  const [parcelDrop, setParcelDrop] = useState<string>('عمارة الشفاء، الطابق 4');
  const [parcelDesc, setParcelDesc] = useState<string>('أوراق ومستندات مهمة تحتاج تسليم عاجل');
  const [parcelOfferPrice, setParcelOfferPrice] = useState<number>(10);

  // Active view state
  const [viewedOrderId, setViewedOrderId] = useState<string | null>(null);
  const [selectedRestaurantForReviews, setSelectedRestaurantForReviews] = useState<Restaurant | null>(null);

  const currentTrackedOrder =
    (viewedOrderId ? orders.find((o) => o.id === viewedOrderId) : null) ||
    activeCustomerOrder;

  const categories = [
    { id: 'all', nameAr: 'الكل', icon: '🍽️' },
    { id: 'burger', nameAr: 'برغر', icon: '🍔' },
    { id: 'pizza', nameAr: 'بيتزا', icon: '🍕' },
    { id: 'chicken', nameAr: 'دجاج', icon: '🍗' },
    { id: 'sushi', nameAr: 'سوشي', icon: '🍣' },
    { id: 'pasta', nameAr: 'نودلز', icon: '🍜' },
    { id: 'shawarma', nameAr: 'شاورما', icon: '🌯' },
    { id: 'grills', nameAr: 'مشاوي', icon: '🥩' },
    { id: 'dessert', nameAr: 'حلويات', icon: '🍰' },
    { id: 'drinks', nameAr: 'مشروبات', icon: '🥤' },
  ];

  const deals = [
    {
      code: 'MSHWAR30',
      titleAr: 'خصم 30% على طلبك',
      descAr: 'استخدم كود MSHWAR30 عند الطلب بأكثر من 30 ₪',
      discount: '30% OFF',
      bgGradient: 'from-emerald-900 to-emerald-700',
    },
    {
      code: 'FREESHIP',
      titleAr: 'توصيل مجاني بالكامل',
      descAr: 'استخدم كود FREESHIP للطلبات فوق 20 ₪',
      discount: 'FREE',
      bgGradient: 'from-amber-900 to-amber-700',
    },
  ];

  const filteredFoods = foodItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.restaurantNameAr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularRestaurants = restaurants.filter((r) => r.isOpen);

  const openFoodModal = (food: FoodItem) => {
    setSelectedFoodForModal(food);
    setFoodModalQuantity(1);
    setSelectedOptions([]);
  };

  const handleConfirmAddToCart = () => {
    if (selectedFoodForModal) {
      addToCart(selectedFoodForModal, foodModalQuantity, selectedOptions);
      setSelectedFoodForModal(null);
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('حجم الملف كبير جداً، الحد الأقصى 10 ميغابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImageBase64(reader.result as string);
        showToast('تم تحميل صورة الإشعار بنجاح');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    // Validation for manual transfer methods: require receipt
    if (['jawwal_pay', 'palpay', 'bank_of_palestine'].includes(selectedPayment) && !receiptImageBase64) {
      showToast('يرجى إرفاق صورة إشعار التحويل البنكي أو المحفظة لإتمام الطلب');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const receiptData = receiptImageBase64
        ? {
            receiptUrl: receiptImageBase64,
            referenceNumber: receiptRefNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
            senderName: currentUser.name,
            notes: orderNotes,
          }
        : undefined;

      await placeCustomerOrder(selectedPayment, orderNotes, isBiddingPreferred, receiptData);
      setReceiptImageBase64(null);
      setReceiptRefNumber('');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleCreateParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcelPickup || !parcelDrop || !parcelDesc) {
      showToast('يرجى ملء جميع بيانات الطرد بدقة');
      return;
    }
    await createCustomParcelOrder(parcelPickup, parcelDrop, parcelDesc, parcelOfferPrice);
  };

  return (
    <div className={`w-full ${isMobileSimulator ? 'py-4 px-4 flex justify-center bg-slate-900/10 min-h-[calc(100vh-4.5rem)] items-center' : 'max-w-7xl mx-auto px-4 sm:px-6 py-4'}`}>
      <div
        className={`bg-white transition-all duration-300 relative ${
          isMobileSimulator
            ? 'w-[380px] h-[calc(100vh-6rem)] max-h-[740px] min-h-[560px] rounded-[44px] shadow-2xl border-[8px] border-slate-900 overflow-hidden flex flex-col ring-1 ring-slate-800/20'
            : 'w-full h-[calc(100vh-6rem)] min-h-[600px] rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col'
        }`}
      >
        {/* Splash Screen Overlay from video reference */}
        {showSplashScreen && (
          <CustomerSplashScreen
            onDismiss={() => setShowSplashScreen(false)}
            onOpenLogin={() => {
              setShowSplashScreen(false);
              setIsAuthModalOpen(true);
            }}
          />
        )}

        {/* Dynamic Island / Mobile status bar simulation */}
        {isMobileSimulator && (
          <div className="h-7 w-full flex items-center justify-between px-7 text-[12px] font-semibold text-slate-800 select-none bg-white">
            <span>9:41</span>
            <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto" />
            <div className="flex items-center gap-1.5 text-[11px]">
              <span>5G</span>
              <div className="w-4 h-2 border border-slate-800 rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-slate-800 rounded-xs" />
              </div>
            </div>
          </div>
        )}

        {/* Top Header - Deliver To Location Bar */}
        <header className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="leading-tight text-right">
              <span className="text-[10px] font-bold text-slate-400 block">التوصيل إلى (Deliver to):</span>
              <span className="text-xs font-black text-slate-900 truncate max-w-[170px] sm:max-w-[260px] block">
                {deliveryArea}، {deliveryStreet}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSplashScreen(true)}
              className="px-2 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
              title="عرض شاشة البداية"
            >
              شاشة البداية
            </button>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2.5 py-1 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition-colors cursor-pointer"
            >
              {currentUser.role === 'customer' ? currentUser.name.split(' ')[0] : 'تسجيل الدخول'}
            </button>
            <button
              onClick={() => {
                if (activeCustomerOrder) setCustomerTab('live_order');
              }}
              className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
              title="التنبيهات وتتبع الطلبات"
            >
              <Bell className="w-5 h-5" />
              {activeCustomerOrder && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>
          </div>
        </header>

        {/* Main Body Content based on customerTab */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
          {/* TAB: HOME */}
          {customerTab === 'home' && (
            <div className="p-4 space-y-6">
              {/* Promo Banner matching video: "FAST & FREE DELIVERY!" with courier illustration */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white p-5 shadow-lg shadow-emerald-950/20">
                <div className="relative z-10 max-w-[65%] space-y-2 text-right">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold border border-emerald-400/20">
                    <Bike className="w-3.5 h-3.5" />
                    <span>توصيل سريع وساخن</span>
                  </div>
                  <h2 className="text-xl font-black leading-tight text-white font-sans">
                    <span dir="ltr" className="inline-block">FAST & FREE DELIVERY!</span>
                  </h2>
                  <p className="text-xs text-emerald-100 leading-relaxed">
                    اطلب أشهى الوجبات من أفضل المطاعم واستمتع بتوصيل مجاني فائق السرعة حتى باب بيتك.
                  </p>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      onClick={() => {
                        const el = document.getElementById('fast-meals-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 bg-white text-emerald-900 font-extrabold text-xs rounded-xl shadow-md hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    >
                      اطلب الآن (ORDER NOW)
                    </button>
                    <button
                      onClick={() => setCustomerTab('custom_delivery')}
                      className="px-3.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-950 text-white border border-emerald-400/30 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Package className="w-3.5 h-3.5 text-amber-300" />
                      <span>توصيل طرد خاص</span>
                    </button>
                  </div>
                </div>

                {/* Delivery Courier Illustration */}
                <div className="absolute -bottom-2 -left-2 w-36 h-36 sm:w-44 sm:h-44 pointer-events-none select-none">
                  <img
                    src={HERO_IMAGE}
                    alt="كابتن توصيل مشوار"
                    className="w-full h-full object-cover rounded-2xl drop-shadow-xl"
                  />
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن وجبة، بيتزا، برغر أو مطعم..."
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none rounded-2xl text-xs text-slate-800 transition-all text-right"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors cursor-pointer"
                  title="عرض جميع التصنيفات"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Direct Parcel Errand Quick Feature Bar (خدمة مشوار حمامة) */}
              <div
                onClick={() => setCustomerTab('custom_delivery')}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-between cursor-pointer shadow-xs hover:shadow-md transition-all text-right"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/30 backdrop-blur-xs flex items-center justify-center font-bold text-slate-950 shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black">خدمة مشوار لتوصيل الطرود والمهمات الخاصة</h4>
                    <p className="text-[10px] text-slate-900 font-medium">
                      أرسل أي طرد أو مشوار خاص واستقبل عروض أسعار مباشرة من الكباتن
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 rotate-180 shrink-0 text-slate-950" />
              </div>

              {/* Categories Horizontal Carousel */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-sm font-bold text-slate-900">التصنيفات (Categories)</h3>
                  <span className="text-[11px] text-emerald-700 font-semibold cursor-pointer" onClick={() => setSelectedCategory('all')}>
                    عرض الكل
                  </span>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex flex-col items-center gap-1.5 min-w-[64px] p-2 rounded-2xl transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20 scale-105'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="text-[11px] font-bold whitespace-nowrap">{cat.nameAr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order Again Section */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-sm font-bold text-slate-900">اطلب مجدداً (Order again)</h3>
                  <span className="text-[11px] text-slate-400 font-medium">وجباتك المفضلة السابقة</span>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                  {foodItems.slice(0, 5).map((item) => (
                    <div
                      key={`again-${item.id}`}
                      className="flex items-center gap-3 p-2.5 bg-white border border-slate-200/80 rounded-2xl min-w-[210px] shrink-0 shadow-2xs hover:border-emerald-300 transition-colors"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.nameAr}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-right">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.nameAr}</h4>
                        <span className="text-xs font-extrabold text-emerald-700 block mt-0.5">
                          {item.price} ₪
                        </span>
                      </div>
                      <button
                        onClick={() => addToCart(item, 1)}
                        className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="إضافة سريعة للسلة"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deals For You Section */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-sm font-bold text-slate-900">عروض مميزة لك (Deals for you)</h3>
                  <span className="text-[11px] text-emerald-700 font-semibold cursor-pointer">
                    كوبونات فعالة
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {deals.map((deal) => {
                    const isApplied = appliedPromo === deal.code;
                    return (
                      <div
                        key={deal.code}
                        className={`p-3.5 rounded-2xl bg-gradient-to-br ${deal.bgGradient} text-white flex items-center justify-between gap-3 shadow-sm`}
                      >
                        <div className="space-y-1 text-right">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold font-sans">
                            {deal.discount}
                          </span>
                          <h4 className="text-xs font-extrabold text-white">{deal.titleAr}</h4>
                          <p className="text-[10px] text-white/80">{deal.descAr}</p>
                        </div>
                        <button
                          onClick={() => {
                            setAppliedPromo(deal.code);
                            showToast(`تم تطبيق كود الخصم "${deal.code}" بنجاح!`);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            isApplied
                              ? 'bg-white text-emerald-800'
                              : 'bg-white/20 hover:bg-white text-white hover:text-slate-900'
                          }`}
                        >
                          {isApplied ? 'مُفعّل ✓' : 'تطبيق الكود'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Popular Restaurants Section */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-sm font-bold text-slate-900">أشهر المطاعم القريبة منك</h3>
                  <span className="text-[11px] text-emerald-700 font-semibold cursor-pointer">
                    {popularRestaurants.length} مطاعم متاحة
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {popularRestaurants.map((rest) => (
                    <div
                      key={rest.id}
                      onClick={() => setSelectedRestaurantForReviews(rest)}
                      className="p-3 bg-white border border-slate-200/80 rounded-2xl shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-3 cursor-pointer group"
                    >
                      <img
                        src={rest.logoUrl}
                        alt={rest.nameAr}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0 text-right">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-800 transition-colors">
                            {rest.nameAr}
                          </h4>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRestaurantForReviews(rest);
                            }}
                            className="flex items-center gap-1 text-[11px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200/70 transition-colors"
                            title="عرض تقييمات العملاء"
                          >
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{rest.rating}</span>
                            <span className="text-[9px] text-slate-400">({rest.ratingsCount || 45})</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{rest.cuisineAr}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[9px]">
                          <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
                            جودة الطعام {rest.foodQualityAvg || 4.9}★
                          </span>
                          <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                            السرعة {rest.deliverySpeedAvg || 4.7}★
                          </span>
                          <span className="text-slate-400 mr-auto font-medium">
                            {rest.deliveryFee === 0 ? 'توصيل مجاني' : `${rest.deliveryFee} ₪ توصيل`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fast Delivery Meals Grid */}
              <div id="fast-meals-section">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <h3 className="text-sm font-bold text-slate-900">
                      وجبات سريعة التوصيل - 15 دقيقة أو أقل
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {filteredFoods.length} وجبة متوفرة
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {filteredFoods.map((food) => {
                    const isSaved = savedFoodIds.includes(food.id);
                    return (
                      <div
                        key={food.id}
                        className="bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
                      >
                        <div className="relative mb-2">
                          <img
                            src={food.imageUrl}
                            alt={food.nameAr}
                            className="w-full h-28 object-cover rounded-xl group-hover:scale-[1.02] transition-transform duration-200"
                          />
                          <button
                            onClick={() => toggleSaveFood(food.id)}
                            className={`absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                              isSaved
                                ? 'bg-rose-50 text-rose-600'
                                : 'bg-black/40 text-white hover:bg-black/60'
                            }`}
                            title="حفظ في المفضلة"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500' : ''}`} />
                          </button>
                          {!food.isAvailable && (
                            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center text-white text-[10px] font-black">
                              غير متوفر حالياً
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 text-right flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <span className="flex items-center gap-0.5">
                                <Flame className="w-3 h-3 text-orange-400" />
                                {food.calories} سعرة
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {food.prepTimeMinutes} دقيقة
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1 mt-1">
                              {food.nameAr}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate">
                              {food.restaurantNameAr}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                            <span className="text-xs font-black text-emerald-800">
                              {food.price} ₪
                            </span>
                            <button
                              disabled={!food.isAvailable}
                              onClick={() => openFoodModal(food)}
                              className="w-7 h-7 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                              title="إضافة الوجبة"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CUSTOM PARCEL ERRAND DELIVERY (HAMAMA DELIVERY MODEL) */}
          {customerTab === 'custom_delivery' && (
            <div className="p-4 space-y-4 text-right">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white space-y-1">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-200" />
                  <h3 className="text-base font-black">خدمة توصيل المشاوير والطرود الخاصة (حمامة)</h3>
                </div>
                <p className="text-xs text-amber-100">
                  اطلب كابتن لتوصيل أو شراء أي شيء من أي مكان في المدينة مع عروض أسعار تنافسية فورية
                </p>
              </div>

              <form onSubmit={handleCreateParcel} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3.5 shadow-xs">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">مكان الاستلام (من أين؟):</label>
                  <input
                    type="text"
                    value={parcelPickup}
                    onChange={(e) => setParcelPickup(e.target.value)}
                    required
                    placeholder="مثال: مطعم أو متجر أو منزل..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">مكان التسليم (إلى أين؟):</label>
                  <input
                    type="text"
                    value={parcelDrop}
                    onChange={(e) => setParcelDrop(e.target.value)}
                    required
                    placeholder="مثال: العنوان ورقم العمارة..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">وصف المحتوى أو المشوار:</label>
                  <textarea
                    value={parcelDesc}
                    onChange={(e) => setParcelDesc(e.target.value)}
                    required
                    rows={2}
                    placeholder="اكتب تفاصيل الطرد أو الأغراض المطلوب شراؤها..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">أجرة التوصيل المقترحة (شيكل):</label>
                  <div className="flex items-center gap-2">
                    {[8, 10, 12, 15].map((price) => (
                      <button
                        key={price}
                        type="button"
                        onClick={() => setParcelOfferPrice(price)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                          parcelOfferPrice === price
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {price} ₪
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-900 border border-amber-200">
                  سيتم بث طلبك لكافة الكباتن المتواجدين في محيطك فورياً لتلقي عروض التوصيل واختيار الأنسب لك.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>نشر الطلب للكباتن الآن</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB: CART */}
          {customerTab === 'cart' && (
            <div className="p-4 space-y-5 text-right">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">سلة المشتريات</h3>
                <span className="text-xs text-slate-500">{cartSummary.itemCount} أصناف</span>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">سلتك فارغة حالياً</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    تصفح قائمة الطعام واختر وجباتك المفضلة وسنقوم بتوصيلها ساخنة إليك
                  </p>
                  <button
                    onClick={() => setCustomerTab('home')}
                    className="mt-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
                  >
                    تصفح قائمة الطعام
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items list */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.foodItem.id}
                        className="p-3 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-3 shadow-2xs"
                      >
                        <img
                          src={item.foodItem.imageUrl}
                          alt={item.foodItem.nameAr}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0 text-right">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {item.foodItem.nameAr}
                          </h4>
                          <span className="text-xs font-bold text-emerald-700 block">
                            {item.foodItem.price} ₪
                          </span>
                          {item.selectedOptions && item.selectedOptions.length > 0 && (
                            <p className="text-[10px] text-slate-500 truncate">
                              {item.selectedOptions.join(' • ')}
                            </p>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl shrink-0">
                          <button
                            onClick={() => updateQuantity(item.foodItem.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-900 w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.foodItem.id, 1)}
                            className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center hover:bg-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Address & Zone selector */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>عنوان وموقع التوصيل:</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">المنطقة:</label>
                          <select
                            value={deliveryArea}
                            onChange={(e) => setDeliveryArea(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                          >
                            {deliveryZones.map((z) => (
                              <option key={z.id} value={z.nameAr.split(' ')[0]}>
                                {z.nameAr} ({z.deliveryFee} ₪)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">الشارع:</label>
                          <input
                            type="text"
                            value={deliveryStreet}
                            onChange={(e) => setDeliveryStreet(e.target.value)}
                            placeholder="اسم الشارع..."
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">علامة مميزة:</label>
                        <input
                          type="text"
                          value={deliveryLandmark}
                          onChange={(e) => setDeliveryLandmark(e.target.value)}
                          placeholder="عمارة، طابق، أو معلم قريب..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hamama Delivery Bidding Option Toggle */}
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl space-y-1.5 text-right">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-700" />
                        <span className="text-xs font-bold text-purple-950">
                          فتح الطلب لمزايدة وتنافس الكباتن (خدمة حمامة)
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isBiddingPreferred}
                        onChange={(e) => setIsBiddingPreferred(e.target.checked)}
                        className="w-4 h-4 accent-purple-600 rounded"
                      />
                    </label>
                    <p className="text-[10px] text-purple-800 leading-relaxed">
                      عند التفعيل، سيتنافس الكباتن القريبون لتقديم أقل سعر توصيل وأسرع وقت وصول لتختار من بينهم.
                    </p>
                  </div>

                  {/* Promo code input */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-700" />
                      كود الخصم الترويجي:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={appliedPromo}
                        onChange={(e) => setAppliedPromo(e.target.value.toUpperCase())}
                        placeholder="جرب MSHWAR30 أو FREESHIP"
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs uppercase font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                      <button
                        onClick={() => {
                          setAppliedPromo(appliedPromo);
                          showToast(`تم تطبيق الكود: ${appliedPromo}`);
                        }}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        تطبيق
                      </button>
                    </div>
                  </div>

                  {/* Payment Method Selector & Manual Transfer Options */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      طريقة الدفع (Payment Method):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'cash', label: 'نقداً عند الاستلام', icon: Wallet },
                        { id: 'jawwal_pay', label: 'جوال باي (Jawwal Pay)', icon: Smartphone },
                        { id: 'bank_of_palestine', label: 'بنك فلسطين (BOP)', icon: Building },
                        { id: 'palpay', label: 'بال بي (PalPay)', icon: CreditCard },
                      ].map((pm) => {
                        const isChosen = selectedPayment === pm.id;
                        const IconComponent = pm.icon;
                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setSelectedPayment(pm.id as PaymentMethod)}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                              isChosen
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <IconComponent className="w-4 h-4 text-emerald-700" />
                            <span className="text-[11px] text-center leading-tight">{pm.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Manual Bank / Wallet Transfer Instructions & Receipt Upload */}
                    {['jawwal_pay', 'palpay', 'bank_of_palestine'].includes(selectedPayment) && (
                      <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                          <AlertCircle className="w-4 h-4 text-blue-700 shrink-0" />
                          <span>تعليمات التحويل المالي:</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-blue-100 text-xs text-slate-800 space-y-1">
                          {selectedPayment === 'jawwal_pay' && (
                            <p>
                              رقم محفظة جوال باي: <strong className="font-mono text-emerald-700">{platformSettings.jawwalPayNumber}</strong>
                            </p>
                          )}
                          {selectedPayment === 'palpay' && (
                            <p>
                              رقم محفظة بال بي: <strong className="font-mono text-purple-700">{platformSettings.palPayNumber}</strong>
                            </p>
                          )}
                          {selectedPayment === 'bank_of_palestine' && (
                            <>
                              <p>
                                الحساب الرسمي: <strong>{platformSettings.bopAccountName}</strong>
                              </p>
                              <p className="text-[11px] font-mono text-blue-800">
                                IBAN: {platformSettings.bopIban}
                              </p>
                            </>
                          )}
                          <p className="text-[10px] text-slate-500">
                            المبلغ المطلوب تحويله: <strong className="text-emerald-700">{cartSummary.grandTotal} ₪</strong>
                          </p>
                        </div>

                        {/* Upload receipt */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-blue-950 block">
                            إرفاق صورة إشعار التحويل (مطلوب للتحقق):
                          </label>
                          <div className="flex items-center gap-2">
                            <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-blue-800 hover:bg-blue-50 cursor-pointer transition-colors">
                              <Upload className="w-4 h-4" />
                              <span>{receiptImageBase64 ? 'تغيير صورة الإشعار' : 'رفع إشعار التحويل'}</span>
                              <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                            </label>
                          </div>
                          {receiptImageBase64 && (
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-blue-300 mt-1">
                              <img src={receiptImageBase64} alt="إشعار التحويل" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setReceiptImageBase64(null)}
                                className="absolute top-1 left-1 p-0.5 bg-black/60 rounded-full text-white cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-0.5">رقم المرجع (اختياري):</label>
                          <input
                            type="text"
                            value={receiptRefNumber}
                            onChange={(e) => setReceiptRefNumber(e.target.value)}
                            placeholder="مثال: REF-983120"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Financial Summary */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>المجموع الفرعي للوجبات</span>
                      <span className="font-bold">{cartSummary.subtotal} ₪</span>
                    </div>
                    {cartSummary.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>قيمة الخصم ({appliedPromo})</span>
                        <span>-{cartSummary.discountAmount} ₪</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>أجرة التوصيل ({deliveryArea})</span>
                      <span className="font-bold">
                        {isBiddingPreferred ? 'حسب عروض الكباتن' : `${cartSummary.deliveryFee} ₪`}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>رسوم الخدمة والتشغيل</span>
                      <span className="font-bold">{cartSummary.serviceFee} ₪</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                      <span>الإجمالي المطلوب سداده</span>
                      <span className="text-emerald-800">{cartSummary.grandTotal} ₪</span>
                    </div>
                  </div>

                  {/* Submit Order Button */}
                  <button
                    disabled={isSubmittingOrder}
                    onClick={handleCheckout}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>
                      {isSubmittingOrder
                        ? 'جاري إرسال الطلب...'
                        : isBiddingPreferred
                        ? 'تأكيد ونشر الطلب لمزايدة الكباتن'
                        : `تأكيد الطلب (${cartSummary.grandTotal} ₪)`}
                    </span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* TAB: LIVE ORDER TRACKING & CAPTAIN BIDDING SCREEN */}
          {customerTab === 'live_order' && (
            <div className="p-4 space-y-5 text-right">
              {!currentTrackedOrder ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Bike className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">لا توجد طلبات جارية حالياً</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    عند قيامك بطلب وجبة طعام أو طرد، ستتمكن من متابعة حركات الكابتن مباشرة عبر GPS
                  </p>
                  <button
                    onClick={() => setCustomerTab('home')}
                    className="px-5 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
                  >
                    اطلب وجبتك الآن
                  </button>
                </div>
              ) : (
                <>
                  {/* Active Orders Switcher */}
                  {orders.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                      <span className="text-[11px] text-slate-500 font-bold shrink-0">تبديل الطلب:</span>
                      {orders.slice(0, 5).map((ord) => {
                        const isSelected = currentTrackedOrder?.id === ord.id;
                        return (
                          <button
                            key={`switch-ord-${ord.id}`}
                            onClick={() => setViewedOrderId(ord.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-400/40'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <span>#{ord.orderNumber}</span>
                            <span className="text-[10px] opacity-80">
                              ({ord.status === 'bidding_open' ? 'مزايدة' : ord.status === 'delivered' ? 'مكتمل' : 'نشط'})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Order Top Badge */}
                  <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-850 via-emerald-800 to-emerald-900 text-white shadow-md space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">رقم الطلب: #{currentTrackedOrder.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-bold">
                        {currentTrackedOrder.estimatedDeliveryTime}
                      </span>
                    </div>

                    <h3 className="text-base font-black">
                      {currentTrackedOrder.status === 'bidding_open' && 'جاري استقبال عروض الكباتن...'}
                      {currentTrackedOrder.status === 'placed' && 'تم استلام طلبك وبانتظار التأكيد'}
                      {currentTrackedOrder.status === 'confirmed' && 'تم تأكيد طلبك بنجاح'}
                      {currentTrackedOrder.status === 'preparing' && 'المطعم يقوم بتحضير وجبتك الساخنة'}
                      {currentTrackedOrder.status === 'ready_for_pickup' && 'الوجبة جاهزة وبانتظار استلام الكابتن'}
                      {currentTrackedOrder.status === 'on_the_way' && 'الكابتن في الطريق إليك الآن 🛵'}
                      {currentTrackedOrder.status === 'delivered' && 'تم تسليم الطلب بنجاح، بالهناء والشفاء!'}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-emerald-100 pt-1 border-t border-white/10">
                      <span>المطعم: {currentTrackedOrder.restaurantNameAr}</span>
                      <span className="font-black">المجموع: {currentTrackedOrder.total} ₪</span>
                    </div>

                    {/* Payment Status Notice */}
                    {currentTrackedOrder.paymentStatus === 'pending_review' && (
                      <div className="p-2 bg-amber-500/20 border border-amber-300/40 rounded-xl text-[11px] text-amber-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-spin text-amber-300 shrink-0" />
                        <span>إشعار التحويل المالي قيد المراجعة والاعتماد بواسطة المحاسب.</span>
                      </div>
                    )}
                  </div>

                  {/* LIVE CAPTAIN BIDS BOX (If Bidding is open) */}
                  {currentTrackedOrder.status === 'bidding_open' && (
                    <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-3xl space-y-3 shadow-sm">
                      <div className="flex items-center justify-between pb-1 border-b border-purple-200">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping" />
                          <h4 className="text-xs font-black text-purple-950">
                            عروض الكباتن المتنافسين لتوصيل طلبك ({currentTrackedOrder.bids.length})
                          </h4>
                        </div>
                        <span className="text-[10px] text-purple-700 font-bold">نظام حمامة الذكي</span>
                      </div>

                      {currentTrackedOrder.bids.length === 0 ? (
                        <div className="py-6 text-center text-xs text-purple-800">
                          بانتظار العروض من الكباتن المتاحين بالقرب منك...
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {currentTrackedOrder.bids.map((bid) => (
                            <div
                              key={bid.id}
                              className="p-3 bg-white rounded-2xl border border-purple-200 shadow-2xs flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                                  {bid.captainName.slice(0, 2)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="text-xs font-bold text-slate-900">{bid.captainName}</h5>
                                    <span className="text-[10px] text-amber-500 font-bold">
                                      ★ {bid.captainRating}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500">
                                    {bid.captainVehicle} • يصل خلال {bid.estimatedMinutes} دقيقة
                                  </p>
                                  {bid.note && (
                                    <p className="text-[10px] text-purple-800 italic mt-0.5">
                                      "{bid.note}"
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="text-left shrink-0 space-y-1">
                                <span className="text-base font-black text-emerald-800 block">
                                  {bid.bidAmount} ₪
                                </span>
                                <button
                                  onClick={() => acceptCaptainBid(currentTrackedOrder.id, bid.id)}
                                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                                >
                                  قبول العرض
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interactive Leaflet Live Route Tracking Map */}
                  <div className="w-full">
                    <OrderLiveTrackingMap order={currentTrackedOrder} />
                  </div>

                  {/* STAR RATING SYSTEM: Rate food quality & delivery speed after trip completion */}
                  {currentTrackedOrder.status === 'delivered' && (
                    <div className="w-full">
                      <OrderRatingCard order={currentTrackedOrder} />
                    </div>
                  )}

                  {/* Assigned Captain Card with Dynamic Live Rating & Speed Score */}
                  {currentTrackedOrder.captainName && (() => {
                    const assignedCap =
                      captains.find((c) => c.id === currentTrackedOrder.captainId) || activeCaptain;
                    return (
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm shadow-2xs">
                            {currentTrackedOrder.captainName.slice(0, 2)}
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-slate-900">
                                كابتن التوصيل: {currentTrackedOrder.captainName}
                              </h4>
                              <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                                ★ {assignedCap.rating} ({assignedCap.ratingsCount || 40} تقييم)
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              {currentTrackedOrder.captainVehicle || 'دراجة مشوار'} • تقييم السرعة:{' '}
                              <strong className="text-emerald-700 font-bold">
                                {assignedCap.deliverySpeedAvg || 4.9}★
                              </strong>
                            </span>
                          </div>
                        </div>

                        <a
                          href={`tel:${currentTrackedOrder.captainPhone || '0599123456'}`}
                          className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="اتصال بالكابتن"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          )}

          {/* TAB: SAVED FAVORITES */}
          {customerTab === 'saved' && (
            <div className="p-4 space-y-4 text-right">
              <h3 className="text-base font-bold text-slate-900">الوجبات المفضلة المحفوظة (Saved)</h3>
              {savedFoodIds.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <Heart className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs text-slate-500">لم تقم بحفظ أي وجبات في المفضلة بعد.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {foodItems
                    .filter((f) => savedFoodIds.includes(f.id))
                    .map((food) => (
                      <div
                        key={`fav-${food.id}`}
                        className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-2xs"
                      >
                        <img
                          src={food.imageUrl}
                          alt={food.nameAr}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0 text-right">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {food.nameAr}
                          </h4>
                          <span className="text-xs font-bold text-emerald-700 block">
                            {food.price} ₪
                          </span>
                        </div>
                        <button
                          onClick={() => addToCart(food, 1)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          إضافة للسلة
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: DEALS */}
          {customerTab === 'deals' && (
            <div className="p-4 space-y-4 text-right">
              <h3 className="text-base font-bold text-slate-900">أقوى العروض والخصومات</h3>
              <div className="space-y-3">
                {deals.map((deal) => (
                  <div
                    key={`tab-deal-${deal.code}`}
                    className={`p-4 rounded-2xl bg-gradient-to-r ${deal.bgGradient} text-white space-y-2 shadow-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-xs font-bold">
                        {deal.discount}
                      </span>
                      <span className="text-xs font-mono font-bold bg-white text-slate-900 px-2 py-0.5 rounded-md">
                        {deal.code}
                      </span>
                    </div>
                    <h4 className="text-sm font-black">{deal.titleAr}</h4>
                    <p className="text-xs text-white/80">{deal.descAr}</p>
                    <button
                      onClick={() => {
                        setAppliedPromo(deal.code);
                        setCustomerTab('cart');
                        showToast(`تم تطبيق الكود "${deal.code}"!`);
                      }}
                      className="mt-2 w-full py-2 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-black rounded-xl transition-colors cursor-pointer"
                    >
                      استخدام الكود والانتقال للسلة
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PROFILE */}
          {customerTab === 'profile' && (
            <div className="p-4 space-y-4 text-right">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-700 text-white font-black text-base flex items-center justify-center">
                    {currentUser.name.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{currentUser.name}</h4>
                    <span className="text-xs text-slate-500 block">{currentUser.phone}</span>
                    <span className="text-[10px] text-slate-400 block">{currentUser.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  تبديل الحساب
                </button>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">عنوان التوصيل المعتمد:</span>
                  <span className="font-bold text-slate-900 max-w-[200px] truncate">
                    {deliveryArea}، {deliveryStreet}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">رصيد المحفظة الترويجية:</span>
                  <span className="font-bold text-emerald-700">75.00 ₪</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">إجمالي الطلبات المنفذة:</span>
                  <span className="font-bold text-slate-900">
                    {orders.filter((o) => o.status === 'delivered').length} طلبات ناجحة
                  </span>
                </div>
              </div>

              {/* Delivered Orders & Rating History */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>الطلبات السابقة والتقييمات:</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {orders.filter((o) => o.status === 'delivered').length} طلبات
                  </span>
                </div>

                <div className="space-y-2">
                  {orders
                    .filter((o) => o.status === 'delivered')
                    .map((ord) => {
                      const isRated = ord.isRated || ord.rating !== undefined;
                      return (
                        <div
                          key={`hist-${ord.id}`}
                          className="p-3 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">
                              #{ord.orderNumber} • {ord.restaurantNameAr}
                            </span>
                            <span className="text-[10px] text-slate-400">{ord.createdAt}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">
                              الكابتن: {ord.captainName || 'مشوار'} • الإجمالي: {ord.total} ₪
                            </span>
                            {isRated ? (
                              <button
                                onClick={() => {
                                  setViewedOrderId(ord.id);
                                  setCustomerTab('live_order');
                                }}
                                className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[10px] rounded-lg border border-amber-200 cursor-pointer flex items-center gap-1"
                              >
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>تم التقييم ({ord.rating?.overallRating || 5} نجوم)</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setViewedOrderId(ord.id);
                                  setCustomerTab('live_order');
                                }}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Star className="w-3 h-3 fill-white text-white" />
                                <span>تقييم الآن</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Mobile Bottom Tab Bar matching reference video */}
        <nav
          aria-label="التنقل السفلي للتطبيق"
          className="shrink-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-20 grid grid-cols-5 items-center px-2 select-none shadow-xs"
        >
          {[
            { id: 'home', label: 'الرئيسية', icon: '🏠' },
            { id: 'custom_delivery', label: 'طرد خاص', icon: '📦' },
            {
              id: 'cart',
              label: 'السلة',
              icon: '🛒',
              badge: cartSummary.itemCount > 0 ? cartSummary.itemCount : undefined,
            },
            { id: 'live_order', label: 'الطلبات', icon: '🛵' },
            { id: 'profile', label: 'حسابي', icon: '👤' },
          ].map((tab) => {
            const isActive = customerTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCustomerTab(tab.id as any)}
                className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer relative ${
                  isActive ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-700 font-medium'
                }`}
              >
                <div className="relative">
                  <span className="text-lg leading-none">{tab.icon}</span>
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-1">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Modal: Food Details & Customization */}
        {selectedFoodForModal && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end">
            <div className="bg-white rounded-t-3xl p-5 space-y-4 max-h-[85%] overflow-y-auto no-scrollbar shadow-2xl border-t border-slate-200 animate-slideUp text-right">
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto" />
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedFoodForModal.nameAr}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedFoodForModal.descriptionAr}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFoodForModal(null)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <img
                src={selectedFoodForModal.imageUrl}
                alt={selectedFoodForModal.nameAr}
                className="w-full h-44 object-cover rounded-2xl"
              />

              {/* Options & Addons */}
              {selectedFoodForModal.options?.map((optGroup) => (
                <div key={optGroup.nameAr} className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    {optGroup.nameAr}:
                  </label>
                  <div className="space-y-1.5">
                    {optGroup.choices.map((choice) => {
                      const isChosen = selectedOptions.includes(choice.nameAr);
                      return (
                        <button
                          key={choice.nameAr}
                          type="button"
                          onClick={() => {
                            setSelectedOptions((prev) =>
                              prev.includes(choice.nameAr)
                                ? prev.filter((c) => c !== choice.nameAr)
                                : [...prev, choice.nameAr]
                            );
                          }}
                          className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isChosen
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{choice.nameAr}</span>
                          <span className="text-emerald-700">+{choice.extraPrice} ₪</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Quantity and Add to Cart Button */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setFoodModalQuantity(Math.max(1, foodModalQuantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white text-slate-800 font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{foodModalQuantity}</span>
                  <button
                    onClick={() => setFoodModalQuantity(foodModalQuantity + 1)}
                    className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center hover:bg-emerald-800 cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleConfirmAddToCart}
                  className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  إضافة إلى السلة • {selectedFoodForModal.price * foodModalQuantity} ₪
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restaurant Customer Reviews & Detailed Rating Breakdown Modal */}
        {selectedRestaurantForReviews && (
          <RestaurantReviewsModal
            restaurant={selectedRestaurantForReviews}
            isOpen={!!selectedRestaurantForReviews}
            onClose={() => setSelectedRestaurantForReviews(null)}
          />
        )}
      </div>
    </div>
  );
};
