export type AppRole = 'customer' | 'restaurant' | 'captain' | 'admin' | 'cashier' | 'kds';

export type CustomerTab = 'home' | 'saved' | 'cart' | 'deals' | 'profile' | 'live_order' | 'custom_delivery';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AppRole;
  address?: string;
  restaurantId?: string; // If restaurant staff or KDS
  captainId?: string;    // If captain
  createdAt: string;
  avatarUrl?: string;
}

export interface FoodOptionChoice {
  nameAr: string;
  extraPrice: number;
}

export interface FoodOptionGroup {
  nameAr: string;
  choices: FoodOptionChoice[];
}

export interface FoodItem {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  category: 'burger' | 'pizza' | 'sushi' | 'chicken' | 'grills' | 'pasta' | 'dessert' | 'drinks' | 'shawarma';
  price: number;
  calories: number;
  prepTimeMinutes: number;
  imageUrl: string;
  restaurantId: string;
  restaurantNameAr: string;
  rating: number;
  ratingCount: number;
  isPopular?: boolean;
  isFastDelivery?: boolean;
  isAvailable: boolean;
  options?: FoodOptionGroup[];
}

export interface Restaurant {
  id: string;
  nameAr: string;
  nameEn: string;
  cuisineAr: string;
  logoUrl: string;
  coverUrl?: string;
  rating: number;
  ratingsCount?: number;
  foodQualityAvg?: number;
  deliverySpeedAvg?: number;
  deliveryFee: number;
  estimatedDeliveryMin: string;
  isOpen: boolean;
  minOrder: number;
  addressAr: string;
  lat?: number;
  lng?: number;
  phone?: string;
}

export interface OrderItem {
  foodItem: FoodItem;
  quantity: number;
  selectedOptions?: string[];
  notes?: string;
}

export interface CaptainBid {
  id: string;
  orderId: string;
  captainId: string;
  captainName: string;
  captainPhone: string;
  captainVehicle: string;
  captainRating: number;
  bidAmount: number; // Delivery fee offer proposed by captain in ILS
  estimatedMinutes: number;
  note?: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

import { OrderStatus } from '../utils/mshwarLogic';
export type { OrderStatus };

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'wallet'
  | 'jawwal_pay'
  | 'palpay'
  | 'bank_of_palestine';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'pending_review'
  | 'rejected';

export interface PaymentReceipt {
  receiptUrl: string; // Base64 or URL
  referenceNumber?: string;
  senderName?: string;
  notes?: string;
  uploadedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface OrderRating {
  id: string;
  orderId: string;
  orderNumber: string;
  restaurantId?: string;
  restaurantNameAr: string;
  captainId?: string;
  captainName?: string;
  foodQualityRating: number; // 1 to 5 stars
  deliverySpeedRating: number; // 1 to 5 stars
  overallRating: number; // average of food & speed
  comment?: string;
  tags: string[];
  customerName: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  area?: string;
  street?: string;
  landmark?: string;
  pickupAddress?: string;
  restaurantId?: string;
  restaurantNameAr: string;
  packageDescription?: string; // For Hamama direct parcel/errand delivery
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  status: OrderStatus;
  orderType: 'delivery' | 'takeaway' | 'dine_in' | 'parcel';
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReceipt?: PaymentReceipt;
  captainId?: string;
  captainName?: string;
  captainPhone?: string;
  captainVehicle?: string;
  createdAt: string;
  elapsedSeconds: number;
  estimatedDeliveryTime: string;
  notes?: string;
  bids: CaptainBid[];
  biddingStatus: 'open' | 'closed';
  selectedBid?: CaptainBid;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  captainLat?: number;
  captainLng?: number;
  isRated?: boolean;
  rating?: OrderRating;
  cashGiven?: number;
  cashChange?: number;
}

export interface WalletTransaction {
  id: string;
  captainId?: string;
  type: 'earning' | 'withdrawal' | 'commission_deduction' | 'bonus';
  titleAr: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'rejected';
  referenceId: string;
  method: 'jawwal_pay' | 'bank_of_palestine' | 'palpay' | 'cash_office';
  accountDetail?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Captain {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  rating: number;
  ratingsCount?: number;
  deliverySpeedAvg?: number;
  isOnline: boolean;
  currentLat: number;
  currentLng: number;
  walletBalance: number;
  pendingTransfersAmount: number;
  completedOrdersCount: number;
  dailyDeliveriesCount: number;
  dailyDeliveryRevenue: number;
  dailyFoodCashCollected: number;
  commissionRatePercent: number;
  platformOwedAmount: number;
  isCommissionSettledToday: boolean;
  lastSettlementTime?: string;
  transactions: WalletTransaction[];
}

export interface DeliveryZone {
  id: string;
  nameAr: string;
  deliveryFee: number;
  estimatedMinutes: string;
  isActive: boolean;
}

export interface PlatformSettings {
  commissionRatePercent: number;
  minimumWithdrawal: number;
  serviceFeePercent: number;
  currency: string;
  // Manual transfer accounts
  jawwalPayNumber: string;
  palPayNumber: string;
  bopIban: string;
  bopAccountName: string;
  transferInstructionsAr: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: AppRole;
  action: string;
  details: string;
}
