import React, { useEffect, useState } from 'react';
import dineroLogo from '../../assets/images/dinero_app_logo_1784744183566.jpg';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 2200,
}) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, duration - 500);

    const finishTimer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white transition-opacity duration-500 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full flex justify-end">
        <button
          onClick={() => {
            setIsFading(true);
            setTimeout(() => onFinish && onFinish(), 300);
          }}
          className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="flex flex-col items-center text-center space-y-6 max-w-xs animate-in zoom-in-95 duration-700">
        {/* Glow backdrop */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full blur-2xl opacity-40 animate-pulse" />
          
          {/* Logo container */}
          <div className="relative w-28 h-28 rounded-3xl p-1 bg-gradient-to-tr from-blue-500 via-emerald-400 to-cyan-300 shadow-2xl shadow-blue-500/30 flex items-center justify-center transform hover:scale-105 transition-transform">
            <img
              src={dineroLogo}
              alt="Dinero App Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-[22px] border border-white/20"
            />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Dinero Tracker
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1.5 leading-relaxed">
            Smart Personal Finance, Budgeting & Expense Manager
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <div className="h-full bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400 rounded-full animate-pulse" style={{ width: '100%', transition: `width ${duration}ms linear` }} />
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs font-semibold text-slate-300">
          Developed by <span className="text-blue-400 font-bold">Franklin Ogot</span>
        </p>
        <p className="text-[10px] text-slate-500 font-mono tracking-wider">
          © {new Date().getFullYear()} Dinero Tracker • All Rights Reserved
        </p>
      </div>
    </div>
  );
};
