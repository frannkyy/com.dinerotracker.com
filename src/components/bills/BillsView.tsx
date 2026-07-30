import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateString } from '../../utils/formatters';
import { generateGoogleCalendarUrl, downloadBillsIcsFile } from '../../utils/calendar';
import { BillItem } from '../../types';
import {
  BellRing,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  ExternalLink,
  Plus,
  Search,
  Trash2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const BillsView: React.FC = () => {
  const {
    bills,
    accounts,
    markBillAsPaid,
    deleteBill,
    openAddModal,
    openEditBillModal,
    settings,
    showToast,
  } = useApp();

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'overdue' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Month navigation helpers
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().slice(0, 10));
  };

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Bills calculations
  const totalMonthlyBillsAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const unpaidBills = bills.filter((b) => b.status === 'unpaid' || b.status === 'overdue');
  const totalUnpaidAmount = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
  const overdueCount = bills.filter((b) => b.status === 'overdue').length;
  const paidCount = bills.filter((b) => b.status === 'paid').length;

  // Filtered bills for list view
  const filteredBills = bills.filter((bill) => {
    if (statusFilter === 'unpaid' && bill.status !== 'unpaid') return false;
    if (statusFilter === 'overdue' && bill.status !== 'overdue') return false;
    if (statusFilter === 'paid' && bill.status !== 'paid') return false;
    if (
      searchQuery &&
      !bill.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Bills on selected calendar date
  const selectedDateBills = bills.filter((b) => b.dueDate === selectedDateStr);

  const handleSyncToCalendar = () => {
    if (bills.length === 0) {
      showToast('No bills available to export');
      return;
    }
    downloadBillsIcsFile(bills);
    showToast('Downloaded .ics file! Open it to sync all bills with your phone calendar.');
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight flex items-center gap-2">
            <span>Bills & Billing Calendar</span>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              {bills.length} Total
            </span>
          </h1>
          <p className="text-xs text-[#86868B] font-medium">
            Manage utility payments, due dates, & sync with your calendar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncToCalendar}
            className="px-3 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-100 transition-all active:scale-95 shadow-2xs"
            title="Export all bills to phone Calendar (.ics)"
          >
            <CalendarIcon size={15} />
            <span>Sync Phone Calendar</span>
          </button>

          <button
            onClick={() => openAddModal('bill')}
            className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Add Bill</span>
          </button>
        </div>
      </div>

      {/* Summary Bento Card */}
      <div className="p-5 rounded-[28px] bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-slate-800 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
            Total Monthly
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(totalMonthlyBillsAmount, settings.currency, settings.hideBalances)}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/40">
          <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            Pending / Unpaid
          </div>
          <div className="text-base font-extrabold text-amber-700 dark:text-amber-400 mt-0.5">
            {formatCurrency(totalUnpaidAmount, settings.currency, settings.hideBalances)}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/50 dark:border-rose-900/40">
          <div className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
            Overdue
          </div>
          <div className="text-base font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
            {overdueCount} {overdueCount === 1 ? 'Bill' : 'Bills'}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/40">
          <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Paid Status
          </div>
          <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {paidCount} Settled
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#1D1D1F] p-1.5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-2xs">
        <div className="flex gap-1.5 flex-1">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'calendar'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarIcon size={14} />
            <span>Calendar View</span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock size={14} />
            <span>List View</span>
          </button>
        </div>
      </div>

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="space-y-4">
          {/* Calendar Card */}
          <div className="p-5 rounded-[28px] bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-slate-800 shadow-xs space-y-4">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#1D1D1F] dark:text-white">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <button
                  onClick={handleToday}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                >
                  Today
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all active:scale-95"
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all active:scale-95"
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-[#86868B] uppercase tracking-wider pb-1 border-b border-gray-100 dark:border-slate-800">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty padding slots before first day */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-12 sm:h-14 rounded-2xl bg-slate-50/40 dark:bg-slate-900/30 opacity-30" />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const monthStr = String(currentMonth + 1).padStart(2, '0');
                const dayStr = String(dayNum).padStart(2, '0');
                const fullDateStr = `${currentYear}-${monthStr}-${dayStr}`;

                const dayBills = bills.filter((b) => b.dueDate === fullDateStr);
                const hasUnpaid = dayBills.some((b) => b.status === 'unpaid' || b.status === 'overdue');
                const hasOverdue = dayBills.some((b) => b.status === 'overdue');
                const hasPaid = dayBills.some((b) => b.status === 'paid');

                const isSelected = selectedDateStr === fullDateStr;
                const isToday =
                  new Date().toISOString().slice(0, 10) === fullDateStr;

                return (
                  <button
                    key={fullDateStr}
                    onClick={() => setSelectedDateStr(fullDateStr)}
                    className={`h-12 sm:h-14 rounded-2xl p-1 flex flex-col justify-between items-center transition-all relative border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30 scale-105'
                        : isToday
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-extrabold'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-extrabold mt-0.5">{dayNum}</span>

                    {/* Bill indicators / dots */}
                    {dayBills.length > 0 && (
                      <div className="flex items-center gap-0.5 mb-1">
                        {hasOverdue && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-white' : 'bg-rose-500'
                            }`}
                            title="Overdue Bill"
                          />
                        )}
                        {hasUnpaid && !hasOverdue && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-amber-200' : 'bg-amber-500'
                            }`}
                            title="Unpaid Bill"
                          />
                        )}
                        {hasPaid && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-emerald-200' : 'bg-emerald-500'
                            }`}
                            title="Paid Bill"
                          />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-[#86868B] pt-2 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Overdue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Pending Due</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Paid</span>
              </div>
            </div>
          </div>

          {/* Selected Date Bills Panel */}
          <div className="p-5 rounded-[28px] bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-extrabold text-[#1D1D1F] dark:text-white flex items-center gap-2">
                <CalendarIcon size={16} className="text-blue-600" />
                <span>Bills Due on {formatDateString(selectedDateStr)}</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {selectedDateBills.length} {selectedDateBills.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {selectedDateBills.length === 0 ? (
              <div className="py-6 text-center text-slate-400 dark:text-slate-500 space-y-2">
                <CheckCircle2 size={28} className="mx-auto text-emerald-500/70" />
                <p className="text-xs font-semibold">
                  No bills scheduled for this date ({formatDateString(selectedDateStr)}).
                </p>
                <button
                  onClick={() => openAddModal('bill')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-100 transition-colors"
                >
                  + Add Bill for {formatDateString(selectedDateStr)}
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDateBills.map((bill) => {
                  const defaultAccount =
                    accounts.find((a) => a.id === bill.accountId) || accounts[0];
                  const googleCalUrl = generateGoogleCalendarUrl(bill);

                  return (
                    <div
                      key={bill.id}
                      className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-slate-800/80 border border-gray-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-[#1D1D1F] dark:text-white flex items-center gap-2">
                          <span>{bill.title}</span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                              bill.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : bill.status === 'overdue'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            }`}
                          >
                            {bill.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#86868B] mt-0.5">
                          Account: {defaultAccount?.name || 'Cash'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-sm font-extrabold text-[#1D1D1F] dark:text-white px-1">
                          {formatCurrency(bill.amount, bill.currency, settings.hideBalances)}
                        </div>

                        <a
                          href={googleCalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 font-medium text-xs flex items-center gap-1 transition-colors"
                          title="Open Google Calendar Event"
                        >
                          <CalendarIcon size={14} className="text-blue-500" />
                          <ExternalLink size={10} className="text-slate-400" />
                        </a>

                        {bill.status !== 'paid' && (
                          <button
                            onClick={() =>
                              markBillAsPaid(bill.id, defaultAccount?.id || accounts[0]?.id)
                            }
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors flex items-center gap-1 active:scale-95"
                          >
                            <CheckCircle2 size={14} />
                            <span>Pay</span>
                          </button>
                        )}

                        <button
                          onClick={() => openEditBillModal(bill)}
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 transition-colors"
                          title="Edit Bill"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => deleteBill(bill.id)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-500 transition-colors"
                          title="Delete Bill"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {/* Filters & Search */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search bill by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-[#1D1D1F] text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto">
              {(['all', 'unpaid', 'overdue', 'paid'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-[#1D1D1F] text-slate-700 dark:text-slate-300 border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Bills List */}
          <div className="space-y-2.5">
            {filteredBills.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#1D1D1F] rounded-[28px] border border-gray-100 dark:border-slate-800 text-slate-400 text-xs font-medium space-y-2">
                <AlertCircle size={28} className="mx-auto text-slate-300 dark:text-slate-600" />
                <p>No bills found matching filters.</p>
                <button
                  onClick={() => openAddModal('bill')}
                  className="px-4 py-2 rounded-2xl bg-blue-600 text-white text-xs font-bold"
                >
                  + Add New Bill
                </button>
              </div>
            ) : (
              filteredBills.map((bill) => {
                const defaultAccount =
                  accounts.find((a) => a.id === bill.accountId) || accounts[0];
                const googleCalUrl = generateGoogleCalendarUrl(bill);

                return (
                  <div
                    key={bill.id}
                    className="p-4 rounded-[24px] bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-slate-800 shadow-2xs flex items-center justify-between flex-wrap gap-3 hover:border-gray-200 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          bill.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : bill.status === 'overdue'
                            ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                            : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}
                      >
                        <Clock size={20} />
                      </div>

                      <div>
                        <div className="font-bold text-sm text-[#1D1D1F] dark:text-white flex items-center gap-2">
                          <span>{bill.title}</span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                              bill.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : bill.status === 'overdue'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            }`}
                          >
                            {bill.status}
                          </span>
                        </div>
                        <div className="text-xs text-[#86868B] mt-0.5 flex items-center gap-2">
                          <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                            Due {formatDateString(bill.dueDate)}
                          </span>
                          <span>•</span>
                          <span>{defaultAccount?.name || 'Cash'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right mr-1">
                        <div className="text-base font-extrabold text-[#1D1D1F] dark:text-white">
                          {formatCurrency(bill.amount, bill.currency, settings.hideBalances)}
                        </div>
                        <div className="text-[10px] text-[#86868B] capitalize">
                          {bill.frequency} billing
                        </div>
                      </div>

                      <a
                        href={googleCalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                        title="Add to Google Calendar"
                      >
                        <CalendarIcon size={16} className="text-blue-500" />
                      </a>

                      {bill.status !== 'paid' && (
                        <button
                          onClick={() =>
                            markBillAsPaid(bill.id, defaultAccount?.id || accounts[0]?.id)
                          }
                          className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 active:scale-95"
                        >
                          <CheckCircle2 size={15} />
                          <span>Pay</span>
                        </button>
                      )}

                      <button
                        onClick={() => openEditBillModal(bill)}
                        className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 transition-colors"
                        title="Edit Bill"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        onClick={() => deleteBill(bill.id)}
                        className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-500 transition-colors"
                        title="Delete Bill"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
