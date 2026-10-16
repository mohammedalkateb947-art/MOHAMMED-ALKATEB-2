import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Printer,
  Trash2,
  Plus,
  Minus,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  CheckCircle,
  X,
  Clock,
  Eye,
  Check,
  AlertTriangle,
  FileText,
  Search,
  Filter,
} from 'lucide-react';
import { useMshwar } from '../../context/MshwarContext';
import { FoodItem, Order, PaymentMethod } from '../../types';
import { calculateCashChange } from '../../utils/mshwarLogic';

export const CashierView: React.FC = () => {
  const {
    foodItems,
    cashierCart,
    cashierAddToCart,
    cashierRemoveFromCart,
    cashierClearCart,
    cashierSubmitOrder,
    orders,
    reviewPaymentReceipt,
    currentUser,
    showToast,
  } = useMshwar();

  const [activeTab, setActiveTab] = useState<'pos' | 'receipts_review' | 'all_invoices'>('receipts_review');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<number>(100);
  const [lastSubmittedOrder, setLastSubmittedOrder] = useState<Order | null>(null);

  // Receipts Review State
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const subtotal = cashierCart.reduce((acc, i) => acc + i.foodItem.price * i.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? 5 : 0;
  const total = subtotal + deliveryFee;
  const changeResult = calculateCashChange(total, cashGiven);

  const filteredFoods = foodItems.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  const pendingReceiptOrders = orders.filter((o) => o.paymentStatus === 'pending_review');
  const allManualPaidOrders = orders.filter(
    (o) => o.paymentMethod === 'jawwal_pay' || o.paymentMethod === 'palpay' || o.paymentMethod === 'bank_of_palestine'
  );

  const handleCompleteOrder = async () => {
    if (cashierCart.length === 0) return;
    const ord = await cashierSubmitOrder(orderType, paymentMethod, cashGiven);
    setLastSubmittedOrder(ord);
  };

  const handleApproveReceipt = async (orderId: string) => {
    setIsProcessing(true);
    await reviewPaymentReceipt(orderId, 'approve', currentUser.name);
    setIsProcessing(false);
    setSelectedReceiptOrder(null);
  };

  const handleRejectReceipt = async () => {
    if (!selectedReceiptOrder) return;
    if (!rejectionReasonInput.trim()) {
      showToast('يرجى كتابة سبب الرفض');
      return;
    }
    setIsProcessing(true);
    await reviewPaymentReceipt(selectedReceiptOrder.id, 'reject', currentUser.name, rejectionReasonInput.trim());
    setIsProcessing(false);
    setIsRejectModalOpen(false);
    setRejectionReasonInput('');
    setSelectedReceiptOrder(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-right space-y-6">
      {/* Cashier Top Banner */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-700 to-purple-900 text-white flex items-center justify-center font-bold shadow-md shadow-purple-900/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900">
                منظومة الكاشير ونقاط البيع والتدقيق المالي (Cashier POS & Audit)
              </h1>
              {pendingReceiptOrders.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-black animate-pulse">
                  {pendingReceiptOrders.length} إشعارات دفع معلقة
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              إصدار الفواتير الفورية ومراجعة وتدقيق إشعارات التحويل البنكي ومحافظ جوال باي وبال بي
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('receipts_review')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'receipts_review'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>تدقيق إشعارات الدفع ({pendingReceiptOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>نقطة البيع (POS)</span>
          </button>

          <button
            onClick={() => setActiveTab('all_invoices')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all_invoices'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>سجل الفواتير</span>
          </button>
        </div>
      </div>

      {/* TAB 1: RECEIPTS REVIEW (تدقيق إشعارات التحويل) */}
      {activeTab === 'receipts_review' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-700 animate-spin" />
                  <span>الإشعارات المعلقة بانتظار الاعتماد المالي ({pendingReceiptOrders.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  قم بمطابقة رقم المرجع وصورة الإشعار مع حساب المحفظة البنكية قبل الموافقة لبدء تحضير الطعام
                </p>
              </div>
            </div>

            {pendingReceiptOrders.length === 0 ? (
              <div className="py-16 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-100">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">جميع إشعارات الدفع تم تدقيقها!</h4>
                <p className="text-xs text-slate-400">لا توجد طلبات معلقة بانتظار التحقق المالي حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingReceiptOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 bg-white border-2 border-purple-200 rounded-3xl shadow-sm hover:border-purple-400 transition-all space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                        <span className="font-mono font-black text-slate-900 text-sm">
                          #{ord.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                          بانتظار المراجعة
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">العميل:</span>
                          <span className="font-bold text-slate-900">{ord.customerName} ({ord.customerPhone})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">طريقة الدفع:</span>
                          <span className="font-bold text-purple-700">
                            {ord.paymentMethod === 'jawwal_pay'
                              ? 'محفظة جوال باي (Jawwal Pay)'
                              : ord.paymentMethod === 'palpay'
                              ? 'محفظة بال بي (PalPay)'
                              : 'بنك فلسطين (BOP)'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">المبلغ الإجمالي:</span>
                          <span className="font-black text-emerald-700 text-sm">{ord.total} ₪</span>
                        </div>
                        {ord.paymentReceipt?.referenceNumber && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">رقم المرجع:</span>
                            <span className="font-mono font-bold text-slate-800">{ord.paymentReceipt.referenceNumber}</span>
                          </div>
                        )}
                      </div>

                      {/* Receipt Preview Thumbnail */}
                      {ord.paymentReceipt?.receiptUrl && (
                        <div
                          onClick={() => setSelectedReceiptOrder(ord)}
                          className="relative h-32 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer group shadow-2xs"
                        >
                          <img
                            src={ord.paymentReceipt.receiptUrl}
                            alt="إشعار الدفع"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <Eye className="w-4 h-4" />
                            <span>تكبير الإشعار</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cashier Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        disabled={isProcessing}
                        onClick={() => handleApproveReceipt(ord.id)}
                        className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>اعتماد وإرسال للمطبخ</span>
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => {
                          setSelectedReceiptOrder(ord);
                          setIsRejectModalOpen(true);
                        }}
                        className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>رفض</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: POINT OF SALE (POS) */}
      {activeTab === 'pos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">نوع الطلب:</span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setOrderType('dine_in')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  orderType === 'dine_in' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>تناول بالصالة</span>
              </button>
              <button
                onClick={() => setOrderType('takeaway')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  orderType === 'takeaway' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>سفري (استلام)</span>
              </button>
              <button
                onClick={() => setOrderType('delivery')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  orderType === 'delivery' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>توصيل ديليفري</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Food Grid (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'all', nameAr: 'الكل' },
                  { id: 'burger', nameAr: 'برغر' },
                  { id: 'pizza', nameAr: 'بيتزا' },
                  { id: 'chicken', nameAr: 'دجاج' },
                  { id: 'sushi', nameAr: 'سوشي' },
                  { id: 'shawarma', nameAr: 'شاورما' },
                  { id: 'grills', nameAr: 'مشاوي' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {cat.nameAr}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => cashierAddToCart(food)}
                    className="p-3 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl shadow-2xs hover:shadow-md transition-all text-right flex flex-col justify-between h-44 cursor-pointer group"
                  >
                    <div className="relative w-full h-24 mb-2 overflow-hidden rounded-xl">
                      <img
                        src={food.imageUrl}
                        alt={food.nameAr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-emerald-900/80 text-white text-[10px] font-bold">
                        {food.price} ₪
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{food.nameAr}</h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {food.calories} سعرة • {food.prepTimeMinutes} دقيقة
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* POS Ticket Cart (1 Col) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between min-h-[500px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">فاتورة الطلب</h3>
                    <span className="text-[11px] text-slate-400">
                      {orderType === 'dine_in' ? 'تناول بالصالة' : orderType === 'takeaway' ? 'استلام سفري' : 'توصيل ديليفري'}
                    </span>
                  </div>
                  {cashierCart.length > 0 && (
                    <button
                      onClick={cashierClearCart}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>تفريغ</span>
                    </button>
                  )}
                </div>

                {cashierCart.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    لم يتم إضافة وجبات بعد
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                    {cashierCart.map((item) => (
                      <div
                        key={item.foodItem.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <span className="font-bold text-slate-800 truncate block">
                            {item.foodItem.nameAr}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            {item.foodItem.price} ₪ × {item.quantity} = {item.foodItem.price * item.quantity} ₪
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => cashierRemoveFromCart(item.foodItem.id)}
                            className="w-5 h-5 rounded bg-white text-slate-600 flex items-center justify-center hover:bg-rose-100 hover:text-rose-700"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => cashierAddToCart(item.foodItem)}
                            className="w-5 h-5 rounded bg-emerald-700 text-white flex items-center justify-center hover:bg-emerald-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment & Submit */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>المجموع الفرعي:</span>
                    <span className="font-bold">{subtotal} ₪</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>أجرة التوصيل:</span>
                      <span className="font-bold">{deliveryFee} ₪</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
                    <span>المبلغ المستحق:</span>
                    <span className="text-emerald-800 text-base">{total} ₪</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    نقدي (كاش)
                  </button>
                  <button
                    onClick={() => setPaymentMethod('jawwal_pay')}
                    className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                      paymentMethod === 'jawwal_pay'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    جوال باي
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    بطاقة بنكية
                  </button>
                </div>

                {paymentMethod === 'cash' && (
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">المبلغ المستلم:</span>
                      <input
                        type="number"
                        value={cashGiven}
                        onChange={(e) => setCashGiven(Number(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-center font-bold text-slate-900 font-mono"
                      />
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-600">الباقي للعميل (الفكة):</span>
                      <span className={changeResult.isValid ? 'text-emerald-700 font-mono' : 'text-rose-600'}>
                        {changeResult.isValid ? `${changeResult.change} ₪` : 'المبلغ غير كافٍ'}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  disabled={cashierCart.length === 0 || (paymentMethod === 'cash' && !changeResult.isValid)}
                  onClick={handleCompleteOrder}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-xs rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة وإرسال لشاشة المطبخ (KDS)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ALL INVOICES & MANUAL TRANSFERS */}
      {activeTab === 'all_invoices' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900">سجل الفواتير والدفع الإلكتروني</h3>
            <span className="text-xs text-slate-500 font-bold">{allManualPaidOrders.length} فواتير مدفوعة</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="pb-3 pr-2">رقم الفاتورة</th>
                  <th className="pb-3">العميل</th>
                  <th className="pb-3">طريقة الدفع</th>
                  <th className="pb-3">الإجمالي</th>
                  <th className="pb-3">حالة الاعتماد</th>
                  <th className="pb-3">رقم المرجع</th>
                  <th className="pb-3">المدقق</th>
                  <th className="pb-3 pl-2 text-left">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allManualPaidOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pr-2 font-mono font-bold text-slate-900">#{ord.orderNumber}</td>
                    <td className="py-3">
                      <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{ord.customerPhone}</span>
                    </td>
                    <td className="py-3 font-semibold text-slate-700">
                      {ord.paymentMethod === 'jawwal_pay' ? 'جوال باي' : ord.paymentMethod === 'palpay' ? 'بال بي' : 'بنك فلسطين'}
                    </td>
                    <td className="py-3 font-black text-emerald-800">{ord.total} ₪</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.paymentStatus === 'pending_review'
                            ? 'bg-amber-100 text-amber-900 animate-pulse'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {ord.paymentStatus === 'paid' ? 'معتمد' : ord.paymentStatus === 'pending_review' ? 'قيد المراجعة' : 'مرفوض'}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-500">
                      {ord.paymentReceipt?.referenceNumber || '-'}
                    </td>
                    <td className="py-3 text-[11px] text-slate-600">
                      {ord.paymentReceipt?.reviewedBy ? (
                        <span>{ord.paymentReceipt.reviewedBy} ({ord.paymentReceipt.reviewedAt})</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 pl-2 text-left">
                      {ord.paymentReceipt?.receiptUrl && (
                        <button
                          onClick={() => setSelectedReceiptOrder(ord)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          عرض الإشعار
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW RECEIPT DETAILS */}
      {selectedReceiptOrder && !isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs text-right animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-700" />
                <h3 className="text-base font-black text-slate-900">
                  إشعار سداد الطلب #{selectedReceiptOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-2xl grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">اسم المحول:</span>
                  <span className="font-bold text-slate-900">{selectedReceiptOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">المبلغ المطلوب:</span>
                  <span className="font-black text-emerald-800 text-sm">{selectedReceiptOrder.total} ₪</span>
                </div>
                <div>
                  <span className="text-slate-400 block">طريقة التحويل:</span>
                  <span className="font-bold text-purple-800">{selectedReceiptOrder.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">وقت الإرسال:</span>
                  <span className="text-slate-700">{selectedReceiptOrder.paymentReceipt?.uploadedAt || 'الآن'}</span>
                </div>
              </div>

              {selectedReceiptOrder.paymentReceipt?.receiptUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-80 flex items-center justify-center bg-slate-900">
                  <img
                    src={selectedReceiptOrder.paymentReceipt.receiptUrl}
                    alt="صورة الإشعار"
                    className="max-h-80 w-auto object-contain"
                  />
                </div>
              )}
            </div>

            {selectedReceiptOrder.paymentStatus === 'pending_review' && (
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  disabled={isProcessing}
                  onClick={() => handleApproveReceipt(selectedReceiptOrder.id)}
                  className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>اعتماد الدفع وإرسال للمطبخ</span>
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => setIsRejectModalOpen(true)}
                  className="px-5 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl cursor-pointer"
                >
                  رفض الإشعار
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: REJECTION REASON */}
      {isRejectModalOpen && selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs text-right animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-black">سبب رفض إشعار السداد</h4>
            </div>
            <p className="text-xs text-slate-500">
              اكتب سبب الرفض لتوضيحه للعميل في شاشة التتبع لإعادة إرسال الإشعار الصحيح.
            </p>
            <textarea
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              rows={3}
              placeholder="مثال: رقم الحوالة غير مطابق، أو المبلغ المدفوع أقل من المطلوب..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center gap-2 pt-2">
              <button
                disabled={isProcessing}
                onClick={handleRejectReceipt}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl cursor-pointer shadow-xs"
              >
                تأكيد الرفض
              </button>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LAST SUBMITTED RECEIPT */}
      {lastSubmittedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-right space-y-4 animate-fadeIn">
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h3 className="text-base font-black text-slate-900">إيصال استلام الطلب</h3>
              <p className="text-[11px] text-slate-500">منظومة نقاط البيع المباشرة</p>
              <p className="text-xs font-mono font-bold mt-1 text-emerald-800">#{lastSubmittedOrder.orderNumber}</p>
            </div>
            <div className="space-y-1.5 text-xs text-slate-700">
              {lastSubmittedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {it.quantity}x {it.foodItem.nameAr}
                  </span>
                  <span className="font-bold">{it.foodItem.price * it.quantity} ₪</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-dashed border-slate-300 space-y-1 text-xs">
              <div className="flex justify-between font-black text-slate-900 text-sm">
                <span>المجموع الكلي:</span>
                <span className="text-emerald-800">{lastSubmittedOrder.total} ₪</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>طريقة الدفع:</span>
                <span>{lastSubmittedOrder.paymentMethod === 'cash' ? 'نقدي (كاش)' : 'دفع إلكتروني'}</span>
              </div>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-center text-xs text-emerald-800 font-bold">
              تم إرسال التذكرة فورياً إلى شاشة المطبخ KDS
            </div>
            <button
              onClick={() => setLastSubmittedOrder(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              إغلاق الإيصال
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
