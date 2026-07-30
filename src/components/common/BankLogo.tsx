import React from 'react';
import { getInstitutionById } from '../../data/phInstitutions';
import {
  Banknote,
  Briefcase,
  Building,
  CreditCard,
  HelpCircle,
  Landmark,
  PiggyBank,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react';

interface BankLogoProps {
  institutionId?: string;
  accountType?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  customColor?: string;
}

export const BankLogo: React.FC<BankLogoProps> = ({
  institutionId,
  accountType,
  name,
  size = 'md',
  customColor,
}) => {
  const inst = getInstitutionById(institutionId);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-10 h-10 text-sm rounded-xl',
    lg: 'w-12 h-12 text-base rounded-2xl',
    xl: 'w-16 h-16 text-xl rounded-2xl',
  }[size];

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 24,
    xl: 32,
  }[size];

  if (inst) {
    return (
      <div
        className={`${sizeClasses} flex items-center justify-center font-bold tracking-tight shadow-xs select-none transition-transform hover:scale-105`}
        style={{
          backgroundColor: customColor || inst.brandColor,
          color: inst.textColor,
        }}
        title={inst.name}
      >
        {inst.logoInitial}
      </div>
    );
  }

  // Fallback icon based on account type
  const bg = customColor || '#3B82F6';

  const renderFallbackIcon = () => {
    switch (accountType) {
      case 'Cash':
      case 'Petty Cash':
        return <Banknote size={iconSizes} />;
      case 'E-wallet':
        return <Smartphone size={iconSizes} />;
      case 'Credit Card':
        return <CreditCard size={iconSizes} />;
      case 'Savings':
      case 'Checking':
      case 'Passbook':
        return <Landmark size={iconSizes} />;
      case 'Payroll':
        return <Briefcase size={iconSizes} />;
      case 'Digital Bank':
        return <ShieldCheck size={iconSizes} />;
      case 'Emergency Fund':
        return <PiggyBank size={iconSizes} />;
      default:
        return <Wallet size={iconSizes} />;
    }
  };

  const initial = (name || 'A').slice(0, 2).toUpperCase();

  return (
    <div
      className={`${sizeClasses} flex items-center justify-center font-semibold text-white shadow-xs select-none`}
      style={{ backgroundColor: bg }}
    >
      {accountType ? renderFallbackIcon() : initial}
    </div>
  );
};
