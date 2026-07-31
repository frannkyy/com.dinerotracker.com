import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Account,
  BillItem,
  Budget,
  Category,
  DebtItem,
  SavingsGoal,
  Transaction,
  UserSettings,
} from '../types';
import { getStoredData, saveAllData, clearAllStorage } from '../utils/storage';
import { DEFAULT_CATEGORIES } from '../data/categories';
import confetti from 'canvas-confetti';
import { AdMobInterstitialModal } from '../components/common/AdMobInterstitialModal';
import { GooglePlayBillingModal } from '../components/common/GooglePlayBillingModal';

interface AppContextType {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: SavingsGoal[];
  debts: DebtItem[];
  bills: BillItem[];
  settings: UserSettings;
  isLocked: boolean;
  activeTab: 'dashboard' | 'accounts' | 'bills' | 'transactions' | 'budgets' | 'goals' | 'analytics' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'accounts' | 'bills' | 'transactions' | 'budgets' | 'goals' | 'analytics' | 'settings') => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Account operations
  addAccount: (acc: Omit<Account, 'id' | 'updatedAt'>) => void;
  editAccount: (acc: Account) => void;
  deleteAccount: (id: string) => void;

  // Transaction operations
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  editTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;

  // Budget operations
  saveBudget: (budget: Omit<Budget, 'id'> & { id?: string }) => void;
  deleteBudget: (id: string) => void;

  // Goal operations
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  editGoal: (goal: SavingsGoal) => void;
  deleteGoal: (id: string) => void;
  depositToGoal: (goalId: string, amount: number, accountId: string) => void;

  // Debt operations
  addDebt: (debt: Omit<DebtItem, 'id' | 'updatedAt'>) => void;
  editDebt: (debt: DebtItem) => void;
  deleteDebt: (id: string) => void;
  recordDebtPayment: (debtId: string, paymentAmount: number, accountId: string) => void;

  // Bill operations
  addBill: (bill: Omit<BillItem, 'id'>) => void;
  editBill: (bill: BillItem) => void;
  deleteBill: (id: string) => void;
  markBillAsPaid: (billId: string, accountId: string) => void;

  // Category operations
  addCategory: (cat: Omit<Category, 'id'>) => void;

  // Settings & Security
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  unlockApp: (pin: string) => boolean;
  lockApp: () => void;
  resetBalancesToZero: () => void;
  resetAllData: () => void;
  restoreFromJSON: (jsonString: string) => boolean;
  triggerConfetti: () => void;
  showSplash: boolean;
  setShowSplash: (show: boolean) => void;
  triggerSplash: () => void;

  // Modal Triggers & Editing States
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  addModalType: 'transaction' | 'account' | 'budget' | 'goal' | 'debt' | 'bill';
  setAddModalType: (type: 'transaction' | 'account' | 'budget' | 'goal' | 'debt' | 'bill') => void;
  openAddModal: (type?: 'transaction' | 'account' | 'budget' | 'goal' | 'debt' | 'bill') => void;
  editingAccount: Account | null;
  setEditingAccount: (acc: Account | null) => void;
  openEditAccountModal: (acc: Account) => void;
  editingBill: BillItem | null;
  setEditingBill: (bill: BillItem | null) => void;
  openEditBillModal: (bill: BillItem) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  openNotificationsModal: () => void;

  // AdMob Interstitial & Action Capping
  actionCount: number;
  showInterstitialAd: boolean;
  triggerInterstitialAd: () => void;
  dismissInterstitialAd: () => void;
  recordActionAndCheckAd: (actionName?: string) => void;

  // Google Play Billing
  isPlayBillingOpen: boolean;
  openPlayBillingModal: () => void;
  closePlayBillingModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialData = getStoredData();

  const [accounts, setAccounts] = useState<Account[]>(initialData.accounts);
  const [transactions, setTransactions] = useState<Transaction[]>(initialData.transactions);
  const [categories, setCategories] = useState<Category[]>(initialData.categories || DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>(initialData.budgets);
  const [goals, setGoals] = useState<SavingsGoal[]>(initialData.goals);
  const [debts, setDebts] = useState<DebtItem[]>(initialData.debts);
  const [bills, setBills] = useState<BillItem[]>(initialData.bills);
  const [settings, setSettings] = useState<UserSettings>(initialData.settings);

  const [isLocked, setIsLocked] = useState<boolean>(initialData.settings.securityPinEnabled);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'transactions' | 'budgets' | 'goals' | 'analytics' | 'settings'>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Auto-download backup when opened in external default browser (Chrome / Safari)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'download-backup') {
      // Clean query parameter from URL without page reload
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      setTimeout(async () => {
        const data = getStoredData();
        const { downloadJSONBackup } = await import('../utils/export');
        downloadJSONBackup(data);
        showToast('Backup downloaded successfully in your default browser!');
      }, 600);
    }
  }, []);

  const triggerSplash = () => {
    setShowSplash(true);
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<'transaction' | 'account' | 'budget' | 'goal' | 'debt' | 'bill'>('transaction');
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingBill, setEditingBill] = useState<BillItem | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // AdMob Interstitial Capping State
  const [actionCount, setActionCount] = useState<number>(0);
  const [showInterstitialAd, setShowInterstitialAd] = useState<boolean>(false);
  const [isPlayBillingOpen, setIsPlayBillingOpen] = useState<boolean>(false);

  const openPlayBillingModal = () => setIsPlayBillingOpen(true);
  const closePlayBillingModal = () => setIsPlayBillingOpen(false);

  const recordActionAndCheckAd = (_actionName?: string) => {
    if (settings.adsEnabled === false || settings.hasPurchasedRemoveAds) return;

    setActionCount((prev) => {
      const next = prev + 1;
      const freq = settings.interstitialFrequency || 8;
      if (next >= freq) {
        setTimeout(() => {
          setShowInterstitialAd(true);
        }, 350);
        return 0;
      }
      return next;
    });
  };

  const triggerInterstitialAd = () => {
    setShowInterstitialAd(true);
  };

  const dismissInterstitialAd = () => {
    setShowInterstitialAd(false);
  };

  // Auto persist changes to localStorage
  useEffect(() => {
    saveAllData({
      accounts,
      transactions,
      categories,
      budgets,
      goals,
      debts,
      bills,
      settings,
    });
  }, [accounts, transactions, categories, budgets, goals, debts, bills, settings]);

  // Sync theme based on system device preference (prefers-color-scheme)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        document.body.style.backgroundColor = '#121212';
        document.body.style.color = '#F5F5F7';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        document.body.style.backgroundColor = '#F8F9FA';
        document.body.style.color = '#0F172A';
      }
    };

    // Apply initial system preference
    applyTheme(mediaQuery.matches);

    // Listen for device theme updates
    const handleChange = (e: MediaQueryListEvent) => {
      applyTheme(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      // Fallback for older Safari/iOS
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }
  };

  const openAddModal = (type: 'transaction' | 'account' | 'budget' | 'goal' | 'debt' | 'bill' = 'transaction') => {
    setEditingAccount(null);
    setEditingBill(null);
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  const openEditAccountModal = (acc: Account) => {
    setEditingAccount(acc);
    setEditingBill(null);
    setAddModalType('account');
    setIsAddModalOpen(true);
  };

  const openEditBillModal = (bill: BillItem) => {
    setEditingBill(bill);
    setEditingAccount(null);
    setAddModalType('bill');
    setIsAddModalOpen(true);
  };

  const openNotificationsModal = () => {
    setIsNotificationsOpen(true);
  };

  // ACCOUNTS
  const addAccount = (accData: Omit<Account, 'id' | 'updatedAt'>) => {
    const newAcc: Account = {
      ...accData,
      id: `acc_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setAccounts((prev) => [newAcc, ...prev]);
    showToast(`Added ${newAcc.name} successfully`);
  };

  const editAccount = (updated: Account) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : a))
    );
    showToast(`Updated ${updated.name}`);
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    showToast('Account deleted');
  };

  // TRANSACTIONS
  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update source account balance
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (acc.id === newTx.accountId) {
          if (newTx.type === 'income') {
            return { ...acc, balance: acc.balance + newTx.amount };
          } else if (newTx.type === 'expense') {
            return { ...acc, balance: acc.balance - newTx.amount - (newTx.fee || 0) };
          } else if (newTx.type === 'transfer') {
            return { ...acc, balance: acc.balance - newTx.amount - (newTx.fee || 0) };
          }
        }
        if (newTx.type === 'transfer' && acc.id === newTx.toAccountId) {
          return { ...acc, balance: acc.balance + newTx.amount };
        }
        return acc;
      })
    );

    showToast(
      newTx.type === 'income'
        ? `Added Income of ₱${newTx.amount.toLocaleString()}`
        : newTx.type === 'expense'
        ? `Added Expense of ₱${newTx.amount.toLocaleString()}`
        : `Transferred ₱${newTx.amount.toLocaleString()}`
    );
    recordActionAndCheckAd('add_transaction');
  };

  const editTransaction = (updatedTx: Transaction) => {
    // For simplicity, replace transaction
    setTransactions((prev) => prev.map((t) => (t.id === updatedTx.id ? updatedTx : t)));
    showToast('Transaction updated');
    recordActionAndCheckAd('edit_transaction');
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Revert balance impact
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === tx.accountId) {
          if (tx.type === 'income') return { ...acc, balance: acc.balance - tx.amount };
          if (tx.type === 'expense' || tx.type === 'transfer')
            return { ...acc, balance: acc.balance + tx.amount + (tx.fee || 0) };
        }
        if (tx.type === 'transfer' && acc.id === tx.toAccountId) {
          return { ...acc, balance: acc.balance - tx.amount };
        }
        return acc;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaction deleted and balances updated');
  };

  // BUDGETS
  const saveBudget = (bData: Omit<Budget, 'id'> & { id?: string }) => {
    if (bData.id) {
      setBudgets((prev) => prev.map((b) => (b.id === bData.id ? (bData as Budget) : b)));
      showToast('Budget updated');
    } else {
      const newB: Budget = {
        ...bData,
        id: `b_${Date.now()}`,
      };
      setBudgets((prev) => [...prev, newB]);
      showToast('Budget created');
    }
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    showToast('Budget removed');
  };

  // GOALS
  const addGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    const newG: SavingsGoal = {
      ...goalData,
      id: `g_${Date.now()}`,
    };
    setGoals((prev) => [newG, ...prev]);
    showToast(`Created goal "${newG.title}"`);
  };

  const editGoal = (updated: SavingsGoal) => {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    showToast('Goal updated');
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    showToast('Goal deleted');
  };

  const depositToGoal = (goalId: string, amount: number, accountId: string) => {
    const targetGoal = goals.find((g) => g.id === goalId);
    if (!targetGoal) return;

    const sourceAcc = accounts.find((a) => a.id === accountId);
    if (!sourceAcc || sourceAcc.balance < amount) {
      showToast('Insufficient funds in selected account');
      return;
    }

    // Deduct from account
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, balance: a.balance - amount } : a))
    );

    // Add to goal
    const newCurrent = targetGoal.currentAmount + amount;
    const isNowCompleted = newCurrent >= targetGoal.targetAmount;

    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              currentAmount: newCurrent,
              isCompleted: isNowCompleted,
            }
          : g
      )
    );

    // Record transaction
    addTransaction({
      type: 'expense',
      amount,
      currency: targetGoal.currency || 'PHP',
      accountId,
      categoryId: 'exp_other',
      date: new Date().toISOString().slice(0, 10),
      payeeOrMerchant: `Goal Stash: ${targetGoal.title}`,
      note: `Deposited ₱${amount.toLocaleString()} into savings goal`,
      tags: ['#SavingsGoal'],
    });

    if (isNowCompleted) {
      triggerConfetti();
      showToast(`🎉 Goal "${targetGoal.title}" Completed! Congratulations!`);
    } else {
      showToast(`Added ₱${amount.toLocaleString()} to ${targetGoal.title}`);
    }
  };

  // DEBTS
  const addDebt = (debtData: Omit<DebtItem, 'id' | 'updatedAt'>) => {
    const newD: DebtItem = {
      ...debtData,
      id: `d_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setDebts((prev) => [newD, ...prev]);
    showToast('Debt/Loan entry recorded');
  };

  const editDebt = (updated: DebtItem) => {
    setDebts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    showToast('Debt details updated');
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
    showToast('Debt item removed');
  };

  const recordDebtPayment = (debtId: string, paymentAmount: number, accountId: string) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) return;

    const newRemaining = Math.max(0, debt.remainingAmount - paymentAmount);
    const isSettled = newRemaining === 0;

    setDebts((prev) =>
      prev.map((d) =>
        d.id === debtId
          ? {
              ...d,
              remainingAmount: newRemaining,
              status: isSettled ? 'settled' : 'active',
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    );

    // Create transaction
    addTransaction({
      type: debt.type === 'i_owe' ? 'expense' : 'income',
      amount: paymentAmount,
      currency: debt.currency || 'PHP',
      accountId,
      categoryId: debt.type === 'i_owe' ? 'exp_debt_pay' : 'inc_other',
      date: new Date().toISOString().slice(0, 10),
      payeeOrMerchant: debt.personOrEntity,
      note: `Repayment for ${debt.personOrEntity}`,
      tags: ['#DebtPayment'],
    });

    if (isSettled) {
      triggerConfetti();
      showToast(`🎉 ${debt.personOrEntity} debt fully settled!`);
    } else {
      showToast(`Recorded payment of ₱${paymentAmount.toLocaleString()}`);
    }
  };

  // BILLS
  const addBill = (billData: Omit<BillItem, 'id'>) => {
    const newB: BillItem = {
      ...billData,
      id: `bill_${Date.now()}`,
    };
    setBills((prev) => [newB, ...prev]);
    showToast(`Bill "${newB.title}" added`);
    recordActionAndCheckAd('add_bill');
  };

  const editBill = (updated: BillItem) => {
    setBills((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    showToast('Bill updated');
    recordActionAndCheckAd('edit_bill');
  };

  const deleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
    showToast('Bill removed');
  };

  const markBillAsPaid = (billId: string, accountId: string) => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill) return;

    // Create expense transaction
    addTransaction({
      type: 'expense',
      amount: bill.amount,
      currency: bill.currency || 'PHP',
      accountId,
      categoryId: bill.categoryId || 'exp_bills',
      date: new Date().toISOString().slice(0, 10),
      payeeOrMerchant: bill.title,
      note: `Paid recurring bill: ${bill.title}`,
      tags: ['#BillPayment'],
    });

    // Update bill status
    setBills((prev) =>
      prev.map((b) =>
        b.id === billId
          ? {
              ...b,
              status: 'paid',
              lastPaidDate: new Date().toISOString().slice(0, 10),
            }
          : b
      )
    );

    showToast(`Paid ${bill.title} (₱${bill.amount.toLocaleString()})`);
  };

  // CATEGORY
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newC: Category = {
      ...catData,
      id: `cat_${Date.now()}`,
    };
    setCategories((prev) => [...prev, newC]);
    showToast(`Category "${newC.name}" created`);
  };

  // SETTINGS
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.securityPinEnabled && !updated.pinCode) {
        // default PIN if none set
        updated.pinCode = '1234';
      }
      return updated;
    });
    showToast('Settings saved');
  };

  const unlockApp = (pin: string) => {
    const activePin = settings.pinCode || '1234';
    if (pin === activePin) {
      setIsLocked(false);
      showToast('App unlocked successfully');
      return true;
    }
    return false;
  };

  const lockApp = () => {
    setIsLocked(true);
  };

  const resetBalancesToZero = () => {
    setAccounts((prev) => prev.map((a) => ({ ...a, balance: 0 })));
    setTransactions([]);
    setDebts([]);
    setGoals([]);
    setBills([]);
    setBudgets([]);
    showToast('All account balances, history & analytics reset to ₱0');
  };

  const resetAllData = () => {
    clearAllStorage();
    window.location.reload();
  };

  const restoreFromJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.accounts && data.transactions) {
        setAccounts(data.accounts);
        setTransactions(data.transactions);
        if (data.categories) setCategories(data.categories);
        if (data.budgets) setBudgets(data.budgets);
        if (data.goals) setGoals(data.goals);
        if (data.debts) setDebts(data.debts);
        if (data.bills) setBills(data.bills);
        if (data.settings) setSettings(data.settings);
        showToast('Database successfully restored!');
        return true;
      }
      return false;
    } catch {
      showToast('Invalid backup file structure');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        accounts,
        transactions,
        categories,
        budgets,
        goals,
        debts,
        bills,
        settings,
        isLocked,
        activeTab,
        setActiveTab,
        toastMessage,
        showToast,
        addAccount,
        editAccount,
        deleteAccount,
        addTransaction,
        editTransaction,
        deleteTransaction,
        saveBudget,
        deleteBudget,
        addGoal,
        editGoal,
        deleteGoal,
        depositToGoal,
        addDebt,
        editDebt,
        deleteDebt,
        recordDebtPayment,
        addBill,
        editBill,
        deleteBill,
        markBillAsPaid,
        addCategory,
        updateSettings,
        unlockApp,
        lockApp,
        resetBalancesToZero,
        resetAllData,
        restoreFromJSON,
        triggerConfetti,
        showSplash,
        setShowSplash,
        triggerSplash,
        isAddModalOpen,
        setIsAddModalOpen,
        addModalType,
        setAddModalType,
        openAddModal,
        editingAccount,
        setEditingAccount,
        openEditAccountModal,
        editingBill,
        setEditingBill,
        openEditBillModal,
        isNotificationsOpen,
        setIsNotificationsOpen,
        openNotificationsModal,
        actionCount,
        showInterstitialAd,
        triggerInterstitialAd,
        dismissInterstitialAd,
        recordActionAndCheckAd,
        isPlayBillingOpen,
        openPlayBillingModal,
        closePlayBillingModal,
      }}
    >
      {children}
      <AdMobInterstitialModal
        isOpen={showInterstitialAd}
        onClose={dismissInterstitialAd}
      />
      <GooglePlayBillingModal
        isOpen={isPlayBillingOpen}
        onClose={closePlayBillingModal}
      />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
