export type AccountType =
  | 'Cash'
  | 'Savings'
  | 'Checking'
  | 'Passbook'
  | 'Payroll'
  | 'Time Deposit'
  | 'Credit Card'
  | 'Loan'
  | 'E-wallet'
  | 'Digital Bank'
  | 'Investment'
  | 'Cryptocurrency'
  | 'Emergency Fund'
  | 'Business Account'
  | 'Petty Cash'
  | 'Custom Account';

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface PHInstitution {
  id: string;
  name: string;
  shortName: string;
  category: 'Bank' | 'Digital Bank' | 'E-Wallet' | 'Other';
  brandColor: string;
  textColor: string;
  logoInitial: string;
  defaultType: AccountType;
  description?: string;
}

export interface Account {
  id: string;
  name: string;
  institutionId?: string; // e.g., 'gcash', 'bpi', 'maya'
  accountType: AccountType;
  balance: number;
  currency: string; // e.g. 'PHP', 'USD'
  accountNumberMasked?: string;
  color: string;
  iconName: string;
  isArchived?: boolean;
  notes?: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  accountId: string;
  toAccountId?: string; // For transfers
  categoryId: string;
  date: string; // ISO string YYYY-MM-DD or YYYY-MM-DDTHH:mm
  payeeOrMerchant?: string;
  note?: string;
  tags?: string[];
  receiptUrl?: string; // Base64 or image URL
  fee?: number;
}

export interface Budget {
  id: string;
  categoryId: string; // or 'all' for total monthly budget
  amount: number;
  period: 'monthly' | 'weekly';
  startDate: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate?: string;
  category?: string;
  color: string;
  icon: string;
  linkedAccountId?: string;
  note?: string;
  isCompleted?: boolean;
}

export interface DebtItem {
  id: string;
  type: 'i_owe' | 'owed_to_me';
  personOrEntity: string;
  amount: number;
  remainingAmount: number;
  currency: string;
  dueDate?: string;
  interestRate?: number;
  linkedAccountId?: string;
  status: 'active' | 'settled';
  notes?: string;
  updatedAt: string;
}

export interface BillItem {
  id: string;
  title: string;
  amount: number;
  currency: string;
  categoryId: string;
  accountId?: string;
  frequency: 'monthly' | 'weekly' | 'yearly' | 'one-time';
  dueDate: string; // YYYY-MM-DD
  isAutoPaid?: boolean;
  status: 'unpaid' | 'paid' | 'overdue';
  lastPaidDate?: string;
  reminderDaysBefore: number;
  note?: string;
}

export interface UserSettings {
  userName?: string;
  currency: string;
  currencySymbol: string;
  hideBalances: boolean;
  theme: 'light' | 'dark' | 'system';
  securityPinEnabled: boolean;
  pinCode?: string;
  biometricsEnabled: boolean;
  autoLockMinutes: number;
  enableNotifications: boolean;
  lastBackupDate?: string;
  cloudSyncEnabled: boolean;
  showMobileFrame: boolean;
  adsEnabled?: boolean;
  admobPublisherId?: string;
  admobBannerUnitId?: string;
  admobNativeUnitId?: string;
  admobInterstitialUnitId?: string;
  interstitialFrequency?: number; // Actions frequency before interstitial ad triggers (e.g. 8 or 10)
}

export interface ExportFilterOptions {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  categoryId?: string;
  type?: TransactionType | 'all';
}
