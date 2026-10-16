import React from 'react';
import { X, Server, Database, Code, Smartphone, CheckCircle, Info, ShieldCheck, Layers } from 'lucide-react';
import { useMshwar } from '../context/MshwarContext';

export const TechArchitectureModal: React.FC = () => {
  const { isTechModalOpen, setIsTechModalOpen } = useMshwar();

  if (!isTechModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-slate-800 text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                هندسة النظام وقواعد البيانات المستمرة
              </h2>
              <p className="text-xs text-slate-500">
                معمارية Full-Stack متكاملة: خادم Express + مخطط Firebase المستقبلي
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTechModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice on Real Database Persistence */}
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 text-sm flex gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-700 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">قاعدة بيانات حقيقية ومستمرة (Persistent Backend Database):</p>
            <p className="text-xs leading-relaxed text-emerald-900">
              يعمل التطبيق بمحرك بيانات متكامل (<code className="font-mono bg-white/70 px-1 rounded">/server/db.ts</code>) مع خادم Express، حيث يتم حفظ التعديلات والطلبات والكباتن والتقييمات بشكل فوري ودائم في ملف <code className="font-mono bg-white/70 px-1 rounded">/data/mshwar_db.json</code>. البيانات محفوظة بالكامل عند إعادة تحميل الصفحة أو إعادة تشغيل الخادم.
            </p>
          </div>
        </div>

        {/* Integration Blueprint */}
        <div className="mt-6 space-y-5">
          <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            نقاط النهاية والخدمات السحابية (REST Endpoints)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Code className="w-4 h-4 text-emerald-600" />
                المسارات البرمجية المكتملة (REST API):
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 font-mono text-[11px]">
                <li><code>POST /api/auth/login</code> (تسجيل الدخول والمصادقة)</li>
                <li><code>GET /api/restaurants</code> (قائمة المطاعم وتقييماتها)</li>
                <li><code>GET/POST /api/menu</code> (إدارة أصناف الوجبات والأسعار)</li>
                <li><code>POST /api/orders</code> (إنشاء طلبات التوصيل والطرود)</li>
                <li><code>POST /api/orders/:id/claim</code> (استلام الكابتن الآمن)</li>
                <li><code>POST /api/orders/:id/review-payment</code> (اعتماد إشعار التحويل)</li>
                <li><code>POST /api/captains/:id/withdrawal</code> (طلبات سحب الرصيد)</li>
                <li><code>GET /api/admin/metrics</code> (مؤشرات الأداء المالي والتشغيلي)</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Layers className="w-4 h-4 text-emerald-600" />
                الجداول والكيانات المخزنة:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                <li><code>users</code> (العملاء، المطاعم، الكباتن، المحاسب، الإدارة)</li>
                <li><code>orders</code> (بيانات الطلبات وتتبع GPS والإشعارات)</li>
                <li><code>captains</code> (المحافظ الرقمية ونسبة العمولة 15%)</li>
                <li><code>reviews</code> (تقييمات النجوم لجودة الطعام وسرعة التوصيل)</li>
                <li><code>audit_logs</code> (سجل تدقيق العمليات الأمنية والمالية)</li>
              </ul>
            </div>
          </div>

          {/* Firebase Layer Blueprint */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-blue-950">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              جاهزية الربط مع Firebase (Firestore & Authentication):
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              تم تضمين ملف <code className="font-mono bg-white px-1 rounded">/src/services/firebaseConfig.ts</code> بحيث يدعم الربط السريع مع Firebase بمجرد إضافة المفاتيح في <code className="font-mono bg-white px-1 rounded">.env</code> دون الحاجة لإعادة كتابة كود الواجهات.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setIsTechModalOpen(false)}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
