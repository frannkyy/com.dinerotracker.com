import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getStoredData } from '../../utils/storage';
import {
  downloadJSONBackup,
  exportTransactionsToCSV,
  generatePDFReportPrint,
  saveJSONWithPicker,
} from '../../utils/export';
import dineroLogo from '../../assets/images/dinero_app_logo_1784744183566.jpg';
import { PrivacyPolicyModal } from '../common/PrivacyPolicyModal';
import {
  CheckCircle2,
  ClipboardPaste,
  Copy,
  Download,
  ExternalLink,
  FileText,
  FolderDown,
  Globe,
  KeyRound,
  Lock,
  DollarSign,
  Printer,
  RotateCcw,
  Share2,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Sun,
  Moon,
  Trash2,
  Upload,
  User,
  Wallet,
  X,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    accounts,
    transactions,
    categories,
    resetBalancesToZero,
    resetAllData,
    restoreFromJSON,
    showToast,
    openPlayBillingModal,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pinInput, setPinInput] = useState(settings.pinCode || '1234');
  const [userNameInput, setUserNameInput] = useState(settings.userName || '');
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [backupJsonText, setBackupJsonText] = useState('');
  const [pasteRestoreText, setPasteRestoreText] = useState('');

  const handleOpenBackupModal = () => {
    const allData = getStoredData();
    setBackupJsonText(JSON.stringify(allData, null, 2));
    setShowBackupModal(true);
  };

  const handleOpenInDefaultBrowser = () => {
    const targetUrl = `${window.location.origin}${window.location.pathname}?action=download-backup`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    showToast('Opening in Chrome/Safari to download backup...');
  };

  const handlePickFolder = async () => {
    const allData = getStoredData();
    const result = await saveJSONWithPicker(allData);
    if (result.success) {
      showToast('Backup save / share prompt opened!');
    }
  };

  const handleDirectDownload = () => {
    const allData = getStoredData();
    downloadJSONBackup(allData);
    showToast('Download file triggered!');
  };

  const handleCopyJSON = () => {
    if (!backupJsonText) return;
    navigator.clipboard.writeText(backupJsonText);
    showToast('JSON Backup copied to clipboard!');
  };

  const handleTextRestore = () => {
    if (!pasteRestoreText.trim()) {
      showToast('Please paste valid JSON backup text.');
      return;
    }
    try {
      restoreFromJSON(pasteRestoreText.trim());
      setShowRestoreModal(false);
      setPasteRestoreText('');
    } catch (err) {
      showToast('Invalid JSON format. Check your backup text.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        restoreFromJSON(content);
      }
    };
    reader.readAsText(file);
  };

  const handleSavePin = () => {
    const cleanPin = pinInput.trim();
    if (!cleanPin || cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
      showToast('Passcode must be exactly 4 digits (e.g. 1234)');
      return;
    }
    updateSettings({
      pinCode: cleanPin,
      securityPinEnabled: true,
    });
    setPinInput(cleanPin);
    showToast(`Passcode updated to "${cleanPin}"`);
  };

  const handleTogglePin = () => {
    const willEnable = !settings.securityPinEnabled;
    const activePin =
      pinInput && pinInput.length === 4 && /^\d{4}$/.test(pinInput)
        ? pinInput
        : settings.pinCode || '1234';

    updateSettings({
      securityPinEnabled: willEnable,
      pinCode: activePin,
    });
    setPinInput(activePin);
    if (willEnable) {
      showToast(`Passcode lock enabled (PIN: ${activePin})`);
    } else {
      showToast('Passcode lock disabled');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Tools & App Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Profile personalization, security lock, backups & offline data controls
        </p>
      </div>

      {/* Google Play Billing Hero Banner - Remove All Ads ($0.99) */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 text-white shadow-xl space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-emerald-200 font-mono bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Google Play Store
                </span>
                <Sparkles size={13} className="text-amber-300" />
              </div>
              <h2 className="font-black text-base text-white leading-snug">
                Remove All Ads Forever
              </h2>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-xl font-black text-white">$0.99</span>
            <div className="text-[10px] text-emerald-200">One-Time</div>
          </div>
        </div>

        {settings.hasPurchasedRemoveAds ? (
          <div className="p-3.5 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={22} className="text-emerald-300 shrink-0" />
              <div>
                <div className="font-bold text-xs text-white">
                  Ad-Free Premium Active
                </div>
                <div className="text-[11px] text-emerald-100">
                  All banner, interstitial, and native ads are permanently removed via Google Play Store.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 relative z-10 pt-1">
            <p className="text-xs text-emerald-50 leading-relaxed font-medium">
              Eliminate all banner ads, interstitial popups, and native promotional cards for a lifetime with a single <strong>$0.99 Google Play purchase</strong>.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={openPlayBillingModal}
                className="flex-1 py-3 px-4 rounded-2xl bg-white hover:bg-emerald-50 active:scale-98 text-emerald-900 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} className="text-emerald-700" />
                <span>Upgrade / Remove Ads ($0.99)</span>
              </button>

              <button
                onClick={openPlayBillingModal}
                className="py-3 px-4 rounded-2xl bg-black/20 hover:bg-black/30 border border-white/20 text-white font-bold text-xs transition-all backdrop-blur-sm"
              >
                Restore
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Profile & Greeting Personalization */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <User size={18} className="text-blue-600 dark:text-blue-400" />
          <h2 className="font-bold text-sm text-[#1D1D1F] dark:text-white">
            Personal Profile & Greetings
          </h2>
        </div>

        <div className="space-y-3 pt-1">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Your Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userNameInput}
                onChange={(e) => setUserNameInput(e.target.value)}
                placeholder="Enter your name e.g. Rafael"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-[#F5F5F7] dark:bg-slate-800/50 font-semibold text-sm text-[#1D1D1F] dark:text-white"
              />
              <button
                onClick={() => {
                  if (userNameInput.trim()) {
                    updateSettings({ userName: userNameInput.trim() });
                    showToast('Profile name saved!');
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 active:scale-95 transition-all"
              >
                Save Name
              </button>
            </div>
            <p className="text-[11px] text-[#86868B] mt-1">
              This name will be displayed in header greetings (Good Morning, Good Afternoon, Good Evening).
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-2">
              <span>App Default Currency</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400">
                Current: {settings.currency || 'PHP'}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { code: 'PHP', symbol: '₱', label: 'PHP (₱)' },
                { code: 'USD', symbol: '$', label: 'USD ($)' },
                { code: 'EUR', symbol: '€', label: 'EUR (€)' },
                { code: 'GBP', symbol: '£', label: 'GBP (£)' },
                { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
                { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$)' },
                { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
                { code: 'SGD', symbol: 'S$', label: 'SGD (S$)' },
                { code: 'INR', symbol: '₹', label: 'INR (₹)' },
              ].map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => {
                    updateSettings({ currency: curr.code, currencySymbol: curr.symbol });
                    showToast(`Currency updated to ${curr.code}`);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                    settings.currency === curr.code
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-[#F5F5F7] dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{curr.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-2">
              <span>App Theme Mode</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400 capitalize">
                Current: {settings.theme || 'light'} Mode
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  updateSettings({ theme: 'light' });
                  showToast('Light mode activated');
                }}
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  settings.theme === 'light'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-[#F5F5F7] dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <Sun size={15} />
                <span>Light Mode</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  updateSettings({ theme: 'dark' });
                  showToast('Dark mode activated');
                }}
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-[#F5F5F7] dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <Moon size={15} />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security & PIN Lock */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-blue-600 dark:text-blue-400" />
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">
            Security & Passcode Lock
          </h2>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Enable PIN Code Lock
            </div>
            <div className="text-[11px] text-slate-500">
              Prompt PIN code when opening the application
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.securityPinEnabled}
              onChange={handleTogglePin}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        {settings.securityPinEnabled && (
          <>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Set Custom 4-Digit Passcode
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234"
                  className="w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-mono text-center font-bold text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSavePin}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                >
                  Save Passcode
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Active PIN: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{settings.pinCode || '1234'}</span>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Backup & Local Export */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Download size={18} className="text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">
            Backup & Data Import/Export
          </h2>
        </div>

        <p className="text-xs text-slate-500">
          Save your complete Dinero database locally onto your phone (Downloads, SD Card, or any folder) or restore an existing backup file anytime offline.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={handleOpenBackupModal}
            className="p-3.5 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 active:scale-95 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <FolderDown size={16} />
            <span>Export Backup Options</span>
          </button>

          <button
            onClick={() => setShowRestoreModal(true)}
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-600 hover:text-white font-bold text-xs text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <Upload size={16} />
            <span>Restore Backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Backup Export Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <FolderDown size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Save Dinero Backup
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Choose how you want to save or copy your database backup
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBackupModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Open in Default Browser (Chrome / Safari) */}
              <button
                onClick={handleOpenInDefaultBrowser}
                className="w-full p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/70 transition-all text-left flex items-center gap-3 group shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <ExternalLink size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                    <span>1. Open in Default Browser (Chrome / Safari)</span>
                    <span className="text-[10px] font-extrabold uppercase bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Opens app in Chrome / Safari so native download triggers automatically
                  </div>
                </div>
              </button>

              {/* Option 2: Share / System Picker */}
              <button
                onClick={handlePickFolder}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Share2 size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                    <span>2. Pick Folder / System Share</span>
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      Android Best
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Opens Android share sheet to save to Files, SD card, or Google Drive
                  </div>
                </div>
              </button>

              {/* Option 3: Direct File Download */}
              <button
                onClick={handleDirectDownload}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    3. Direct File Download
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Saves directly as Dinero_Backup.json in Downloads
                  </div>
                </div>
              </button>

              {/* Option 4: Copy Text */}
              <button
                onClick={handleCopyJSON}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-600/10 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                  <Copy size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    4. Copy Backup Text to Clipboard
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Copies complete JSON database text so you can paste into Notes or Email
                  </div>
                </div>
              </button>
            </div>

            {/* Raw JSON Code Box for WebView fallback */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Raw Backup Text (Guaranteed Works Everywhere)
                </span>
                <button
                  onClick={handleCopyJSON}
                  className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[11px] font-bold flex items-center gap-1 hover:bg-purple-200 transition-colors"
                >
                  <Copy size={12} />
                  <span>Copy Text</span>
                </button>
              </div>
              <textarea
                readOnly
                value={backupJsonText}
                rows={4}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-[10px] text-slate-700 dark:text-slate-300 resize-none select-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Restore Backup Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Restore Dinero Backup
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload a .json backup file or paste your backup JSON text
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRestoreModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Method A: Select File */}
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  fileInputRef.current?.click();
                }}
                className="w-full p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all text-left flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Upload size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    Option A: Select .json File from Phone
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Browse phone files to choose a saved Dinero_Backup.json file
                  </div>
                </div>
              </button>

              {/* Method B: Paste JSON Text */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Option B: Paste Backup JSON Text
                </label>
                <textarea
                  value={pasteRestoreText}
                  onChange={(e) => setPasteRestoreText(e.target.value)}
                  placeholder="Paste your copied JSON backup code here..."
                  rows={4}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-white resize-none"
                />
                <button
                  onClick={handleTextRestore}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <ClipboardPaste size={16} />
                  <span>Restore from Pasted Text</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports & PDF */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Printer size={18} className="text-purple-600 dark:text-purple-400" />
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">
            Executive Statements & Reports
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => exportTransactionsToCSV(transactions, accounts, categories)}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200"
          >
            CSV / Excel Statement
          </button>
          <button
            onClick={() => generatePDFReportPrint('Dinero Financial Summary', accounts, transactions, categories)}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-sm"
          >
            Print PDF Statement
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-5 rounded-3xl bg-rose-500/5 border border-rose-500/20 space-y-3">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <Trash2 size={18} />
          <h2 className="font-bold text-sm">Danger Zone & Reset Tools</h2>
        </div>

        <p className="text-xs text-slate-500">
          Reset dashboard balances back to ₱0 or clear all offline storage state.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => {
              if (window.confirm('Reset all account balances to ₱0 and clear transaction history?')) {
                resetBalancesToZero();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Wallet size={14} />
            <span>Reset Balances to ₱0</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all data back to clean defaults?')) {
                resetAllData();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <RotateCcw size={14} />
            <span>Reset Database & App State</span>
          </button>
        </div>
      </div>

      {/* Developer Credits, Privacy & Copyright */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1D1D1F] border border-gray-100 dark:border-slate-800 shadow-xs text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-xs mx-auto p-0.5 bg-white dark:bg-slate-800">
          <img
            src={dineroLogo}
            alt="Dinero Logo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-[14px]"
          />
        </div>
        <div>
          <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-white font-display">
            Dinero Tracker
          </h3>
          <p className="text-xs text-[#86868B] font-medium mt-0.5">
            Designed & Developed by <span className="font-bold text-blue-600 dark:text-blue-400">DEV.FRANKYY</span>
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700/80 shadow-2xs"
          >
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Read Privacy Policy</span>
          </button>
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-slate-800/80 text-[11px] text-[#86868B]">
          © {new Date().getFullYear()} DEV.FRANKYY. All Rights Reserved.
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
};
