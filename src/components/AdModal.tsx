import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ShieldCheck, Play } from 'lucide-react';
import { sounds } from '../utils/audio';

declare global {
  interface Window {
    show_11697097?: () => Promise<unknown>;
  }
}

interface AdModalProps {
  isOpen: boolean;
  onAdComplete: () => void;
  onClose?: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({ isOpen, onAdComplete, onClose }) => {
  const [status, setStatus] = useState<'ready' | 'loading' | 'error'>('ready');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setStatus('ready');
      setErrorMessage('');
    }
  }, [isOpen]);

  const startRewardedAd = async () => {
    if (status === 'loading') return;

    setStatus('loading');
    setErrorMessage('');

    try {
      if (typeof window.show_11697097 !== 'function') {
        throw new Error('Monetag SDK is not ready yet. Please try again.');
      }

      sounds.playClick();
      await window.show_11697097();
      sounds.playAdComplete();
      onAdComplete();
    } catch (error) {
      console.error('Monetag rewarded interstitial failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Monetag did not return an ad.');
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm rounded-3xl overflow-hidden bg-[#0f172a] border border-slate-800 shadow-2xl text-slate-100"
        >
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
              {status === 'loading' ? (
                <Loader2 className="w-7 h-7 text-sky-400 animate-spin" />
              ) : status === 'error' ? (
                <ShieldCheck className="w-7 h-7 text-rose-400" />
              ) : (
                <Play className="w-7 h-7 text-sky-400" />
              )}
            </div>

            {status === 'ready' && (
              <>
                <h3 className="text-lg font-black">Watch an ad to play</h3>
                <p className="mt-2 text-sm text-slate-400">Tap the button below to open the rewarded ad.</p>
                <button type="button" onClick={startRewardedAd} className="mt-5 w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-black transition-colors">
                  Watch Ad &amp; Continue
                </button>
              </>
            )}

            {status === 'loading' && (
              <>
                <h3 className="text-lg font-black">Opening rewarded ad...</h3>
                <p className="mt-2 text-sm text-slate-400">Please wait while Monetag loads the ad.</p>
              </>
            )}

            {status === 'error' && (
              <>
                <h3 className="text-lg font-black">No ad available</h3>
                <p className="mt-2 text-sm text-slate-400">The game will not start until a rewarded ad is successfully shown.</p>
                {errorMessage && <p className="mt-3 text-xs text-slate-500 break-words">{errorMessage}</p>}
                <button type="button" onClick={startRewardedAd} className="mt-5 w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-black transition-colors">
                  Try Again
                </button>
                {onClose && <button type="button" onClick={onClose} className="mt-3 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold">Close</button>}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
