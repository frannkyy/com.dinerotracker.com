import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Eye,
  EyeOff,
  Lock,
  BellRing,
} from 'lucide-react';
import dineroLogo from '../../assets/images/dinero_app_logo_1784744183566.jpg';

export const Navbar: React.FC = () => {
  const {
    settings,
    updateSettings,
    lockApp,
    bills,
    budgets,
    categories,
    transactions,
    debts,
    openNotificationsModal,
  } = useApp();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const unpaidBillsCount = bills.filter(
    (b) => b.status === 'unpaid' || b.status === 'overdue'
  ).length;

  const budgetAlertsCount = budgets.filter((b) => {
    const categoryTxs = transactions.filter(
      (t) => t.categoryId === b.categoryId && t.type === 'expense'
    );
    const spent = categoryTxs.reduce((sum, t) => sum + t.amount, 0);
    return spent / b.amount >= 0.8;
  }).length;

  const debtAlertsCount = debts.filter((d) => d.status === 'active' && d.dueDate).length;

  const totalNotificationsCount = unpaidBillsCount + budgetAlertsCount + debtAlertsCount;

  const toggleHideBalances = () => {
    updateSettings({ hideBalances: !settings.hideBalances });
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#F5F5F7]/90 dark:bg-[#121212]/90 border-b border-gray-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-xs shrink-0 bg-white dark:bg-slate-800 p-0.5">
            <img
              src={dineroLogo}
              alt="Dinero Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#86868B] mb-0.5">
              {getGreeting()}, {settings.userName || 'User'}
            </p>
            <h1 className="text-xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-white font-display">
              Dinero Tracker
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Hide / Show Balances */}
          <button
            onClick={toggleHideBalances}
            className="p-2 rounded-2xl bg-white dark:bg-[#1D1D1F] text-slate-700 dark:text-slate-300 border border-gray-100 dark:border-slate-800 shadow-2xs hover:bg-gray-50 dark:hover:bg-slate-800 transition-all active:scale-95"
            title={settings.hideBalances ? 'Show Balances' : 'Hide Balances'}
          >
            {settings.hideBalances ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>

          {/* Notifications Center Bell Badge */}
          <button
            onClick={openNotificationsModal}
            className="relative p-2 rounded-2xl bg-white dark:bg-[#1D1D1F] text-slate-700 dark:text-slate-300 border border-gray-100 dark:border-slate-800 shadow-2xs hover:bg-gray-50 dark:hover:bg-slate-800 transition-all active:scale-95"
            title={`${totalNotificationsCount} notifications & reminders`}
          >
            <BellRing size={18} />
            {totalNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {totalNotificationsCount}
              </span>
            )}
          </button>

          {/* Lock Button if PIN enabled */}
          {settings.securityPinEnabled && (
            <button
              onClick={lockApp}
              className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200/50 dark:border-rose-900/40 hover:bg-rose-100 transition-all active:scale-95"
              title="Lock App"
            >
              <Lock size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
