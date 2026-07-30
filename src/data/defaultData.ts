import { Account, Budget, BillItem, DebtItem, SavingsGoal, Transaction, UserSettings } from '../types';

export const INITIAL_ACCOUNTS: Account[] = [];

const today = new Date();
const formatDate = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_BUDGETS: Budget[] = [];

export const INITIAL_GOALS: SavingsGoal[] = [];

export const INITIAL_DEBTS: DebtItem[] = [];

export const INITIAL_BILLS: BillItem[] = [];

export const INITIAL_SETTINGS: UserSettings = {
  currency: 'PHP',
  currencySymbol: '₱',
  hideBalances: false,
  theme: 'dark', // Apple premium dark feel by default or toggleable
  securityPinEnabled: false,
  pinCode: undefined,
  biometricsEnabled: true,
  autoLockMinutes: 5,
  enableNotifications: true,
  cloudSyncEnabled: false,
  showMobileFrame: false, // Can toggle mobile device frame in header
  adsEnabled: true,
  admobPublisherId: 'ca-app-pub-2285121147680297~4425275798',
  admobBannerUnitId: 'ca-app-pub-2285121147680297/7496527811',
  admobInterstitialUnitId: 'ca-app-pub-2285121147680297/1370671386',
  admobNativeUnitId: 'ca-app-pub-2285121147680297/7308679768',
  interstitialFrequency: 8, // Triggers every 8 key actions
};
