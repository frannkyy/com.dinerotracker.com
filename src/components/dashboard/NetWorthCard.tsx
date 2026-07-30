import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Scale,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export const NetWorthCard: React.FC = () => {
  const { accounts, transactions, settings, openAddModal } = useApp();

  const totalAssets = accounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = accounts
    .filter((a) => a.balance < 0)
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  const netWorth = totalAssets - totalLiabilities;

  // Current month income & expenses
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthlyTransactions = transactions.filter(
    (t) => t.date && t.date.startsWith(currentMonthStr)
  );

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-white dark:bg-[#1D1D1F] rounded-[32px] p-7 shadow-xs border border-gray-100 dark:border-slate-800/80 text-[#1D1D1F] dark:text-white flex flex-col justify-between my-2">
      <div>
        {/* Header Eyebrow */}
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[#86868B] dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Total Net Worth
          </p>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-900/50">
            <TrendingUp size={12} />
            <span>Active Dashboard</span>
          </div>
        </div>

        {/* Net Worth Figure */}
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-white mt-1">
          {formatCurrency(netWorth, settings.currency, settings.hideBalances)}
        </h2>
        <p className="text-xs text-[#86868B] dark:text-slate-400 font-medium mt-1.5">
          {accounts.length === 0
            ? 'No accounts connected yet. Add an account to get started.'
            : `Across ${accounts.length} linked account${accounts.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Assets vs Liabilities Bento Pill Cards */}
      <div className="flex gap-3 mt-6">
        <div className="flex-1 bg-[#F5F5F7] dark:bg-slate-800/60 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800">
          <p className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider">
            Assets
          </p>
          <p className="font-bold text-base text-blue-600 dark:text-blue-400 mt-0.5">
            {formatCurrency(totalAssets, settings.currency, settings.hideBalances)}
          </p>
        </div>

        <div className="flex-1 bg-[#F5F5F7] dark:bg-slate-800/60 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800">
          <p className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider">
            Liabilities
          </p>
          <p className="font-bold text-base text-red-500 dark:text-red-400 mt-0.5">
            {formatCurrency(totalLiabilities, settings.currency, settings.hideBalances)}
          </p>
        </div>
      </div>

      {/* Monthly Flow Stats */}
      <div className="flex items-center justify-between mt-3.5 bg-[#F5F5F7] dark:bg-slate-800/40 rounded-2xl px-4 py-2.5 border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400">
            <ArrowDownRight size={14} />
          </div>
          <div>
            <div className="text-[10px] text-[#86868B] uppercase font-bold">Income</div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">
              {formatCurrency(monthlyIncome, settings.currency, settings.hideBalances)}
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <ArrowUpRight size={14} />
          </div>
          <div>
            <div className="text-[10px] text-[#86868B] uppercase font-bold">Expense</div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">
              {formatCurrency(monthlyExpense, settings.currency, settings.hideBalances)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
