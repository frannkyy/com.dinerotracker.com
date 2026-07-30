import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BankLogo } from '../common/BankLogo';
import { formatCurrency } from '../../utils/formatters';
import {
  ArrowRightLeft,
  Building,
  CreditCard,
  Edit2,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash2,
  Wallet,
} from 'lucide-react';

export const AccountsView: React.FC = () => {
  const { accounts, settings, deleteAccount, openAddModal, openEditAccountModal } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredAccounts = accounts.filter((acc) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'bank') return ['Savings', 'Checking', 'Passbook', 'Payroll', 'Time Deposit'].includes(acc.accountType);
    if (selectedFilter === 'ewallet') return ['E-wallet', 'Digital Bank'].includes(acc.accountType);
    if (selectedFilter === 'credit') return ['Credit Card', 'Loan'].includes(acc.accountType);
    if (selectedFilter === 'cash') return ['Cash', 'Petty Cash'].includes(acc.accountType);
    return true;
  });

  const totalAssets = accounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = accounts
    .filter((a) => a.balance < 0)
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight">
            Financial Accounts
          </h1>
          <p className="text-xs text-[#86868B] font-medium">
            {accounts.length} active accounts & digital wallets
          </p>
        </div>

        <button
          onClick={() => openAddModal('account')}
          className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>New Account</span>
        </button>
      </div>

      {/* Summary Bento Banner */}
      <div className="p-5 rounded-[28px] bg-white dark:bg-[#1D1D1F] text-[#1D1D1F] dark:text-white grid grid-cols-2 gap-4 border border-gray-100 dark:border-slate-800 shadow-xs">
        <div className="bg-[#F5F5F7] dark:bg-slate-800/80 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800">
          <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
            Total Liquid Assets
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatCurrency(totalAssets, settings.currency, settings.hideBalances)}
          </div>
        </div>
        <div className="bg-[#F5F5F7] dark:bg-slate-800/80 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800">
          <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
            Total Liabilities
          </div>
          <div className="text-lg font-bold text-red-500 dark:text-red-400 mt-0.5">
            {formatCurrency(totalLiabilities, settings.currency, settings.hideBalances)}
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Accounts' },
          { id: 'bank', label: 'Banks' },
          { id: 'ewallet', label: 'E-Wallets & Digital' },
          { id: 'credit', label: 'Credit & Loans' },
          { id: 'cash', label: 'Cash & Wallet' },
        ].map((pill) => (
          <button
            key={pill.id}
            onClick={() => setSelectedFilter(pill.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === pill.id
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white dark:bg-[#1D1D1F] text-slate-700 dark:text-slate-300 border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Accounts List */}
      <div className="space-y-2.5">
        {accounts.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white dark:bg-[#1D1D1F] rounded-[28px] border border-dashed border-gray-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-3xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
              <Wallet size={28} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-white">
                Add your first account now!
              </h3>
              <p className="text-xs text-[#86868B] max-w-sm mx-auto mt-1 leading-relaxed">
                You haven't added any financial accounts yet. Add your bank account, e-wallet, credit card, or cash wallet to start tracking your money.
              </p>
            </div>
            <button
              onClick={() => openAddModal('account')}
              className="mt-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all"
            >
              <Plus size={18} />
              <span>Add Your First Account</span>
            </button>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-8 bg-[#F5F5F7] dark:bg-slate-800/50 rounded-2xl text-[#86868B] text-xs font-medium">
            No accounts found in this category filter.
          </div>
        ) : (
          filteredAccounts.map((acc) => (
            <div
              key={acc.id}
              className="p-4 rounded-[24px] bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-slate-800 shadow-2xs hover:border-gray-200 dark:hover:border-slate-700 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <BankLogo
                  institutionId={acc.institutionId}
                  accountType={acc.accountType}
                  name={acc.name}
                  size="md"
                  customColor={acc.color}
                />

                <div>
                  <div className="font-bold text-sm text-[#1D1D1F] dark:text-white flex items-center gap-2">
                    <span>{acc.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F5F7] dark:bg-slate-800 text-[#86868B]">
                      {acc.accountType}
                    </span>
                  </div>
                  <div className="text-xs text-[#86868B] font-mono mt-0.5">
                    {acc.accountNumberMasked || acc.currency}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div
                    className={`text-base font-extrabold ${
                      acc.balance < 0 ? 'text-red-500' : 'text-[#1D1D1F] dark:text-white'
                    }`}
                  >
                    {formatCurrency(acc.balance, acc.currency, settings.hideBalances)}
                  </div>
                  <div className="text-[10px] text-[#86868B]">
                    {acc.balance >= 0 ? 'Available Balance' : 'Outstanding Balance'}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openEditAccountModal(acc)}
                    className="p-2.5 rounded-xl text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 transition-all active:scale-95"
                    title="Edit Account"
                    aria-label="Edit Account"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => deleteAccount(acc.id)}
                    className="p-2.5 rounded-xl text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 transition-all active:scale-95"
                    title="Delete Account"
                    aria-label="Delete Account"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
