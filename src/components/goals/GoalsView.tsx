import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateString } from '../../utils/formatters';
import {
  CheckCircle2,
  Gift,
  Laptop,
  PiggyBank,
  Plane,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  Wallet,
} from 'lucide-react';

export const GoalsView: React.FC = () => {
  const { goals, accounts, depositToGoal, deleteGoal, openAddModal, settings } = useApp();

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositAccountId, setDepositAccountId] = useState<string>(accounts[0]?.id || '');

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !depositAccountId) return;
    const num = parseFloat(depositAmount);
    if (isNaN(num) || num <= 0) return;

    depositToGoal(selectedGoalId, num, depositAccountId);
    setSelectedGoalId(null);
    setDepositAmount('');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Savings & Goals Stashes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated goals, emergency funds & travel stashes
          </p>
        </div>

        <button
          onClick={() => openAddModal('goal')}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));

          return (
            <div
              key={g.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs"
                    style={{ backgroundColor: g.color || '#3B82F6' }}
                  >
                    <PiggyBank size={20} />
                  </div>

                  <div className="flex items-center gap-1">
                    {g.isCompleted && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={12} />
                        Completed
                      </span>
                    )}
                    <button
                      onClick={() => deleteGoal(g.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{g.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target: {formatCurrency(g.targetAmount, g.currency, settings.hideBalances)}
                </p>

                {g.targetDate && (
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    Target Date: {formatDateString(g.targetDate)}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-900 dark:text-white">
                    {formatCurrency(g.currentAmount, g.currency, settings.hideBalances)}
                  </span>
                  <span style={{ color: g.color }}>{pct}%</span>
                </div>

                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: g.color }}
                  />
                </div>

                {!g.isCompleted && (
                  <button
                    onClick={() => {
                      setSelectedGoalId(g.id);
                      setDepositAccountId(accounts[0]?.id || '');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white font-bold text-xs text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Plus size={14} />
                    <span>Deposit / Stash</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Deposit to {selectedGoal.title}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Transfer funds from account into goal stash
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Amount (₱)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-bold text-base text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Source Account
                </label>
                <select
                  value={depositAccountId}
                  onChange={(e) => setDepositAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (₱{acc.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedGoalId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20"
                >
                  Confirm Stash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
