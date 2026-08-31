import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Award, Building2, Users, Play, ShieldCheck, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-sm bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-slate-100 max-h-[90vh]"
        >
          <div className="p-4 bg-[#020617] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-sm text-white font-display">How Worm Works</h3>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3 overflow-y-auto text-xs">
            {/* Rule 1: Watch Ad */}
            <div className="flex items-start gap-2.5 p-3 bg-[#020617]/80 rounded-2xl border border-slate-800">
              <div className="w-7 h-7 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 font-bold font-mono text-xs">
                1
              </div>
              <div>
                <div className="font-bold text-slate-200">Watch Sponsored Ad to Play</div>
                <div className="text-slate-400 mt-0.5 leading-relaxed">
                  Click the Play button, view a 5-second partner sponsored ad, and your match unlocks automatically.
                </div>
              </div>
            </div>

            {/* Rule 2: Earnings */}
            <div className="flex items-start gap-2.5 p-3 bg-[#020617]/80 rounded-2xl border border-slate-800">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 font-bold font-mono text-xs">
                2
              </div>
              <div>
                <div className="font-bold text-slate-200">Earn Per Match Played</div>
                <div className="text-slate-400 mt-0.5 space-y-1 leading-relaxed">
                  <div>• <strong className="text-emerald-400 font-mono">+₹10.00</strong> guaranteed every time you play vs AI or a real person.</div>
                  <div>• <strong className="text-emerald-400 font-mono">+₹10.00</strong> victory bonus if you win (total ₹20.00).</div>
                  <div>• <strong className="text-emerald-400 font-mono">+₹50.00</strong> draw bonus if match ends in a draw (total ₹60.00).</div>
                </div>
              </div>
            </div>

            {/* Rule 3: Referral */}
            <div className="flex items-start gap-2.5 p-3 bg-[#020617]/80 rounded-2xl border border-slate-800">
              <div className="w-7 h-7 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 font-bold font-mono text-xs">
                3
              </div>
              <div>
                <div className="font-bold text-slate-200">0.1% Referral Commission</div>
                <div className="text-slate-400 mt-0.5 leading-relaxed">
                  Share your unique Telegram link with friends. You will earn a 0.1% commission on all their match earnings for life!
                </div>
              </div>
            </div>

            {/* Rule 4: Bank & UPI Withdrawals */}
            <div className="flex items-start gap-2.5 p-3 bg-[#020617]/80 rounded-2xl border border-slate-800">
              <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 font-bold font-mono text-xs">
                4
              </div>
              <div>
                <div className="font-bold text-slate-200">Instant UPI & Bank Withdrawals</div>
                <div className="text-slate-400 mt-0.5 leading-relaxed">
                  Withdraw your earnings straight to UPI (Google Pay, PhonePe, Paytm) or any Indian bank account (Min: ₹100.00) with 0 fees.
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#020617] border-t border-slate-800">
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black rounded-xl text-xs transition border border-sky-400/30 shadow-lg shadow-sky-500/20 active:scale-98"
            >
              Got It, Let's Play!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
