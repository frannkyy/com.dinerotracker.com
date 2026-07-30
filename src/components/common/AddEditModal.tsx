import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PH_INSTITUTIONS } from '../../data/phInstitutions';
import { AccountType, TransactionType } from '../../types';
import {
  ArrowRightLeft,
  Camera,
  Check,
  CreditCard,
  DollarSign,
  FileText,
  Image,
  Plus,
  Tag,
  X,
} from 'lucide-react';

export const AddEditModal: React.FC = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    addModalType,
    accounts,
    categories,
    addTransaction,
    addAccount,
    editAccount,
    editingAccount,
    setEditingAccount,
    saveBudget,
    addGoal,
    addDebt,
    addBill,
    editBill,
    editingBill,
    setEditingBill,
    showToast,
  } = useApp();

  // TRANSACTION STATE
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txAccountId, setTxAccountId] = useState(accounts[0]?.id || '');
  const [txToAccountId, setTxToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [txCategoryId, setTxCategoryId] = useState(categories[0]?.id || '');
  const [txPayee, setTxPayee] = useState('');
  const [txNote, setTxNote] = useState('');
  const [txTagInput, setTxTagInput] = useState('#Personal');
  const [txReceipt, setTxReceipt] = useState<string | null>(null);

  // ACCOUNT STATE
  const [accName, setAccName] = useState('');
  const [accInstitutionId, setAccInstitutionId] = useState('gcash');
  const [accType, setAccType] = useState<AccountType>('E-wallet');
  const [accBalance, setAccBalance] = useState('');
  const [accMaskedNum, setAccMaskedNum] = useState('');

  // BUDGET STATE
  const [bCategoryId, setBCategoryId] = useState(categories[0]?.id || '');
  const [bAmount, setBAmount] = useState('');

  // GOAL STATE
  const [gTitle, setGTitle] = useState('');
  const [gTarget, setGTarget] = useState('');
  const [gDate, setGDate] = useState('');

  // DEBT STATE
  const [dPerson, setDPerson] = useState('');
  const [dType, setDType] = useState<'i_owe' | 'owed_to_me'>('i_owe');
  const [dAmount, setDAmount] = useState('');
  const [dDueDate, setDDueDate] = useState('');

  // BILL STATE
  const [billTitle, setBillTitle] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState('');

  // Helper to reset all form fields to pristine default values
  const resetAllFields = () => {
    setTxType('expense');
    setTxAmount('');
    setTxAccountId(accounts[0]?.id || '');
    setTxToAccountId(accounts[1]?.id || accounts[0]?.id || '');
    setTxCategoryId(categories[0]?.id || '');
    setTxPayee('');
    setTxNote('');
    setTxTagInput('#Personal');
    setTxReceipt(null);

    setAccName('');
    setAccInstitutionId('gcash');
    setAccType('E-wallet');
    setAccBalance('');
    setAccMaskedNum('');

    setBCategoryId(categories[0]?.id || '');
    setBAmount('');

    setGTitle('');
    setGTarget('');
    setGDate('');

    setDPerson('');
    setDType('i_owe');
    setDAmount('');
    setDDueDate('');

    setBillTitle('');
    setBillAmount('');
    setBillDueDate(new Date().toISOString().slice(0, 10));
  };

  // Prefill effect when editing & reset when opening/changing
  React.useEffect(() => {
    if (isAddModalOpen) {
      resetAllFields();
      if (addModalType === 'account' && editingAccount) {
        setAccName(editingAccount.name);
        setAccInstitutionId(editingAccount.institutionId || 'gcash');
        setAccType(editingAccount.accountType);
        setAccBalance(editingAccount.balance.toString());
        setAccMaskedNum(editingAccount.accountNumberMasked || '');
      } else if (addModalType === 'bill' && editingBill) {
        setBillTitle(editingBill.title);
        setBillAmount(editingBill.amount.toString());
        setBillDueDate(editingBill.dueDate || new Date().toISOString().slice(0, 10));
      }
    }
  }, [isAddModalOpen, addModalType, editingAccount, editingBill]);

  if (!isAddModalOpen) return null;

  const handleClose = () => {
    resetAllFields();
    setEditingAccount(null);
    setEditingBill(null);
    setIsAddModalOpen(false);
  };

  // Receipt image simulated camera upload
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTxReceipt(event.target?.result as string);
        showToast('Receipt attached');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (addModalType === 'transaction') {
      const amountNum = parseFloat(txAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        showToast('Please enter a valid transaction amount');
        return;
      }

      addTransaction({
        type: txType,
        amount: amountNum,
        currency: 'PHP',
        accountId: txAccountId || accounts[0]?.id || '',
        toAccountId: txType === 'transfer' ? txToAccountId : undefined,
        categoryId: txCategoryId || categories[0]?.id || '',
        date: new Date().toISOString().slice(0, 10),
        payeeOrMerchant: txPayee || undefined,
        note: txNote || undefined,
        tags: txTagInput ? txTagInput.split(' ').filter(Boolean) : [],
        receiptUrl: txReceipt || undefined,
      });
      handleClose();
    } else if (addModalType === 'account') {
      const balNum = parseFloat(accBalance) || 0;
      const inst = PH_INSTITUTIONS.find((i) => i.id === accInstitutionId);

      if (editingAccount) {
        editAccount({
          ...editingAccount,
          name: accName || inst?.name || 'My Account',
          institutionId: accInstitutionId,
          accountType: accType,
          balance: balNum,
          accountNumberMasked: accMaskedNum || undefined,
          color: inst?.brandColor || editingAccount.color || '#3B82F6',
        });
      } else {
        addAccount({
          name: accName || inst?.name || 'My Account',
          institutionId: accInstitutionId,
          accountType: accType,
          balance: balNum,
          currency: 'PHP',
          accountNumberMasked: accMaskedNum || undefined,
          color: inst?.brandColor || '#3B82F6',
          iconName: 'Wallet',
        });
      }
      handleClose();
    } else if (addModalType === 'budget') {
      const bNum = parseFloat(bAmount);
      if (!bNum || bNum <= 0) return;

      saveBudget({
        categoryId: bCategoryId,
        amount: bNum,
        period: 'monthly',
        startDate: new Date().toISOString().slice(0, 10),
      });
      handleClose();
    } else if (addModalType === 'goal') {
      const targetNum = parseFloat(gTarget);
      if (!targetNum || targetNum <= 0) return;

      addGoal({
        title: gTitle || 'New Savings Goal',
        targetAmount: targetNum,
        currentAmount: 0,
        currency: 'PHP',
        targetDate: gDate || undefined,
        color: '#10B981',
        icon: 'PiggyBank',
      });
      handleClose();
    } else if (addModalType === 'debt') {
      const dNum = parseFloat(dAmount);
      if (!dNum || dNum <= 0) return;

      addDebt({
        type: dType,
        personOrEntity: dPerson || 'Contact',
        amount: dNum,
        remainingAmount: dNum,
        currency: 'PHP',
        dueDate: dDueDate || undefined,
        status: 'active',
      });
      handleClose();
    } else if (addModalType === 'bill') {
      const bNum = parseFloat(billAmount);
      if (!bNum || bNum <= 0) return;

      if (editingBill) {
        editBill({
          ...editingBill,
          title: billTitle || 'Recurring Bill',
          amount: bNum,
          dueDate: billDueDate || new Date().toISOString().slice(0, 10),
        });
      } else {
        addBill({
          title: billTitle || 'Recurring Bill',
          amount: bNum,
          currency: 'PHP',
          categoryId: 'exp_bills',
          accountId: accounts[0]?.id,
          frequency: 'monthly',
          dueDate: billDueDate || new Date().toISOString().slice(0, 10),
          status: 'unpaid',
          reminderDaysBefore: 3,
        });
      }
      handleClose();
    }
  };

  const getHeaderTitle = () => {
    if (addModalType === 'account') {
      return editingAccount ? 'Edit Account' : 'Add New Account';
    }
    if (addModalType === 'bill') {
      return editingBill ? 'Edit Bill' : 'Add New Bill';
    }
    return `Add New ${addModalType}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white capitalize">
            {getHeaderTitle()}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
          {/* TRANSACTION FORM */}
          {addModalType === 'transaction' && (
            <>
              {/* Type Switcher */}
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                {(['expense', 'income', 'transfer'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTxType(t)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                      txType === t
                        ? t === 'expense'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : t === 'income'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Amount (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Account / To Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {txType === 'transfer' ? 'From Account' : 'Account'}
                  </label>
                  <select
                    value={txAccountId}
                    onChange={(e) => setTxAccountId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (₱{a.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                {txType === 'transfer' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      To Account
                    </label>
                    <select
                      value={txToAccountId}
                      onChange={(e) => setTxToAccountId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} (₱{a.balance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {txType !== 'transfer' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Category
                    </label>
                    <select
                      value={txCategoryId}
                      onChange={(e) => setTxCategoryId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      {categories
                        .filter((c) => (txType === 'income' ? c.type === 'income' : c.type === 'expense'))
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Payee / Note */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Payee / Merchant Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. SM Supermarket, Jollibee, Grab, Meralco"
                  value={txPayee}
                  onChange={(e) => setTxPayee(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              {/* Tags & Receipt Attachment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tags (#Tag)
                  </label>
                  <input
                    type="text"
                    placeholder="#Groceries #Family"
                    value={txTagInput}
                    onChange={(e) => setTxTagInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Attach Receipt Photo
                  </label>
                  <label className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:border-blue-500 cursor-pointer flex items-center justify-center gap-1.5">
                    <Camera size={14} />
                    <span>{txReceipt ? 'Receipt Uploaded' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </>
          )}

          {/* ACCOUNT FORM */}
          {addModalType === 'account' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Philippine Financial Institution
                </label>
                <select
                  value={accInstitutionId}
                  onChange={(e) => {
                    const instId = e.target.value;
                    setAccInstitutionId(instId);
                    const inst = PH_INSTITUTIONS.find((i) => i.id === instId);
                    if (inst) {
                      setAccName(inst.name);
                      setAccType(inst.defaultType);
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {PH_INSTITUTIONS.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Account Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. My BPI Preferred Savings"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-medium text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Account Type
                  </label>
                  <select
                    value={accType}
                    onChange={(e) => setAccType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {[
                      'Savings',
                      'Checking',
                      'E-wallet',
                      'Digital Bank',
                      'Credit Card',
                      'Cash',
                      'Payroll',
                      'Time Deposit',
                      'Loan',
                      'Investment',
                      'Emergency Fund',
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Initial Balance (₱)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={accBalance}
                    onChange={(e) => setAccBalance(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Account Number / Mask (Optional)
                </label>
                <input
                  type="text"
                  placeholder="0917 ••• 1234 or 4012 •••• 9981"
                  value={accMaskedNum}
                  onChange={(e) => setAccMaskedNum(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-mono text-xs text-slate-900 dark:text-white"
                />
              </div>
            </>
          )}

          {/* BUDGET FORM */}
          {addModalType === 'budget' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Category
                </label>
                <select
                  value={bCategoryId}
                  onChange={(e) => setBCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {categories
                    .filter((c) => c.type === 'expense')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Monthly Limit (₱)
                </label>
                <input
                  type="number"
                  placeholder="10000"
                  value={bAmount}
                  onChange={(e) => setBAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-bold text-base text-slate-900 dark:text-white"
                  required
                />
              </div>
            </>
          )}

          {/* GOAL FORM */}
          {addModalType === 'goal' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tokyo Travel Fund 2027"
                  value={gTitle}
                  onChange={(e) => setGTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Amount (₱)
                  </label>
                  <input
                    type="number"
                    placeholder="100000"
                    value={gTarget}
                    onChange={(e) => setGTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={gDate}
                    onChange={(e) => setGDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </>
          )}

          {/* DEBT FORM */}
          {addModalType === 'debt' && (
            <>
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setDType('i_owe')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    dType === 'i_owe' ? 'bg-rose-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  I Owe (Borrowed)
                </button>
                <button
                  type="button"
                  onClick={() => setDType('owed_to_me')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    dType === 'owed_to_me' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Owed To Me (Lent)
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Contact or Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. BPI Auto Loan or Mark"
                  value={dPerson}
                  onChange={(e) => setDPerson(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Amount (₱)
                  </label>
                  <input
                    type="number"
                    placeholder="15000"
                    value={dAmount}
                    onChange={(e) => setDAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dDueDate}
                    onChange={(e) => setDDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </>
          )}

          {/* BILL FORM */}
          {addModalType === 'bill' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Bill Name / Utility
                </label>
                <input
                  type="text"
                  placeholder="e.g. Meralco, PLDT, Netflix, Spotify"
                  value={billTitle}
                  onChange={(e) => setBillTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Amount Due (₱)
                  </label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
