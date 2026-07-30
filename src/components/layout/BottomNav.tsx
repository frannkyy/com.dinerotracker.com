import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Clock,
  CreditCard,
  Grid,
  LayoutDashboard,
  Plus,
  Receipt,
  Target,
} from 'lucide-react';
import { motion } from 'motion/react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openAddModal } = useApp();

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: CreditCard },
    { id: 'bills', label: 'Bills', icon: Clock },
    { id: 'transactions', label: 'History', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Tools', icon: Grid },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 pointer-events-none">
      <div className="max-w-lg mx-auto pointer-events-auto bg-white/95 dark:bg-[#1D1D1F]/95 backdrop-blur-xl border border-gray-200/80 dark:border-slate-800 rounded-[28px] shadow-2xl p-1.5 flex items-center justify-between">
        {tabs.slice(0, 3).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="relative flex-1 flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all active:scale-95 text-[#86868B]"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-blue-50 dark:bg-blue-950/60 rounded-2xl"
                  transition={{ type: 'spring', duration: 0.4 }}
                />
              )}
              <Icon
                size={18}
                className={`z-10 transition-colors ${
                  isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
                }`}
              />
              <span
                className={`z-10 text-[9px] mt-0.5 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-[#86868B] font-semibold'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Floating Center Action Button (+ FAB) */}
        <div className="relative px-1 -mt-7">
          <button
            onClick={() => openAddModal('transaction')}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 active:scale-90 transition-transform duration-200 ring-4 ring-[#F5F5F7] dark:ring-[#121212]"
            title="Add New Transaction"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>
        </div>

        {tabs.slice(3).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="relative flex-1 flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all active:scale-95 text-[#86868B]"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-blue-50 dark:bg-blue-950/60 rounded-2xl"
                  transition={{ type: 'spring', duration: 0.4 }}
                />
              )}
              <Icon
                size={18}
                className={`z-10 transition-colors ${
                  isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
                }`}
              />
              <span
                className={`z-10 text-[9px] mt-0.5 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-[#86868B] font-semibold'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
