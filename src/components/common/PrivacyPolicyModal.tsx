import React from 'react';
import { ShieldCheck, Lock, EyeOff, Database, ServerOff, FileCheck, X, HardDrive, Cpu, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Privacy Policy</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Package: com.dinerotracker.com • Effective: July 2026
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            {/* Highlight Banner */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex gap-3 items-start">
              <Lock className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={20} />
              <div className="text-xs text-emerald-950 dark:text-emerald-200">
                <strong className="font-bold text-emerald-900 dark:text-emerald-100 block mb-1">
                  100% Offline-First & Private Data Guarantee
                </strong>
                Dinero Tracker (<span className="font-mono">com.dinerotracker.com</span>) is built on a private, local-first architecture. Your income, expenses, bank balances, and financial logs never leave your personal device.
              </div>
            </div>

            {/* Section 1 */}
            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                <HardDrive className="text-blue-500" size={18} />
                1. Data Storage & Ownership
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                All financial data created within Dinero Tracker—including transactions, account names, budgets, and savings goals—is stored strictly on your local device storage. We do not maintain external database servers or user tracking accounts to capture your financial activity.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                <EyeOff className="text-purple-500" size={18} />
                2. Zero Personal Data Harvesting
              </h3>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4">
                <li>We do <strong>NOT</strong> collect your name, email, or phone number.</li>
                <li>We do <strong>NOT</strong> link to real banking credentials or financial APIs.</li>
                <li>We do <strong>NOT</strong> track, aggregate, or sell user telemetry data to advertisers or third parties.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                <Cpu className="text-emerald-500" size={18} />
                3. Passcode & Biometric Security
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                When you enable Security PIN Lock or Touch ID / Face ID Biometric Unlock:
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4">
                <li>Your PIN passcode is hashed and stored exclusively on your device.</li>
                <li>Biometric verification utilizes your device’s native hardware security enclave. Biometric scans never leave your device hardware.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                <ServerOff className="text-amber-500" size={18} />
                4. Third-Party Integrations & External Requests
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                The application only communicates externally in two specific user-driven scenarios:
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4">
                <li>
                  <strong>Currency Exchange Rates:</strong> Live currency pair conversions query public central bank rates (e.g. Frankfurter / ECB APIs). Only public currency codes (e.g. PHP/USD) are sent; no transaction or balance amounts are transmitted.
                </li>
                <li>
                  <strong>Google Drive Backups:</strong> If you explicitly enable Google Drive Backup, backup files are saved directly into your personal Google Drive account under your control.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                <Database className="text-rose-500" size={18} />
                5. User Rights & Data Erasure
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You retain complete control of your data at all times. Through the Settings menu, you can:
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4">
                <li>Export complete backups in encrypted JSON or standard CSV formats.</li>
                <li>Reset account balances or permanently wipe all app data with one tap.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileCheck size={15} className="text-blue-500" />
                <span>Contact & Application Identity</span>
              </div>
              <p>Application Package: <span className="font-mono text-slate-700 dark:text-slate-300">com.dinerotracker.com</span></p>
              <p>For privacy inquiries or technical questions regarding Dinero Tracker, please consult the app settings menu or account controls.</p>
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-all shadow-sm"
            >
              Close Privacy Policy
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
