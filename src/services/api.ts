import {
  AppRole,
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
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('mshwar_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // --- AUTH ---
  auth: {
    async login(identifier: string, password?: string, role?: AppRole): Promise<{ user: User; token: string }> {
      const res = await request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password, role }),
      });
      if (res.token) {
        localStorage.setItem('mshwar_auth_token', res.token);
        localStorage.setItem('mshwar_current_user', JSON.stringify(res.user));
      }
      return res;
    },
    async register(data: { name: string; email?: string; phone: string; role?: AppRole; address?: string; restaurantId?: string }): Promise<{ user: User; token: string }> {
      const res = await request<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.token) {
        localStorage.setItem('mshwar_auth_token', res.token);
        localStorage.setItem('mshwar_current_user', JSON.stringify(res.user));
      }
      return res;
    },
    getStoredUser(): User | null {
      try {
        const raw = localStorage.getItem('mshwar_current_user');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },
    logout() {
      localStorage.removeItem('mshwar_auth_token');
      localStorage.removeItem('mshwar_current_user');
    },
    async listUsers(): Promise<User[]> {
      return request<User[]>('/auth/users');
    },
  },

  // --- RESTAURANTS ---
  restaurants: {
    async list(): Promise<Restaurant[]> {
      return request<Restaurant[]>('/restaurants');
    },
    async get(id: string): Promise<Restaurant> {
      return request<Restaurant>(`/restaurants/${id}`);
    },
    async update(id: string, updates: Partial<Restaurant>): Promise<Restaurant> {
      return request<Restaurant>(`/restaurants/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
  },

  // --- MENU ITEMS ---
  menu: {
    async list(restaurantId?: string): Promise<FoodItem[]> {
      const q = restaurantId ? `?restaurantId=${encodeURIComponent(restaurantId)}` : '';
      return request<FoodItem[]>(`/menu${q}`);
    },
    async create(item: Partial<FoodItem>): Promise<FoodItem> {
      return request<FoodItem>('/menu', {
        method: 'POST',
        body: JSON.stringify(item),
      });
    },
    async update(id: string, updates: Partial<FoodItem>): Promise<FoodItem> {
      return request<FoodItem>(`/menu/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    async delete(id: string): Promise<boolean> {
      const res = await request<{ success: boolean }>(`/menu/${id}`, {
        method: 'DELETE',
      });
      return res.success;
    },
  },

  // --- ORDERS ---
  orders: {
    async list(filters?: { status?: OrderStatus; restaurantId?: string; captainId?: string; customerPhone?: string }): Promise<Order[]> {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.restaurantId) params.append('restaurantId', filters.restaurantId);
      if (filters?.captainId) params.append('captainId', filters.captainId);
      if (filters?.customerPhone) params.append('customerPhone', filters.customerPhone);
      const q = params.toString() ? `?${params.toString()}` : '';
      return request<Order[]>(`/orders${q}`);
    },
    async get(id: string): Promise<Order> {
      return request<Order>(`/orders/${id}`);
    },
    async create(orderData: Partial<Order> & { requestBidding?: boolean }): Promise<Order> {
      return request<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    },
    async updateStatus(
      orderId: string,
      status: OrderStatus,
      captainInfo?: { id: string; name: string; phone: string; vehicle?: string }
    ): Promise<Order> {
      return request<Order>(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, captainInfo }),
      });
    },
    async claim(orderId: string, captainId: string): Promise<Order> {
      return request<Order>(`/orders/${orderId}/claim`, {
        method: 'POST',
        body: JSON.stringify({ captainId }),
      });
    },
    async submitBid(
      orderId: string,
      captainId: string,
      bidAmount: number,
      estimatedMinutes: number,
      note?: string
    ): Promise<Order> {
      return request<Order>(`/orders/${orderId}/bid`, {
        method: 'POST',
        body: JSON.stringify({ captainId, bidAmount, estimatedMinutes, note }),
      });
    },
    async acceptBid(orderId: string, bidId: string): Promise<Order> {
      return request<Order>(`/orders/${orderId}/accept-bid`, {
        method: 'POST',
        body: JSON.stringify({ bidId }),
      });
    },
    async uploadReceipt(
      orderId: string,
      receiptData: { receiptUrl: string; referenceNumber?: string; senderName?: string; notes?: string }
    ): Promise<Order> {
      return request<Order>(`/orders/${orderId}/receipt`, {
        method: 'POST',
        body: JSON.stringify(receiptData),
      });
    },
    async reviewPayment(
      orderId: string,
      action: 'approve' | 'reject',
      reviewerName: string,
      rejectionReason?: string
    ): Promise<Order> {
      return request<Order>(`/orders/${orderId}/review-payment`, {
        method: 'POST',
        body: JSON.stringify({ action, reviewerName, rejectionReason }),
      });
    },
  },

  // --- CAPTAINS & WALLET ---
  captains: {
    async list(): Promise<Captain[]> {
      return request<Captain[]>('/captains');
    },
    async get(id: string): Promise<Captain> {
      return request<Captain>(`/captains/${id}`);
    },
    async update(id: string, updates: Partial<Captain>): Promise<Captain> {
      return request<Captain>(`/captains/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    async requestWithdrawal(
      captainId: string,
      amount: number,
      method: 'jawwal_pay' | 'bank_of_palestine' | 'palpay' | 'cash_office',
      accountDetail?: string
    ): Promise<WalletTransaction> {
      return request<WalletTransaction>(`/captains/${captainId}/withdrawal`, {
        method: 'POST',
        body: JSON.stringify({ amount, method, accountDetail }),
      });
    },
    async reviewWithdrawal(txId: string, action: 'approve' | 'reject', reviewerName: string): Promise<{ success: boolean }> {
      return request<{ success: boolean }>(`/withdrawals/${txId}/review`, {
        method: 'POST',
        body: JSON.stringify({ action, reviewerName }),
      });
    },
    async settleCommission(captainId: string, adminName: string): Promise<Captain> {
      return request<Captain>(`/captains/${captainId}/settle`, {
        method: 'POST',
        body: JSON.stringify({ adminName }),
      });
    },
  },

  // --- REVIEWS & RATINGS ---
  reviews: {
    async list(restaurantId?: string, captainId?: string): Promise<OrderRating[]> {
      const params = new URLSearchParams();
      if (restaurantId) params.append('restaurantId', restaurantId);
      if (captainId) params.append('captainId', captainId);
      const q = params.toString() ? `?${params.toString()}` : '';
      return request<OrderRating[]>(`/reviews${q}`);
    },
    async create(review: {
      orderId: string;
      orderNumber?: string;
      restaurantId?: string;
      restaurantNameAr?: string;
      captainId?: string;
      captainName?: string;
      foodQualityRating: number;
      deliverySpeedRating: number;
      comment?: string;
      tags?: string[];
      customerName?: string;
    }): Promise<OrderRating> {
      return request<OrderRating>('/reviews', {
        method: 'POST',
        body: JSON.stringify(review),
      });
    },
  },

  // --- SETTINGS & ZONES ---
  settings: {
    async get(): Promise<PlatformSettings> {
      return request<PlatformSettings>('/settings');
    },
    async update(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
      return request<PlatformSettings>('/settings', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    async getZones(): Promise<DeliveryZone[]> {
      return request<DeliveryZone[]>('/zones');
    },
    async updateZones(zones: DeliveryZone[]): Promise<DeliveryZone[]> {
      return request<DeliveryZone[]>('/zones', {
        method: 'POST',
        body: JSON.stringify(zones),
      });
    },
  },

  // --- ADMIN & ANALYTICS ---
  admin: {
    async getMetrics(): Promise<{
      totalOrders: number;
      activeOrders: number;
      biddingOrders: number;
      deliveredOrders: number;
      totalGMV: number;
      totalDailyDeliveryRevenue: number;
      totalPlatformOwed: number;
      totalSettledToday: number;
      totalPendingSettlement: number;
      pendingReceiptsCount: number;
      pendingWithdrawalsCount: number;
      totalCaptains: number;
      onlineCaptains: number;
      totalRestaurants: number;
    }> {
      return request<any>('/admin/metrics');
    },
    async getAuditLogs(): Promise<AuditLogItem[]> {
      return request<AuditLogItem[]>('/admin/audit');
    },
  },
};
