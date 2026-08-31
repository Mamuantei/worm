import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ADMIN_CREDENTIALS = {
  question: 'worm app',
  answer: 'Fire and lightning',
  email: 'mamuanteiamanda@gmail.com',
  password: 'Pegasus777&exodus',
};

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Step 1: Secret Question ("worm app" -> "Fire and lightning")
  // Step 2: Admin Email & Password login
  const [step, setStep] = useState<1 | 2>(1);
  const [securityAnswer, setSecurityAnswer] = useState<string>('');
  const [email, setEmail] = useState<string>('mamuanteiamanda@gmail.com');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAnswer = securityAnswer.trim().toLowerCase();
    const targetAnswer = ADMIN_CREDENTIALS.answer.toLowerCase();

    if (cleanAnswer === targetAnswer) {
      sounds.playCoin();
      setError(null);
      setStep(2);
    } else {
      sounds.playDraw();
      setError('Incorrect security answer. Access denied.');
    }
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const isMatch =
      cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() &&
      cleanPassword === ADMIN_CREDENTIALS.password;

    if (isMatch) {
      sounds.playWin();
      setError(null);
      setPassword('');
      setSecurityAnswer('');
      setStep(1);
      localStorage.setItem('worm_admin_session', 'true');
      onSuccess();
    } else {
      sounds.playDraw();
      setError('Invalid admin email or password. Access denied.');
    }
  };

  const handleClose = () => {
    sounds.playClick();
    setError(null);
    setSecurityAnswer('');
    setPassword('');
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-[#0f172a] border border-amber-500/30 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm font-display">Owner Admin Gateway</h3>
              <p className="text-[10px] text-slate-400">
                {step === 1 ? 'Step 1: Security Challenge' : 'Step 2: Admin Credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-1.5 mt-3 mb-4">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-amber-400' : 'bg-slate-800'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-amber-400' : 'bg-slate-800'}`} />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            /* STEP 1: Secret Question */
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleQuestionSubmit}
              className="space-y-4"
            >
              <div className="bg-[#020617] border border-amber-500/20 rounded-2xl p-3.5 text-center">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 mb-2">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider mb-1">
                  Secret Security Question
                </span>
                <p className="text-base font-black text-amber-300 font-display">
                  "{ADMIN_CREDENTIALS.question}"
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Enter Security Answer
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={securityAnswer}
                    onChange={(e) => {
                      setSecurityAnswer(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter security answer..."
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-1.5 text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-1.5"
              >
                <span>Verify Answer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.form>
          ) : (
            /* STEP 2: Email & Password */
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleCredentialsSubmit}
              className="space-y-3.5"
            >
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 p-2 rounded-xl text-emerald-400 text-[11px]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Security question verified. Please enter Admin credentials.</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="admin@email.com"
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Admin Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter password"
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-1.5 text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setStep(1);
                    setError(null);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 active:scale-98"
                >
                  Login as Admin
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
