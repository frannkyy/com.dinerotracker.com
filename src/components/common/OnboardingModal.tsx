import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Smartphone, Sparkles, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CURRENCIES = [
  { code: 'PHP', symbol: '₱', label: 'Philippine Peso (₱)' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen (¥)' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar (S$)' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)' },
  { code: 'AED', symbol: 'AED', label: 'UAE Dirham (AED)' },
  { code: 'MYR', symbol: 'RM', label: 'Malaysian Ringgit (RM)' },
];

export const OnboardingModal: React.FC = () => {
  const { settings, updateSettings, showToast } = useApp();
  const [nameInput, setNameInput] = useState(settings.userName || '');
  const [selectedCurrency, setSelectedCurrency] = useState(settings.currency || 'PHP');

  // If user already has a name set, don't show the onboarding modal
  if (settings.userName && settings.userName.trim().length > 0) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim();
    if (!cleanName) {
      showToast('Please enter your name to proceed');
      return;
    }
    const selectedCurrObj = CURRENCIES.find((c) => c.code === selectedCurrency);

    updateSettings({
      userName: cleanName,
      currency: selectedCurrency,
      currencySymbol: selectedCurrObj?.symbol || '$',
    });
    showToast(`Welcome, ${cleanName}! Currency set to ${selectedCurrency}.`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-slate-800 rounded-[32px] p-6 sm:p-8 shadow-2xl text-[#1D1D1F] dark:text-white max-h-[90vh] overflow-y-auto"
        >
          {/* Header Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative p-3.5 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30">
              <Smartphone size={32} />
              <div className="absolute -top-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow-md">
                <Sparkles size={12} />
              </div>
            </div>
          </div>

          {/* Title & Tagline */}
          <div className="text-center mb-5">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 inline-block mb-2">
              Welcome to Dinero Tracker
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-white">
              Set Up Your Profile
            </h2>
            <p className="text-xs text-[#86868B] dark:text-slate-400 mt-1 leading-relaxed max-w-xs mx-auto">
              Choose your name & preferred default currency to calculate balances, accounts, and budgets.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#86868B] block mb-1.5">
                Your Preferred Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B]">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g., Rafael, Maria, Alex"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F7] dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Quick Preset Names */}
            <div>
              <span className="text-[11px] font-medium text-[#86868B] block mb-1">Quick Name Suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {['Rafael', 'Maria', 'Juan', 'Alex', 'Sophia'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNameInput(preset)}
                    className="px-2.5 py-0.5 rounded-xl text-xs font-semibold bg-[#F5F5F7] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-gray-100 dark:border-slate-800"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency Selector */}
            <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-[#86868B] flex items-center gap-1.5 mb-1.5">
                <Globe size={14} className="text-blue-600 dark:text-blue-400" />
                <span>Select Default Currency</span>
              </label>

              <div className="grid grid-cols-2 gap-1.5 mb-2 max-h-36 overflow-y-auto pr-1">
                {CURRENCIES.map((curr) => (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setSelectedCurrency(curr.code)}
                    className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                      selectedCurrency === curr.code
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-[#F5F5F7] dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{curr.label}</span>
                    <span className="font-extrabold opacity-80">{curr.symbol}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subtext info */}
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 text-[11px] text-[#86868B]">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
              <span>All data remains 100% offline and securely stored on your device.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started & Sync Dashboard</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
