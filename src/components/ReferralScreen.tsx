import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Copy,
  Check,
  Share2,
  Sparkles,
  Award,
  TrendingUp,
  UserCheck,
  Zap,
  ArrowLeft,
  DollarSign
} from 'lucide-react';
import { ReferralUser } from '../types';
import { sounds } from '../utils/audio';

interface ReferralScreenProps {
  referralCode: string;
  referrals: ReferralUser[];
  totalReferralCommission: number;
  onSimulateReferralGame: () => void;
  onBackToHome: () => void;
}

export const ReferralScreen: React.FC<ReferralScreenProps> = ({
  referralCode,
  referrals,
  totalReferralCommission,
  onSimulateReferralGame,
  onBackToHome,
}) => {
  const [copied, setCopied] = useState(false);

  const referralLink = `https://t.me/WormEarnBot?start=ref_${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    sounds.playCoin();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTelegramShare = () => {
    sounds.playClick();
    const shareText = encodeURIComponent(
      `🎮 Play Tic-Tac-Toe on Worm (Telegram) and earn ₹10.00+ real cash every match! Withdraw instantly to UPI & Bank: ${referralLink}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${shareText}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-4 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playClick();
            onBackToHome();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-[#0f172a] border border-slate-800 px-3 py-1.5 rounded-xl transition hover:border-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
        <span className="text-[11px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full font-mono">
          0.1% Lifetime Commission
        </span>
      </div>

      {/* Referral Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b1120] border border-slate-800 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Referral Program</span>
        </div>

        <h3 className="text-2xl font-black text-white font-display leading-tight">
          Invite Friends & Earn 0.1%
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Whenever someone you invite plays a Tic-Tac-Toe match or wins rewards, you automatically earn 0.1% commission directly into your wallet.
        </p>

        {/* Total Referral Stats Bar */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800">
          <div className="bg-[#020617]/70 rounded-xl p-2.5 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-medium">Total Ref Commission</div>
            <div className="text-base font-black text-sky-400 font-mono">
              ₹{totalReferralCommission.toFixed(2)} INR
            </div>
          </div>
          <div className="bg-[#020617]/70 rounded-xl p-2.5 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-medium">Active Referrals</div>
            <div className="text-base font-black text-white font-mono">{referrals.length} Friends</div>
          </div>
        </div>
      </motion.div>

      {/* Shareable Link Box */}
      <div className="bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
        <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span>Your Unique Telegram Invite Link</span>
          <span className="text-[11px] font-mono text-sky-400 font-bold">Code: {referralCode}</span>
        </label>

        <div className="flex items-center gap-2 bg-[#020617] border border-slate-800 rounded-xl p-2 pl-3">
          <span className="text-xs font-mono text-slate-300 truncate select-all">{referralLink}</span>
          <button
            id="copy-referral-link-btn"
            onClick={handleCopyLink}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              copied
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Telegram Share Button */}
        <button
          id="telegram-share-ref-btn"
          onClick={handleTelegramShare}
          className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black rounded-xl text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition active:scale-98 border border-sky-400/30"
        >
          <Share2 className="w-4 h-4" />
          <span>Share to Telegram Chats / Stories</span>
        </button>
      </div>

      {/* Interactive Simulation Helper */}
      <div className="bg-[#0f172a]/70 border border-slate-800/90 rounded-2xl p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Simulate Friend's Game</div>
            <div className="text-[11px] text-slate-400">Trigger simulated match & earn +0.1% commission live</div>
          </div>
        </div>
        <button
          id="simulate-ref-action-btn"
          onClick={() => {
            sounds.playCoin();
            onSimulateReferralGame();
          }}
          className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs rounded-xl transition shrink-0 active:scale-95 font-mono"
        >
          +0.1% Test
        </button>
      </div>

      {/* Referrals List */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Your Invited Friends</h4>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{referrals.length} active users</span>
        </div>

        <div className="space-y-2">
          {referrals.map((user) => (
            <div
              key={user.id}
              className="p-2.5 bg-[#020617]/70 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-700/60"
                />
                <div>
                  <div className="font-bold text-slate-200 flex items-center gap-1">
                    <span>{user.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{user.username}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {user.gamesPlayed} games played • joined {user.joinedDate}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400">Commission (0.1%)</div>
                <div className="font-bold text-emerald-400 font-mono text-xs">
                  +₹{user.commissionPaid.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
