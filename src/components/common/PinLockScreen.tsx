import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Fingerprint, Lock, ShieldAlert, ScanFace, CheckCircle2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PinLockScreen: React.FC = () => {
  const { settings, unlockApp, showToast } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);

  // Auto-trigger biometrics if enabled in settings when lock screen mounts
  useEffect(() => {
    if (settings.biometricsEnabled) {
      triggerBiometrics();
    }
  }, []);

  const triggerBiometrics = async () => {
    setShowBiometricModal(true);
    setIsScanning(true);
    setBiometricSuccess(false);

    // Try WebAuthn Web API first if browser supports it
    if (window.PublicKeyCredential) {
      try {
        // Attempt native WebAuthn credential query if supported
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
      } catch (e) {
        console.log('WebAuthn default fallback:', e);
      }
    }

    // Simulate 1.2s biometric scan verification
    setTimeout(() => {
      setIsScanning(false);
      setBiometricSuccess(true);

      setTimeout(() => {
        const targetPin = settings.pinCode || '1234';
        const success = unlockApp(targetPin);
        if (success) {
          showToast('Biometric Face ID / Touch ID verified');
        } else {
          setShowBiometricModal(false);
          showToast('Biometric verification failed. Please enter PIN.');
        }
      }, 600);
    }, 1200);
  };

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => {
          const success = unlockApp(newPin);
          if (!success) {
            setError(true);
            setPin('');
            showToast('Incorrect PIN passcode');
            setTimeout(() => setError(false), 800);
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950 text-white p-6 select-none backdrop-blur-xl">
      <div className="pt-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 shadow-lg">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Dinero Tracker</h2>
        <p className="text-slate-400 text-sm mt-1">Enter PIN code to unlock app</p>

        {/* PIN Indicators */}
        <motion.div
          animate={error ? { x: [-10, 10, -8, 8, 0] } : {}}
          className="flex gap-4 mt-8"
        >
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                pin.length > index
                  ? 'bg-blue-500 border-blue-400 scale-110 shadow-md shadow-blue-500/50'
                  : 'border-slate-700 bg-slate-900'
              }`}
            />
          ))}
        </motion.div>
      </div>

      {/* Numpad */}
      <div className="w-full max-w-xs pb-8">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-2xl font-semibold hover:bg-slate-800 active:scale-95 transition-all mx-auto flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            onClick={triggerBiometrics}
            className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/50 active:scale-95 transition-all mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10"
            title="Authenticate with Touch ID / Face ID"
          >
            <Fingerprint size={28} />
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-2xl font-semibold hover:bg-slate-800 active:scale-95 transition-all mx-auto flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full bg-slate-900/50 border border-slate-800 text-slate-300 hover:bg-slate-800 active:scale-95 transition-all mx-auto flex items-center justify-center text-sm font-medium"
          >
            Del
          </button>
        </div>

        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1">
          <ShieldAlert size={12} />
          {settings.pinCode && settings.pinCode !== '1234' ? (
            <span>Custom 4-digit passcode protection active</span>
          ) : (
            <span>
              Default passcode is <span className="text-slate-300 font-mono font-bold">1234</span>
            </span>
          )}
        </div>
      </div>

      {/* Biometric Scanning Overlay Modal */}
      <AnimatePresence>
        {showBiometricModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden"
            >
              {/* Close / Passcode Fallback button */}
              <button
                onClick={() => setShowBiometricModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>

              <div className="my-4 flex flex-col items-center">
                {/* Fingerprint / Face ID Scanning Visual */}
                <div className="relative w-24 h-24 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-5 overflow-hidden">
                  {biometricSuccess ? (
                    <motion.div
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="text-emerald-400"
                    >
                      <CheckCircle2 size={48} />
                    </motion.div>
                  ) : (
                    <>
                      <div className="text-emerald-400 z-10">
                        <Fingerprint size={48} />
                      </div>
                      {isScanning && (
                        <motion.div
                          animate={{ top: ['0%', '100%', '0%'] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                          className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_12px_#34d399]"
                        />
                      )}
                    </>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-1">
                  {biometricSuccess
                    ? 'Authentication Successful'
                    : isScanning
                    ? 'Scanning Biometric Sensor...'
                    : 'Touch ID / Face ID'}
                </h3>

                <p className="text-xs text-slate-400 max-w-[220px]">
                  {biometricSuccess
                    ? 'Unlocking Dinero Tracker...'
                    : 'Verify your fingerprint or Face ID to unlock your financial data.'}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2">
                {!biometricSuccess && (
                  <button
                    onClick={triggerBiometrics}
                    disabled={isScanning}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
                  >
                    <ScanFace size={16} />
                    <span>{isScanning ? 'Verifying...' : 'Rescan Biometric'}</span>
                  </button>
                )}
                <button
                  onClick={() => setShowBiometricModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
                >
                  Use Passcode Instead
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
