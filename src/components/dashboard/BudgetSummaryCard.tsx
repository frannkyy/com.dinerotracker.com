import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { AlertCircle, ChevronRight, PieChart, ShieldCheck } from 'lucide-react';

export const BudgetSummaryCard: React.FC = () => {
  const { budgets, transactions, categories, settings, setActiveTab } = useApp();

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthlyExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date && t.date.startsWith(currentMonthStr)
  );

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);

  const totalSpent = budgets.reduce((sum, b) => {
    const categorySpent = monthlyExpenses
      .filter((t) => t.categoryId === b.categoryId)
      .reduce((s, t) => s + t.amount, 0);
    return sum + categorySpent;
  }, 0);

  const percentUsed = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  const isOverBudget = percentUsed >= 100;
  const isWarning = percentUsed >= 80 && percentUsed < 100;

  return (
    <div className="bg-white dark:bg-[#1D1D1F] rounded-[32px] p-6 shadow-xs border border-gray-100 dark:border-slate-800 my-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
              <PieChart size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white leading-tight">
                Budget Tracker
              </h3>
              <p className="text-xs text-[#86868B] font-medium">
                {formatCurrency(totalSpent, settings.currency, settings.hideBalances)} spent of{' '}
                {formatCurrency(totalBudgeted, settings.currency, settings.hideBalances)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('budgets')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
          >
            Manage
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span
              className={
                isOverBudget
                  ? 'text-rose-600 dark:text-rose-400'
                  : isWarning
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }
            >
              {percentUsed}% Used
            </span>
            <span className="text-[#86868B]">
              {formatCurrency(
                Math.max(0, totalBudgeted - totalSpent),
                settings.currency,
                settings.hideBalances
              )}{' '}
              remaining
            </span>
          </div>

          <div className="w-full h-2 bg-[#F5F5F7] dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-red-500'
                  : isWarning
                  ? 'bg-amber-400'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, percentUsed)}%` }}
            />
          </div>
        </div>

        {/* Category Breakdown Snippet */}
        {budgets.length === 0 ? (
          <div className="mt-4 p-4 rounded-2xl bg-[#F5F5F7] dark:bg-slate-800/50 border border-dashed border-gray-200 dark:border-slate-800 text-center">
            <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">No budgets configured yet</p>
            <p className="text-[11px] text-[#86868B] mt-0.5">
              Set monthly spending targets for dining, groceries, and utilities.
            </p>
            <button
              onClick={() => setActiveTab('budgets')}
              className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Set Up Budget</span>
              <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {budgets.slice(0, 2).map((b) => {
              const cat = categories.find((c) => c.id === b.categoryId);
              const spent = monthlyExpenses
                .filter((t) => t.categoryId === b.categoryId)
                .reduce((s, t) => s + t.amount, 0);
              const catPct = Math.round((spent / b.amount) * 100);

              return (
                <div
                  key={b.id}
                  className="p-3 rounded-2xl bg-[#F5F5F7] dark:bg-slate-800/80 border border-gray-100 dark:border-slate-800"
                >
                  <div className="font-semibold text-[#1D1D1F] dark:text-slate-200 truncate">
                    {cat?.name || 'Category'}
                  </div>
                  <div className="text-[11px] text-[#86868B] mt-0.5 flex items-center justify-between font-mono">
                    <span>
                      ₱{spent.toLocaleString()} / ₱{b.amount.toLocaleString()}
                    </span>
                    <span
                      className={
                        catPct >= 100
                          ? 'text-red-500 font-bold'
                          : catPct >= 80
                          ? 'text-amber-500 font-bold'
                          : 'text-emerald-500 font-bold'
                      }
                    >
                      {catPct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bento Insight Pill */}
      <div className="mt-4 bg-blue-50/80 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">Insight</p>
        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
          You're spending within budget limits this month. Keep track of subscriptions & utility bills!
        </p>
      </div>
    </div>
  );
};
