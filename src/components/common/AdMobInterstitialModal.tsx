import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sparkles, ExternalLink, ShieldCheck, Download, Award, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdMobInterstitialModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitId?: string;
}

export const AdMobInterstitialModal: React.FC<AdMobInterstitialModalProps> = ({
  isOpen,
  onClose,
  unitId,
}) => {
  const { settings, openPlayBillingModal } = useApp();
  const [countdown, setCountdown] = useState(3);
  const [canClose, setCanClose] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const rawUnitId = unitId || settings.admobInterstitialUnitId;
  const activeUnitId =
    !rawUnitId || rawUnitId.includes('3940256099942544')
      ? 'ca-app-pub-2285121147680297/1370671386'
      : rawUnitId;

  useEffect(() => {
    if (isOpen) {
      setCountdown(3);
      setCanClose(false);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col text-white"
        >
          {/* Top Bar with AdMob Badge & Countdown / Close Button */}
          <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border border-amber-500/30">
                AdMob Interstitial
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Sponsored Ad
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              {canClose ? (
                <button
                  onClick={onClose}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                >
                  <span>Close Ad</span>
                  <X size={14} />
                </button>
              ) : (
                <div className="px-3 py-1 rounded-xl bg-slate-800/80 text-amber-400 text-xs font-bold font-mono border border-slate-700">
                  Ad ends in {countdown}s
                </div>
              )}
            </div>
          </div>

          {/* High Impact Ad Content */}
          <div className="p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Ad Sponsor Icon */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 font-black flex items-center justify-center mb-5 shadow-2xl shadow-amber-500/30 ring-4 ring-amber-500/20">
              <Sparkles size={42} />
            </div>

            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Award size={14} />
              <span>Featured App Recommendation</span>
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-white mb-2 leading-tight">
              Dinero Premium Financial Suite
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mb-6 leading-relaxed">
              Unlock real-time exchange rates, automated recurring bills sync, advanced analytics graphs, and biometric cloud backups.
            </p>

            {/* Ad Feature Badges */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs mb-6 text-left">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                <span>Bank-Grade Encryption</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 flex items-center gap-2">
                <Award size={14} className="text-amber-400 shrink-0" />
                <span>Top Finance App 2026</span>
              </div>
            </div>

            {/* CTA Button */}
            <a
              href="https://admob.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25 active:scale-98"
            >
              <Download size={18} />
              <span>Install Free from Google Play</span>
              <ExternalLink size={14} />
            </a>

            <button
              onClick={() => {
                onClose();
                openPlayBillingModal();
              }}
              className="mt-3 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles size={14} />
              <span>Tired of Ads? Remove All Ads for $0.99 (Google Play)</span>
            </button>
          </div>

          {/* Ad Footer Info */}
          <div className="px-6 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Unit ID: {activeUnitId.slice(0, 30)}...</span>
            <div className="flex items-center gap-1 text-slate-400">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>Google AdMob SDK</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
