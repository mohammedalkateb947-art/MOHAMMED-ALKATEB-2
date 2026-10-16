import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppRole,
  CustomerTab,
  FoodItem,
  Restaurant,
  Captain,
  Order,
  OrderItem,
  CaptainBid,
  OrderRating,
  User,
  PlatformSettings,
  DeliveryZone,
  AuditLogItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../types';
import {
  INITIAL_FOOD_ITEMS,
  INITIAL_RESTAURANTS,
  INITIAL_CAPTAINS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_USERS,
  INITIAL_PLATFORM_SETTINGS,
  INITIAL_DELIVERY_ZONES,
} from '../data/mockData';
import {
  calculateCartSummary,
  canTransitionOrder,
} from '../utils/mshwarLogic';
import { api } from '../services/api';

interface MshwarContextType {
  // Role & Authentication
  role: AppRole;
  setRole: (role: AppRole) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allUsers: User[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (val: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  login: (identifier: string, password?: string, role?: AppRole) => Promise<boolean>;
  registerUser: (data: { name: string; email?: string; phone: string; role?: AppRole; address?: string }) => Promise<boolean>;
  logout: () => void;

  // Splash Screen State
  showSplashScreen: boolean;
  setShowSplashScreen: (val: boolean) => void;

  // Simulator & Modal controls
  isMobileSimulator: boolean;
  setIsMobileSimulator: (val: boolean) => void;
  isTechModalOpen: boolean;
  setIsTechModalOpen: (val: boolean) => void;
  isStoreModalOpen: boolean;
  setIsStoreModalOpen: (val: boolean) => void;

  // Customer State
  customerTab: CustomerTab;
  setCustomerTab: (tab: CustomerTab) => void;
  cartItems: OrderItem[];
  addToCart: (item: FoodItem, quantity?: number, selectedOptions?: string[]) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  appliedPromo: string;
  setAppliedPromo: (code: string) => void;
  cartSummary: ReturnType<typeof calculateCartSummary>;
  savedFoodIds: string[];
  toggleSaveFood: (foodId: string) => void;

  // Customer Delivery Info
  deliveryArea: string;
  setDeliveryArea: (area: string) => void;
  deliveryStreet: string;
  setDeliveryStreet: (street: string) => void;
  deliveryLandmark: string;
  setDeliveryLandmark: (landmark: string) => void;

  // Global Orders & Bidding
  orders: Order[];
  activeCustomerOrder: Order | null;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
    captainInfo?: { id: string; name: string; phone: string; vehicle?: string }
  ) => Promise<boolean>;
  placeCustomerOrder: (
    paymentMethod: PaymentMethod,
    notes?: string,
    requestBidding?: boolean,
    receiptData?: { receiptUrl: string; referenceNumber?: string; senderName?: string; notes?: string }
  ) => Promise<Order>;
  createCustomParcelOrder: (
    pickupAddress: string,
    dropAddress: string,
    packageDescription: string,
    suggestedPrice: number
  ) => Promise<Order>;
  submitCaptainBid: (
    orderId: string,
    bidAmount: number,
    estimatedMinutes: number,
    note?: string
  ) => Promise<void>;
  acceptCaptainBid: (orderId: string, bidId: string) => Promise<void>;
  claimOrderAtomic: (orderId: string) => Promise<boolean>;

  // Payment Receipt Management (Cashier & Customer)
  uploadOrderReceipt: (
    orderId: string,
    receiptData: { receiptUrl: string; referenceNumber?: string; senderName?: string; notes?: string }
  ) => Promise<boolean>;
  reviewPaymentReceipt: (
    orderId: string,
    action: 'approve' | 'reject',
    reviewerName?: string,
    rejectionReason?: string
  ) => Promise<boolean>;

  // Food & Restaurant Management
  foodItems: FoodItem[];
  restaurants: Restaurant[];
  toggleFoodAvailability: (foodId: string) => Promise<void>;
  updateFoodPrice: (foodId: string, newPrice: number) => Promise<void>;
  addFoodItem: (item: Partial<FoodItem>) => Promise<FoodItem>;
  deleteFoodItem: (foodId: string) => Promise<void>;

  // Captain state & Ledger
  captains: Captain[];
  activeCaptain: Captain;
  toggleCaptainOnline: () => Promise<void>;
  captainAcceptOrder: (orderId: string) => Promise<void>;
  captainUpdateDeliveryStep: (orderId: string, step: 'pickup' | 'deliver') => Promise<void>;
  settleCaptainDailyCommission: (captainId: string) => Promise<void>;
  requestCaptainWithdrawal: (
    amount: number,
    method: 'jawwal_pay' | 'bank_of_palestine' | 'palpay' | 'cash_office',
    accountDetail?: string
  ) => Promise<boolean>;
  reviewCaptainWithdrawal: (txId: string, action: 'approve' | 'reject') => Promise<boolean>;

  // Cashier POS state
  cashierCart: OrderItem[];
  cashierAddToCart: (item: FoodItem) => void;
  cashierRemoveFromCart: (itemId: string) => void;
  cashierClearCart: () => void;
  cashierSubmitOrder: (
    orderType: 'dine_in' | 'takeaway' | 'delivery',
    paymentMethod: PaymentMethod,
    cashGiven?: number
  ) => Promise<Order>;

  // Rating System
  orderRatings: OrderRating[];
  submitOrderRating: (ratingData: {
    orderId: string;
    foodQualityRating: number;
    deliverySpeedRating: number;
    comment?: string;
    tags?: string[];
  }) => Promise<boolean>;
  getOrderRating: (orderId: string) => OrderRating | undefined;
  getRestaurantReviews: (restaurantId: string) => OrderRating[];
  getCaptainReviews: (captainId: string) => OrderRating[];

  // Platform Settings & Zones
  platformSettings: PlatformSettings;
  updatePlatformSettings: (updates: Partial<PlatformSettings>) => Promise<void>;
  deliveryZones: DeliveryZone[];
  updateDeliveryZones: (zones: DeliveryZone[]) => Promise<void>;
  auditLogs: AuditLogItem[];

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const MshwarContext = createContext<MshwarContextType | undefined>(undefined);

export const MshwarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current logged in user (defaults to Mohammed Al-Kateb customer)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return api.auth.getStoredUser() || INITIAL_USERS[1];
  });
  const [role, setRole] = useState<AppRole>(currentUser.role);
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Splash screen state (for customer first impression from video)
  const [showSplashScreen, setShowSplashScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') return false;
      return true;
    }
    return false;
  });

  // Simulator & Architecture Modals
  const [isMobileSimulator, setIsMobileSimulator] = useState<boolean>(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState<boolean>(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState<boolean>(false);

  // Customer State
  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');
  const [cartItems, setCartItems] = useState<OrderItem[]>([
    {
      foodItem: INITIAL_FOOD_ITEMS[0],
      quantity: 1,
      selectedOptions: ['جبنة شيدر إضافية'],
    },
  ]);
  const [appliedPromo, setAppliedPromo] = useState<string>('MSHWAR30');
  const [savedFoodIds, setSavedFoodIds] = useState<string[]>(['food-1', 'food-3']);
  const [deliveryArea, setDeliveryArea] = useState<string>('الرمال الجنوبي');
  const [deliveryStreet, setDeliveryStreet] = useState<string>('شارع عمر المختار');
  const [deliveryLandmark, setDeliveryLandmark] = useState<string>('قرب برج الشفاء');

  // Platform Entities (synced with persistent backend database)
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [foodItems, setFoodItems] = useState<FoodItem[]>(INITIAL_FOOD_ITEMS);
  const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [captains, setCaptains] = useState<Captain[]>(INITIAL_CAPTAINS);
  const [activeCaptain, setActiveCaptain] = useState<Captain>(INITIAL_CAPTAINS[0]);
  const [orderRatings, setOrderRatings] = useState<OrderRating[]>(INITIAL_REVIEWS);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(INITIAL_PLATFORM_SETTINGS);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(INITIAL_DELIVERY_ZONES);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Cashier POS Cart
  const [cashierCart, setCashierCart] = useState<OrderItem[]>([]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  }, []);

  // --- INITIAL DATA FETCH & PERIODIC DATABASE SYNC ---
  const fetchAllFromBackend = useCallback(async () => {
    try {
      const [
        fetchedOrders,
        fetchedFood,
        fetchedRestaurants,
        fetchedCaptains,
        fetchedReviews,
        fetchedSettings,
        fetchedZones,
        fetchedUsers,
        fetchedLogs,
      ] = await Promise.all([
        api.orders.list(),
        api.menu.list(),
        api.restaurants.list(),
        api.captains.list(),
        api.reviews.list(),
        api.settings.get(),
        api.settings.getZones(),
        api.auth.listUsers(),
        api.admin.getAuditLogs(),
      ]);

      if (fetchedOrders && fetchedOrders.length > 0) setOrders(fetchedOrders);
      if (fetchedFood && fetchedFood.length > 0) setFoodItems(fetchedFood);
      if (fetchedRestaurants && fetchedRestaurants.length > 0) setRestaurants(fetchedRestaurants);
      if (fetchedCaptains && fetchedCaptains.length > 0) {
        setCaptains(fetchedCaptains);
        setActiveCaptain((prev) => fetchedCaptains.find((c) => c.id === prev.id) || fetchedCaptains[0]);
      }
      if (fetchedReviews) setOrderRatings(fetchedReviews);
      if (fetchedSettings) setPlatformSettings(fetchedSettings);
      if (fetchedZones) setDeliveryZones(fetchedZones);
      if (fetchedUsers) setAllUsers(fetchedUsers);
      if (fetchedLogs) setAuditLogs(fetchedLogs);
    } catch {
      // Offline fallback: already seeded with default state
    }
  }, []);

  useEffect(() => {
    fetchAllFromBackend();

    // 4-second polling to sync state across multiple roles / screens in real time
    const interval = setInterval(() => {
      api.orders.list().then((freshOrders) => {
        if (freshOrders && freshOrders.length > 0) {
          setOrders(freshOrders);
        }
      }).catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchAllFromBackend]);

  // Periodic elapsedSeconds increment for active orders
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.status !== 'delivered' && o.status !== 'cancelled') {
            return { ...o, elapsedSeconds: o.elapsedSeconds + 1 };
          }
          return o;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Active Customer Order resolution
  const activeCustomerOrder =
    orders.find(
      (o) =>
        o.customerPhone === currentUser.phone &&
        o.status !== 'delivered' &&
        o.status !== 'cancelled'
    ) ||
    orders.find((o) => o.status !== 'delivered' && o.status !== 'cancelled') ||
    orders[0] ||
    null;

  // --- AUTHENTICATION METHODS ---
  const login = async (identifier: string, password?: string, requestedRole?: AppRole): Promise<boolean> => {
    try {
      const res = await api.auth.login(identifier, password, requestedRole);
      setCurrentUser(res.user);
      setRole(res.user.role);
      setIsAuthModalOpen(false);
      showToast(`مرحباً بك يا ${res.user.name}`);
      return true;
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل الدخول');
      return false;
    }
  };

  const registerUser = async (data: { name: string; email?: string; phone: string; role?: AppRole; address?: string }): Promise<boolean> => {
    try {
      const res = await api.auth.register(data);
      setCurrentUser(res.user);
      setRole(res.user.role);
      setIsAuthModalOpen(false);
      showToast(`أهلاً بك في مشوار يا ${res.user.name}`);
      return true;
    } catch (err: any) {
      showToast(err.message || 'فشل التسجيل');
      return false;
    }
  };

  const logout = () => {
    api.auth.logout();
    const guestUser: User = {
      id: `usr-${Date.now()}`,
      name: 'عميل زائر',
      email: 'guest@mshwar.ps',
      phone: '0599000000',
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(guestUser);
    setRole('customer');
    showToast('تم تسجيل الخروج بنجاح');
  };

  // --- CART OPERATIONS ---
  const currentDeliveryFee = deliveryZones.find((z) => z.nameAr.includes(deliveryArea))?.deliveryFee || 8;

  const cartSummary = calculateCartSummary(
    cartItems.map((ci) => ({
      id: ci.foodItem.id,
      name: ci.foodItem.nameAr,
      price: ci.foodItem.price,
      quantity: ci.quantity,
      selectedOptions: ci.selectedOptions,
    })),
    appliedPromo,
    currentDeliveryFee,
    platformSettings.serviceFeePercent / 100
  );

  const addToCart = (item: FoodItem, quantity: number = 1, selectedOptions: string[] = []) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.foodItem.id === item.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { foodItem: item, quantity, selectedOptions }];
    });
    showToast(`تمت إضافة "${item.nameAr}" إلى السلة بنجاح`);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.foodItem.id !== itemId));
    showToast('تم حذف الصنف من السلة');
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((ci) => {
          if (ci.foodItem.id === itemId) {
            const nextQty = ci.quantity + delta;
            return nextQty > 0 ? { ...ci, quantity: nextQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as OrderItem[];
    });
  };

  const clearCart = () => setCartItems([]);

  const toggleSaveFood = (foodId: string) => {
    setSavedFoodIds((prev) =>
      prev.includes(foodId) ? prev.filter((id) => id !== foodId) : [...prev, foodId]
    );
    showToast('تم تحديث قائمة المفضلة');
  };

  // --- ORDERS OPERATIONS ---
  const refreshOrders = async () => {
    try {
      const fresh = await api.orders.list();
      setOrders(fresh);
    } catch {
      // ignore
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    captainInfo?: { id: string; name: string; phone: string; vehicle?: string }
  ): Promise<boolean> => {
    try {
      const updated = await api.orders.updateStatus(orderId, newStatus, captainInfo);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      const statusLabels: Record<OrderStatus, string> = {
        placed: 'تم إنشاء الطلب',
        bidding_open: 'مفتوح للمزايدة',
        confirmed: 'تم التأكيد',
        preparing: 'قيد التحضير في المطبخ',
        ready_for_pickup: 'جاهز للاستلام من المطعم',
        on_the_way: 'في الطريق مع الكابتن',
        delivered: 'تم التوصيل بنجاح',
        cancelled: 'تم إلغاء الطلب',
      };
      showToast(`تحديث حالة الطلب: ${statusLabels[newStatus]}`);
      return true;
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث حالة الطلب');
      return false;
    }
  };

  const placeCustomerOrder = async (
    paymentMethod: PaymentMethod,
    notes?: string,
    requestBidding: boolean = true,
    receiptData?: { receiptUrl: string; referenceNumber?: string; senderName?: string; notes?: string }
  ): Promise<Order> => {
    const fullAddress = `${deliveryArea}، ${deliveryStreet}${deliveryLandmark ? ` - ${deliveryLandmark}` : ''}`;
    const targetRest = restaurants.find((r) => r.id === cartItems[0]?.foodItem.restaurantId) || restaurants[0];

    const orderPayload = {
      customerName: currentUser.name,
      customerPhone: currentUser.phone,
      customerAddress: fullAddress,
      area: deliveryArea,
      street: deliveryStreet,
      landmark: deliveryLandmark,
      pickupAddress: targetRest.addressAr,
      restaurantId: targetRest.id,
      restaurantNameAr: targetRest.nameAr,
      items: [...cartItems],
      subtotal: cartSummary.subtotal,
      discount: cartSummary.discountAmount,
      deliveryFee: cartSummary.deliveryFee,
      serviceFee: cartSummary.serviceFee,
      total: cartSummary.grandTotal,
      orderType: 'delivery' as const,
      paymentMethod,
      notes,
      requestBidding,
      paymentReceipt: receiptData
        ? {
            ...receiptData,
            uploadedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          }
        : undefined,
    };

    const created = await api.orders.create(orderPayload);
    setOrders((prev) => [created, ...prev]);
    clearCart();
    setCustomerTab('live_order');
    showToast(
      requestBidding
        ? `تم إرسال الطلب #${created.orderNumber} ونشره للمزايدة الفورية للكباتن!`
        : `تم تأكيد إرسال الطلب #${created.orderNumber} بنجاح`
    );
    return created;
  };

  const createCustomParcelOrder = async (
    pickupAddress: string,
    dropAddress: string,
    packageDescription: string,
    suggestedPrice: number
  ): Promise<Order> => {
    const orderPayload = {
      customerName: currentUser.name,
      customerPhone: currentUser.phone,
      customerAddress: dropAddress,
      pickupAddress,
      restaurantNameAr: 'توصيل طرد ومهمة خاصة',
      packageDescription,
      items: [],
      subtotal: 0,
      discount: 0,
      deliveryFee: suggestedPrice,
      serviceFee: 1.5,
      total: suggestedPrice + 1.5,
      orderType: 'parcel' as const,
      paymentMethod: 'cash' as const,
      notes: packageDescription,
      requestBidding: true,
    };

    const created = await api.orders.create(orderPayload);
    setOrders((prev) => [created, ...prev]);
    setCustomerTab('live_order');
    showToast(`تم نشر طلب التوصيل #${created.orderNumber} لكافة الكباتن المتاحين!`);
    return created;
  };

  const submitCaptainBid = async (
    orderId: string,
    bidAmount: number,
    estimatedMinutes: number,
    note?: string
  ) => {
    try {
      const updated = await api.orders.submitBid(orderId, activeCaptain.id, bidAmount, estimatedMinutes, note);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast(`تم إرسال عرضك بقيمة ${bidAmount} ₪ بنجاح`);
    } catch (err: any) {
      showToast(err.message || 'فشل إرسال العرض');
    }
  };

  const acceptCaptainBid = async (orderId: string, bidId: string) => {
    try {
      const updated = await api.orders.acceptBid(orderId, bidId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast('تم قبول عرض الكابتن وبدء التوصيل.');
    } catch (err: any) {
      showToast(err.message || 'فشل قبول العرض');
    }
  };

  const claimOrderAtomic = async (orderId: string): Promise<boolean> => {
    try {
      const updated = await api.orders.claim(orderId, activeCaptain.id);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast(`تم استلام الطلب #${updated.orderNumber} مباشرة لحسابك بنجاح!`);
      return true;
    } catch (err: any) {
      showToast(err.message || 'فشل استلام الطلب');
      return false;
    }
  };

  // --- PAYMENT RECEIPT OPERATIONS ---
  const uploadOrderReceipt = async (
    orderId: string,
    receiptData: { receiptUrl: string; referenceNumber?: string; senderName?: string; notes?: string }
  ): Promise<boolean> => {
    try {
      const updated = await api.orders.uploadReceipt(orderId, receiptData);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast('تم رفع إشعار الدفع وبانتظار اعتماد المحاسب');
      return true;
    } catch (err: any) {
      showToast(err.message || 'فشل رفع الإشعار');
      return false;
    }
  };

  const reviewPaymentReceipt = async (
    orderId: string,
    action: 'approve' | 'reject',
    reviewerName?: string,
    rejectionReason?: string
  ): Promise<boolean> => {
    try {
      const updated = await api.orders.reviewPayment(
        orderId,
        action,
        reviewerName || currentUser.name,
        rejectionReason
      );
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast(action === 'approve' ? 'تم اعتماد الدفع بنجاح' : 'تم رفض الإشعار');
      return true;
    } catch (err: any) {
      showToast(err.message || 'فشل تدقيق الإشعار');
      return false;
    }
  };

  // --- MENU MANAGEMENT ---
  const toggleFoodAvailability = async (foodId: string) => {
    const item = foodItems.find((f) => f.id === foodId);
    if (!item) return;
    const nextVal = !item.isAvailable;
    const updated = await api.menu.update(foodId, { isAvailable: nextVal });
    setFoodItems((prev) => prev.map((f) => (f.id === foodId ? updated : f)));
    showToast(nextVal ? 'تم تعيين الصنف متوفر' : 'تم تعيين الصنف غير متوفر');
  };

  const updateFoodPrice = async (foodId: string, newPrice: number) => {
    const updated = await api.menu.update(foodId, { price: newPrice });
    setFoodItems((prev) => prev.map((f) => (f.id === foodId ? updated : f)));
    showToast('تم تحديث السعر بنجاح');
  };

  const addFoodItem = async (item: Partial<FoodItem>): Promise<FoodItem> => {
    const created = await api.menu.create(item);
    setFoodItems((prev) => [created, ...prev]);
    showToast(`تمت إضافة صنف "${created.nameAr}" إلى القائمة`);
    return created;
  };

  const deleteFoodItem = async (foodId: string) => {
    await api.menu.delete(foodId);
    setFoodItems((prev) => prev.filter((f) => f.id !== foodId));
    showToast('تم حذف الصنف من القائمة');
  };

  // --- CAPTAIN & WALLET OPERATIONS ---
  const toggleCaptainOnline = async () => {
    const nextState = !activeCaptain.isOnline;
    const updated = await api.captains.update(activeCaptain.id, { isOnline: nextState });
    setActiveCaptain(updated);
    setCaptains((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast(nextState ? 'أنت متصل الآن ومستعد لتلقي الطلبات' : 'تم إيقاف الاتصال');
  };

  const captainAcceptOrder = async (orderId: string) => {
    await submitCaptainBid(orderId, 10, 15, 'جاهز وفوري');
  };

  const captainUpdateDeliveryStep = async (orderId: string, step: 'pickup' | 'deliver') => {
    if (step === 'pickup') {
      await updateOrderStatus(orderId, 'on_the_way');
    } else {
      await updateOrderStatus(orderId, 'delivered');
      // Refresh captain wallet
      const freshCap = await api.captains.get(activeCaptain.id);
      if (freshCap) {
        setActiveCaptain(freshCap);
        setCaptains((prev) => prev.map((c) => (c.id === freshCap.id ? freshCap : c)));
      }
    }
  };

  const settleCaptainDailyCommission = async (captainId: string) => {
    try {
      const settled = await api.captains.settleCommission(captainId, currentUser.name);
      setCaptains((prev) => prev.map((c) => (c.id === captainId ? settled : c)));
      if (activeCaptain.id === captainId) {
        setActiveCaptain(settled);
      }
      showToast('تمت تسوية عمولة الكابتن بنجاح');
    } catch (err: any) {
      showToast(err.message || 'فشل تسوية العمولة');
    }
  };

  const requestCaptainWithdrawal = async (
    amount: number,
    method: 'jawwal_pay' | 'bank_of_palestine' | 'palpay' | 'cash_office',
    accountDetail?: string
  ): Promise<boolean> => {
    try {
      await api.captains.requestWithdrawal(activeCaptain.id, amount, method, accountDetail);
      const freshCap = await api.captains.get(activeCaptain.id);
      if (freshCap) {
        setActiveCaptain(freshCap);
        setCaptains((prev) => prev.map((c) => (c.id === freshCap.id ? freshCap : c)));
      }
      showToast(`تم إرسال طلب سحب ${amount} ₪ بنجاح`);
      return true;
    } catch (err: any) {
      showToast(err.message || 'فشل طلب السحب');
      return false;
    }
  };

  const reviewCaptainWithdrawal = async (txId: string, action: 'approve' | 'reject'): Promise<boolean> => {
    try {
      await api.captains.reviewWithdrawal(txId, action, currentUser.name);
      // Refresh captains
      const freshCaps = await api.captains.list();
      setCaptains(freshCaps);
      showToast(`تم ${action === 'approve' ? 'اعتماد' : 'رفض'} طلب السحب`);
      return true;
    } catch (err: any) {
      showToast(err.message || 'فشل مراجعة السحب');
      return false;
    }
  };

  // --- CASHIER POS OPERATIONS ---
  const cashierAddToCart = (item: FoodItem) => {
    setCashierCart((prev) => {
      const index = prev.findIndex((ci) => ci.foodItem.id === item.id);
      if (index > -1) {
        const next = [...prev];
        next[index] = { ...next[index], quantity: next[index].quantity + 1 };
        return next;
      }
      return [...prev, { foodItem: item, quantity: 1 }];
    });
  };

  const cashierRemoveFromCart = (itemId: string) => {
    setCashierCart((prev) => prev.filter((ci) => ci.foodItem.id !== itemId));
  };

  const cashierClearCart = () => setCashierCart([]);

  const cashierSubmitOrder = async (
    orderType: 'dine_in' | 'takeaway' | 'delivery',
    paymentMethod: PaymentMethod,
    cashGiven?: number
  ): Promise<Order> => {
    const subtotal = cashierCart.reduce((acc, ci) => acc + ci.foodItem.price * ci.quantity, 0);
    const deliveryFee = orderType === 'delivery' ? 5 : 0;
    const total = subtotal + deliveryFee;

    const orderPayload = {
      customerName: 'عميل صالة / مباشر',
      customerPhone: '0590000000',
      customerAddress: orderType === 'dine_in' ? 'تناول بالصالة (طاولة كاشير)' : 'استلام سفري',
      restaurantId: 'rest-1',
      restaurantNameAr: 'برغر هانت | Burger Hunt',
      items: [...cashierCart],
      subtotal,
      discount: 0,
      deliveryFee,
      serviceFee: 0,
      total,
      orderType,
      paymentMethod,
      paymentStatus: 'paid' as const,
      status: 'confirmed' as const,
      requestBidding: false,
      cashGiven,
      cashChange: cashGiven ? Math.max(0, cashGiven - total) : undefined,
    };

    const created = await api.orders.create(orderPayload);
    setOrders((prev) => [created, ...prev]);
    cashierClearCart();
    showToast(`تم إصدار فاتورة #${created.orderNumber} وإرسالها لشاشة المطبخ KDS`);
    return created;
  };

  // --- REVIEWS & RATINGS ---
  const submitOrderRating = async (ratingData: {
    orderId: string;
    foodQualityRating: number;
    deliverySpeedRating: number;
    comment?: string;
    tags?: string[];
  }): Promise<boolean> => {
    try {
      const targetOrder = orders.find((o) => o.id === ratingData.orderId);
      if (!targetOrder) return false;

      const createdReview = await api.reviews.create({
        ...ratingData,
        orderNumber: targetOrder.orderNumber,
        restaurantId: targetOrder.restaurantId,
        restaurantNameAr: targetOrder.restaurantNameAr,
        captainId: targetOrder.captainId,
        captainName: targetOrder.captainName,
        customerName: currentUser.name,
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === ratingData.orderId ? { ...o, isRated: true, rating: createdReview } : o))
      );
      setOrderRatings((prev) => [createdReview, ...prev.filter((r) => r.orderId !== ratingData.orderId)]);

      // Refresh restaurant & captain metrics
      const [freshRests, freshCaps] = await Promise.all([api.restaurants.list(), api.captains.list()]);
      setRestaurants(freshRests);
      setCaptains(freshCaps);

      showToast('شكراً جزيلاً! تم حفظ تقييمك ودعم الكابتن والمطعم.');
      return true;
    } catch (err: any) {
      showToast(err.message || 'فشل إرسال التقييم');
      return false;
    }
  };

  const getOrderRating = (orderId: string): OrderRating | undefined => {
    return orderRatings.find((r) => r.orderId === orderId);
  };

  const getRestaurantReviews = (restaurantId: string): OrderRating[] => {
    return orderRatings.filter((r) => r.restaurantId === restaurantId);
  };

  const getCaptainReviews = (captainId: string): OrderRating[] => {
    return orderRatings.filter((r) => r.captainId === captainId);
  };

  // --- PLATFORM SETTINGS & ZONES ---
  const updatePlatformSettings = async (updates: Partial<PlatformSettings>) => {
    const updated = await api.settings.update(updates);
    setPlatformSettings(updated);
    showToast('تم حفظ إعدادات المنصة بنجاح');
  };

  const updateDeliveryZones = async (zones: DeliveryZone[]) => {
    const updated = await api.settings.updateZones(zones);
    setDeliveryZones(updated);
    showToast('تم تحديث مناطق التوصيل بنجاح');
  };

  return (
    <MshwarContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        setCurrentUser,
        allUsers,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        login,
        registerUser,
        logout,
        showSplashScreen,
        setShowSplashScreen,
        isMobileSimulator,
        setIsMobileSimulator,
        isTechModalOpen,
        setIsTechModalOpen,
        isStoreModalOpen,
        setIsStoreModalOpen,
        customerTab,
        setCustomerTab,
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedPromo,
        setAppliedPromo,
        cartSummary,
        savedFoodIds,
        toggleSaveFood,
        deliveryArea,
        setDeliveryArea,
        deliveryStreet,
        setDeliveryStreet,
        deliveryLandmark,
        setDeliveryLandmark,
        orders,
        activeCustomerOrder,
        refreshOrders,
        updateOrderStatus,
        placeCustomerOrder,
        createCustomParcelOrder,
        submitCaptainBid,
        acceptCaptainBid,
        claimOrderAtomic,
        uploadOrderReceipt,
        reviewPaymentReceipt,
        foodItems,
        restaurants,
        toggleFoodAvailability,
        updateFoodPrice,
        addFoodItem,
        deleteFoodItem,
        captains,
        activeCaptain,
        toggleCaptainOnline,
        captainAcceptOrder,
        captainUpdateDeliveryStep,
        settleCaptainDailyCommission,
        requestCaptainWithdrawal,
        reviewCaptainWithdrawal,
        cashierCart,
        cashierAddToCart,
        cashierRemoveFromCart,
        cashierClearCart,
        cashierSubmitOrder,
        orderRatings,
        submitOrderRating,
        getOrderRating,
        getRestaurantReviews,
        getCaptainReviews,
        platformSettings,
        updatePlatformSettings,
        deliveryZones,
        updateDeliveryZones,
        auditLogs,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </MshwarContext.Provider>
  );
};

export const useMshwar = () => {
  const context = useContext(MshwarContext);
  if (!context) {
    throw new Error('useMshwar must be used within a MshwarProvider');
  }
  return context;
};
