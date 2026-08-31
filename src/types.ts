export type CellValue = 'X' | 'O' | null;

export type GameMode = 'ai' | 'pvp_local' | 'pvp_online';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type GameResult = 'win' | 'loss' | 'draw' | null;

export interface Player {
  id: string;
  name: string;
  avatar: string;
  symbol: 'X' | 'O';
  isAi?: boolean;
  rating?: number;
  country?: string;
}

export interface GameState {
  board: CellValue[];
  isXNext: boolean;
  winner: 'X' | 'O' | 'draw' | null;
  winningLine: number[] | null;
  mode: GameMode;
  difficulty: AIDifficulty;
  opponent: Player;
  userPlayer: Player;
  movesCount: number;
}

export interface UserWallet {
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  referralEarnings: number;
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
}

export interface WithdrawalRecord {
  id: string;
  amount: number;
  payoutType?: 'upi' | 'bank';
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  routingCode: string;
  upiId?: string;
  ifscCode?: string;
  status: 'completed' | 'processing' | 'pending';
  createdAt: string;
  paidAt?: string;
  referenceId: string;
  utrNumber?: string;
  adminNote?: string;
}

export interface ReferralUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  joinedDate: string;
  gamesPlayed: number;
  totalEarnedByRef: number;
  commissionPaid: number;
  status: 'active' | 'online';
}

export interface AdCreative {
  id: string;
  title: string;
  sponsor: string;
  tagline: string;
  description: string;
  category: string;
  rewardText: string;
  bannerGradient: string;
  badge: string;
  ctaText: string;
  iconType: 'crypto' | 'game' | 'telegram' | 'finance';
}

export type ActiveTab = 'home' | 'game' | 'wallet' | 'referral' | 'admin' | 'guide';
