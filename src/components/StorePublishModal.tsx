import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Globe,
  Download,
  CheckCircle,
  Copy,
  Terminal,
  Play,
  Layers,
} from 'lucide-react';
import { useMshwar } from '../context/MshwarContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const StorePublishModal: React.FC = () => {
  const { isStoreModalOpen, setIsStoreModalOpen, showToast } = useMshwar();
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'google_play' | 'chrome_pwa' | 'manifest_view'>('google_play');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isStoreModalOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    showToast(`تم نسخ ${label} إلى الحافظة`);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const bubblewrapCode = `# 1. تثبيت أداة تحويل PWA إلى تطبيق Google Play (TWA):
npm install -g @bubblewrap/cli

# 2. إنشاء المشروع باستخدام manifest.json للتطبيق:
bubblewrap init --manifest=https://[YOUR_DOMAIN]/manifest.json

# 3. بناء حزمة التطبيق (Android App Bundle .aab):
bubblewrap build

# 4. رفع ملف .aab إلى Google Play Console للإطلاق`;

  const assetLinksCode = `[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "ps.mshwar.app",
    "sha256_cert_fingerprints": [
      "14:6D:E9:A5:0F:45:72:71:11:A6:8D:89:29:E9:E9:..."
    ]
  }
}]`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-slate-800 text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                إرشادات النشر على Google Play ومتصفح Chrome
              </h2>
              <p className="text-xs text-slate-500">
                جاهزية تطبيق ويب تقدمي Progressive Web App (PWA) وتوليد حزم (TWA APK / AAB)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsStoreModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('google_play')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'google_play'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Play className="w-4 h-4 fill-emerald-700 text-emerald-700" />
              <span>متجر Google Play (أندرويد)</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('chrome_pwa')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'chrome_pwa'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>تثبيت Chrome & آيفون (PWA)</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('manifest_view')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'manifest_view'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>ملف Manifest</span>
            </span>
          </button>
        </div>

        {/* TAB 1: GOOGLE PLAY STORE */}
        {activeTab === 'google_play' && (
          <div className="mt-5 space-y-4 text-xs leading-relaxed text-slate-700">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-black text-emerald-950 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>المعايير المكتملة لنشر Google Play عبر تقنية TWA (Trusted Web Activity)</span>
              </div>
              <p className="text-emerald-900 text-xs">
                يحتوي المشروع على ملف <code className="font-mono bg-white px-1 rounded">manifest.json</code> وأيقونات Maskable بمقاسات 192x192 و 512x512، مما يتيح توليد ملف (<code className="font-mono bg-white px-1 rounded">.aab</code>) لرفعه مباشرة إلى <strong>Google Play Console</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-slate-600" />
                  أوامر الإنشاء بواسطة Google Bubblewrap:
                </span>
                <button
                  onClick={() => copyToClipboard(bubblewrapCode, 'أوامر Bubblewrap')}
                  className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedText === 'أوامر Bubblewrap' ? 'تم النسخ!' : 'نسخ الأوامر'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto text-left dir-ltr">
                {bubblewrapCode}
              </pre>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <h4 className="font-bold text-slate-900">
                الربط الرقمي الموثوق مع الدومين (Digital Asset Links):
              </h4>
              <p className="text-slate-600 text-[11px]">
                يتم رفع الملف في المسار: <code className="font-mono bg-white px-1 rounded">/.well-known/assetlinks.json</code>
              </p>
              <pre className="p-3 bg-slate-900 text-slate-300 font-mono text-[10px] rounded-xl overflow-x-auto text-left dir-ltr">
                {assetLinksCode}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 2: CHROME & DIRECT PWA */}
        {activeTab === 'chrome_pwa' && (
          <div className="mt-5 space-y-4 text-xs leading-relaxed text-slate-700">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-black text-slate-900 text-sm">تثبيت التطبيق مباشرة على متصفح Chrome</h4>
                <p className="text-slate-600 text-xs">
                  {isInstalled
                    ? 'التطبيق مثبت حالياً في وضع الشاشة الكاملة (Standalone Mode)!'
                    : 'يمكن للمستخدمين تثبيت التطبيق بضغطة زر واحدة بدون تنزيل من متجر خارجي.'}
                </p>
              </div>
              {isInstallable && (
                <button
                  onClick={install}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer shrink-0"
                >
                  تثبيت مشوار الآن
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                <h5 className="font-bold text-slate-900">مميزات التثبيت على Google Chrome:</h5>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  <li>تشغيل سريع وفوري بدون شريط عناوين المتصفح.</li>
                  <li>حفظ الجلسة والطلبات والبيانات محلياً.</li>
                  <li>دعم كامل لاتجاه RTL واللغة العربية.</li>
                </ul>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                <h5 className="font-bold text-slate-900">التثبيت على آيفون (iOS Safari):</h5>
                <p className="text-slate-600 text-[11px]">
                  اضغط على زر <strong>مشاركة (Share)</strong> في سفاري ثم اختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong> للحصول على أيقونة مشوار المخصصة.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANIFEST FILE VIEW */}
        {activeTab === 'manifest_view' && (
          <div className="mt-5 space-y-4 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">محتوى ملف /public/manifest.json الحقيقي:</span>
              <a
                href="/manifest.json"
                download="manifest.json"
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل الملف</span>
              </a>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-2xl overflow-x-auto text-left dir-ltr max-h-64">
              {JSON.stringify(
                {
                  id: '/',
                  name: 'مشوار | Mshwar Delivery',
                  short_name: 'مشوار',
                  display: 'standalone',
                  theme_color: '#1b4332',
                  background_color: '#ffffff',
                  dir: 'rtl',
                  lang: 'ar',
                  icons: [
                    { src: '/icon.svg', sizes: '192x192 512x512', type: 'image/svg+xml', purpose: 'any' },
                    { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
                  ],
                },
                null,
                2
              )}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
          <span className="text-[11px] text-slate-400">
            معايير PWA و Trusted Web Activities متوافقة مع متطلبات 2026
          </span>
          <button
            onClick={() => setIsStoreModalOpen(false)}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
