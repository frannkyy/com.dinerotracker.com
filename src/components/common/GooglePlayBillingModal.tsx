import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { purchaseProductWithGooglePlay, restoreGooglePlayPurchases, REMOVE_ADS_PRODUCT_ID } from '../../services/playBillingService';
import confetti from 'canvas-confetti';
import { CheckCircle2, ShieldCheck, Sparkles, X, CreditCard, RefreshCw, ShoppingBag, Lock } from 'lucide-react';

interface GooglePlayBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GooglePlayBillingModal: React.FC<GooglePlayBillingModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, showToast } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'gpay' | 'card'>('gpay');

  if (!isOpen) return null;

  const isAlreadyPurchased = Boolean(settings.hasPurchasedRemoveAds);

  const handlePurchase = async () => {
    setIsProcessing(true);

    try {
      const result = await purchaseProductWithGooglePlay(REMOVE_ADS_PRODUCT_ID);

      if (result.success) {
        // Update app settings state permanently
        updateSettings({
          adsEnabled: false,
          hasPurchasedRemoveAds: true,
          removeAdsPurchaseDate: new Date().toISOString(),
        });

        // Trigger confetti
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });

        showToast('🎉 Google Play Purchase Successful! All ads have been removed permanently.');
        setTimeout(() => {
          setIsProcessing(false);
          onClose();
        }, 1000);
      } else {
        showToast(result.error || 'Payment was cancelled.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      showToast('Transaction failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const result = await restoreGooglePlayPurchases();
      if (result.restored) {
        updateSettings({
          adsEnabled: false,
          hasPurchasedRemoveAds: true,
        });
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        showToast('Purchase restored successfully from Google Play!');
        onClose();
      } else {
        // Also check if local settings were previously toggled
        if (settings.hasPurchasedRemoveAds) {
          updateSettings({ adsEnabled: false });
          showToast('Ad-free status restored!');
          onClose();
        } else {
          showToast('No prior purchase of "Remove Ads ($0.99)" found for this Google Account.');
        }
      }
    } catch {
      showToast('Could not reach Google Play Store servers.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1C1C1E] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-300">
        
        {/* Header with Google Play Badge */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <ShoppingBag size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 tracking-wide uppercase font-mono">
                  Google Play In-App Billing
                </span>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                Remove All Ads
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Product Card */}
        {isAlreadyPurchased ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
            <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
            <h4 className="font-bold text-base text-emerald-900 dark:text-emerald-200">
              Remove Ads Product Active!
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              You own the permanent Ad-Free license. All banner, interstitial, and native ads are turned off across Dinero Tracker.
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="flex justify-between items-baseline">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Dinero Tracker Ad-Free Premium</span>
                    <Sparkles size={14} className="text-amber-500" />
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Item ID: <code className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{REMOVE_ADS_PRODUCT_ID}</code>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                    $0.99
                  </div>
                  <div className="text-[10px] text-slate-400">One-time purchase</div>
                </div>
              </div>

              <ul className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Disable all Banner Ads on Home Screen</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Eliminate Interstitial Ads when creating records</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Remove Native Ads from Analytics & Transactions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Lifetime access tied to your Google Play Account</span>
                </li>
              </ul>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Select Google Play Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('gpay')}
                  className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'gpay'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <ShieldCheck size={16} />
                  <span>Google Pay / Balance</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <CreditCard size={16} />
                  <span>Credit / Debit Card</span>
                </button>
              </div>
            </div>

            {/* 1-Tap Buy Action Button */}
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Contacting Google Play Store...</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>1-Tap Buy ($0.99)</span>
                </>
              )}
            </button>
          </>
        )}

        {/* Restore Purchases & Security Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Google Play Protection</span>
          </div>

          <button
            onClick={handleRestore}
            disabled={isRestoring}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            {isRestoring ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <RefreshCw size={12} />
            )}
            <span>Restore Purchases</span>
          </button>
        </div>

      </div>
    </div>
  );
};
