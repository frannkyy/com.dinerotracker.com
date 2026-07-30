import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateString } from '../../utils/formatters';
import { generateGoogleCalendarUrl, downloadBillsIcsFile } from '../../utils/calendar';
import { Calendar, CheckCircle, Clock, BellRing, ExternalLink, Edit2 } from 'lucide-react';

export const UpcomingBillsWidget: React.FC = () => {
  const { bills, accounts, markBillAsPaid, openEditBillModal, setActiveTab, settings, openAddModal, showToast } = useApp();

  const unpaidBills = bills.filter((b) => b.status === 'unpaid' || b.status === 'overdue');

  const handleSyncToCalendar = () => {
    if (unpaidBills.length === 0) return;
    downloadBillsIcsFile(unpaidBills);
    showToast('Downloaded .ics Calendar file! Open it to add all bills to your phone calendar.');
  };

  const handleEnableNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('Browser notifications are not supported in this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('Bill Reminder Notifications enabled!');
        new Notification('Dinero Bill Reminders', {
          body: `You have ${unpaidBills.length} pending bill(s) due soon!`,
          icon: '/favicon.ico',
        });
      } else {
        showToast('Notification permission was denied in browser settings.');
      }
    } catch (err) {
      console.warn('Error requesting notifications:', err);
      showToast('Could not enable notifications.');
    }
  };

  if (unpaidBills.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#1D1D1F] rounded-[32px] p-6 shadow-xs border border-gray-100 dark:border-slate-800 my-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white leading-tight">
              Bills & Payment Reminders
            </h3>
            <p className="text-xs text-[#86868B] font-medium">
              {unpaidBills.length} pending bill payments due
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('bills')}
            className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 font-semibold text-xs flex items-center gap-1 hover:bg-blue-100 transition-colors"
            title="Open Full Billing Calendar"
          >
            <Calendar size={13} />
            <span>Calendar</span>
          </button>

          <button
            onClick={handleSyncToCalendar}
            className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 font-semibold text-xs flex items-center gap-1 hover:bg-amber-100 transition-colors"
            title="Export all bills to phone Calendar (.ics)"
          >
            <span>Sync .ics</span>
          </button>

          <button
            onClick={() => openAddModal('bill')}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            + Add Bill
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {unpaidBills.slice(0, 4).map((bill) => {
          const defaultAccount = accounts.find((a) => a.id === bill.accountId) || accounts[0];
          const googleCalUrl = generateGoogleCalendarUrl(bill);

          return (
            <div
              key={bill.id}
              className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-slate-800/80 border border-gray-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 shadow-2xs"
            >
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-[#1D1D1F] dark:text-white truncate">
                  {bill.title}
                </div>
                <div className="text-[11px] text-[#86868B] mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
                    Due {formatDateString(bill.dueDate)}
                  </span>
                  <span>•</span>
                  <span>{defaultAccount?.name || 'Cash'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={googleCalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 font-medium text-xs flex items-center gap-1 transition-colors"
                  title="Add this bill to Google Calendar"
                >
                  <Calendar size={13} className="text-blue-500" />
                  <ExternalLink size={11} className="text-slate-400" />
                </a>

                <div className="text-sm font-extrabold text-[#1D1D1F] dark:text-white px-1">
                  {formatCurrency(bill.amount, bill.currency, settings.hideBalances)}
                </div>

                <button
                  onClick={() => openEditBillModal(bill)}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                  title="Edit Bill"
                >
                  <Edit2 size={13} />
                </button>

                <button
                  onClick={() => markBillAsPaid(bill.id, defaultAccount?.id || accounts[0]?.id)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors flex items-center gap-1 active:scale-95"
                  title="Mark Bill as Paid"
                >
                  <CheckCircle size={14} />
                  <span>Pay</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleEnableNotifications}
          className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
        >
          <BellRing size={13} />
          <span>Enable Bill Phone Notifications</span>
        </button>

        <span className="text-[11px] text-slate-400">
          Syncs with Google Calendar / Android Calendar
        </span>
      </div>
    </div>
  );
};

