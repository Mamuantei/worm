import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  Building2,
  History,
  Users,
  ArrowDownToLine,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  IndianRupee,
  Smartphone
} from 'lucide-react';
import { UserWallet, WithdrawalRecord } from '../types';
import { sounds } from '../utils/audio';

interface WalletScreenProps {
  wallet: UserWallet;
  withdrawals: WithdrawalRecord[];
  onWithdraw: (record: WithdrawalRecord) => void;
  onOpenReferral: () => void;
  onBackToHome: () => void;
}

const POPULAR_INDIAN_BANKS = [
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Punjab National Bank (PNB)',
  'Kotak Mahindra Bank',
  'Bank of Baroda',
  'Paytm Payments Bank',
  'UPI Direct (GPay / PhonePe / Paytm / BHIM)',
  'Other Indian Bank'
];

export const WalletScreen: React.FC<WalletScreenProps> = ({
  wallet,
  withdrawals,
  onWithdraw,
  onOpenReferral,
}) => {
  // Withdraw Form State
  const [payoutType, setPayoutType] = useState<'bank' | 'upi'>('upi');
  const [amount, setAmount] = useState<string>('100.00');
  const [bankName, setBankName] = useState<string>(POPULAR_INDIAN_BANKS[0]);
  const [customBank, setCustomBank] = useState<string>('');
  const [accountHolder, setAccountHolder] = useState<string>('Worm Player');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parsedAmount = parseFloat(amount) || 0;
  const minWithdrawal = 100.00; // Accessible minimum for INR (₹100.00)

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const selectedBank = payoutType === 'upi'
      ? 'Instant UPI Transfer'
      : (bankName === 'Other Indian Bank' ? (customBank.trim() || 'Indian Bank') : bankName);

    if (parsedAmount < minWithdrawal) {
      setErrorMessage(`Minimum withdrawal amount is ₹${minWithdrawal.toFixed(2)} INR`);
      return;
    }

    if (parsedAmount > wallet.balance) {
      setErrorMessage(`Insufficient balance. You currently have ₹${wallet.balance.toFixed(2)} available.`);
      return;
    }

    if (!accountHolder.trim()) {
      setErrorMessage('Please enter the beneficiary full name.');
      return;
    }

    if (payoutType === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setErrorMessage('Please enter a valid UPI ID (e.g. yourname@okhdfcbank, mobile@paytm).');
        return;
      }
    } else {
      if (!accountNumber.trim() || accountNumber.length < 4) {
        setErrorMessage('Please enter a valid Bank Account Number (min 4 digits).');
        return;
      }
      if (!ifscCode.trim() || ifscCode.length < 5) {
        setErrorMessage('Please enter a valid 11-digit Bank IFSC code (e.g. SBIN0001234).');
        return;
      }
    }

    setIsSubmitting(true);
    sounds.playClick();

    // Submit withdrawal request to admin payout queue
    setTimeout(() => {
      const fullAccount = payoutType === 'upi' ? upiId.trim() : accountNumber.trim();
      const newRecord: WithdrawalRecord = {
        id: 'tx-' + Date.now().toString().slice(-6),
        amount: parsedAmount,
        payoutType: payoutType,
        bankName: selectedBank,
        accountHolder: accountHolder.trim(),
        accountNumber: fullAccount,
        upiId: payoutType === 'upi' ? upiId.trim() : undefined,
        ifscCode: payoutType === 'bank' ? ifscCode.toUpperCase().trim() : undefined,
        routingCode: payoutType === 'upi' ? 'UPI-VPA' : ifscCode.toUpperCase().trim(),
        status: 'pending',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        referenceId: 'WORM-' + (payoutType === 'upi' ? 'UPI-' : 'BNK-') + Math.random().toString(36).substring(2, 8).toUpperCase(),
      };

      onWithdraw(newRecord);
      setIsSubmitting(false);
      setSuccessMessage(`₹${parsedAmount.toFixed(2)} withdrawal request submitted! Payout will be sent to your ${payoutType === 'upi' ? 'UPI ID' : 'Bank Account'}.`);
      sounds.playWin();

      // Reset fields
      setAccountNumber('');
      setIfscCode('');
      setUpiId('');
    }, 900);
  };

  return (
    <div className="flex flex-col gap-4 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* Wallet Balance Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b1120] border border-slate-800 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Worm INR Wallet</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            UPI & Bank 0% Fee
          </span>
        </div>

        <div className="my-2">
          <div className="text-xs text-slate-400 font-medium">Available to Withdraw</div>
          <div className="text-4xl font-black text-white font-display flex items-baseline gap-2">
            <span>₹{wallet.balance.toFixed(2)}</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">INR</span>
          </div>
        </div>

        {/* Ledger Breakdown */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
          <div className="bg-[#020617]/70 rounded-xl p-2 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">Total Earned</div>
            <div className="text-xs font-bold text-emerald-400 font-mono">₹{wallet.totalEarned.toFixed(2)}</div>
          </div>
          <div className="bg-[#020617]/70 rounded-xl p-2 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">Withdrawn</div>
            <div className="text-xs font-bold text-sky-400 font-mono">₹{wallet.totalWithdrawn.toFixed(2)}</div>
          </div>
          <div className="bg-[#020617]/70 rounded-xl p-2 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">Ref Commission</div>
            <div className="text-xs font-bold text-amber-400 font-mono">₹{wallet.referralEarnings.toFixed(2)}</div>
          </div>
        </div>
      </motion.div>

      {/* Total of Referral Section Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0f172a] via-[#1e1b4b]/40 to-[#0f172a] border border-slate-800 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total of Referral</div>
            <div className="text-base font-black text-white flex items-center gap-1.5 font-mono">
              <span>₹{wallet.referralEarnings.toFixed(2)} INR</span>
              <span className="text-[10px] bg-sky-500/15 text-sky-300 px-1.5 py-0.5 rounded font-mono font-bold border border-sky-500/20">
                0.1% rate
              </span>
            </div>
          </div>
        </div>

        <button
          id="wallet-open-referral-btn"
          onClick={() => {
            sounds.playClick();
            onOpenReferral();
          }}
          className="text-xs font-bold text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-xl transition flex items-center gap-1 active:scale-95"
        >
          <span>Invite</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* WITHDRAW SECTION - UPI & BANK TRANSFER */}
      <div className="bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black text-white font-display">Instant Withdrawal (INR)</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            0% Transfer Fee
          </span>
        </div>

        {/* Method Toggle: UPI vs Bank Account */}
        <div className="grid grid-cols-2 gap-2 bg-[#020617] p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setPayoutType('upi');
            }}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              payoutType === 'upi'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>UPI Transfer (Instant)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setPayoutType('bank');
            }}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              payoutType === 'bank'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Bank IMPS / NEFT</span>
          </button>
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-3.5">
          {/* Amount field with quick chips */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-300">Withdraw Amount (₹ INR)</label>
              <span className="text-[11px] text-slate-400 font-mono">Min: ₹{minWithdrawal.toFixed(2)}</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
              <input
                id="withdraw-amount-input"
                type="number"
                step="1.00"
                min="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
                className="w-full bg-[#020617] border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>

            {/* Preset Amount Chips */}
            <div className="flex items-center gap-1.5 mt-2">
              {['100.00', '200.00', '500.00', '1000.00'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setAmount(preset);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition border ${
                    amount === preset
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-[#020617] text-slate-400 border-slate-800 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setAmount(wallet.balance.toFixed(2));
                }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Account Holder */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-1.5 block">Beneficiary Full Name</label>
            <input
              id="account-holder-input"
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="e.g. Aryan Sharma"
              className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          {/* UPI ID Field */}
          {payoutType === 'upi' ? (
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">UPI ID / VPA Address</label>
              <input
                id="upi-id-input"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourname@okhdfcbank, mobile@paytm, user@ybl"
                className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Supports Google Pay, PhonePe, Paytm, BHIM & all bank UPIs.</span>
            </div>
          ) : (
            <>
              {/* Bank Selection */}
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Select Destination Bank</label>
                <select
                  id="bank-name-select"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  {POPULAR_INDIAN_BANKS.map((bank) => (
                    <option key={bank} value={bank} className="bg-[#0f172a] text-white">
                      {bank}
                    </option>
                  ))}
                </select>
              </div>

              {bankName === 'Other Indian Bank' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">Custom Bank Name</label>
                  <input
                    type="text"
                    value={customBank}
                    onChange={(e) => setCustomBank(e.target.value)}
                    placeholder="e.g. Canara Bank / IndusInd Bank"
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              )}

              {/* Account Number & IFSC */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">Account Number</label>
                  <input
                    id="account-number-input"
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 501004218849"
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">IFSC Code</label>
                  <input
                    id="routing-code-input"
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="e.g. HDFC0001234"
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs font-mono uppercase focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            id="submit-bank-withdraw-btn"
            type="submit"
            disabled={isSubmitting || wallet.balance < minWithdrawal}
            className={`w-full mt-2 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
              isSubmitting || wallet.balance < minWithdrawal
                ? 'bg-[#020617] text-slate-500 cursor-not-allowed border border-slate-800'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black shadow-xl shadow-emerald-500/20 active:scale-98'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Processing Transfer...</span>
              </>
            ) : (
              <>
                <ArrowDownToLine className="w-4 h-4" />
                <span>Withdraw ₹{parsedAmount > 0 ? parsedAmount.toFixed(2) : '100.00'} INR</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* WITHDRAWAL HISTORY */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Withdrawal History (INR)</h4>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{withdrawals.length} records</span>
        </div>

        {withdrawals.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No bank or UPI withdrawals yet. Play matches to earn and withdraw anytime!
          </div>
        ) : (
          <div className="space-y-2">
            {withdrawals.map((record) => {
              const isUpi = record.payoutType === 'upi' || record.routingCode === 'UPI-VPA';
              return (
                <div
                  key={record.id}
                  className="p-3 bg-[#020617]/70 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                        isUpi
                          ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      }`}
                    >
                      {isUpi ? <Smartphone className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-200">
                        {isUpi ? 'UPI Transfer' : record.bankName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <span className="truncate max-w-[150px]">{record.accountNumber}</span>
                        <span>•</span>
                        <span>{record.createdAt}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Ref: {record.referenceId}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-white font-mono text-sm">₹{record.amount.toFixed(2)}</div>
                    <span
                      className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        record.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                      }`}
                    >
                      {record.status === 'completed' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
