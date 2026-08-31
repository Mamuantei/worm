import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles, ExternalLink, ShieldCheck, Gamepad2, Coins, Rocket, CheckCircle2 } from 'lucide-react';
import { AdCreative } from '../types';
import { AD_CREATIVES } from '../utils/storage';
import { sounds } from '../utils/audio';

interface AdModalProps {
  isOpen: boolean;
  onAdComplete: () => void;
  onClose?: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({ isOpen, onAdComplete, onClose }) => {
  const [adIndex, setAdIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentAd: AdCreative = AD_CREATIVES[adIndex % AD_CREATIVES.length];

  useEffect(() => {
    if (isOpen) {
      // Pick random ad
      setAdIndex(Math.floor(Math.random() * AD_CREATIVES.length));
      setSecondsRemaining(5);
      setIsCompleted(false);

      const timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsCompleted(true);
            sounds.playAdComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getAdIcon = () => {
    switch (currentAd.iconType) {
      case 'crypto':
        return <Coins className="w-8 h-8 text-yellow-400" />;
      case 'game':
        return <Gamepad2 className="w-8 h-8 text-pink-400" />;
      case 'telegram':
        return <Sparkles className="w-8 h-8 text-cyan-400" />;
      case 'finance':
      default:
        return <Rocket className="w-8 h-8 text-emerald-400" />;
    }
  };

  const progressPercentage = ((5 - secondsRemaining) / 5) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-sm bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-slate-100"
        >
          {/* Ad Top Header */}
          <div className="bg-[#020617] px-4 py-3 flex items-center justify-between border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                {currentAd.badge}
              </span>
              <span className="font-medium text-slate-300">{currentAd.sponsor}</span>
            </div>

            <div className="flex items-center gap-1 font-mono font-bold text-slate-300">
              {isCompleted ? (
                <span className="text-emerald-400 flex items-center gap-1 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ad Finished
                </span>
              ) : (
                <span className="bg-slate-800/80 px-2.5 py-0.5 rounded-full text-amber-300 border border-amber-500/20 text-[11px]">
                  Ad: {secondsRemaining}s
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#020617] h-1.5 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Ad Media Canvas / Banner */}
          <div className={`p-6 bg-gradient-to-br ${currentAd.bannerGradient} relative overflow-hidden flex flex-col justify-between min-h-[190px]`}>
            {/* Background glowing shapes */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute top-2.5 right-2.5 bg-black/30 backdrop-blur-sm text-white/90 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/15">
              Rewarded Ad
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                {getAdIcon()}
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-white/80">{currentAd.category}</span>
                <h3 className="text-lg font-black text-white leading-tight font-display drop-shadow-sm">
                  {currentAd.title}
                </h3>
              </div>
            </div>

            <div className="mt-4 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/15">
              <p className="text-xs font-semibold text-white/90 line-clamp-2">
                "{currentAd.tagline}"
              </p>
              <p className="text-[11px] text-white/70 mt-1 line-clamp-2">
                {currentAd.description}
              </p>
            </div>
          </div>

          {/* Ad Reward & Action Area */}
          <div className="p-4 bg-[#0f172a] flex flex-col gap-3">
            <div className="bg-[#020617]/90 rounded-2xl p-3 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  +₹
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Watch to Unlock Match</div>
                  <div className="text-[11px] text-slate-400">Earn ₹10.00 base reward + win bonus!</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 font-mono">+₹10.00</span>
              </div>
            </div>

            {/* External Sponsor link */}
            <a
              href="https://telegram.org"
              target="_blank"
              rel="noreferrer"
              onClick={() => sounds.playClick()}
              className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 py-1 transition"
            >
              <span>{currentAd.ctaText}</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Continue button */}
            {isCompleted ? (
              <motion.button
                id="start-game-after-ad-btn"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  sounds.playClick();
                  onAdComplete();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-98"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Tic-Tac-Toe Match</span>
              </motion.button>
            ) : (
              <button
                disabled
                className="w-full py-3 bg-[#020617] text-slate-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-800"
              >
                <div className="w-3.5 h-3.5 border-2 border-slate-600 border-t-sky-400 rounded-full animate-spin" />
                <span>Watching Ad ({secondsRemaining}s remaining)...</span>
              </button>
            )}

            {onClose && isCompleted && (
              <button
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-400 text-center py-0.5"
              >
                Cancel
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
