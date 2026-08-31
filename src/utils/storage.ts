import { UserWallet, WithdrawalRecord, ReferralUser, AdCreative } from '../types';

const WALLET_KEY = 'worm_inr_wallet_v1';
const WITHDRAWALS_KEY = 'worm_inr_withdrawals_v1';
const REFERRALS_KEY = 'worm_inr_referrals_v1';
const REF_CODE_KEY = 'worm_inr_ref_code_v1';

export const INITIAL_WALLET: UserWallet = {
  balance: 120.00,
  totalEarned: 120.00,
  totalWithdrawn: 50.00,
  referralEarnings: 20.00,
  totalGames: 4,
  wins: 2,
  draws: 1,
  losses: 1,
};

export const INITIAL_WITHDRAWALS: WithdrawalRecord[] = [
  {
    id: 'tx-1003', amount: 150.00, payoutType: 'upi', bankName: 'Instant UPI Transfer',
    accountHolder: 'Rohit Verma', accountNumber: 'rohitverma@okhdfcbank', upiId: 'rohitverma@okhdfcbank',
    routingCode: 'UPI-VPA', status: 'pending', createdAt: '2026-08-31 09:15', referenceId: 'WORM-UPI-481902',
  },
  {
    id: 'tx-1001', amount: 100.00, payoutType: 'bank', bankName: 'HDFC Bank',
    accountHolder: 'Aryan Sharma', accountNumber: '501004218849', routingCode: 'HDFC0001234', ifscCode: 'HDFC0001234',
    status: 'completed', createdAt: '2026-08-28 14:23', paidAt: '2026-08-28 14:28', utrNumber: 'UTR482910384912', referenceId: 'WORM-INR-984211',
  },
  {
    id: 'tx-1002', amount: 100.00, payoutType: 'upi', bankName: 'Instant UPI Transfer',
    accountHolder: 'Priya Patel', accountNumber: 'priya.win@paytm', upiId: 'priya.win@paytm', routingCode: 'UPI-VPA',
    status: 'completed', createdAt: '2026-08-20 09:45', paidAt: '2026-08-20 09:50', utrNumber: 'UPI492019385011', referenceId: 'WORM-INR-741299',
  }
];

export const INITIAL_REFERRALS: ReferralUser[] = [
  { id: 'ref-1', name: 'Rohit Verma', username: '@rohit_gamer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', joinedDate: '2 days ago', gamesPlayed: 42, totalEarnedByRef: 840.00, commissionPaid: 0.840, status: 'online' },
  { id: 'ref-2', name: 'Priya Patel', username: '@priya_win', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', joinedDate: '4 days ago', gamesPlayed: 65, totalEarnedByRef: 1300.00, commissionPaid: 1.300, status: 'active' },
  { id: 'ref-3', name: 'Ankit Kumar', username: '@ankit_pro', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', joinedDate: '1 week ago', gamesPlayed: 18, totalEarnedByRef: 360.00, commissionPaid: 0.360, status: 'active' }
];

export const AD_CREATIVES: AdCreative[] = [
  { id: 'ad-worm-arena', title: 'Worm Pro Tournament 2026', sponsor: 'Worm Gaming Arena', tagline: 'Compete in daily leaderboard battles & win ₹10,000 INR prize pools', description: 'Join the fastest growing Telegram gaming community with instant Bank & UPI payouts.', category: 'Featured Partner', rewardText: 'Unlock Worm Match', bannerGradient: 'from-blue-600 via-indigo-600 to-cyan-500', badge: 'SPONSORED', ctaText: 'Explore Worm Arena', iconType: 'game' },
  { id: 'ad-hamster-spin', title: 'UPI Fast Pay Bonus', sponsor: 'Instant Pay Network', tagline: 'Instant 0-Fee UPI & Bank Settlements 24/7', description: 'Transfer earnings instantly to any Indian Bank or UPI ID with verified gateway protection.', category: 'Top Sponsor', rewardText: 'Unlock Worm Match', bannerGradient: 'from-amber-600 via-orange-500 to-rose-600', badge: 'VERIFIED AD', ctaText: 'View UPI Deals', iconType: 'finance' },
  { id: 'ad-telegram-premium', title: 'Telegram Stars & VIP Club', sponsor: 'Direct Telegram Ads', tagline: 'Get exclusive badges, 4GB uploads & 10x faster speeds', description: 'Support bot developers and enhance your messaging experience with Telegram Stars.', category: 'Telegram Network', rewardText: 'Unlock Worm Match', bannerGradient: 'from-purple-600 via-violet-600 to-sky-500', badge: 'PROMOTED', ctaText: 'Get Stars VIP', iconType: 'telegram' },
  { id: 'ad-neobank-bonus', title: 'Digital Savings 7.5% APY', sponsor: 'Indian Fintech Bank', tagline: 'Zero-fee digital savings with instant virtual RuPay cards', description: 'Open your account in 2 minutes. Receive IMPS, NEFT & UPI transfers with zero hidden fees.', category: 'Fintech Sponsor', rewardText: 'Unlock Worm Match', bannerGradient: 'from-emerald-600 via-teal-600 to-cyan-600', badge: 'BANKING AD', ctaText: 'Open Free Account', iconType: 'finance' }
];

function isValidWallet(value: unknown): value is UserWallet {
  if (!value || typeof value !== 'object') return false;
  const w = value as Record<string, unknown>;
  return ['balance', 'totalEarned', 'totalWithdrawn', 'referralEarnings', 'totalGames', 'wins', 'draws', 'losses']
    .every((key) => typeof w[key] === 'number' && Number.isFinite(w[key] as number));
}

function isValidArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function getStoredWallet(): UserWallet {
  try {
    const data = localStorage.getItem(WALLET_KEY);
    if (data) {
      const parsed: unknown = JSON.parse(data);
      if (isValidWallet(parsed)) return parsed;
      localStorage.removeItem(WALLET_KEY);
    }
  } catch {
    // fallback
  }
  return { ...INITIAL_WALLET };
}

export function saveWallet(wallet: UserWallet): void {
  try {
    if (isValidWallet(wallet)) localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
  } catch {
    // ignore
  }
}

export function getStoredWithdrawals(): WithdrawalRecord[] {
  try {
    const data = localStorage.getItem(WITHDRAWALS_KEY);
    if (data) {
      const parsed: unknown = JSON.parse(data);
      if (isValidArray(parsed)) return parsed as WithdrawalRecord[];
      localStorage.removeItem(WITHDRAWALS_KEY);
    }
  } catch {
    // fallback
  }
  return [...INITIAL_WITHDRAWALS];
}

export function saveWithdrawals(records: WithdrawalRecord[]): void {
  try { localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(records)); } catch { /* ignore */ }
}

export function getStoredReferrals(): ReferralUser[] {
  try {
    const data = localStorage.getItem(REFERRALS_KEY);
    if (data) {
      const parsed: unknown = JSON.parse(data);
      if (isValidArray(parsed)) return parsed as ReferralUser[];
      localStorage.removeItem(REFERRALS_KEY);
    }
  } catch {
    // fallback
  }
  return [...INITIAL_REFERRALS];
}

export function saveReferrals(refs: ReferralUser[]): void {
  try { localStorage.setItem(REFERRALS_KEY, JSON.stringify(refs)); } catch { /* ignore */ }
}

export function getReferralCode(): string {
  try {
    let code = localStorage.getItem(REF_CODE_KEY);
    if (!code) {
      code = 'TIC_' + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem(REF_CODE_KEY, code);
    }
    return code;
  } catch {
    return 'TIC_EARN88';
  }
}
