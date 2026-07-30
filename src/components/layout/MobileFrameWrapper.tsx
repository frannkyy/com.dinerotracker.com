import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Battery, Signal, Wifi } from 'lucide-react';

interface MobileFrameWrapperProps {
  children: React.ReactNode;
}

export const MobileFrameWrapper: React.FC<MobileFrameWrapperProps> = ({ children }) => {
  const { settings } = useApp();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  if (!settings.showMobileFrame) {
    return <div className="min-h-screen pb-24 bg-[#F5F5F7] dark:bg-[#121212] text-[#1D1D1F] dark:text-[#F5F5F7]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-2 sm:p-6 select-none">
      {/* Mobile Device Mockup */}
      <div className="w-full max-w-[420px] h-[880px] bg-slate-900 border-[8px] border-slate-800 rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col ring-1 ring-slate-700/50">
        {/* Notch / Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-950 rounded-full z-50 flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
          <div className="w-2 h-2 rounded-full bg-blue-900/60" />
        </div>

        {/* Status Bar */}
        <div className="pt-2 px-7 pb-1 text-xs text-slate-400 font-semibold flex items-center justify-between select-none z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <span>{currentTime || '9:41'}</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Signal size={12} />
            <Wifi size={12} />
            <Battery size={14} className="text-emerald-400" />
          </div>
        </div>

        {/* Screen Content Container */}
        <div className="flex-1 overflow-y-auto pb-24 bg-[#F5F5F7] dark:bg-[#121212] text-[#1D1D1F] dark:text-[#F5F5F7] scrollbar-none">
          {children}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-400/40 rounded-full z-50 pointer-events-none" />
      </div>
    </div>
  );
};
