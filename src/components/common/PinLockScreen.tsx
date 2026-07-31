import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export const PinLockScreen: React.FC = () => {
  const { settings, unlockApp, showToast } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

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
          <div className="w-16 h-16 mx-auto" />
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
    </div>
  );
};
