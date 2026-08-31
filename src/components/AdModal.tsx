import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ShieldCheck } from 'lucide-react';
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

const MONETAG_SRC = '//libtl.com/sdk.js';
const MONETAG_ZONE = '11697097';
const MONETAG_SDK = 'show_11697097';

function loadMonetagSdk(): Promise<void> {
  if (typeof window.show_11697097 === 'function') return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-zone="${MONETAG_ZONE}"][data-sdk="${MONETAG_SDK}"]`,
    );

    if (existing) {
      if (typeof window.show_11697097 === 'function') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Monetag SDK failed to load')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = MONETAG_SRC;
    script.async = true;
    script.dataset.zone = MONETAG_ZONE;
    script.dataset.sdk = MONETAG_SDK;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Monetag SDK failed to load'));
    document.head.appendChild(script);
  });
}

interface AdModalProps {
  isOpen: boolean;
  onAdComplete: () => void;
  onClose?: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({ isOpen, onAdComplete, onClose }) => {
  const startedRef = useRef(false);
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    if (!isOpen) {
      startedRef.current = false;
      return;
    }

    if (startedRef.current) return;
    startedRef.current = true;
    setStatus('loading');

    const showRewardedAd = async () => {
      try {
        await loadMonetagSdk();

        for (let attempt = 0; attempt < 40; attempt++) {
          if (typeof window.show_11697097 === 'function') break;
          await new Promise((resolve) => setTimeout(resolve, 250));
        }

        if (typeof window.show_11697097 !== 'function') {
          throw new Error('Monetag rewarded interstitial is not available');
        }

        sounds.playClick();
        await window.show_11697097();
        sounds.playAdComplete();
        onAdComplete();
      } catch (error) {
        console.error('Monetag rewarded interstitial failed:', error);
        setStatus('error');
      }
    };

    void showRewardedAd();
  }, [isOpen, onAdComplete]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-sm rounded-3xl overflow-hidden bg-[#0f172a] border border-slate-800 shadow-2xl text-slate-100"
        >
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
              {status === 'loading' ? (
                <Loader2 className="w-7 h-7 text-sky-400 animate-spin" />
              ) : (
                <ShieldCheck className="w-7 h-7 text-rose-400" />
              )}
            </div>

            {status === 'loading' ? (
              <>
                <h3 className="text-lg font-black">Loading rewarded ad...</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Please watch the ad to unlock your game.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-black">Ad unavailable</h3>
                <p className="mt-2 text-sm text-slate-400">
                  The rewarded ad could not be loaded. Please try again.
                </p>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="mt-5 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold"
                  >
                    Close
                  </button>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
