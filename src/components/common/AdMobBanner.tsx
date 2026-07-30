import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ExternalLink, Megaphone } from 'lucide-react';

interface AdMobBannerProps {
  className?: string;
  slot?: string;
  format?: 'banner' | 'rectangle' | 'leaderboard';
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  className = '',
  slot,
  format = 'banner',
}) => {
  const { settings } = useApp();
  const adRef = useRef<HTMLDivElement>(null);

  const isEnabled = settings.adsEnabled ?? true;
  const rawUnitId = slot || settings.admobBannerUnitId;
  const unitId =
    !rawUnitId || rawUnitId.includes('3940256099942544')
      ? 'ca-app-pub-2285121147680297/7496527811'
      : rawUnitId;
  const isTestUnit = false;

  // Attempt to load Google Publisher Ad Tag if adsbygoogle exists
  useEffect(() => {
    if (isEnabled && window && 'adsbygoogle' in window) {
      try {
        ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
          (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
      } catch (e) {
        console.log('AdSense / AdMob push notice:', e);
      }
    }
  }, [isEnabled, unitId]);

  if (!isEnabled) return null;

  return (
    <div
      className={`w-full max-w-2xl mx-auto my-3 px-2 flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-full bg-slate-900/90 dark:bg-slate-900/95 border border-slate-800 rounded-2xl p-2.5 shadow-md text-white overflow-hidden relative group">
        {/* Ad Tag Header */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 px-1 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider border border-amber-500/30">
              AdMob
            </span>
            <span>Google AdMob Banner</span>
          </div>
          <span className="text-[9px] text-slate-500">
            {isTestUnit ? 'Test Mode Active' : 'Live Ad Unit'}
          </span>
        </div>

        {/* Ad Contents / Container */}
        <div
          ref={adRef}
          className="w-full bg-slate-950/80 rounded-xl p-3 flex items-center justify-between border border-slate-800/80 gap-3 min-h-[50px] relative overflow-hidden"
        >
          {/* Subtle ambient light */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
              Ad
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
                <span>Google AdMob Banner Display</span>
                <Sparkles size={12} className="text-amber-400" />
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-[220px] sm:max-w-xs font-mono">
                Active Ad Unit: {unitId}
              </div>
            </div>
          </div>

          <a
            href="https://admob.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white font-semibold text-[11px] transition-all flex items-center gap-1 shrink-0 border border-blue-500/30"
          >
            <span>AdMob</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
};
