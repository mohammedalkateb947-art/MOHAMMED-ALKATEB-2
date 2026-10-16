import fs from 'fs';
import path from 'path';
import {
  FoodItem,
  Restaurant,
  Captain,
  Order,
  OrderRating,
  WalletTransaction,
  DeliveryZone,
  PlatformSettings,
  User,
  AuditLogItem,
  OrderStatus,
  PaymentStatus,
} from '../src/types/index';
import {
  INITIAL_RESTAURANTS,
  INITIAL_FOOD_ITEMS,
  INITIAL_ORDERS,
  INITIAL_CAPTAINS,
  INITIAL_REVIEWS,
  INITIAL_USERS,
  INITIAL_DELIVERY_ZONES,
  INITIAL_PLATFORM_SETTINGS,
} from '../src/data/mockData';
import { calculateUpdatedAverage } from '../src/utils/mshwarLogic';

interface DatabaseSchema {
  version: number;
  users: User[];
  restaurants: Restaurant[];
  foodItems: FoodItem[];
  orders: Order[];
  captains: Captain[];
  reviews: OrderRating[];
  deliveryZones: DeliveryZone[];
  settings: PlatformSettings;
  auditLogs: AuditLogItem[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'mshwar_db.json');

class DatabaseEngine {
  private data: DatabaseSchema;
  private isWriting: boolean = false;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version) {
          return parsed;
        }
      } catch (err) {
        console.error('Error reading existing database file, re-initializing defaults:', err);
      }
    }

    // Default Seed Data
    const initialData: DatabaseSchema = {
      version: 1,
      users: [...INITIAL_USERS],
      restaurants: [...INITIAL_RESTAURANTS],
      foodItems: [...INITIAL_FOOD_ITEMS],
      orders: [...INITIAL_ORDERS],
      captains: [...INITIAL_CAPTAINS],
      reviews: [...INITIAL_REVIEWS],
      deliveryZones: [...INITIAL_DELIVERY_ZONES],
      settings: { ...INITIAL_PLATFORM_SETTINGS },
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: 'usr-admin',
          userName: 'مدير النظام',
          userRole: 'admin',
          action: 'INITIALIZE_SYSTEM',
          details: 'تشغيل محرك قاعدة بيانات مشوار المستمرة بنجاح',
        },
      ],
    };

    this.saveSync(initialData);
    return initialData;
  }

  private saveSync(data: DatabaseSchema) {
    const tmp = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, DB_FILE);
  }

  private async persist(): Promise<void> {
    if (this.isWriting) return;
    this.isWriting = true;
    try {
      const tmp = `${DB_FILE}.tmp`;
      await fs.promises.writeFile(tmp, JSON.stringify(this.data, null, 2), 'utf-8');
      await fs.promises.rename(tmp, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database:', err);
    } finally {
      this.isWriting = false;
    }
  }

  // --- USERS & AUTH ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  public getUserByPhone(phone: string): User | undefined {
    return this.data.users.find((u) => u.phone.trim() === phone.trim());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public async createUser(user: User): Promise<User> {
    this.data.users.push(user);
    await this.persist();
    return user;
  }

  public async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    await this.persist();
    return this.data.users[idx];
  }

  // --- RESTAURANTS ---
  public getRestaurants(): Restaurant[] {
    return this.data.restaurants;
  }

  public getRestaurantById(id: string): Restaurant | undefined {
    return this.data.restaurants.find((r) => r.id === id);
  }

  public async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant | null> {
    const idx = this.data.restaurants.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.data.restaurants[idx] = { ...this.data.restaurants[idx], ...updates };
    await this.persist();
    return this.data.restaurants[idx];
  }

  // --- MENU ITEMS ---
  public getFoodItems(restaurantId?: string): FoodItem[] {
    if (restaurantId) {
      return this.data.foodItems.filter((f) => f.restaurantId === restaurantId);
    }
    return this.data.foodItems;
  }

  public getFoodItemById(id: string): FoodItem | undefined {
    return this.data.foodItems.find((f) => f.id === id);
  }

  public async createFoodItem(item: FoodItem): Promise<FoodItem> {
    this.data.foodItems.push(item);
    await this.persist();
    return item;
  }

  public async updateFoodItem(id: string, updates: Partial<FoodItem>): Promise<FoodItem | null> {
    const idx = this.data.foodItems.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.data.foodItems[idx] = { ...this.data.foodItems[idx], ...updates };
    await this.persist();
    return this.data.foodItems[idx];
  }

  public async deleteFoodItem(id: string): Promise<boolean> {
    const prevLen = this.data.foodItems.length;
    this.data.foodItems = this.data.foodItems.filter((f) => f.id !== id);
    if (this.data.foodItems.length !== prevLen) {
      await this.persist();
      return true;
    }
    return false;
  }

  // --- ORDERS ---
  public getOrders(filters?: {
    status?: OrderStatus;
    restaurantId?: string;
    captainId?: string;
    customerPhone?: string;
  }): Order[] {
    let result = [...this.data.orders];
    if (filters?.status) {
      result = result.filter((o) => o.status === filters.status);
    }
    if (filters?.restaurantId) {
      result = result.filter((o) => o.restaurantId === filters.restaurantId);
    }
    if (filters?.captainId) {
      result = result.filter((o) => o.captainId === filters.captainId);
    }
    if (filters?.customerPhone) {
      result = result.filter((o) => o.customerPhone === filters.customerPhone);
    }
    return result.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  public async createOrder(order: Order): Promise<Order> {
    this.data.orders.unshift(order);
    await this.persist();
    return order;
  }

  public async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const idx = this.data.orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    this.data.orders[idx] = { ...this.data.orders[idx], ...updates };
    await this.persist();
    return this.data.orders[idx];
  }

  public async claimOrderAtomic(orderId: string, captain: Captain): Promise<{ success: boolean; order?: Order; message?: string }> {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, message: 'الطلب غير موجود' };
    }
    if (order.status !== 'bidding_open' && order.status !== 'ready_for_pickup') {
      return { success: false, message: 'الطلب ليس متاحاً للاستلام حالياً' };
    }
    if (order.captainId && order.captainId !== captain.id) {
      return { success: false, message: 'تم استلام الطلب مسبقاً من كابتن آخر' };
    }
    order.captainId = captain.id;
    order.captainName = captain.name;
    order.captainPhone = captain.phone;
    order.captainVehicle = captain.vehicle;
    order.biddingStatus = 'closed';
    if (order.status === 'bidding_open') {
      order.status = 'confirmed';
    }
    await this.persist();
    return { success: true, order };
  }

  public async addCaptainBid(orderId: string, bid: any): Promise<Order | null> {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order || order.biddingStatus !== 'open') return null;
    order.bids = order.bids.filter((b) => b.captainId !== bid.captainId);
    order.bids.push(bid);
    await this.persist();
    return order;
  }

  public async acceptCaptainBid(orderId: string, bidId: string): Promise<Order | null> {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;
    const acceptedBid = order.bids.find((b) => b.id === bidId);
    if (!acceptedBid) return null;
    order.bids = order.bids.map((b) => ({
      ...b,
      status: (b.id === bidId ? 'accepted' : 'rejected') as 'accepted' | 'rejected',
    }));
    order.selectedBid = acceptedBid;
    order.biddingStatus = 'closed';
    order.captainId = acceptedBid.captainId;
    order.captainName = acceptedBid.captainName;
    order.captainPhone = acceptedBid.captainPhone;
    order.captainVehicle = acceptedBid.captainVehicle;
    order.deliveryFee = acceptedBid.bidAmount;
    order.total = Math.round((order.subtotal - order.discount + acceptedBid.bidAmount + order.serviceFee) * 100) / 100;
    order.status = order.orderType === 'parcel' ? 'ready_for_pickup' : 'confirmed';
    await this.persist();
    return order;
  }

  public async reviewPaymentReceipt(
    orderId: string,
    action: 'approve' | 'reject',
    reviewerName: string,
    rejectionReason?: string
  ): Promise<Order | null> {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;
    const nowStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    if (action === 'approve') {
      order.paymentStatus = 'paid';
      if (order.paymentReceipt) {
        order.paymentReceipt.reviewedBy = reviewerName;
        order.paymentReceipt.reviewedAt = nowStr;
      }
      if (order.status === 'placed') {
        order.status = 'confirmed';
      }
      this.addAuditLogItem({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'cashier',
        userName: reviewerName,
        userRole: 'cashier',
        action: 'APPROVE_PAYMENT_RECEIPT',
        details: `اعتماد إشعار دفع الطلب #${order.orderNumber} بمبلغ ${order.total} ₪`,
      });
    } else {
      order.paymentStatus = 'rejected';
      if (order.paymentReceipt) {
        order.paymentReceipt.reviewedBy = reviewerName;
        order.paymentReceipt.reviewedAt = nowStr;
        order.paymentReceipt.rejectionReason = rejectionReason || 'الإشعار غير واضح أو لم يصل للحساب';
      }
      this.addAuditLogItem({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'cashier',
        userName: reviewerName,
        userRole: 'cashier',
        action: 'REJECT_PAYMENT_RECEIPT',
        details: `رفض إشعار دفع الطلب #${order.orderNumber}. السبب: ${rejectionReason}`,
      });
    }
    await this.persist();
    return order;
  }

  // --- CAPTAINS & WALLET ---
  public getCaptains(): Captain[] {
    return this.data.captains;
  }

  public getCaptainById(id: string): Captain | undefined {
    return this.data.captains.find((c) => c.id === id);
  }

  public async updateCaptain(id: string, updates: Partial<Captain>): Promise<Captain | null> {
    const idx = this.data.captains.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.captains[idx] = { ...this.data.captains[idx], ...updates };
    await this.persist();
    return this.data.captains[idx];
  }

  public async recordOrderDelivered(orderId: string): Promise<{ order: Order; captain: Captain } | null> {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.status = 'delivered';
    const deliveryFee = order.deliveryFee || 10;
    const foodCash = order.paymentMethod === 'cash' ? order.subtotal : 0;

    let captain = this.data.captains.find((c) => c.id === order.captainId);
    if (!captain) {
      captain = this.data.captains[0];
    }

    const newDailyRevenue = captain.dailyDeliveryRevenue + deliveryFee;
    const newFoodCash = captain.dailyFoodCashCollected + foodCash;
    const newPlatformCut = Math.round(newDailyRevenue * (captain.commissionRatePercent / 100) * 100) / 100;

    const now = new Date();
    const dateStr = `اليوم ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const earningTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      captainId: captain.id,
      type: 'earning',
      titleAr: `أجرة توصيل #${order.orderNumber} (${order.restaurantNameAr})`,
      amount: deliveryFee,
      date: dateStr,
      status: 'completed',
      referenceId: order.orderNumber,
      method: 'cash_office',
    };

    captain.walletBalance = Math.round((captain.walletBalance + deliveryFee) * 100) / 100;
    captain.completedOrdersCount += 1;
    captain.dailyDeliveriesCount += 1;
    captain.dailyDeliveryRevenue = newDailyRevenue;
    captain.dailyFoodCashCollected = newFoodCash;
    captain.platformOwedAmount = newPlatformCut;
    captain.isCommissionSettledToday = false;
    captain.transactions = [earningTx, ...(captain.transactions || [])];

    await this.persist();
    return { order, captain };
  }

  public async requestCaptainWithdrawal(
    captainId: string,
    amount: number,
    method: 'jawwal_pay' | 'bank_of_palestine' | 'palpay' | 'cash_office',
    accountDetail?: string
  ): Promise<WalletTransaction | null> {
    const captain = this.data.captains.find((c) => c.id === captainId);
    if (!captain || amount <= 0 || amount > captain.walletBalance) {
      return null;
    }

    const now = new Date();
    const dateStr = `اليوم ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const ref = `WTH-${Math.floor(10000 + Math.random() * 90000)}`;

    const methodLabels: Record<string, string> = {
      jawwal_pay: 'محفظة جوال باي (Jawwal Pay)',
      bank_of_palestine: 'حساب بنك فلسطين',
      palpay: 'محفظة بال بي (PalPay)',
      cash_office: 'استلام نقدي من المقر الرئيسي',
    };

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      captainId: captain.id,
      type: 'withdrawal',
      titleAr: methodLabels[method] || 'سحب أرباح',
      amount: -amount,
      date: dateStr,
      status: 'pending',
      referenceId: ref,
      method,
      accountDetail: accountDetail || (method === 'jawwal_pay' ? captain.phone : undefined),
    };

    captain.walletBalance = Math.max(0, Math.round((captain.walletBalance - amount) * 100) / 100);
    captain.pendingTransfersAmount = Math.round((captain.pendingTransfersAmount + amount) * 100) / 100;
    captain.transactions = [newTx, ...(captain.transactions || [])];

    this.addAuditLogItem({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: captain.id,
      userName: captain.name,
      userRole: 'captain',
      action: 'REQUEST_WITHDRAWAL',
      details: `طلب سحب ${amount} ₪ عبر ${methodLabels[method]}`,
    });

    await this.persist();
    return newTx;
  }

  public async reviewCaptainWithdrawal(
    txId: string,
    action: 'approve' | 'reject',
    reviewerName: string
  ): Promise<boolean> {
    for (const cap of this.data.captains) {
      const tx = cap.transactions.find((t) => t.id === txId);
      if (tx && tx.status === 'pending') {
        const absAmount = Math.abs(tx.amount);
        tx.reviewedBy = reviewerName;
        tx.reviewedAt = new Date().toISOString();
        if (action === 'approve') {
          tx.status = 'completed';
          cap.pendingTransfersAmount = Math.max(0, Math.round((cap.pendingTransfersAmount - absAmount) * 100) / 100);
        } else {
          tx.status = 'rejected';
          cap.pendingTransfersAmount = Math.max(0, Math.round((cap.pendingTransfersAmount - absAmount) * 100) / 100);
          cap.walletBalance = Math.round((cap.walletBalance + absAmount) * 100) / 100;
        }

        this.addAuditLogItem({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: 'admin',
          userName: reviewerName,
          userRole: 'admin',
          action: action === 'approve' ? 'APPROVE_WITHDRAWAL' : 'REJECT_WITHDRAWAL',
          details: `${action === 'approve' ? 'اعتماد' : 'رفض'} طلب سحب #${tx.referenceId} بمبلغ ${absAmount} ₪`,
        });

        await this.persist();
        return true;
      }
    }
    return false;
  }

  public async settleCaptainCommission(captainId: string, adminName: string): Promise<Captain | null> {
    const captain = this.data.captains.find((c) => c.id === captainId);
    if (!captain) return null;

    const nowStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    captain.isCommissionSettledToday = true;
    captain.lastSettlementTime = `${nowStr} (المبلغ: ${captain.platformOwedAmount.toFixed(2)} ₪)`;

    this.addAuditLogItem({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'admin',
      userName: adminName,
      userRole: 'admin',
      action: 'SETTLE_CAPTAIN_COMMISSION',
      details: `تسوية عمولة الكابتن ${captain.name} بقيمة ${captain.platformOwedAmount.toFixed(2)} ₪`,
    });

    await this.persist();
    return captain;
  }

  // --- REVIEWS & RATINGS ---
  public getReviews(restaurantId?: string, captainId?: string): OrderRating[] {
    let list = this.data.reviews;
    if (restaurantId) list = list.filter((r) => r.restaurantId === restaurantId);
    if (captainId) list = list.filter((r) => r.captainId === captainId);
    return list;
  }

  public async createReview(review: OrderRating): Promise<OrderRating> {
    this.data.reviews.unshift(review);

    const order = this.data.orders.find((o) => o.id === review.orderId);
    if (order) {
      order.isRated = true;
      order.rating = review;
    }

    if (review.restaurantId) {
      const rest = this.data.restaurants.find((r) => r.id === review.restaurantId);
      if (rest) {
        const count = rest.ratingsCount || 50;
        const currentAvg = rest.rating || 4.8;
        const currentFoodAvg = rest.foodQualityAvg || 4.8;
        const { newAvg, newCount } = calculateUpdatedAverage(currentAvg, count, review.overallRating);
        const { newAvg: newFoodAvg } = calculateUpdatedAverage(currentFoodAvg, count, review.foodQualityRating);
        rest.rating = newAvg;
        rest.ratingsCount = newCount;
        rest.foodQualityAvg = newFoodAvg;
      }
    }

    if (review.captainId) {
      const cap = this.data.captains.find((c) => c.id === review.captainId);
      if (cap) {
        const count = cap.ratingsCount || 30;
        const currentAvg = cap.rating || 4.9;
        const currentSpeedAvg = cap.deliverySpeedAvg || 4.9;
        const { newAvg, newCount } = calculateUpdatedAverage(currentAvg, count, review.overallRating);
        const { newAvg: newSpeedAvg } = calculateUpdatedAverage(currentSpeedAvg, count, review.deliverySpeedRating);
        cap.rating = newAvg;
        cap.ratingsCount = newCount;
        cap.deliverySpeedAvg = newSpeedAvg;
      }
    }

    await this.persist();
    return review;
  }

  // --- SETTINGS & ZONES ---
  public getSettings(): PlatformSettings {
    return this.data.settings;
  }

  public async updateSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
    this.data.settings = { ...this.data.settings, ...updates };
    await this.persist();
    return this.data.settings;
  }

  public getDeliveryZones(): DeliveryZone[] {
    return this.data.deliveryZones;
  }

  public async updateDeliveryZones(zones: DeliveryZone[]): Promise<DeliveryZone[]> {
    this.data.deliveryZones = zones;
    await this.persist();
    return zones;
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLogItem[] {
    return this.data.auditLogs.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
  }

  public addAuditLogItem(item: AuditLogItem) {
    this.data.auditLogs.unshift(item);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
  }
}

export const db = new DatabaseEngine();
