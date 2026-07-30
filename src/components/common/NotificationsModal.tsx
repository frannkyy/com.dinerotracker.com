import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateString } from '../../utils/formatters';
import {
  BellRing,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  PieChart,
  ShieldAlert,
  Target,
  X,
  Zap,
} from 'lucide-react';

export const NotificationsModal: React.FC = () => {
  const {
    isNotificationsOpen,
    setIsNotificationsOpen,
    bills,
    budgets,
    categories,
    transactions,
    debts,
    goals,
    accounts,
    markBillAsPaid,
    openEditBillModal,
    setActiveTab,
    settings,
    showToast,
  } = useApp();

  if (!isNotificationsOpen) return null;

  const handleClose = () => {
    setIsNotificationsOpen(false);
  };

  // 1. Unpaid / Overdue Bills
  const pendingBills = bills.filter((b) => b.status === 'unpaid' || b.status === 'overdue');

  // 2. Budget Alerts (Spent >= 80% of limit)
  const budgetAlerts = budgets
    .map((b) => {
      const cat = categories.find((c) => c.id === b.categoryId);
      const categoryTxs = transactions.filter(
        (t) => t.categoryId === b.categoryId && t.type === 'expense'
      );
      const spent = categoryTxs.reduce((sum, t) => sum + t.amount, 0);
      const percentage = Math.round((spent / b.amount) * 100);

      return {
        id: b.id,
        categoryName: cat?.name || 'Category',
        spent,
        limit: b.amount,
        percentage,
      };
    })
    .filter((ba) => ba.percentage >= 80);

  // 3. Debts with due dates
  const debtAlerts = debts.filter((d) => d.status === 'active' && d.dueDate);

  // Total alert items count
  const totalAlertsCount = pendingBills.length + budgetAlerts.length + debtAlerts.length;

  const handleEnablePushNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('Browser notifications are not supported on this device.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('Push Notifications active!');
        new Notification('Dinero Financial Tracker', {
          body: `You have ${totalAlertsCount} active notifications and reminders.`,
        });
      } else {
        showToast('Notification permission denied in browser settings.');
      }
    } catch {
      showToast('Could not enable notifications.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold">
              <BellRing size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Notifications & Alerts</span>
                {totalAlertsCount > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    {totalAlertsCount} New
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                All bill due dates, budget warnings, & reminders
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {totalAlertsCount === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              All Caught Up!
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              You have no pending bill payments or budget warnings right now. Great job keeping your finances in order!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* BILL REMINDERS SECTION */}
            {pendingBills.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>Pending Bill Reminders ({pendingBills.length})</span>
                </div>

                <div className="space-y-2">
                  {pendingBills.map((bill) => {
                    const defaultAcc = accounts.find((a) => a.id === bill.accountId) || accounts[0];

                    return (
                      <div
                        key={bill.id}
                        className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between flex-wrap gap-2"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{bill.title}</span>
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full ${
                                bill.status === 'overdue'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-amber-600 text-white'
                              }`}
                            >
                              {bill.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Due {formatDateString(bill.dueDate)} • {defaultAcc?.name || 'Cash'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(bill.amount, bill.currency, settings.hideBalances)}
                          </div>

                          <button
                            onClick={() => {
                              markBillAsPaid(bill.id, defaultAcc?.id || accounts[0]?.id);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs active:scale-95 transition-all"
                          >
                            Pay Now
                          </button>

                          <button
                            onClick={() => {
                              handleClose();
                              openEditBillModal(bill);
                            }}
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            title="Edit Bill"
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BUDGET ALERTS SECTION */}
            {budgetAlerts.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <PieChart size={14} />
                  <span>Budget Limit Alerts ({budgetAlerts.length})</span>
                </div>

                <div className="space-y-2">
                  {budgetAlerts.map((ba) => (
                    <div
                      key={ba.id}
                      className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between flex-wrap gap-2"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{ba.categoryName}</span>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-rose-600 text-white">
                            {ba.percentage}% Used
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Spent {formatCurrency(ba.spent, settings.currency)} of{' '}
                          {formatCurrency(ba.limit, settings.currency)} limit
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          handleClose();
                          setActiveTab('budgets');
                        }}
                        className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                      >
                        View Budgets
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DEBT REMINDERS SECTION */}
            {debtAlerts.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <ShieldAlert size={14} />
                  <span>Debt / Loan Reminders ({debtAlerts.length})</span>
                </div>

                <div className="space-y-2">
                  {debtAlerts.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between flex-wrap gap-2"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {d.personOrEntity} ({d.type === 'i_owe' ? 'I Owe' : 'Owed to Me'})
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Due {d.dueDate ? formatDateString(d.dueDate) : 'Soon'}
                        </div>
                      </div>

                      <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(d.remainingAmount, d.currency || 'PHP')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Enable Push Notifications Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={handleEnablePushNotifications}
            className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <Zap size={14} />
            <span>Enable Push Notifications</span>
          </button>

          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
