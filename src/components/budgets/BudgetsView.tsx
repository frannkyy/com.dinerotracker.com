import React from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency } from '../../utils/formatters';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';

export const BudgetsView: React.FC = () => {
  const { budgets, transactions, categories, settings, deleteBudget, openAddModal } = useApp();

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthlyExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date && t.date.startsWith(currentMonthStr)
  );

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Category Budgets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monthly spending targets & limit alerts
          </p>
        </div>

        <button
          onClick={() => openAddModal('budget')}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>New Budget</span>
        </button>
      </div>

      <div className="space-y-3">
        {budgets.map((b) => {
          const cat = categories.find((c) => c.id === b.categoryId);
          const spent = monthlyExpenses
            .filter((t) => t.categoryId === b.categoryId)
            .reduce((sum, t) => sum + t.amount, 0);

          const pct = Math.round((spent / b.amount) * 100);
          const isOver = pct >= 100;
          const isWarn = pct >= 80 && pct < 100;

          return (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CategoryIcon
                    iconName={cat?.icon || 'Tag'}
                    color={cat?.color || '#3B82F6'}
                    size={20}
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {cat?.name || 'Category'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {formatCurrency(spent, settings.currency, settings.hideBalances)} spent of{' '}
                      {formatCurrency(b.amount, settings.currency, settings.hideBalances)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div
                      className={`text-sm font-extrabold ${
                        isOver
                          ? 'text-rose-600 dark:text-rose-400'
                          : isWarn
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {pct}%
                    </div>
                  </div>

                  <button
                    onClick={() => deleteBudget(b.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Budget"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOver ? 'bg-rose-500' : isWarn ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              {isOver && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl">
                  <AlertTriangle size={14} />
                  <span>Budget limit exceeded by ₱{(spent - b.amount).toLocaleString()}!</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
