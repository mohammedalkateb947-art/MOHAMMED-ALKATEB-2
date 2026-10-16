export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const firebaseConfig: FirebaseClientConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mshwar-delivery-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
};

export const FIREBASE_SETUP_GUIDE = {
  titleAr: 'تكامل Firebase Firestore والمصادقة المتقدمة',
  stepsAr: [
    '1. إنشاء مشروع جديد في Firebase Console (https://console.firebase.google.com)',
    '2. تفعيل Firebase Authentication واختيار طرق تسجيل الدخول (Email/Password و Phone)',
    '3. إنشاء قاعدة بيانات Cloud Firestore بنمط الإنتاج (Production Mode)',
    '4. تسجيل تطبيق ويب (Web App) وإضافة المتغيرات البيئية التالية في .env:',
    '   VITE_FIREBASE_API_KEY=AIzaSy...',
    '   VITE_FIREBASE_AUTH_DOMAIN=mshwar-app.firebaseapp.com',
    '   VITE_FIREBASE_PROJECT_ID=mshwar-app',
    '   VITE_FIREBASE_STORAGE_BUCKET=mshwar-app.appspot.com',
    '   VITE_FIREBASE_MESSAGING_SENDER_ID=...',
    '   VITE_FIREBASE_APP_ID=1:...',
    '5. في الوضع الحالي، يعمل خادم Express بكفاءة تامة مع التخزين الموضعي الدائم في data/mshwar_db.json.',
  ],
};
