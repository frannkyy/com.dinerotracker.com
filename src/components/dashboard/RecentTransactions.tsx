import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency, formatDateString } from '../../utils/formatters';
import { generateSingleTransactionReceiptPrint } from '../../utils/export';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  FileText,
  Paperclip,
  Printer,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import { Account, Category, Transaction } from '../../types';

export const RecentTransactions: React.FC = () => {
  const { transactions, accounts, categories, settings, setActiveTab, deleteTransaction } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const accountMap = new Map<string, Account>(accounts.map((a) => [a.id, a]));
  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  const filteredTx = transactions
    .filter((tx) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const payee = (tx.payeeOrMerchant || '').toLowerCase();
      const note = (tx.note || '').toLowerCase();
      const cat = (categoryMap.get(tx.categoryId)?.name || '').toLowerCase();
      const acc = (accountMap.get(tx.accountId)?.name || '').toLowerCase();
      const tags = (tx.tags || []).join(' ').toLowerCase();
      return payee.includes(q) || note.includes(q) || cat.includes(q) || acc.includes(q) || tags.includes(q);
    })
    .slice(0, 10);

  return (
    <div className="bg-white dark:bg-[#1D1D1F] rounded-[32px] p-6 shadow-xs border border-gray-100 dark:border-slate-800 my-4">
      <div className="flex items-center justify-between px-1 mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white tracking-tight">
            Recent Transactions
          </h3>
          <p className="text-xs text-[#86868B] font-medium">
            {transactions.length} total entries recorded
          </p>
        </div>
        <button
          onClick={() => setActiveTab('transactions')}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
        >
          View All
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Quick Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
        <input
          type="text"
          placeholder="Search transactions, payees, tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F7] dark:bg-slate-800/80 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-[#1D1D1F] dark:text-white placeholder-[#86868B]"
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        {transactions.length === 0 ? (
          <div className="text-center py-8 px-4 bg-[#F5F5F7] dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
              <FileText size={20} />
            </div>
            <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">No transactions recorded yet</p>
            <p className="text-[11px] text-[#86868B] mt-0.5 max-w-xs">
              Your recent transaction history is empty. Tap the button below to add your first entry.
            </p>
          </div>
        ) : filteredTx.length === 0 ? (
          <div className="text-center py-8 bg-[#F5F5F7] dark:bg-slate-800/50 rounded-2xl text-[#86868B] text-xs font-medium">
            No transactions found matching "{searchQuery}"
          </div>
        ) : (
          filteredTx.map((tx) => {
            const cat = categoryMap.get(tx.categoryId);
            const acc = accountMap.get(tx.accountId);
            const toAcc = tx.toAccountId ? accountMap.get(tx.toAccountId) : null;

            const isIncome = tx.type === 'income';
            const isExpense = tx.type === 'expense';
            const isTransfer = tx.type === 'transfer';

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 shadow-2xs hover:border-blue-400 dark:hover:border-blue-600 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryIcon
                    iconName={cat?.icon || (isIncome ? 'TrendingUp' : isTransfer ? 'Repeat' : 'Tag')}
                    color={cat?.color || (isIncome ? '#10B981' : isTransfer ? '#3B82F6' : '#EF4444')}
                    size={20}
                  />

                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#1D1D1F] dark:text-white truncate">
                      {tx.payeeOrMerchant || cat?.name || 'Transaction'}
                    </div>

                    <div className="text-[11px] text-[#86868B] mt-0.5 flex items-center gap-1.5 flex-wrap font-medium">
                      <span>{formatDateString(tx.date)}</span>
                      <span>•</span>
                      <span>
                        {acc?.name || 'Account'}
                        {toAcc ? ` → ${toAcc.name}` : ''}
                      </span>
                      {tx.receiptUrl && (
                        <span className="inline-flex items-center text-blue-500 text-[10px] font-semibold">
                          <Paperclip size={10} className="mr-0.5" />
                          Receipt
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div
                      className={`text-xs font-extrabold ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isExpense
                          ? 'text-[#1D1D1F] dark:text-white'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {isIncome ? '+' : isExpense ? '-' : ''}
                      {formatCurrency(tx.amount, tx.currency, settings.hideBalances)}
                    </div>
                    {tx.fee && tx.fee > 0 ? (
                      <div className="text-[10px] text-[#86868B]">Fee: ₱{tx.fee}</div>
                    ) : null}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTransaction(tx.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Entry"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail & Print Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-slate-800 rounded-[32px] p-6 shadow-2xl text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">Transaction Details</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    ID: #{selectedTx.id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close Modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-4 space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  {selectedTx.type} Amount
                </span>
                <span
                  className={`text-2xl font-black ${
                    selectedTx.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : selectedTx.type === 'expense'
                      ? 'text-slate-900 dark:text-white'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {selectedTx.type === 'income' ? '+' : selectedTx.type === 'expense' ? '-' : ''}
                  {formatCurrency(selectedTx.amount, selectedTx.currency)}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/60">
                  <span className="text-slate-500 font-medium">Payee / Merchant</span>
                  <span className="font-bold">{selectedTx.payeeOrMerchant || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/60">
                  <span className="text-slate-500 font-medium">Account</span>
                  <span className="font-bold">
                    {accountMap.get(selectedTx.accountId)?.name || 'Account'}
                    {selectedTx.toAccountId ? ` → ${accountMap.get(selectedTx.toAccountId)?.name}` : ''}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/60">
                  <span className="text-slate-500 font-medium">Category</span>
                  <span className="font-bold">{categoryMap.get(selectedTx.categoryId)?.name || 'Category'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/60">
                  <span className="text-slate-500 font-medium">Date</span>
                  <span className="font-bold">{formatDateString(selectedTx.date)}</span>
                </div>
                {selectedTx.note && (
                  <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/60">
                    <span className="text-slate-500 font-medium">Notes</span>
                    <span className="font-bold text-right max-w-[200px]">{selectedTx.note}</span>
                  </div>
                )}
                {selectedTx.tags && selectedTx.tags.length > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/60">
                    <span className="text-slate-500 font-medium">Tags</span>
                    <span className="font-bold text-blue-500">{selectedTx.tags.join(' ')}</span>
                  </div>
                )}
              </div>

              {selectedTx.receiptUrl && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-500 block mb-1">Attached Receipt Photo:</span>
                  <img
                    src={selectedTx.receiptUrl}
                    alt="Receipt attachment"
                    className="w-full max-h-48 object-cover rounded-2xl border border-slate-200 dark:border-slate-700"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center gap-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all active:scale-95"
              >
                Close Window
              </button>
              <button
                onClick={() => {
                  generateSingleTransactionReceiptPrint(
                    selectedTx,
                    accountMap.get(selectedTx.accountId),
                    categoryMap.get(selectedTx.categoryId),
                    selectedTx.toAccountId ? accountMap.get(selectedTx.toAccountId) : undefined
                  );
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
              >
                <Printer size={15} />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
