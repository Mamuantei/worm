import React from 'react';
import { motion } from 'motion/react';
import { Play, Wallet, Users, Sparkles, Trophy, HelpCircle, ArrowUpRight, Award, IndianRupee, ShieldCheck } from 'lucide-react';
import { UserWallet } from '../types';
import { sounds } from '../utils/audio';
import wormLogo from '../assets/images/worm_logo_1788193225519.jpg';

interface HomeScreenProps {
  wallet: UserWallet;
  isAdminUnlocked: boolean;
  pendingWithdrawalsCount?: number;
  onPlayClick: () => void;
  onOpenWallet: () => void;
  onOpenReferral: () => void;
  onOpenGuide: () => void;
  onOpenAdmin: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  wallet,
  isAdminUnlocked,
  pendingWithdrawalsCount = 0,
  onPlayClick,
  onOpenWallet,
  onOpenReferral,
  onOpenGuide,
  onOpenAdmin,
}) => {
  const winRate = wallet.totalGames > 0
    ? Math.round((wallet.wins / wallet.totalGames) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-4 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* Telegram User Greeting & Worm Branding */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={wormLogo}
            alt="Worm Logo"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-2xl object-cover border border-sky-500/40 shadow-md shadow-sky-500/20"
          />
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Welcome back</span>
            <h2 className="text-xl font-black text-white font-display flex items-center gap-1.5">
              Worm Player <span className="text-sm">⚡</span>
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isAdminUnlocked && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenAdmin();
              }}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1.5 rounded-xl transition"
              title="Owner Payout Dashboard"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-semibold">Payouts</span>
              {pendingWithdrawalsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  {pendingWithdrawalsCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenGuide();
            }}
            className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-xl transition hover:bg-sky-500/15"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="font-semibold">Rules</span>
          </button>
        </div>
      </div>

      {/* Main Balance Card (INR) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b1120] border border-slate-800 p-5 shadow-2xl"
      >
        {/* Ambient Glow Accents */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
              Total Available Balance
            </span>
            <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              UPI & Bank Payouts
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-display">
              ₹{wallet.balance.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">INR</span>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/90 text-center">
            <div className="bg-[#020617]/70 rounded-xl p-2 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-medium">Total Earned</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">₹{wallet.totalEarned.toFixed(2)}</div>
            </div>
            <div className="bg-[#020617]/70 rounded-xl p-2 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-medium">Games Played</div>
              <div className="text-sm font-bold text-sky-300 font-mono">{wallet.totalGames}</div>
            </div>
            <div className="bg-[#020617]/70 rounded-xl p-2 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-medium">Win Rate</div>
              <div className="text-sm font-bold text-amber-400 font-mono">{winRate}%</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Reward Structure Pill Banner */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Worm Earning Rates Per Match (INR)</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl py-2 px-1">
            <div className="text-[10px] text-sky-400 font-medium">Every Play</div>
            <div className="text-xs font-bold text-white font-mono">+₹10.00</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-2 px-1">
            <div className="text-[10px] text-emerald-400 font-medium">Win Bonus</div>
            <div className="text-xs font-bold text-emerald-300 font-mono">+₹10.00</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl py-2 px-1">
            <div className="text-[10px] text-purple-400 font-medium">Draw Bonus</div>
            <div className="text-xs font-bold text-purple-300 font-mono">+₹50.00</div>
          </div>
        </div>
      </div>

      {/* Big Main Play Button (Watches Ad First) */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="flex flex-col gap-1.5"
      >
        <button
          id="home-play-game-btn"
          onClick={() => {
            sounds.playClick();
            onPlayClick();
          }}
          className="relative group w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 text-white font-black text-lg shadow-xl shadow-sky-500/20 flex items-center justify-between overflow-hidden transition-all border border-sky-400/30"
        >
          {/* Subtle animated light sweep */}
          <div className="absolute inset-0 w-1/2 bg-white/15 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />

          <div className="flex items-center gap-3.5 text-left relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 shadow-inner">
              <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
            </div>
            <div>
              <div className="font-display font-black text-lg sm:text-xl tracking-wide leading-tight">
                PLAY WORM MATCH
              </div>
              <div className="text-xs font-medium text-sky-100 flex items-center gap-1.5">
                <span>Watch 5s ad to unlock match</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="relative z-10 bg-white/15 px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold font-mono">
            +₹10.00+
          </div>
        </button>
      </motion.div>

      {/* Dual Options: Wallet & Referral Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Wallet Option */}
        <motion.button
          id="home-wallet-btn"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            sounds.playClick();
            onOpenWallet();
          }}
          className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/80 text-left transition flex flex-col justify-between h-32 group shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
              <Wallet className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
          </div>
          <div>
            <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
              Wallet Option
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Bank / UPI Withdraw (INR)
            </div>
          </div>
        </motion.button>

        {/* Referral Option */}
        <motion.button
          id="home-referral-btn"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            sounds.playClick();
            onOpenReferral();
          }}
          className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-sky-500/40 hover:bg-slate-800/80 text-left transition flex flex-col justify-between h-32 group shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
              0.1% Share
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-white group-hover:text-sky-300 transition">
              Referral Option
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Invite friends & earn 0.1%
            </div>
          </div>
        </motion.button>
      </div>

      {/* Owner / Admin Payout Hub Card (Only visible when Owner is authenticated) */}
      {isAdminUnlocked && (
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => {
            sounds.playClick();
            onOpenAdmin();
          }}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1.5 font-display uppercase tracking-wide">
                <span>Owner Payout Queue</span>
                {pendingWithdrawalsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px]">
                    {pendingWithdrawalsCount} New
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                View player UPI IDs & bank details to send money
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/15 px-2.5 py-1.5 rounded-xl border border-amber-500/30">
            <span>Open</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>
      )}

      {/* Live Recent Matches / Leaderboard Preview */}
      <div className="bg-[#0f172a]/70 rounded-2xl border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Player Payouts (INR)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Real-time</span>
        </div>

        <div className="space-y-2">
          {[
            { user: '@rohit_gamer', action: 'Won Worm Match vs AI', amount: '+₹20.00', time: '1m ago', flag: '🇮🇳' },
            { user: '@priya_win', action: 'Draw Match vs Real Player', amount: '+₹60.00', time: '3m ago', flag: '🇮🇳' },
            { user: '@aryan_tech', action: 'UPI Transfer Completed', amount: '-₹100.00', time: '5m ago', flag: '🇮🇳' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-[#020617]/70 border border-slate-800/70"
            >
              <div className="flex items-center gap-2">
                <span>{item.flag}</span>
                <span className="font-bold text-slate-200">{item.user}</span>
                <span className="text-slate-400 text-[11px]">{item.action}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`font-mono font-bold ${item.amount.startsWith('+') ? 'text-emerald-400' : 'text-sky-400'}`}>
                  {item.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
