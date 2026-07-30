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
import {
  INITIAL_ACCOUNTS,
  INITIAL_BILLS,
  INITIAL_BUDGETS,
  INITIAL_DEBTS,
  INITIAL_GOALS,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
} from '../data/defaultData';
import { DEFAULT_CATEGORIES } from '../data/categories';

const STORAGE_KEYS = {
  ACCOUNTS: 'dinero_accounts_v3',
  TRANSACTIONS: 'dinero_transactions_v3',
  CATEGORIES: 'dinero_categories_v3',
  BUDGETS: 'dinero_budgets_v3',
  GOALS: 'dinero_goals_v3',
  DEBTS: 'dinero_debts_v3',
  BILLS: 'dinero_bills_v3',
  SETTINGS: 'dinero_settings_v3',
};

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
  }
}

export function getStoredData() {
  const loadedSettings = loadFromStorage<UserSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);

  // Sanitize AdMob IDs if they contain test unit IDs from prior installs
  const settings: UserSettings = {
    ...INITIAL_SETTINGS,
    ...loadedSettings,
    admobPublisherId:
      !loadedSettings.admobPublisherId || loadedSettings.admobPublisherId.includes('3940256099942544')
        ? INITIAL_SETTINGS.admobPublisherId
        : loadedSettings.admobPublisherId,
    admobBannerUnitId:
      !loadedSettings.admobBannerUnitId || loadedSettings.admobBannerUnitId.includes('3940256099942544')
        ? INITIAL_SETTINGS.admobBannerUnitId
        : loadedSettings.admobBannerUnitId,
    admobInterstitialUnitId:
      !loadedSettings.admobInterstitialUnitId || loadedSettings.admobInterstitialUnitId.includes('3940256099942544')
        ? INITIAL_SETTINGS.admobInterstitialUnitId
        : loadedSettings.admobInterstitialUnitId,
    admobNativeUnitId:
      !loadedSettings.admobNativeUnitId || loadedSettings.admobNativeUnitId.includes('3940256099942544')
        ? INITIAL_SETTINGS.admobNativeUnitId
        : loadedSettings.admobNativeUnitId,
  };

  return {
    accounts: loadFromStorage<Account[]>(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS),
    transactions: loadFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS),
    categories: loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES),
    budgets: loadFromStorage<Budget[]>(STORAGE_KEYS.BUDGETS, INITIAL_BUDGETS),
    goals: loadFromStorage<SavingsGoal[]>(STORAGE_KEYS.GOALS, INITIAL_GOALS),
    debts: loadFromStorage<DebtItem[]>(STORAGE_KEYS.DEBTS, INITIAL_DEBTS),
    bills: loadFromStorage<BillItem[]>(STORAGE_KEYS.BILLS, INITIAL_BILLS),
    settings,
  };
}

export function saveAllData(data: {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: SavingsGoal[];
  debts: DebtItem[];
  bills: BillItem[];
  settings: UserSettings;
}) {
  saveToStorage(STORAGE_KEYS.ACCOUNTS, data.accounts);
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, data.transactions);
  saveToStorage(STORAGE_KEYS.CATEGORIES, data.categories);
  saveToStorage(STORAGE_KEYS.BUDGETS, data.budgets);
  saveToStorage(STORAGE_KEYS.GOALS, data.goals);
  saveToStorage(STORAGE_KEYS.DEBTS, data.debts);
  saveToStorage(STORAGE_KEYS.BILLS, data.bills);
  saveToStorage(STORAGE_KEYS.SETTINGS, data.settings);
}

export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}
