import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileFrameWrapper } from './components/layout/MobileFrameWrapper';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { PinLockScreen } from './components/common/PinLockScreen';
import { AddEditModal } from './components/common/AddEditModal';
import { OnboardingModal } from './components/common/OnboardingModal';
import { Toast } from './components/common/Toast';
import { SplashScreen } from './components/common/SplashScreen';

// Dashboard components
import { NetWorthCard } from './components/dashboard/NetWorthCard';
import { AccountsSlider } from './components/dashboard/AccountsSlider';
import { BudgetSummaryCard } from './components/dashboard/BudgetSummaryCard';
import { CurrencyConverterWidget } from './components/dashboard/CurrencyConverterWidget';
import { UpcomingBillsWidget } from './components/dashboard/UpcomingBillsWidget';
import { RecentTransactions } from './components/dashboard/RecentTransactions';

// Tab views
import { AccountsView } from './components/accounts/AccountsView';
import { BillsView } from './components/bills/BillsView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { GoalsView } from './components/goals/GoalsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { NotificationsModal } from './components/common/NotificationsModal';
import { AdMobBanner } from './components/common/AdMobBanner';

const MainScreenContent: React.FC = () => {
  const { activeTab, isLocked, showSplash, setShowSplash } = useApp();

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (isLocked) {
    return <PinLockScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 bg-[#F5F5F7] dark:bg-[#121212] text-[#1D1D1F] dark:text-[#F5F5F7]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto pb-20">
        {activeTab === 'dashboard' && (
          <div className="p-4 space-y-2 animate-in fade-in duration-200">
            <NetWorthCard />
            <AccountsSlider />
            <UpcomingBillsWidget />
            <BudgetSummaryCard />
            <CurrencyConverterWidget />
            <RecentTransactions />
            <AdMobBanner className="pt-2" />
          </div>
        )}

        {activeTab === 'accounts' && <AccountsView />}
        {activeTab === 'bills' && <BillsView />}
        {activeTab === 'transactions' && <TransactionsView />}
        {activeTab === 'budgets' && <BudgetsView />}
        {activeTab === 'goals' && <GoalsView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      <BottomNav />
      <AddEditModal />
      <NotificationsModal />
      <OnboardingModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MobileFrameWrapper>
        <MainScreenContent />
      </MobileFrameWrapper>
    </AppProvider>
  );
}
