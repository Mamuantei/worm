import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Smartphone,
  Building2,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  PlusCircle,
  FileSpreadsheet,
  IndianRupee,
  ChevronLeft,
  Info,
  Send,
  AlertCircle,
  Lock
} from 'lucide-react';
import { WithdrawalRecord } from '../types';
import { sounds } from '../utils/audio';

interface AdminPortalProps {
  withdrawals: WithdrawalRecord[];
  onUpdateWithdrawalStatus: (id: string, status: 'completed' | 'pending' | 'processing', utr?: string, adminNote?: string) => void;
  onRejectWithdrawal: (id: string, reason: string) => void;
  onCreateTestWithdrawal: () => void;
  onBackToHome: () => void;
  onLockAdmin?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  withdrawals,
  onUpdateWithdrawalStatus,
  onRejectWithdrawal,
  onCreateTestWithdrawal,
  onBackToHome,
  onLockAdmin,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'completed' | 'upi' | 'bank'>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedFullId, setCopiedFullId] = useState<string | null>(null);

  // Selected item for payment modal
  const [activePaymentModal, setActivePaymentModal] = useState<WithdrawalRecord | null>(null);
  const [utrInput, setUtrInput] = useState<string>('');

  // Selected item for reject modal
  const [activeRejectModal, setActiveRejectModal] = useState<WithdrawalRecord | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Incorrect UPI ID or Bank Details');

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    sounds.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy Full formatted text
  const handleCopyFull = (record: WithdrawalRecord) => {
    const isUpi = record.payoutType === 'upi' || record.routingCode === 'UPI-VPA';
    const text = `--- WORM WITHDRAWAL PAYOUT ---
Beneficiary: ${record.accountHolder}
Amount: ₹${record.amount.toFixed(2)} INR
Method: ${isUpi ? 'UPI' : 'Bank IMPS/NEFT'}
${isUpi ? `UPI ID: ${record.upiId || record.accountNumber}` : `Bank Name: ${record.bankName}\nAccount No: ${record.accountNumber}\nIFSC Code: ${record.ifscCode || record.routingCode}`}
Reference ID: ${record.referenceId}
Date: ${record.createdAt}
-----------------------------`;

    navigator.clipboard.writeText(text);
    setCopiedFullId(record.id);
    sounds.playClick();
    setTimeout(() => setCopiedFullId(null), 2000);
  };

  // Stats calculation
  const pendingRecords = withdrawals.filter((w) => w.status === 'pending');
  const completedRecords = withdrawals.filter((w) => w.status === 'completed');
  const totalPendingAmount = pendingRecords.reduce((sum, w) => sum + w.amount, 0);
  const totalCompletedAmount = completedRecords.reduce((sum, w) => sum + w.amount, 0);

  // Filtered withdrawals
  const filteredWithdrawals = withdrawals.filter((item) => {
    const isUpi = item.payoutType === 'upi' || item.routingCode === 'UPI-VPA';
    if (filterTab === 'pending' && item.status !== 'pending') return false;
    if (filterTab === 'completed' && item.status !== 'completed') return false;
    if (filterTab === 'upi' && !isUpi) return false;
    if (filterTab === 'bank' && isUpi) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchHolder = item.accountHolder.toLowerCase().includes(q);
      const matchAcc = item.accountNumber.toLowerCase().includes(q);
      const matchRef = item.referenceId.toLowerCase().includes(q);
      const matchBank = item.bankName.toLowerCase().includes(q);
      const matchUpi = (item.upiId || '').toLowerCase().includes(q);
      return matchHolder || matchAcc || matchRef || matchBank || matchUpi;
    }
    return true;
  });

  // Export to CSV
  const handleExportCSV = () => {
    sounds.playClick();
    const headers = ['Reference ID', 'Date', 'Beneficiary', 'Method', 'UPI ID / Account', 'IFSC / Bank', 'Amount (INR)', 'Status', 'UTR Number'];
    const rows = withdrawals.map((w) => [
      w.referenceId,
      w.createdAt,
      `"${w.accountHolder}"`,
      w.payoutType === 'upi' || w.routingCode === 'UPI-VPA' ? 'UPI' : 'Bank IMPS',
      `"${w.upiId || w.accountNumber}"`,
      `"${w.ifscCode || w.bankName}"`,
      w.amount.toFixed(2),
      w.status,
      w.utrNumber || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `worm_withdrawals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmPaid = () => {
    if (!activePaymentModal) return;
    onUpdateWithdrawalStatus(
      activePaymentModal.id,
      'completed',
      utrInput.trim() || 'UPI-REF-' + Date.now().toString().slice(-8),
      'Marked paid by admin'
    );
    sounds.playWin();
    setActivePaymentModal(null);
    setUtrInput('');
  };

  const handleConfirmReject = () => {
    if (!activeRejectModal) return;
    onRejectWithdrawal(activeRejectModal.id, rejectReason);
    sounds.playClick();
    setActiveRejectModal(null);
  };

  return (
    <div className="flex flex-col gap-4 pb-28 max-w-md mx-auto px-4 pt-3">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playClick();
            onBackToHome();
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white font-display uppercase tracking-wider">
              Owner Payout Portal
            </h2>
            <div className="flex items-center gap-1 text-[10px] text-amber-400/90 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>mamuanteiamanda@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1.5 rounded-xl hover:bg-emerald-500/20 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          {onLockAdmin && (
            <button
              onClick={() => {
                sounds.playClick();
                onLockAdmin();
              }}
              title="Lock Admin Mode"
              className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2 py-1.5 rounded-xl hover:bg-rose-500/20 transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Pending Payouts
            </span>
            <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
              {pendingRecords.length}
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1.5">
            ₹{totalPendingAmount.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting your UPI / IMPS transfer</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Total Paid Out
            </span>
            <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {completedRecords.length}
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1.5">
            ₹{totalCompletedAmount.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Successfully sent to players</div>
        </div>
      </div>

      {/* Guide Banner for Admin */}
      <div className="p-3 bg-sky-950/40 border border-sky-800/60 rounded-xl flex items-start gap-2.5 text-xs text-sky-200">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>How to send money to players:</strong>
          <div className="text-[11px] text-slate-300 mt-0.5">
            1. Copy user's <strong>UPI ID</strong> or <strong>Bank Account + IFSC</strong>.<br />
            2. Open your <strong>Google Pay / PhonePe / Paytm / Netbanking</strong> and send the exact INR amount.<br />
            3. Tap <strong>"Mark as Paid"</strong> to notify the player and close the request.
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, UPI ID, account, or ref..."
            className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
          {[
            { id: 'pending', label: `Pending (${pendingRecords.length})` },
            { id: 'all', label: `All (${withdrawals.length})` },
            { id: 'upi', label: 'UPI only' },
            { id: 'bank', label: 'Bank IMPS only' },
            { id: 'completed', label: `Paid (${completedRecords.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                setFilterTab(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl shrink-0 transition ${
                filterTab === tab.id
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Test Generator button */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {filteredWithdrawals.length} Withdrawal Request{filteredWithdrawals.length === 1 ? '' : 's'}
        </span>
        <button
          onClick={() => {
            sounds.playClick();
            onCreateTestWithdrawal();
          }}
          className="flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/25 px-2.5 py-1 rounded-lg transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ Add Test Request</span>
        </button>
      </div>

      {/* Withdrawal Request Cards */}
      {filteredWithdrawals.length === 0 ? (
        <div className="py-12 text-center bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-6">
          <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <div className="text-sm font-bold text-slate-300">No withdrawal requests found</div>
          <div className="text-xs text-slate-500 mt-1">
            {filterTab === 'pending'
              ? 'Great job! All player payout requests have been settled.'
              : 'Try changing your search query or filter criteria.'}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWithdrawals.map((record) => {
            const isUpi = record.payoutType === 'upi' || record.routingCode === 'UPI-VPA';
            const isPending = record.status === 'pending';
            const upiTarget = record.upiId || record.accountNumber;
            const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiTarget)}&pn=${encodeURIComponent(record.accountHolder)}&am=${record.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Worm Earnings Payout ${record.referenceId}`)}`;

            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-[#0f172a] border rounded-2xl p-4 shadow-xl flex flex-col gap-3 transition ${
                  isPending
                    ? 'border-amber-500/40 bg-gradient-to-br from-[#0f172a] to-[#1e1b18]'
                    : 'border-slate-800'
                }`}
              >
                {/* Header: Type, Status, and Amount */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        isUpi
                          ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isUpi ? <Smartphone className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{isUpi ? 'UPI Transfer' : 'Bank IMPS / NEFT'}</span>
                        <span className="text-[10px] text-slate-500 font-mono">#{record.referenceId}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{record.createdAt}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-white font-mono">
                      ₹{record.amount.toFixed(2)}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        record.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : record.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {record.status === 'pending' ? 'Needs Payment' : 'Paid & Settled'}
                    </span>
                  </div>
                </div>

                {/* Beneficiary Details Section */}
                <div className="bg-[#020617]/80 rounded-xl p-3 border border-slate-850 space-y-2 text-xs">
                  {/* Beneficiary Name */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Beneficiary Name:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white font-sans">{record.accountHolder}</span>
                      <button
                        onClick={() => handleCopy(record.accountHolder, `name-${record.id}`)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                        title="Copy Name"
                      >
                        {copiedId === `name-${record.id}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* UPI Details */}
                  {isUpi ? (
                    <div className="flex items-center justify-between bg-sky-950/30 p-2 rounded-lg border border-sky-900/40">
                      <div>
                        <span className="text-[10px] text-sky-300 font-bold block uppercase tracking-wider">
                          UPI ID (VPA)
                        </span>
                        <span className="font-mono font-bold text-white text-xs select-all">
                          {upiTarget}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(upiTarget, `upi-${record.id}`)}
                          className="flex items-center gap-1 bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 px-2 py-1 rounded-md text-[11px] font-bold transition border border-sky-500/30"
                        >
                          {copiedId === `upi-${record.id}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy UPI</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Bank Account & IFSC Details */
                    <div className="space-y-1.5 bg-emerald-950/20 p-2 rounded-lg border border-emerald-900/40">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Bank:</span>
                        <span className="font-semibold text-slate-200">{record.bankName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Account Number:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-white select-all">{record.accountNumber}</span>
                          <button
                            onClick={() => handleCopy(record.accountNumber, `acc-${record.id}`)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                          >
                            {copiedId === `acc-${record.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">IFSC Code:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-amber-300 uppercase select-all">
                            {record.ifscCode || record.routingCode}
                          </span>
                          <button
                            onClick={() => handleCopy(record.ifscCode || record.routingCode, `ifsc-${record.id}`)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                          >
                            {copiedId === `ifsc-${record.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment settlement timestamp & UTR */}
                  {record.status === 'completed' && record.utrNumber && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400">UTR / Ref:</span>
                      <span className="font-mono text-emerald-400 font-bold">{record.utrNumber}</span>
                    </div>
                  )}
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-2 pt-1">
                  {/* Copy All Details Button */}
                  <button
                    onClick={() => handleCopyFull(record)}
                    className="flex-1 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition"
                  >
                    {copiedFullId === record.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied All</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy All Details</span>
                      </>
                    )}
                  </button>

                  {/* UPI Direct App Launch (Mobile friendly) */}
                  {isUpi && isPending && (
                    <a
                      href={upiDeepLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-sky-600/20 transition"
                      title="Open in UPI App (GPay/PhonePe)"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open UPI</span>
                    </a>
                  )}

                  {/* Mark as Paid / Reject Buttons */}
                  {isPending ? (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setActivePaymentModal(record);
                        setUtrInput('');
                      }}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 transition active:scale-98"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Paid</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onUpdateWithdrawalStatus(record.id, 'pending');
                      }}
                      className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-800 transition"
                      title="Reopen as pending"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MARK AS PAID MODAL */}
      {activePaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center gap-2.5 text-emerald-400">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Confirm Money Sent</h3>
            </div>

            <div className="p-3 bg-[#020617] rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="text-slate-400">
                Beneficiary: <strong className="text-white">{activePaymentModal.accountHolder}</strong>
              </div>
              <div className="text-slate-400">
                Amount:{' '}
                <strong className="text-emerald-400 font-mono text-sm">
                  ₹{activePaymentModal.amount.toFixed(2)} INR
                </strong>
              </div>
              <div className="text-slate-400">
                Target:{' '}
                <span className="font-mono text-sky-300">
                  {activePaymentModal.upiId || activePaymentModal.accountNumber}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                Bank UTR / UPI Transaction Reference (Optional)
              </label>
              <input
                type="text"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                placeholder="e.g. 423891024819"
                className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Enter the reference number from your bank app for player records.
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActivePaymentModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPaid}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition shadow-lg shadow-emerald-500/20"
              >
                Confirm Paid
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
