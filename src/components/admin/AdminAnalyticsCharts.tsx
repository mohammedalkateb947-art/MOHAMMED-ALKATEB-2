import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, TrendingUp, Bike, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { Captain } from '../../types';

interface AdminAnalyticsChartsProps {
  captains: Captain[];
}

export const AdminAnalyticsCharts: React.FC<AdminAnalyticsChartsProps> = ({ captains }) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly'>('daily');

  // Daily revenue & commission trend data (7 days)
  const dailyData = [
    { name: 'السبت', gmv: 850, commission: 127.5, deliveryFees: 180, orders: 42, parcels: 12 },
    { name: 'الأحد', gmv: 920, commission: 138.0, deliveryFees: 210, orders: 48, parcels: 15 },
    { name: 'الإثنين', gmv: 780, commission: 117.0, deliveryFees: 165, orders: 39, parcels: 10 },
    { name: 'الثلاثاء', gmv: 1100, commission: 165.0, deliveryFees: 240, orders: 55, parcels: 18 },
    { name: 'الأربعاء', gmv: 990, commission: 148.5, deliveryFees: 215, orders: 50, parcels: 14 },
    { name: 'الخميس', gmv: 1450, commission: 217.5, deliveryFees: 320, orders: 74, parcels: 22 },
    { name: 'الجمعة (اليوم)', gmv: 1680, commission: 252.0, deliveryFees: 380, orders: 86, parcels: 28 },
  ];

  // Weekly data (Past 4 weeks)
  const weeklyData = [
    { name: 'أسبوع 1', gmv: 5400, commission: 810, deliveryFees: 1250, orders: 280, parcels: 75 },
    { name: 'أسبوع 2', gmv: 6200, commission: 930, deliveryFees: 1420, orders: 315, parcels: 90 },
    { name: 'أسبوع 3', gmv: 7100, commission: 1065, deliveryFees: 1600, orders: 360, parcels: 110 },
    { name: 'أسبوع 4 (الحالي)', gmv: 8450, commission: 1267.5, deliveryFees: 1910, orders: 430, parcels: 135 },
  ];

  const currentChartData = timeframe === 'daily' ? dailyData : weeklyData;

  // Category distribution
  const categoryData = [
    { name: 'برغر وسندويشات', value: 38, color: '#10b981' },
    { name: 'بيتزا إيطالية', value: 26, color: '#059669' },
    { name: 'دجاج مقرمش وبروستد', value: 22, color: '#f59e0b' },
    { name: 'سوشي ومأكولات بحرية', value: 14, color: '#6366f1' },
  ];

  // Captain Performance Data derived from actual captains in state
  const captainPerformanceData = captains.map((c) => ({
    name: c.name.split(' ')[0],
    fullName: c.name,
    deliveries: c.dailyDeliveriesCount,
    deliveryRevenue: c.dailyDeliveryRevenue,
    platformCommission: c.platformOwedAmount,
    netProfit: c.dailyDeliveryRevenue - c.platformOwedAmount,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-right text-xs space-y-1 font-sans">
          <p className="font-black text-amber-300 pb-1 border-b border-slate-800">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="flex justify-between gap-3 text-[11px]">
              <span className="text-slate-300">{item.name}:</span>
              <span className="font-bold font-mono" style={{ color: item.color }}>
                {item.value} {item.unit || '₪'}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 text-right">
      {/* Timeframe Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              مؤشرات الأداء المالي والتشغيلي المباشر
            </h3>
            <p className="text-[11px] text-slate-500">
              تحليل إجمالي قيمة البضائع (GMV)، العمولات المحققة، وحجم طلبات الطعام والطرود
            </p>
          </div>
        </div>

        {/* Daily / Weekly Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setTimeframe('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeframe === 'daily'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            يومي (7 أيام)
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeframe === 'weekly'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            أسبوعي (شهر)
          </button>
        </div>
      </div>

      {/* Grid 1: Revenue & Commission Growth (AreaChart) + Orders Volume (BarChart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue vs Platform Commission */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>إجمالي المبيعات وعمولة المنصة (15%)</span>
              </h4>
              <span className="text-[10px] text-slate-400">
                مقارنة بين إجمالي مبيعات الطعام والطرود (GMV) وصافي عمولة تطبيق مشوار
              </span>
            </div>
            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg">
              {timeframe === 'daily' ? '+22.4% هذا الأسبوع' : '+38.5% هذا الشهر'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gmvGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="commGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} unit=" ₪" />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="left"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="gmv"
                  name="إجمالي المبيعات (GMV)"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gmvGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="commission"
                  name="عمولة المنصة (15%)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#commGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Order Counts & Parcel Distribution */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>حجم الطلبات (وجبات المطاعم مقابل الطرود)</span>
              </h4>
              <span className="text-[10px] text-slate-400">
                عدد الطلبات المنفذة بنجاح موزعة حسب نوع الخدمة
              </span>
            </div>
            <span className="text-xs font-black text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg">
              إجمالي اليوم: 114 طلب
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="left"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="orders" name="طلبات المطاعم" fill="#047857" radius={[6, 6, 0, 0]} />
                <Bar dataKey="parcels" name="توصيل طرود خاصة" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid 2: Captain Financials Comparison + Service Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 3: Captains Earnings & Commission (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-emerald-600" />
                <span>مقارنة أداء وإيرادات كباتن مشوار اليوم</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                إجمالي إيراد التوصيل للكابتن مقابل عمولة المنصة المستحقة
              </p>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold">
              {captains.length} كباتن نشطين
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={captainPerformanceData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} unit=" ₪" />
                <YAxis
                  dataKey="fullName"
                  type="category"
                  tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 'bold' }}
                  width={90}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="left"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="deliveryRevenue" name="إيراد التوصيل" fill="#10b981" radius={[0, 6, 6, 0]} />
                <Bar dataKey="platformCommission" name="عمولة مشوار (15%)" fill="#f43f5e" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Categories Share (Donut PieChart) (1 Col) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-purple-600" />
              <span>أصناف الوجبات الأكثر طلباً</span>
            </h4>
            <span className="text-[10px] text-slate-400">نسبة المبيعات</span>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'النسبة']}
                  contentStyle={{ direction: 'rtl', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {categoryData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 text-[11px]">{item.name}</span>
                </div>
                <span className="font-bold font-mono text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
