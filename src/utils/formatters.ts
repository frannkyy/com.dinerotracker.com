export function formatCurrency(
  amount: number,
  currencyCode: string = 'PHP',
  hideBalance: boolean = false
): string {
  const symbolMap: Record<string, string> = {
    PHP: '₱',
    USD: '$',
    EUR: '€',
    JPY: '¥',
    GBP: '£',
    SGD: 'S$',
    AUD: 'A$',
    CAD: 'C$',
    HKD: 'HK$',
    INR: '₹',
    AED: 'AED ',
    MYR: 'RM',
  };

  const symbol = symbolMap[currencyCode] || `${currencyCode} `;

  if (hideBalance) {
    return `${symbol}••••••`;
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formattedNumber = new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);

  return `${isNegative ? '-' : ''}${symbol}${formattedNumber}`;
}

export function formatDateString(dateStr: string, includeTime: boolean = false): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeString = includeTime
    ? `, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    : '';

  if (isToday) return `Today${timeString}`;
  if (isYesterday) return `Yesterday${timeString}`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }) + timeString;
}

export function calculatePercentage(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}
