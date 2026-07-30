import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeftRight, RefreshCw, DollarSign, Globe, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const SUPPORTED_CURRENCIES = [
  { code: 'PHP', symbol: '₱', label: 'Philippine Peso (PHP)' },
  { code: 'USD', symbol: '$', label: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (GBP)' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen (JPY)' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (AUD)' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar (CAD)' },
  { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc (CHF)' },
  { code: 'HKD', symbol: 'HK$', label: 'Hong Kong Dollar (HKD)' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar (SGD)' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (INR)' },
  { code: 'MYR', symbol: 'RM', label: 'Malaysian Ringgit (MYR)' },
  { code: 'THB', symbol: '฿', label: 'Thai Baht (THB)' },
  { code: 'IDR', symbol: 'Rp', label: 'Indonesian Rupiah (IDR)' },
  { code: 'KRW', symbol: '₩', label: 'South Korean Won (KRW)' },
  { code: 'NZD', symbol: 'NZ$', label: 'New Zealand Dollar (NZD)' },
];

export const CurrencyConverterWidget: React.FC = () => {
  const { settings } = useApp();

  // User's default currency setting or 'PHP'
  const defaultFromCurrency = settings.currency || 'PHP';
  // Target currency defaults to 'USD' (if base is USD, target defaults to 'EUR')
  const defaultToCurrency = defaultFromCurrency === 'USD' ? 'EUR' : 'USD';

  const [fromCurrency, setFromCurrency] = useState<string>(defaultFromCurrency);
  const [toCurrency, setToCurrency] = useState<string>(defaultToCurrency);
  const [amount, setAmount] = useState<string>('100');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Update base currency if user changes app default currency
  useEffect(() => {
    if (settings.currency) {
      setFromCurrency(settings.currency);
      if (settings.currency === 'USD') {
        setToCurrency('EUR');
      } else {
        setToCurrency('USD');
      }
    }
  }, [settings.currency]);

  // Fetch exchange rate from Exchange APIs with high reliability
  const fetchRate = useCallback(async () => {
    if (fromCurrency === toCurrency) {
      setRate(1);
      const parsedAmount = parseFloat(amount) || 0;
      setConvertedAmount(parsedAmount);
      setError(null);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      return;
    }

    setLoading(true);
    setError(null);

    const numericAmount = parseFloat(amount) || 0;

    try {
      let rateFound: number | null = null;

      // Source 1: Frankfurter API using official base and symbols parameters
      try {
        const res1 = await fetch(`https://api.frankfurter.dev/v1/latest?base=${fromCurrency}&symbols=${toCurrency}`);
        if (res1.ok) {
          const data1 = await res1.json();
          if (data1.rates && data1.rates[toCurrency]) {
            rateFound = Number(data1.rates[toCurrency]);
          }
        }
      } catch (e) {
        console.warn('Frankfurter API dev endpoint error, trying open exchange rate fallback...', e);
      }

      // Source 2: Open Exchange Rate API fallback
      if (rateFound === null) {
        try {
          const res2 = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2.rates && data2.rates[toCurrency]) {
              rateFound = Number(data2.rates[toCurrency]);
            }
          }
        } catch (e) {
          console.warn('Primary open exchange rate API error...', e);
        }
      }

      // Source 3: Fawaz Ahmed Currency API CDN fallback
      if (rateFound === null) {
        try {
          const res3 = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrency.toLowerCase()}.json`);
          if (res3.ok) {
            const data3 = await res3.json();
            const ratesObj = data3[fromCurrency.toLowerCase()];
            if (ratesObj && ratesObj[toCurrency.toLowerCase()]) {
              rateFound = Number(ratesObj[toCurrency.toLowerCase()]);
            }
          }
        } catch (e) {
          console.warn('CDN currency API error...', e);
        }
      }

      // Source 4: Fallback static realistic rate table if network is offline
      if (rateFound === null) {
        const fallbackRatesToUSD: Record<string, number> = {
          PHP: 0.0171,
          USD: 1.0,
          EUR: 1.08,
          GBP: 1.28,
          JPY: 0.0065,
          AUD: 0.65,
          CAD: 0.73,
          CHF: 1.12,
          HKD: 0.128,
          SGD: 0.74,
          INR: 0.012,
          MYR: 0.22,
          THB: 0.028,
          IDR: 0.000063,
          KRW: 0.00072,
          NZD: 0.59,
        };
        const fromInUSD = fallbackRatesToUSD[fromCurrency] || 1;
        const toInUSD = fallbackRatesToUSD[toCurrency] || 1;
        rateFound = fromInUSD / toInUSD;
      }

      if (rateFound !== null && !isNaN(rateFound)) {
        setRate(rateFound);
        setConvertedAmount(numericAmount * rateFound);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setError(null);
      } else {
        throw new Error('Unable to calculate exchange rate.');
      }
    } catch (err: any) {
      console.error('Exchange rate error:', err);
      setError('Unable to fetch exchange rate at this moment');
    } finally {
      setLoading(false);
    }
  }, [fromCurrency, toCurrency, amount]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRate();
    }, 300); // debounce input change
    return () => clearTimeout(timer);
  }, [fetchRate]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getSymbol = (currCode: string) => {
    return SUPPORTED_CURRENCIES.find((c) => c.code === currCode)?.symbol || currCode;
  };

  return (
    <div className="bg-white dark:bg-[#1D1D1F] rounded-[32px] p-5 sm:p-6 shadow-xs border border-gray-100 dark:border-slate-800 my-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Globe size={18} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#1D1D1F] dark:text-white leading-tight">
              Currency Converter
            </h3>
            <p className="text-xs text-[#86868B] dark:text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
              <span>Live ECB Exchange Rates</span>
              {lastUpdated && <span>• Updated {lastUpdated}</span>}
            </p>
          </div>
        </div>

        <button
          onClick={fetchRate}
          disabled={loading}
          className="p-2 rounded-xl bg-[#F5F5F7] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all active:scale-95"
          title="Refresh Exchange Rates"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin text-blue-600' : ''} />
        </button>
      </div>

      {/* Main Converter Form */}
      <div className="space-y-3">
        {/* Input Amount */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#86868B] block mb-1">
            Amount ({fromCurrency})
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#86868B]">
              {getSymbol(fromCurrency)}
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full pl-9 pr-4 py-2.5 bg-[#F5F5F7] dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl text-base font-extrabold text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Currency Selector Row with Swap */}
        <div className="grid grid-cols-11 gap-2 items-center">
          {/* From Currency */}
          <div className="col-span-5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block mb-1">
              From
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full p-2.5 bg-[#F5F5F7] dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.symbol}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="col-span-1 flex justify-center pt-4">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 active:scale-90 transition-all"
              title="Swap Currencies"
            >
              <ArrowLeftRight size={14} />
            </button>
          </div>

          {/* To Currency */}
          <div className="col-span-5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block mb-1">
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full p-2.5 bg-[#F5F5F7] dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preset Amount Quick Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {['10', '100', '500', '1000', '5000'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                amount === preset
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-[#F5F5F7] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              {getSymbol(fromCurrency)}{preset}
            </button>
          ))}
        </div>

        {/* Converted Output Display */}
        <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col items-center justify-center text-center">
          {loading ? (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 py-1">
              <RefreshCw size={16} className="animate-spin" />
              <span>Fetching live Frankfurter rates...</span>
            </div>
          ) : error ? (
            <div className="text-xs font-semibold text-rose-500 py-1">{error}</div>
          ) : (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#86868B] block mb-0.5">
                Converted Equivalent ({toCurrency})
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {convertedAmount !== null
                  ? formatCurrency(convertedAmount, toCurrency, settings.hideBalances)
                  : '-'}
              </div>
              {rate !== null && (
                <div className="text-[11px] font-semibold text-[#86868B] dark:text-slate-400 mt-1 flex items-center justify-center gap-1">
                  <TrendingUp size={12} className="text-emerald-500" />
                  <span>
                    1 {fromCurrency} = {rate < 0.01 ? rate.toFixed(6) : rate.toFixed(4)} {toCurrency}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
