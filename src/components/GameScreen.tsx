import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Bot,
  User,
  Users,
  RotateCcw,
  Sparkles,
  Award,
  ArrowLeft,
  Coins,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
  Globe
} from 'lucide-react';
import { CellValue, GameMode, AIDifficulty, Player } from '../types';
import { checkWinner, getAIMove, WINNING_COMBOS } from '../utils/tictactoe';
import { sounds } from '../utils/audio';

interface GameScreenProps {
  onGameComplete: (payout: { base: number; bonus: number; total: number; result: 'win' | 'draw' | 'loss' }) => void;
  onRequireAdForNextMatch: () => void;
  onBackToHome: () => void;
  onOpenWallet: () => void;
}

const REAL_PLAYERS: Player[] = [
  { id: 'p1', name: 'Rohit S. 🇮🇳', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', symbol: 'O', country: 'India', rating: 1420 },
  { id: 'p2', name: 'Priya M. 🇮🇳', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', symbol: 'O', country: 'India', rating: 1580 },
  { id: 'p3', name: 'Aarav P. 🇮🇳', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', symbol: 'O', country: 'India', rating: 1390 },
  { id: 'p4', name: 'Carlos S. 🇧🇷', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', symbol: 'O', country: 'Brazil', rating: 1490 }
];

export const GameScreen: React.FC<GameScreenProps> = ({
  onGameComplete,
  onRequireAdForNextMatch,
  onBackToHome,
  onOpenWallet,
}) => {
  // Game Setup States
  const [mode, setMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [isMatchmaking, setIsMatchmaking] = useState<boolean>(false);
  const [onlineOpponent, setOnlineOpponent] = useState<Player>(REAL_PLAYERS[0]);

  // Board State
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true); // User is X
  const [winner, setWinner] = useState<'X' | 'O' | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [payoutResult, setPayoutResult] = useState<{
    base: number;
    bonus: number;
    total: number;
    result: 'win' | 'draw' | 'loss';
  } | null>(null);

  // Initialize online opponent matchmaking
  const startMatchmaking = useCallback(() => {
    setIsMatchmaking(true);
    const randomOpponent = REAL_PLAYERS[Math.floor(Math.random() * REAL_PLAYERS.length)];
    const timeout = setTimeout(() => {
      setOnlineOpponent(randomOpponent);
      setIsMatchmaking(false);
      resetBoard();
    }, 1200);
    return () => clearTimeout(timeout);
  }, []);

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
    setIsAiThinking(false);
    setPayoutResult(null);
  };

  // Handle Game Over & calculate rewards in INR:
  // Base play: ₹10.00 for everyone
  // Win bonus: +₹10.00
  // Draw bonus: +₹50.00
  const handleGameOver = useCallback((winResult: 'X' | 'O' | 'draw') => {
    let result: 'win' | 'draw' | 'loss' = 'loss';
    let base = 10.00;
    let bonus = 0.00;

    if (winResult === 'X') {
      result = 'win';
      bonus = 10.00;
      sounds.playWin();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#10b981', '#6366f1', '#f59e0b'],
        });
      } catch {
        // ignore
      }
    } else if (winResult === 'draw') {
      result = 'draw';
      bonus = 50.00; // Draw bonus ₹50.00
      sounds.playDraw();
    } else {
      result = 'loss';
      bonus = 0.00;
      sounds.playDraw();
    }

    const total = base + bonus;
    const payout = { base, bonus, total, result };
    setPayoutResult(payout);
    sounds.playCoin();
    onGameComplete(payout);
  }, [onGameComplete]);

  // Check board state after every change
  useEffect(() => {
    if (winner !== null) return;

    const { winner: winCheck, line } = checkWinner(board);

    if (winCheck) {
      setWinner(winCheck);
      setWinningLine(line);
      handleGameOver(winCheck);
    } else if (!isXNext && mode === 'ai') {
      // AI's turn
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board, difficulty, 'O', 'X');
        if (aiMove !== -1) {
          setBoard((prev) => {
            const next = [...prev];
            next[aiMove] = 'O';
            return next;
          });
          sounds.playMove('O');
          setIsXNext(true);
        }
        setIsAiThinking(false);
      }, 500);

      return () => clearTimeout(timer);
    } else if (!isXNext && mode === 'pvp_online') {
      // Simulated real opponent turn
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        // Real player simulated move (tactical medium)
        const opponentMove = getAIMove(board, 'medium', 'O', 'X');
        if (opponentMove !== -1) {
          setBoard((prev) => {
            const next = [...prev];
            next[opponentMove] = 'O';
            return next;
          });
          sounds.playMove('O');
          setIsXNext(true);
        }
        setIsAiThinking(false);
      }, 700 + Math.random() * 500);

      return () => clearTimeout(timer);
    }
  }, [board, isXNext, mode, difficulty, winner, handleGameOver]);

  // Cell click handler
  const handleCellClick = (index: number) => {
    if (board[index] !== null || winner !== null || isAiThinking) return;

    sounds.playMove(isXNext ? 'X' : 'O');

    const nextBoard = [...board];
    nextBoard[index] = isXNext ? 'X' : 'O';
    setBoard(nextBoard);

    if (mode === 'pvp_local') {
      setIsXNext(!isXNext);
    } else {
      setIsXNext(false);
    }
  };

  const getOpponentDisplay = () => {
    if (mode === 'ai') {
      return {
        name: `AI Bot (${difficulty.toUpperCase()})`,
        avatar: null,
        isBot: true,
      };
    }
    if (mode === 'pvp_online') {
      return {
        name: onlineOpponent.name,
        avatar: onlineOpponent.avatar,
        isBot: false,
      };
    }
    return {
      name: 'Player 2 (Friend)',
      avatar: null,
      isBot: false,
    };
  };

  const opponentInfo = getOpponentDisplay();

  return (
    <div className="flex flex-col gap-4 pb-24 max-w-md mx-auto px-4 pt-2">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playClick();
            onBackToHome();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-[#0f172a] border border-slate-800 px-3 py-1.5 rounded-xl transition hover:border-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Lobby</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Coins className="w-3 h-3 text-emerald-400" />
            <span className="font-mono">Play = +$0.10</span>
          </span>
        </div>
      </div>

      {/* Game Mode Selector */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0f172a] border border-slate-800 rounded-2xl">
        <button
          onClick={() => {
            sounds.playClick();
            setMode('ai');
            resetBoard();
          }}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mode === 'ai'
              ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>vs AI</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setMode('pvp_online');
            startMatchmaking();
          }}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mode === 'pvp_online'
              ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>vs Online</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setMode('pvp_local');
            resetBoard();
          }}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mode === 'pvp_local'
              ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Pass & Play</span>
        </button>
      </div>

      {/* AI Difficulty Sub-selector if mode is AI */}
      {mode === 'ai' && (
        <div className="flex items-center justify-between px-2 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold">AI Difficulty:</span>
          <div className="flex items-center gap-1">
            {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  sounds.playClick();
                  setDifficulty(d);
                  resetBoard();
                }}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize transition ${
                  difficulty === d
                    ? 'bg-slate-800 text-sky-300 border border-sky-500/40'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Matchmaking Overlay if loading real player */}
      {isMatchmaking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 bg-[#0f172a] border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 text-center"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
            <Globe className="w-6 h-6 text-sky-400 absolute inset-0 m-auto" />
          </div>
          <div className="text-sm font-bold text-white">Searching for Real Player...</div>
          <div className="text-xs text-slate-400">Connecting via Telegram Game Engine</div>
        </motion.div>
      )}

      {/* Players Header Card */}
      {!isMatchmaking && (
        <div className="grid grid-cols-2 gap-3">
          {/* Player (You) */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              isXNext && !winner
                ? 'bg-gradient-to-br from-sky-950/50 via-[#0f172a] to-[#020617] border-sky-500/80 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/30'
                : 'bg-[#0f172a]/80 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center font-black text-sky-400 text-xs">
                X
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">You (Player)</div>
                <div className="text-[10px] text-sky-400 font-mono">
                  {isXNext && !winner ? 'Your Turn' : 'Waiting'}
                </div>
              </div>
            </div>
          </div>

          {/* Opponent */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              !isXNext && !winner
                ? 'bg-gradient-to-br from-indigo-950/50 via-[#0f172a] to-[#020617] border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                : 'bg-[#0f172a]/80 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {opponentInfo.avatar ? (
                <img
                  src={opponentInfo.avatar}
                  alt={opponentInfo.name}
                  className="w-8 h-8 rounded-xl object-cover border border-indigo-500/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center font-black text-indigo-400 text-xs">
                  O
                </div>
              )}
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{opponentInfo.name}</div>
                <div className="text-[10px] text-indigo-400 font-mono">
                  {!isXNext && !winner ? (isAiThinking ? 'Thinking...' : 'Turn') : 'Waiting'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main 3x3 Tic-Tac-Toe Board */}
      {!isMatchmaking && (
        <div className="relative p-4 bg-[#0f172a]/90 border border-slate-800 rounded-3xl shadow-2xl flex items-center justify-center">
          <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] aspect-square">
            {board.map((cell, idx) => {
              const isWinningCell = winningLine?.includes(idx);

              return (
                <motion.button
                  key={idx}
                  id={`cell-${idx}`}
                  whileTap={{ scale: cell === null && !winner ? 0.95 : 1 }}
                  onClick={() => handleCellClick(idx)}
                  disabled={cell !== null || winner !== null || isAiThinking}
                  className={`relative rounded-2xl flex items-center justify-center font-display font-black text-4xl transition-all select-none border ${
                    cell === null
                      ? 'bg-[#020617]/70 hover:bg-[#020617] border-slate-800/80 hover:border-sky-500/40 cursor-pointer shadow-inner'
                      : isWinningCell
                      ? cell === 'X'
                        ? 'bg-sky-500/30 border-sky-400 text-sky-300 shadow-xl shadow-sky-500/30 animate-pulse'
                        : 'bg-indigo-500/30 border-indigo-400 text-indigo-300 shadow-xl shadow-indigo-500/30 animate-pulse'
                      : cell === 'X'
                      ? 'bg-[#020617] border-sky-500/40 text-sky-400'
                      : 'bg-[#020617] border-indigo-500/40 text-indigo-400'
                  }`}
                >
                  <AnimatePresence>
                    {cell && (
                      <motion.span
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        {cell}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Result Payout Card */}
      <AnimatePresence>
        {payoutResult && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b1120] border border-slate-800 shadow-2xl flex flex-col gap-3.5 text-center"
          >
            <div className="flex flex-col items-center gap-1">
              {payoutResult.result === 'win' && (
                <div className="flex items-center gap-1.5 text-emerald-400 font-display font-black text-xl">
                  <Sparkles className="w-5 h-5" />
                  <span>VICTORY! YOU WON</span>
                </div>
              )}
              {payoutResult.result === 'draw' && (
                <div className="flex items-center gap-1.5 text-purple-400 font-display font-black text-xl">
                  <Zap className="w-5 h-5" />
                  <span>DRAW MATCH (+ ₹50.00 BONUS)</span>
                </div>
              )}
              {payoutResult.result === 'loss' && (
                <div className="flex items-center gap-1.5 text-slate-300 font-display font-bold text-lg">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <span>Match Completed</span>
                </div>
              )}
              <span className="text-xs text-slate-400">Earnings automatically credited to your INR wallet</span>
            </div>

            {/* Earnings Breakdown */}
            <div className="bg-[#020617]/80 rounded-xl p-3 border border-slate-800 text-xs space-y-1.5 text-left">
              <div className="flex justify-between text-slate-400">
                <span>Base Play Reward:</span>
                <span className="font-mono text-emerald-400 font-bold">+₹10.00</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>
                  {payoutResult.result === 'win'
                    ? 'Victory Bonus:'
                    : payoutResult.result === 'draw'
                    ? 'Draw Bonus:'
                    : 'Bonus (Loss):'}
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  +{payoutResult.bonus > 0 ? `₹${payoutResult.bonus.toFixed(2)}` : '₹0.00'}
                </span>
              </div>
              <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold text-white text-sm">
                <span>Total Added to Balance:</span>
                <span className="font-mono text-emerald-400 text-base font-black">
                  +₹{payoutResult.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                id="play-again-btn"
                onClick={() => {
                  sounds.playClick();
                  onRequireAdForNextMatch();
                }}
                className="py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black rounded-xl text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center gap-1.5 transition active:scale-95 border border-sky-400/30"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Next (+Watch Ad)</span>
              </button>

              <button
                id="view-wallet-after-game-btn"
                onClick={() => {
                  sounds.playClick();
                  onOpenWallet();
                }}
                className="py-3 bg-[#020617] hover:bg-slate-800 text-emerald-400 font-bold rounded-xl text-xs border border-emerald-500/30 flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Go to Wallet</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restart/Reset Board during active match if user wants */}
      {!winner && !isMatchmaking && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              sounds.playClick();
              resetBoard();
            }}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 py-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Current Board</span>
          </button>
        </div>
      )}
    </div>
  );
};
