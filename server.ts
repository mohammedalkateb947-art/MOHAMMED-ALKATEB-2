import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db';
import { AppRole, Order, OrderStatus } from './src/types/index';
import { calculateCartSummary, canTransitionOrder } from './src/utils/mshwarLogic';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Large payload limit for base64 transfer receipt images
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // --- REST API ROUTES ---
  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'Mshwar Food Delivery Engine', time: new Date().toISOString() });
  });

  // --- AUTHENTICATION ---
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { identifier, password, role } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف' });
    }
    const clean = identifier.trim().toLowerCase();
    let user = db.getUserByEmail(clean) || db.getUserByPhone(clean);

    if (!user) {
      if (role === 'customer' || !role) {
        user = {
          id: `usr-${Date.now()}`,
          name: clean.includes('@') ? clean.split('@')[0] : 'عميل جديد',
          email: clean.includes('@') ? clean : `${clean}@mshwar.ps`,
          phone: clean.match(/^\d+$/) ? clean : '0599000000',
          role: 'customer',
          address: 'غزة، الرمال',
          createdAt: new Date().toISOString(),
        };
        db.createUser(user);
      } else {
        return res.status(401).json({ error: 'الحساب غير موجود، يرجى إنشاء حساب جديد' });
      }
    }

    const token = `mshwar_jwt_${user.id}_${Date.now()}`;
    res.json({ user, token, message: 'تم تسجيل الدخول بنجاح' });
  });

  app.post('/api/auth/register', async (req: Request, res: Response) => {
    const { name, email, phone, role = 'customer', address, restaurantId } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'الاسم ورقم الهاتف مطلوبان' });
    }

    const existing = db.getUserByPhone(phone) || (email && db.getUserByEmail(email));
    if (existing) {
      return res.status(409).json({ error: 'المستخدم مسجل مسبقاً برقم الهاتف أو البريد هذا' });
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : `${phone}@mshwar.ps`,
      phone: phone.trim(),
      role: role as AppRole,
      address: address?.trim() || 'غزة',
      restaurantId,
      createdAt: new Date().toISOString(),
    };

    await db.createUser(newUser);
    const token = `mshwar_jwt_${newUser.id}_${Date.now()}`;
    res.status(201).json({ user: newUser, token, message: 'تم إنشاء الحساب بنجاح' });
  });

  app.get('/api/auth/users', (_req: Request, res: Response) => {
    res.json(db.getUsers());
  });

  // --- RESTAURANTS ---
  app.get('/api/restaurants', (_req: Request, res: Response) => {
    res.json(db.getRestaurants());
  });

  app.get('/api/restaurants/:id', (req: Request, res: Response) => {
    const r = db.getRestaurantById(req.params.id);
    if (!r) return res.status(404).json({ error: 'المطعم غير موجود' });
    res.json(r);
  });

  app.patch('/api/restaurants/:id', async (req: Request, res: Response) => {
    const updated = await db.updateRestaurant(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'المطعم غير موجود' });
    res.json(updated);
  });

  // --- MENU ITEMS ---
  app.get(['/api/menu', '/api/foods'], (req: Request, res: Response) => {
    const restaurantId = req.query.restaurantId as string | undefined;
    res.json(db.getFoodItems(restaurantId));
  });

  app.post('/api/menu', async (req: Request, res: Response) => {
    const item = req.body;
    if (!item.nameAr || !item.price || !item.restaurantId) {
      return res.status(400).json({ error: 'اسم الوجبة والسعر والمطعم حقول إلزامية' });
    }
    const newItem = {
      ...item,
      id: item.id || `food-${Date.now()}`,
      price: Number(item.price),
      calories: Number(item.calories || 350),
      prepTimeMinutes: Number(item.prepTimeMinutes || 12),
      rating: 5.0,
      ratingCount: 1,
      isAvailable: item.isAvailable !== false,
    };
    await db.createFoodItem(newItem);
    res.status(201).json(newItem);
  });

  app.patch('/api/menu/:id', async (req: Request, res: Response) => {
    const updated = await db.updateFoodItem(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'الوجبة غير موجودة' });
    res.json(updated);
  });

  app.delete('/api/menu/:id', async (req: Request, res: Response) => {
    const deleted = await db.deleteFoodItem(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'الوجبة غير موجودة' });
    res.json({ success: true, message: 'تم حذف الوجبة بنجاح' });
  });

  // --- ORDERS ---
  app.get('/api/orders', (req: Request, res: Response) => {
    const status = req.query.status as OrderStatus | undefined;
    const restaurantId = req.query.restaurantId as string | undefined;
    const captainId = req.query.captainId as string | undefined;
    const customerPhone = req.query.customerPhone as string | undefined;
    res.json(db.getOrders({ status, restaurantId, captainId, customerPhone }));
  });

  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const ord = db.getOrderById(req.params.id);
    if (!ord) return res.status(404).json({ error: 'الطلب غير موجود' });
    res.json(ord);
  });

  app.post('/api/orders', async (req: Request, res: Response) => {
    const body = req.body;
    if (!body.customerName || !body.customerPhone) {
      return res.status(400).json({ error: 'الاسم ورقم هاتف العميل مطلوبان' });
    }

    const orderNumber = body.orderType === 'parcel'
      ? `HAM-${Math.floor(1000 + Math.random() * 9000)}`
      : `MSH-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderNumber,
      customerName: body.customerName.trim(),
      customerPhone: body.customerPhone.trim(),
      customerAddress: body.customerAddress || 'غزة',
      area: body.area || 'الرمال',
      street: body.street,
      landmark: body.landmark,
      pickupAddress: body.pickupAddress || body.restaurantNameAr || 'غزة',
      restaurantId: body.restaurantId || 'rest-1',
      restaurantNameAr: body.restaurantNameAr || 'برغر هانت | Burger Hunt',
      packageDescription: body.packageDescription,
      items: body.items || [],
      subtotal: Number(body.subtotal) || 0,
      discount: Number(body.discount) || 0,
      deliveryFee: Number(body.deliveryFee) || 8,
      serviceFee: Number(body.serviceFee) || 2,
      total: Number(body.total) || 10,
      status: body.requestBidding ? 'bidding_open' : 'placed',
      orderType: body.orderType || 'delivery',
      paymentMethod: body.paymentMethod || 'cash',
      paymentStatus: body.paymentStatus || (body.paymentMethod === 'cash' ? 'pending' : body.paymentReceipt ? 'pending_review' : 'paid'),
      paymentReceipt: body.paymentReceipt,
      createdAt: 'الآن',
      elapsedSeconds: 0,
      estimatedDeliveryTime: body.requestBidding ? 'مطلوب عروض كباتن' : '20-30 دقيقة',
      notes: body.notes,
      bids: body.bids || [],
      biddingStatus: body.requestBidding ? 'open' : 'closed',
      pickupLat: body.pickupLat || 31.5042,
      pickupLng: body.pickupLng || 34.4648,
      dropoffLat: body.dropoffLat || 31.4965,
      dropoffLng: body.dropoffLng || 34.453,
      captainLat: 31.501,
      captainLng: 34.466,
    };

    if (body.paymentReceipt?.receiptUrl) {
      newOrder.paymentStatus = 'pending_review';
      newOrder.paymentReceipt = {
        ...body.paymentReceipt,
        uploadedAt: 'الآن',
      };
    }

    if (body.requestBidding) {
      newOrder.bids = [
        {
          id: `bid-${Date.now()}-auto`,
          orderId: newOrder.id,
          captainId: 'cap-2',
          captainName: 'محمود الصالحي',
          captainPhone: '0598765432',
          captainVehicle: 'سكوتر كهربائي (#108)',
          captainRating: 4.88,
          bidAmount: Math.max(7, (newOrder.deliveryFee || 8) - 1),
          estimatedMinutes: 16,
          note: 'أصل خلال 16 دقيقة',
          createdAt: 'الآن',
          status: 'pending',
        },
      ];
    }

    await db.createOrder(newOrder);
    res.status(201).json(newOrder);
  });

  app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
    const { status, captainInfo } = req.body;
    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });

    if (!canTransitionOrder(order.status, status)) {
      return res.status(400).json({ error: `لا يمكن تحويل حالة الطلب من ${order.status} إلى ${status}` });
    }

    if (status === 'delivered') {
      const result = await db.recordOrderDelivered(order.id);
      return res.json(result?.order || order);
    }

    const updates: Partial<Order> = { status };
    if (captainInfo) {
      updates.captainId = captainInfo.id;
      updates.captainName = captainInfo.name;
      updates.captainPhone = captainInfo.phone;
      updates.captainVehicle = captainInfo.vehicle;
    }

    const updated = await db.updateOrder(order.id, updates);
    res.json(updated);
  });

  app.post('/api/orders/:id/claim', async (req: Request, res: Response) => {
    const { captainId } = req.body;
    const captain = db.getCaptainById(captainId);
    if (!captain) return res.status(400).json({ error: 'الكابتن غير موجود' });

    const result = await db.claimOrderAtomic(req.params.id, captain);
    if (!result.success) {
      return res.status(409).json({ error: result.message });
    }
    res.json(result.order);
  });

  app.post('/api/orders/:id/bid', async (req: Request, res: Response) => {
    const { captainId, bidAmount, estimatedMinutes, note } = req.body;
    const captain = db.getCaptainById(captainId);
    if (!captain) return res.status(400).json({ error: 'الكابتن غير موجود' });

    const newBid = {
      id: `bid-${Date.now()}-${captain.id}`,
      orderId: req.params.id,
      captainId: captain.id,
      captainName: captain.name,
      captainPhone: captain.phone,
      captainVehicle: captain.vehicle,
      captainRating: captain.rating,
      bidAmount: Number(bidAmount),
      estimatedMinutes: Number(estimatedMinutes),
      note: note || '',
      createdAt: 'الآن',
      status: 'pending' as const,
    };

    const updatedOrder = await db.addCaptainBid(req.params.id, newBid);
    if (!updatedOrder) return res.status(400).json({ error: 'لا يمكن إضافة عرض لهذا الطلب' });
    res.json(updatedOrder);
  });

  app.post('/api/orders/:id/accept-bid', async (req: Request, res: Response) => {
    const { bidId } = req.body;
    const updated = await db.acceptCaptainBid(req.params.id, bidId);
    if (!updated) return res.status(400).json({ error: 'فشل قبول العرض' });
    res.json(updated);
  });

  app.post('/api/orders/:id/receipt', async (req: Request, res: Response) => {
    const { receiptUrl, referenceNumber, senderName, notes } = req.body;
    if (!receiptUrl) return res.status(400).json({ error: 'صورة الإشعار مطلوبة' });

    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });

    order.paymentReceipt = {
      receiptUrl,
      referenceNumber: referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      senderName: senderName || order.customerName,
      notes,
      uploadedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    order.paymentStatus = 'pending_review';

    await db.updateOrder(order.id, {
      paymentReceipt: order.paymentReceipt,
      paymentStatus: 'pending_review',
    });
    res.json(order);
  });

  app.post('/api/orders/:id/review-payment', async (req: Request, res: Response) => {
    const { action, reviewerName, rejectionReason } = req.body;
    if (!action || (action !== 'approve' && action !== 'reject')) {
      return res.status(400).json({ error: 'الإجراء غير صالح (approve أو reject)' });
    }

    const updated = await db.reviewPaymentReceipt(
      req.params.id,
      action,
      reviewerName || 'المحاسب',
      rejectionReason
    );
    if (!updated) return res.status(404).json({ error: 'الطلب غير موجود' });
    res.json(updated);
  });

  // --- CAPTAINS & WALLET ---
  app.get('/api/captains', (_req: Request, res: Response) => {
    res.json(db.getCaptains());
  });

  app.get('/api/captains/:id', (req: Request, res: Response) => {
    const c = db.getCaptainById(req.params.id);
    if (!c) return res.status(404).json({ error: 'الكابتن غير موجود' });
    res.json(c);
  });

  app.patch('/api/captains/:id', async (req: Request, res: Response) => {
    const updated = await db.updateCaptain(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'الكابتن غير موجود' });
    res.json(updated);
  });

  app.post('/api/captains/:id/withdrawal', async (req: Request, res: Response) => {
    const { amount, method, accountDetail } = req.body;
    const tx = await db.requestCaptainWithdrawal(req.params.id, Number(amount), method, accountDetail);
    if (!tx) {
      return res.status(400).json({ error: 'فشل تقديم طلب السحب، تحقق من الرصيد المتاح' });
    }
    res.status(201).json(tx);
  });

  app.post('/api/withdrawals/:id/review', async (req: Request, res: Response) => {
    const { action, reviewerName } = req.body;
    const success = await db.reviewCaptainWithdrawal(req.params.id, action, reviewerName || 'المدير');
    if (!success) return res.status(404).json({ error: 'المعاملة غير موجودة' });
    res.json({ success: true, message: `تم تحديث حالة السحب (${action})` });
  });

  app.post('/api/captains/:id/settle', async (req: Request, res: Response) => {
    const { adminName } = req.body;
    const cap = await db.settleCaptainCommission(req.params.id, adminName || 'الإدارة');
    if (!cap) return res.status(404).json({ error: 'الكابتن غير موجود' });
    res.json(cap);
  });

  // --- REVIEWS & RATINGS ---
  app.get('/api/reviews', (req: Request, res: Response) => {
    const restId = req.query.restaurantId as string | undefined;
    const capId = req.query.captainId as string | undefined;
    res.json(db.getReviews(restId, capId));
  });

  app.post('/api/reviews', async (req: Request, res: Response) => {
    const body = req.body;
    if (!body.orderId || !body.foodQualityRating || !body.deliverySpeedRating) {
      return res.status(400).json({ error: 'التقييمات ومعرف الطلب إلزامية' });
    }

    const overallRating = Math.round(((Number(body.foodQualityRating) + Number(body.deliverySpeedRating)) / 2) * 10) / 10;
    const newReview = {
      id: `rev-${Date.now()}`,
      orderId: body.orderId,
      orderNumber: body.orderNumber || 'MSH-ORDER',
      restaurantId: body.restaurantId,
      restaurantNameAr: body.restaurantNameAr || 'مطعم مشوار',
      captainId: body.captainId,
      captainName: body.captainName,
      foodQualityRating: Number(body.foodQualityRating),
      deliverySpeedRating: Number(body.deliverySpeedRating),
      overallRating,
      comment: body.comment?.trim() || '',
      tags: body.tags || [],
      customerName: body.customerName || 'عميل مشوار',
      createdAt: 'اليوم',
    };

    const saved = await db.createReview(newReview);
    res.status(201).json(saved);
  });

  // --- PLATFORM SETTINGS & ZONES ---
  app.get('/api/settings', (_req: Request, res: Response) => {
    res.json(db.getSettings());
  });

  app.patch('/api/settings', async (req: Request, res: Response) => {
    const updated = await db.updateSettings(req.body);
    res.json(updated);
  });

  app.get('/api/zones', (_req: Request, res: Response) => {
    res.json(db.getDeliveryZones());
  });

  app.post('/api/zones', async (req: Request, res: Response) => {
    const zones = await db.updateDeliveryZones(req.body);
    res.json(zones);
  });

  app.get('/api/admin/metrics', (_req: Request, res: Response) => {
    const orders = db.getOrders();
    const captains = db.getCaptains();
    const restaurants = db.getRestaurants();

    const totalGMV = orders.reduce((sum, o) => sum + o.total, 0);
    const totalDailyDeliveryRevenue = captains.reduce((sum, c) => sum + c.dailyDeliveryRevenue, 0);
    const totalPlatformOwed = captains.reduce((sum, c) => sum + c.platformOwedAmount, 0);
    const totalSettledToday = captains
      .filter((c) => c.isCommissionSettledToday)
      .reduce((sum, c) => sum + c.platformOwedAmount, 0);
    const totalPendingSettlement = totalPlatformOwed - totalSettledToday;

    const pendingReceiptsCount = orders.filter((o) => o.paymentStatus === 'pending_review').length;
    const pendingWithdrawalsCount = captains.reduce(
      (sum, c) => sum + (c.transactions?.filter((t) => t.status === 'pending').length || 0),
      0
    );

    res.json({
      totalOrders: orders.length,
      activeOrders: orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length,
      biddingOrders: orders.filter((o) => o.status === 'bidding_open').length,
      deliveredOrders: orders.filter((o) => o.status === 'delivered').length,
      totalGMV,
      totalDailyDeliveryRevenue,
      totalPlatformOwed,
      totalSettledToday,
      totalPendingSettlement,
      pendingReceiptsCount,
      pendingWithdrawalsCount,
      totalCaptains: captains.length,
      onlineCaptains: captains.filter((c) => c.isOnline).length,
      totalRestaurants: restaurants.length,
    });
  });

  app.get('/api/admin/audit', (_req: Request, res: Response) => {
    res.json(db.getAuditLogs());
  });

  // --- MOUNT VITE MIDDLEWARE (DEV) OR STATIC ASSETS (PROD) ---
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Mshwar Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
  process.exit(1);
});
