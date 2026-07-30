import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { AdMobNativeAd } from '../common/AdMobNativeAd';
import { formatCurrency } from '../../utils/formatters';
import { generatePDFReportPrint } from '../../utils/export';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  PieChart,
  Printer,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import { Category } from '../../types';

export const AnalyticsView: React.FC = () => {
  const { transactions, categories, accounts, settings, recordActionAndCheckAd } = useApp();
  const [period, setPeriod] = useState<'thisMonth' | 'lastMonth' | 'allTime'>('thisMonth');

  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  // Filter transactions by selected period
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const filteredTx = transactions.filter((t) => {
    if (period === 'thisMonth') return t.date && t.date.startsWith(currentMonthStr);
    if (period === 'lastMonth') return t.date && t.date.startsWith(lastMonthStr);
    return true;
  });

  const totalIncome = filteredTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;

  // Category breakdown for expenses
  const categoryExpensesMap = new Map<string, number>();
  filteredTx
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const current = categoryExpensesMap.get(t.categoryId) || 0;
      categoryExpensesMap.set(t.categoryId, current + t.amount);
    });

  const categoryStats = Array.from(categoryExpensesMap.entries())
    .map(([catId, amount]) => ({
      category: categoryMap.get(catId),
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header & Period Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cash flow breakdown, spending trends & savings rate
          </p>
        </div>

        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 self-start">
          {[
            { id: 'thisMonth', label: 'This Month' },
            { id: 'lastMonth', label: 'Last Month' },
            { id: 'allTime', label: 'All Time' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                period === p.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cash Flow Summary Card */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-lg border border-slate-800 mb-5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-blue-400" />
            <span>Period Financial Statement</span>
          </div>
          <button
            onClick={() => {
              generatePDFReportPrint(
                `Financial Report (${period})`,
                accounts,
                filteredTx,
                categories
              );
              recordActionAndCheckAd('print_pdf_analytics');
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-[11px] font-bold flex items-center gap-1 transition-all border border-slate-700"
            title="Print Period Financial Report PDF"
          >
            <Printer size={13} />
            <span>Print PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <ArrowDownRight size={12} className="text-emerald-400" />
              <span>Income</span>
            </div>
            <div className="text-sm font-extrabold text-emerald-400 mt-1">
              {formatCurrency(totalIncome, settings.currency, settings.hideBalances)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <ArrowUpRight size={12} className="text-rose-400" />
              <span>Expenses</span>
            </div>
            <div className="text-sm font-extrabold text-rose-400 mt-1">
              {formatCurrency(totalExpense, settings.currency, settings.hideBalances)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Wallet size={12} className="text-blue-400" />
              <span>Net Flow</span>
            </div>
            <div
              className={`text-sm font-extrabold mt-1 ${
                netSavings >= 0 ? 'text-blue-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(netSavings, settings.currency, settings.hideBalances)}
            </div>
          </div>
        </div>
      </div>

      {/* Spending by Category List */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart size={18} className="text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Spending Breakdown by Category
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total ₱{totalExpense.toLocaleString()}
          </span>
        </div>

        {categoryStats.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No expenses recorded for this period
          </div>
        ) : (
          <div className="space-y-3">
            {categoryStats.map((stat, idx) => (
              <div key={stat.category?.id || idx}>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <div className="flex items-center gap-2">
                    <CategoryIcon
                      iconName={stat.category?.icon || 'Tag'}
                      color={stat.category?.color || '#3B82F6'}
                      size={16}
                      className="w-7 h-7 rounded-lg"
                    />
                    <span className="text-slate-800 dark:text-slate-200">
                      {stat.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                  <div className="text-slate-900 dark:text-white font-mono">
                    {formatCurrency(stat.amount, settings.currency, settings.hideBalances)}{' '}
                    <span className="text-slate-400 text-[10px]">({stat.percentage}%)</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stat.percentage}%`,
                      backgroundColor: stat.category?.color || '#3B82F6',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AdMob Native Ad Unit */}
      <AdMobNativeAd />
    </div>
  );
};
