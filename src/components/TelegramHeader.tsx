import React from 'react';
import { Volume2, VolumeX, ShieldCheck, Sparkles, User, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';
import wormLogo from '../assets/images/worm_logo_1788193225519.jpg';

interface TelegramHeaderProps {
  balance: number;
  soundEnabled: boolean;
  isAdminUnlocked: boolean;
  currentPhoneNumber?: string;
  pendingWithdrawalsCount?: number;
  onToggleSound: () => void;
  onOpenWallet: () => void;
  onOpenAdmin: () => void;
  onTriggerAdminLogin: () => void;
}

export const TelegramHeader: React.FC<TelegramHeaderProps> = ({
  balance,
  soundEnabled,
  isAdminUnlocked,
  currentPhoneNumber,
  pendingWithdrawalsCount = 0,
  onToggleSound,
  onOpenWallet,
  onOpenAdmin,
  onTriggerAdminLogin,
}) => {
  const [tapCount, setTapCount] = React.useState<number>(0);

  const handleLogoTap = () => {
    sounds.playClick();
    const nextCount = tapCount + 1;
    setTapCount(nextCount);

    if (nextCount >= 3) {
      setTapCount(0);
      onTriggerAdminLogin();
    } else {
      setTimeout(() => setTapCount(0), 1200);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#020617]/85 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Worm App logo & branding (Triple-tap trigger for secret owner challenge) */}
        <div
          onClick={handleLogoTap}
          className="flex items-center gap-2.5 cursor-pointer select-none active:scale-95 transition"
          title="Worm"
        >
          <div className="relative">
            <img
              src={wormLogo}
              alt="Worm Logo"
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-xl object-cover border border-sky-500/40 shadow-lg shadow-sky-500/20"
            />
            <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 w-3 h-3 rounded-full border-2 border-[#020617]" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-black text-white tracking-tight font-display">Worm</span>
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 inline" />
            </div>
            <span className="text-[11px] text-slate-400 block font-mono">Play & Earn INR 🇮🇳</span>
          </div>
        </div>

        {/* Balance badge, Admin portal link (only visible when unlocked), and audio controls */}
        <div className="flex items-center gap-1.5">
          {isAdminUnlocked && (
            <button
              id="header-admin-btn"
              onClick={() => {
                sounds.playClick();
                onOpenAdmin();
              }}
              className="flex items-center gap-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 px-2.5 py-1 rounded-full text-[11px] font-bold transition active:scale-95 shadow-sm"
              title="Owner Payout Dashboard"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
              {pendingWithdrawalsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center -mr-0.5">
                  {pendingWithdrawalsCount}
                </span>
              )}
            </button>
          )}

          <button
            id="header-wallet-btn"
            onClick={() => {
              sounds.playClick();
              onOpenWallet();
            }}
            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-bold font-mono transition active:scale-95 shadow-sm"
            title="Open Wallet"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>₹{balance.toFixed(2)}</span>
          </button>

          <button
            id="sound-toggle-btn"
            onClick={() => {
              onToggleSound();
              sounds.playClick();
            }}
            className="p-1.5 rounded-xl bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
