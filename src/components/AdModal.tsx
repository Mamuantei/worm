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

let sdkPromise: Promise<void> | null = null;

function loadSdk(): Promise<void> {
  if (typeof window !== 'undefined' && typeof window.show_11697097 === 'function') {
    return Promise.resolve();
  }
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SDK_SRC;
    script.async = true;
    script.dataset.zone = ZONE;
    script.dataset.sdk = SDK_NAME;
    script.onload = () => {
      // Give the SDK a short moment to expose the function.
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
  }).catch((error) => {
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
        if (cancelled || typeof window.show_11697097 !== 'function') return;
        sounds.playClick();
        await window.show_11697097();
        if (cancelled) return;
        sounds.playAdComplete();
        onAdComplete();
      } catch (error) {
        console.error('Monetag rewarded interstitial failed:', error);
        if (!cancelled) setStatus('error');
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
                <p className="mt-2 text-sm text-slate-400">Please wait a moment.</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-black">Ad unavailable</h3>
                <p className="mt-2 text-sm text-slate-400">No rewarded ad is available right now. Please try again.</p>
                {onClose && <button onClick={onClose} className="mt-5 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold">Close</button>}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
