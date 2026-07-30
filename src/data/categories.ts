import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // EXPENSES
  {
    id: 'exp_food',
    name: 'Food & Dining',
    type: 'expense',
    icon: 'Utensils',
    color: '#EF4444', // Red
    isDefault: true,
  },
  {
    id: 'exp_groceries',
    name: 'Groceries & Supermarket',
    type: 'expense',
    icon: 'ShoppingCart',
    color: '#F97316', // Orange
    isDefault: true,
  },
  {
    id: 'exp_transport',
    name: 'Transportation & Commute',
    type: 'expense',
    icon: 'Car',
    color: '#EAB308', // Yellow
    isDefault: true,
  },
  {
    id: 'exp_bills',
    name: 'Bills & Utilities',
    type: 'expense',
    icon: 'Zap',
    color: '#3B82F6', // Blue
    isDefault: true,
  },
  {
    id: 'exp_housing',
    name: 'Housing & Rent',
    type: 'expense',
    icon: 'Home',
    color: '#6366F1', // Indigo
    isDefault: true,
  },
  {
    id: 'exp_shopping',
    name: 'Shopping & Retail',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#EC4899', // Pink
    isDefault: true,
  },
  {
    id: 'exp_health',
    name: 'Health & Pharmacy',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#10B981', // Emerald
    isDefault: true,
  },
  {
    id: 'exp_entertainment',
    name: 'Entertainment & Leisure',
    type: 'expense',
    icon: 'Film',
    color: '#8B5CF6', // Purple
    isDefault: true,
  },
  {
    id: 'exp_subscriptions',
    name: 'Subscriptions & Apps',
    type: 'expense',
    icon: 'Tv',
    color: '#A855F7', // Purple Accent
    isDefault: true,
  },
  {
    id: 'exp_education',
    name: 'Education & Tuition',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#0EA5E9', // Sky
    isDefault: true,
  },
  {
    id: 'exp_family',
    name: 'Family & Remittance',
    type: 'expense',
    icon: 'Users',
    color: '#14B8A6', // Teal
    isDefault: true,
  },
  {
    id: 'exp_debt_pay',
    name: 'Loan & Debt Payment',
    type: 'expense',
    icon: 'CreditCard',
    color: '#64748B', // Slate
    isDefault: true,
  },
  {
    id: 'exp_other',
    name: 'Miscellaneous Expense',
    type: 'expense',
    icon: 'HelpCircle',
    color: '#94A3B8',
    isDefault: true,
  },

  // INCOME
  {
    id: 'inc_salary',
    name: 'Salary & Payroll',
    type: 'income',
    icon: 'Briefcase',
    color: '#10B981', // Emerald
    isDefault: true,
  },
  {
    id: 'inc_freelance',
    name: 'Freelance & Side Hustle',
    type: 'income',
    icon: 'Laptop',
    color: '#06B6D4', // Cyan
    isDefault: true,
  },
  {
    id: 'inc_business',
    name: 'Business Revenue',
    type: 'income',
    icon: 'Building2',
    color: '#3B82F6', // Blue
    isDefault: true,
  },
  {
    id: 'inc_investment',
    name: 'Investment Dividends',
    type: 'income',
    icon: 'TrendingUp',
    color: '#8B5CF6', // Purple
    isDefault: true,
  },
  {
    id: 'inc_gift',
    name: 'Gifts & Allowance',
    type: 'income',
    icon: 'Gift',
    color: '#F43F5E', // Rose
    isDefault: true,
  },
  {
    id: 'inc_other',
    name: 'Other Income',
    type: 'income',
    icon: 'PlusCircle',
    color: '#059669',
    isDefault: true,
  },
];
