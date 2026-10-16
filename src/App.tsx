import React from 'react';
import { MshwarProvider, useMshwar } from './context/MshwarContext';
import { RoleNavbar } from './components/RoleNavbar';
import { CustomerView } from './components/customer/CustomerView';
import { RestaurantView } from './components/restaurant/RestaurantView';
import { CaptainView } from './components/captain/CaptainView';
import { AdminView } from './components/admin/AdminView';
import { CashierView } from './components/cashier/CashierView';
import { KdsView } from './components/kds/KdsView';
import { AuthModal } from './components/auth/AuthModal';
import { TechArchitectureModal } from './components/TechArchitectureModal';
import { StorePublishModal } from './components/StorePublishModal';
import { Check } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { role, toastMessage } = useMshwar();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Universal Role Switcher Top Bar */}
      <RoleNavbar />

      {/* Main View Area based on current active Role */}
      <main className="flex-1 w-full">
        {role === 'customer' && <CustomerView />}
        {role === 'restaurant' && <RestaurantView />}
        {role === 'captain' && <CaptainView />}
        {role === 'admin' && <AdminView />}
        {role === 'cashier' && <CashierView />}
        {role === 'kds' && <KdsView />}
      </main>

      {/* Authentication and Account Management Modal */}
      <AuthModal />

      {/* Architectural Alignment & Database Integration Modal */}
      <TechArchitectureModal />

      {/* Google Play Store & Chrome PWA Deployment Modal */}
      <StorePublishModal />

      {/* Real-time Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700/60 backdrop-blur-md animate-fadeIn">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <MshwarProvider>
      <MainLayout />
    </MshwarProvider>
  );
}
