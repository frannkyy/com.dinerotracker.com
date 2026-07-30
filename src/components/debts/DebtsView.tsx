import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateString } from '../../utils/formatters';
import {
  AlertCircle,
  CheckCircle2,
  Handshake,
  Plus,
  Trash2,
  UserCheck,
} from 'lucide-react';

export const DebtsView: React.FC = () => {
  const { debts, accounts, recordDebtPayment, deleteDebt, openAddModal, settings } = useApp();

  const [activeTab, setActiveTab] = useState<'i_owe' | 'owed_to_me'>('i_owe');
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentAccountId, setPaymentAccountId] = useState<string>(accounts[0]?.id || '');

  const filteredDebts = debts.filter((d) => d.type === activeTab);
  const selectedDebt = debts.find((d) => d.id === selectedDebtId);

  const totalIOwe = debts
    .filter((d) => d.type === 'i_owe' && d.status === 'active')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const totalOwedToMe = debts
    .filter((d) => d.type === 'owed_to_me' && d.status === 'active')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtId || !paymentAccountId) return;
    const num = parseFloat(paymentAmount);
    if (isNaN(num) || num <= 0) return;

    recordDebtPayment(selectedDebtId, num, paymentAccountId);
    setSelectedDebtId(null);
    setPaymentAmount('');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Debt & Loans Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track money borrowed, loans & personal receivables
          </p>
        </div>

        <button
          onClick={() => openAddModal('debt')}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>New Entry</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
          <div className="text-[10px] font-bold uppercase tracking-wider">I Owe (Liabilities)</div>
          <div className="text-lg font-black mt-0.5">
            {formatCurrency(totalIOwe, settings.currency, settings.hideBalances)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <div className="text-[10px] font-bold uppercase tracking-wider">Owed To Me (Receivables)</div>
          <div className="text-lg font-black mt-0.5">
            {formatCurrency(totalOwedToMe, settings.currency, settings.hideBalances)}
          </div>
        </div>
      </div>

      {/* Segmented Tab */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 mb-4">
        <button
          onClick={() => setActiveTab('i_owe')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'i_owe'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          I Owe Money ({debts.filter((d) => d.type === 'i_owe').length})
        </button>
        <button
          onClick={() => setActiveTab('owed_to_me')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'owed_to_me'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Owed To Me ({debts.filter((d) => d.type === 'owed_to_me').length})
        </button>
      </div>

      {/* Debt List */}
      <div className="space-y-3">
        {filteredDebts.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-400">
            No debt or loan entries recorded under this tab
          </div>
        ) : (
          filteredDebts.map((d) => {
            const isSettled = d.status === 'settled' || d.remainingAmount <= 0;
            const pct = Math.round(((d.amount - d.remainingAmount) / d.amount) * 100);

            return (
              <div
                key={d.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl text-white font-bold ${
                        d.type === 'i_owe' ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}
                    >
                      <Handshake size={18} />
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {d.personOrEntity}
                      </h3>
                      {d.dueDate && (
                        <p className="text-[11px] text-slate-500 font-mono">
                          Due: {formatDateString(d.dueDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(d.remainingAmount, d.currency, settings.hideBalances)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Original: ₱{d.amount.toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteDebt(d.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {d.notes && <p className="text-xs text-slate-500 my-2 italic">{d.notes}</p>}

                {/* Progress bar */}
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                    <span>Repaid {pct}%</span>
                    <span>
                      Remaining: ₱{d.remainingAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        d.type === 'i_owe' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {!isSettled && (
                    <button
                      onClick={() => {
                        setSelectedDebtId(d.id);
                        setPaymentAccountId(accounts[0]?.id || '');
                      }}
                      className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white font-bold text-xs text-slate-800 dark:text-slate-200 transition-all active:scale-95"
                    >
                      Record Payment / Settlement
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Popup */}
      {selectedDebt && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Payment for {selectedDebt.personOrEntity}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Remaining balance: ₱{selectedDebt.remainingAmount.toLocaleString()}
            </p>

            <form onSubmit={handlePaymentSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Payment Amount (₱)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-bold text-base text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Account
                </label>
                <select
                  value={paymentAccountId}
                  onChange={(e) => setPaymentAccountId(e.target.value)}
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
                  onClick={() => setSelectedDebtId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
