import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ExternalLink, ShieldCheck, Download, Star } from 'lucide-react';

interface AdMobNativeAdProps {
  className?: string;
  slot?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  sponsorName?: string;
}

export const AdMobNativeAd: React.FC<AdMobNativeAdProps> = ({
  className = '',
  slot,
  title = 'Smart Automated Wealth & Savings App',
  description = 'Maximize your interest yield and manage digital asset portfolios with bank-grade encryption.',
  ctaText = 'Install Now',
  sponsorName = 'Dinero Partner Network',
}) => {
  const { settings } = useApp();

  const isEnabled = (settings.adsEnabled ?? true) && !settings.hasPurchasedRemoveAds;
  const rawUnitId = slot || settings.admobNativeUnitId;
  const unitId =
    !rawUnitId || rawUnitId.includes('3940256099942544')
      ? 'ca-app-pub-2285121147680297/7308679768'
      : rawUnitId;

  useEffect(() => {
    if (isEnabled && window && 'adsbygoogle' in window) {
      try {
        ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
          (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
      } catch (e) {
        console.log('AdMob Native push error:', e);
      }
    }
  }, [isEnabled, unitId]);

  if (!isEnabled) return null;

  return (
    <div className={`w-full my-4 ${className}`}>
      <div className="w-full bg-slate-900/90 dark:bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl text-white relative overflow-hidden group">
        {/* Subtle background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Native Badge & Sponsor Line */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider border border-amber-500/30">
              AdMob Native
            </span>
            <span className="text-slate-400 text-xs font-medium truncate max-w-[160px] sm:max-w-xs">
              {sponsorName}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span>Sponsored</span>
          </div>
        </div>

        {/* Ad Body */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* App Icon / Logo */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
              <Sparkles size={24} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-sm sm:text-base text-slate-100 group-hover:text-amber-400 transition-colors">
                  {title}
                </h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md line-clamp-2">
                {description}
              </p>

              {/* Rating stars / details */}
              <div className="flex items-center gap-2 mt-2 text-[11px] text-amber-400">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} fill="currentColor" />
                  ))}
                </div>
                <span className="font-bold text-slate-300">4.9</span>
                <span className="text-slate-500">• Free on Google Play</span>
              </div>
            </div>
          </div>

          {/* Call to Action Button */}
          <a
            href="https://admob.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-95 shrink-0"
          >
            <Download size={15} />
            <span>{ctaText}</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Ad Unit ID Footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Ad Unit: {unitId.slice(0, 28)}...</span>
          <span>Google AdMob SDK</span>
        </div>
      </div>
    </div>
  );
};
