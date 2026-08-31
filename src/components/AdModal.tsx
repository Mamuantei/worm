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

const SDK_SRC = 'https://libtl.com/sdk.js';
const ZONE = '11697097';
const SDK_NAME = 'show_11697097';
const SDK_TIMEOUT_MS = 6000;
const AD_TIMEOUT_MS = 12000;

let sdkPromise: Promise<void> | null = null;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), timeoutMs)),
  ]);
}

function loadSdk(): Promise<void> {
  if (typeof window !== 'undefined' && typeof window.show_11697097 === 'function') {
    return Promise.resolve();
  }
  if (sdkPromise) return sdkPromise;

  sdkPromise = withTimeout(new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SDK_SRC;
    script.async = true;
    script.dataset.zone = ZONE;
    script.dataset.sdk = SDK_NAME;
    script.onload = () => {
      const start = Date.now();
      const check = () => {
        if (typeof window.show_11697097 === 'function') return resolve();
        if (Date.now() - start > 3000) return reject(new Error('Monetag function unavailable'));
        setTimeout(check, 100);
      };
      check();
    };
    script.onerror = () => reject(new Error('Monetag SDK failed to load'));
    document.head.appendChild(script);
  }), SDK_TIMEOUT_MS, 'Monetag SDK timed out').catch((error) => {
    sdkPromise = null;
    throw error;
  });

  return sdkPromise;
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

    let cancelled = false;

    (async () => {
      try {
        await loadSdk();
        if (cancelled || typeof window.show_11697097 !== 'function') throw new Error('Rewarded ad unavailable');
        sounds.playClick();
        await withTimeout(window.show_11697097(), AD_TIMEOUT_MS, 'Rewarded ad timed out');
        if (cancelled) return;
        sounds.playAdComplete();
        onAdComplete();
      } catch (error) {
        console.error('Rewarded ad failed:', error);
        if (!cancelled) {
          setStatus('error');
          // Never leave the player trapped behind an ad spinner.
          setTimeout(() => {
            if (!cancelled) onAdComplete();
          }, 1200);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, onAdComplete]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm rounded-3xl overflow-hidden bg-[#0f172a] border border-slate-800 shadow-2xl text-slate-100">
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
              {status === 'loading' ? <Loader2 className="w-7 h-7 text-sky-400 animate-spin" /> : <ShieldCheck className="w-7 h-7 text-rose-400" />}
            </div>
            {status === 'loading' ? (
              <>
                <h3 className="text-lg font-black">Opening rewarded ad...</h3>
                <p className="mt-2 text-sm text-slate-400">The ad has a timeout so the app cannot get stuck loading.</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-black">Ad unavailable</h3>
                <p className="mt-2 text-sm text-slate-400">No rewarded ad is available right now. Starting the match instead.</p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
