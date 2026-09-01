import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveTab, UserWallet, WithdrawalRecord, ReferralUser } from './types';
import { getStoredWallet, saveWallet, getStoredWithdrawals, saveWithdrawals, getStoredReferrals, saveReferrals, getReferralCode } from './utils/storage';
import { sounds } from './utils/audio';
import { TelegramHeader } from './components/TelegramHeader';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { WalletScreen } from './components/WalletScreen';
import { ReferralScreen } from './components/ReferralScreen';
import { AdminPortal } from './components/AdminPortal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdModal } from './components/AdModal';
import { GuideModal } from './components/GuideModal';
import { Navigation } from './components/Navigation';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [wallet, setWallet] = useState<UserWallet>(getStoredWallet);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>(getStoredWithdrawals);
  const [referrals, setReferrals] = useState<ReferralUser[]>(getStoredReferrals);
  const [referralCode] = useState<string>(getReferralCode);
  const [isAdModalOpen, setIsAdModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [userPhoneNumber, setUserPhoneNumber] = useState<string>(() => localStorage.getItem('worm_user_phone') || '');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    const savedPhone = localStorage.getItem('worm_user_phone');
    const isSavedAdmin = localStorage.getItem('worm_admin_session') === 'true';
    return isSavedAdmin || savedPhone === '6033190536' || (savedPhone ? savedPhone.replace(/\D/g, '').endsWith('6033190536') : false);
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'pending').length;

  useEffect(() => { saveWallet(wallet); }, [wallet]);
  useEffect(() => { saveWithdrawals(withdrawals); }, [withdrawals]);
  useEffect(() => { saveReferrals(referrals); }, [referrals]);

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      sounds.enabled = next;
      return next;
    });
  };

  // Open the visible rewarded-ad gate. Monetag itself is triggered by the ad button.
  const handleInitiatePlay = () => {
    setIsAdModalOpen(true);
  };

  const handleAdComplete = () => {
    setIsAdModalOpen(false);
    setActiveTab('game');
  };

  const handleGameComplete = (payout: { base: number; bonus: number; total: number; result: 'win' | 'draw' | 'loss' }) => {
    setWallet((prev) => {
      const isWin = payout.result === 'win';
      const isDraw = payout.result === 'draw';
      const isLoss = payout.result === 'loss';
      const newBalance = Number((prev.balance + payout.total).toFixed(2));
      const newTotalEarned = Number((prev.totalEarned + payout.total).toFixed(2));
      return {
        ...prev,
        balance: newBalance,
        totalEarned: newTotalEarned,
        totalGames: prev.totalGames + 1,
        wins: isWin ? prev.wins + 1 : prev.wins,
        draws: isDraw ? prev.draws + 1 : prev.draws,
        losses: isLoss ? prev.losses + 1 : prev.losses,
      };
    });
  };

  const handleWithdraw = (newRecord: WithdrawalRecord) => {
    setWithdrawals((prev) => [newRecord, ...prev]);
    setWallet((prev) => ({
      ...prev,
      balance: Math.max(0, Number((prev.balance - newRecord.amount).toFixed(2))),
      totalWithdrawn: Number((prev.totalWithdrawn + newRecord.amount).toFixed(2)),
    }));
  };

  const handleUpdateWithdrawalStatus = (id: string, status: 'completed' | 'pending' | 'processing', utr?: string, adminNote?: string) => {
    setWithdrawals((prev) => prev.map((item) => item.id === id ? {
      ...item,
      status,
      utrNumber: utr || item.utrNumber,
      paidAt: status === 'completed' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : item.paidAt,
      adminNote: adminNote || item.adminNote,
    } : item));
  };

  const handleRejectWithdrawal = (id: string, reason: string) => {
    const record = withdrawals.find((w) => w.id === id);
    if (!record) return;
    setWallet((prev) => ({
      ...prev,
      balance: Number((prev.balance + record.amount).toFixed(2)),
      totalWithdrawn: Math.max(0, Number((prev.totalWithdrawn - record.amount).toFixed(2))),
    }));
    setWithdrawals((prev) => prev.map((item) => item.id === id ? { ...item, status: 'processing', adminNote: `Refunded: ${reason}` } : item));
  };

  const handleCreateTestWithdrawal = () => {
    const samplePlayers = [
      { name: 'Vikram Malhotra', type: 'upi' as const, upi: 'vikram.m@okhdfcbank', bank: 'Instant UPI' },
      { name: 'Ananya Sen', type: 'upi' as const, upi: 'ananya.sen@paytm', bank: 'Instant UPI' },
      { name: 'Karan Mehra', type: 'bank' as const, acc: '501008891234', ifsc: 'HDFC0004589', bank: 'HDFC Bank' },
      { name: 'Siddharth Roy', type: 'bank' as const, acc: '309812458912', ifsc: 'SBIN0001094', bank: 'State Bank of India (SBI)' },
    ];
    const picked = samplePlayers[Math.floor(Math.random() * samplePlayers.length)];
    const amounts = [100.00, 150.00, 200.00, 500.00];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    const testRecord: WithdrawalRecord = {
      id: 'tx-' + Date.now().toString().slice(-6), amount, payoutType: picked.type, bankName: picked.bank, accountHolder: picked.name,
      accountNumber: picked.type === 'upi' ? picked.upi! : picked.acc!, upiId: picked.type === 'upi' ? picked.upi : undefined,
      ifscCode: picked.type === 'bank' ? picked.ifsc : undefined, routingCode: picked.type === 'upi' ? 'UPI-VPA' : picked.ifsc!,
      status: 'pending', createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      referenceId: 'WORM-' + (picked.type === 'upi' ? 'UPI-' : 'BNK-') + Math.random().toString(36).substring(2, 8).toUpperCase(),
    };
    setWithdrawals((prev) => [testRecord, ...prev]);
    sounds.playWin();
  };

  const handleSimulateReferralGame = () => {
    const friendEarning = 0.20;
    const bonusCommission = 0.05;
    setReferrals((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[0] = { ...updated[0], gamesPlayed: updated[0].gamesPlayed + 1, totalEarnedByRef: Number((updated[0].totalEarnedByRef + friendEarning).toFixed(2)), commissionPaid: Number((updated[0].commissionPaid + bonusCommission).toFixed(3)) };
      return updated;
    });
    setWallet((prev) => ({ ...prev, balance: Number((prev.balance + bonusCommission).toFixed(2)), totalEarned: Number((prev.totalEarned + bonusCommission).toFixed(2)), referralEarnings: Number((prev.referralEarnings + bonusCommission).toFixed(3)) }));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col antialiased selection:bg-sky-500/30">
      <TelegramHeader balance={wallet.balance} soundEnabled={soundEnabled} isAdminUnlocked={isAdminUnlocked} currentPhoneNumber={userPhoneNumber} pendingWithdrawalsCount={pendingWithdrawalsCount} onToggleSound={handleToggleSound} onOpenWallet={() => setActiveTab('wallet')} onOpenAdmin={() => isAdminUnlocked ? setActiveTab('admin') : setIsAdminLoginModalOpen(true)} onTriggerAdminLogin={() => isAdminUnlocked ? setActiveTab('admin') : setIsAdminLoginModalOpen(true)} />
      <main className="flex-1 w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <motion.div key="home" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.18 }}><HomeScreen wallet={wallet} isAdminUnlocked={isAdminUnlocked} pendingWithdrawalsCount={pendingWithdrawalsCount} onPlayClick={handleInitiatePlay} onOpenWallet={() => setActiveTab('wallet')} onOpenReferral={() => setActiveTab('referral')} onOpenGuide={() => setIsGuideModalOpen(true)} onOpenAdmin={() => isAdminUnlocked ? setActiveTab('admin') : setIsAdminLoginModalOpen(true)} /></motion.div>}
          {activeTab === 'game' && <motion.div key="game" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.18 }}><GameScreen onGameComplete={handleGameComplete} onRequireAdForNextMatch={handleInitiatePlay} onBackToHome={() => setActiveTab('home')} onOpenWallet={() => setActiveTab('wallet')} /></motion.div>}
          {activeTab === 'wallet' && <motion.div key="wallet" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}><WalletScreen wallet={wallet} withdrawals={withdrawals} onWithdraw={handleWithdraw} onOpenReferral={() => setActiveTab('referral')} onBackToHome={() => setActiveTab('home')} /></motion.div>}
          {activeTab === 'referral' && <motion.div key="referral" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}><ReferralScreen referralCode={referralCode} referrals={referrals} totalReferralCommission={wallet.referralEarnings} onSimulateReferralGame={handleSimulateReferralGame} onBackToHome={() => setActiveTab('home')} /></motion.div>}
          {activeTab === 'admin' && isAdminUnlocked && <motion.div key="admin" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.18 }}><AdminPortal withdrawals={withdrawals} onUpdateWithdrawalStatus={handleUpdateWithdrawalStatus} onRejectWithdrawal={handleRejectWithdrawal} onCreateTestWithdrawal={handleCreateTestWithdrawal} onBackToHome={() => setActiveTab('home')} onLockAdmin={() => { setIsAdminUnlocked(false); setUserPhoneNumber(''); localStorage.removeItem('worm_admin_session'); localStorage.removeItem('worm_user_phone'); setActiveTab('home'); sounds.playClick(); }} /></motion.div>}
        </AnimatePresence>
      </main>
      <AdModal isOpen={isAdModalOpen} onAdComplete={handleAdComplete} onClose={() => setIsAdModalOpen(false)} />
      <GuideModal isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} />
      <AdminLoginModal isOpen={isAdminLoginModalOpen} onClose={() => setIsAdminLoginModalOpen(false)} onSuccess={() => { setIsAdminUnlocked(true); setIsAdminLoginModalOpen(false); setActiveTab('admin'); }} />
      <Navigation activeTab={activeTab} isAdminUnlocked={isAdminUnlocked} pendingWithdrawalsCount={pendingWithdrawalsCount} onTabChange={(tab) => { if (tab === 'admin' && !isAdminUnlocked) { setIsAdminLoginModalOpen(true); return; } setActiveTab(tab); }} onPlayClick={handleInitiatePlay} />
    </div>
  );
}
