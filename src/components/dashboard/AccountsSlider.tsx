import React from 'react';
import { useApp } from '../../context/AppContext';
import { BankLogo } from '../common/BankLogo';
import { formatCurrency } from '../../utils/formatters';
import { ChevronRight, Plus } from 'lucide-react';

export const AccountsSlider: React.FC = () => {
  const { accounts, settings, setActiveTab, openAddModal } = useApp();

  return (
    <div className="bg-white dark:bg-[#1D1D1F] rounded-[32px] p-6 shadow-xs border border-gray-100 dark:border-slate-800 my-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-[#1D1D1F] dark:text-white">Accounts & Wallets</h3>
          <p className="text-xs text-[#86868B] font-medium">
            {accounts.length} Linked Institutions
          </p>
        </div>
        <button
          onClick={() => setActiveTab('accounts')}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
        >
          See All
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x">
        {accounts.length === 0 ? (
          <div
            onClick={() => openAddModal('account')}
            className="w-full p-5 rounded-2xl bg-[#F5F5F7] dark:bg-slate-800/50 border border-dashed border-gray-200 dark:border-slate-800 hover:border-blue-500 transition-colors flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Plus size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">Add Your First Account</p>
                <p className="text-[11px] text-[#86868B]">Connect your bank, e-wallet, or cash wallet</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Add +</span>
          </div>
        ) : (
          <>
            {accounts.map((acc) => (
              <div
                key={acc.id}
                onClick={() => setActiveTab('accounts')}
                className="snap-start shrink-0 w-52 p-4 rounded-2xl bg-[#F5F5F7] dark:bg-slate-800/80 border border-gray-100 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-98 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <BankLogo
                    institutionId={acc.institutionId}
                    accountType={acc.accountType}
                    name={acc.name}
                    size="sm"
                    customColor={acc.color}
                  />
                  <span className="text-[10px] font-bold text-[#86868B] uppercase">
                    {acc.accountType}
                  </span>
                </div>

                <div className="mt-1">
                  <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white truncate">
                    {acc.name}
                  </p>
                  <p className="font-bold text-base text-[#1D1D1F] dark:text-white mt-0.5">
                    {formatCurrency(acc.balance, acc.currency, settings.hideBalances)}
                  </p>
                </div>
              </div>
            ))}

            {/* Add Account Card */}
            <button
              onClick={() => openAddModal('account')}
              className="snap-start shrink-0 w-36 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 flex flex-col items-center justify-center p-4 text-[#86868B] hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-[#F5F5F7]/50 dark:bg-slate-800/30"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-1.5">
                <Plus size={18} />
              </div>
              <span className="text-xs font-bold">Add Account</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
