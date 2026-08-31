import { CellValue, AIDifficulty } from '../types';

export const WINNING_COMBOS = [
  [0, 1, 2], // Row 0
  [3, 4, 5], // Row 1
  [6, 7, 8], // Row 2
  [0, 3, 6], // Col 0
  [1, 4, 7], // Col 1
  [2, 5, 8], // Col 2
  [0, 4, 8], // Diagonal top-left to bot-right
  [2, 4, 6], // Diagonal top-right to bot-left
];

export function checkWinner(board: CellValue[]): {
  winner: 'X' | 'O' | 'draw' | null;
  line: number[] | null;
} {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }

  if (board.every((cell) => cell !== null)) {
    return { winner: 'draw', line: null };
  }

  return { winner: null, line: null };
}

export function getAvailableMoves(board: CellValue[]): number[] {
  const moves: number[] = [];
  board.forEach((cell, idx) => {
    if (cell === null) moves.push(idx);
  });
  return moves;
}

// Minimax algorithm for smart AI
function minimax(
  board: CellValue[],
  depth: number,
  isMaximizing: boolean,
  aiSymbol: 'O',
  humanSymbol: 'X'
): { score: number; bestMove?: number } {
  const { winner } = checkWinner(board);

  if (winner === aiSymbol) return { score: 10 - depth };
  if (winner === humanSymbol) return { score: depth - 10 };
  if (winner === 'draw') return { score: 0 };

  const available = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestMove = available[0];

    for (const move of available) {
      board[move] = aiSymbol;
      const result = minimax(board, depth + 1, false, aiSymbol, humanSymbol);
      board[move] = null;

      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    }
    return { score: bestScore, bestMove };
  } else {
    let bestScore = Infinity;
    let bestMove = available[0];

    for (const move of available) {
      board[move] = humanSymbol;
      const result = minimax(board, depth + 1, true, aiSymbol, humanSymbol);
      board[move] = null;

      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    }
    return { score: bestScore, bestMove };
  }
}

export function getAIMove(
  board: CellValue[],
  difficulty: AIDifficulty,
  aiSymbol: 'O' = 'O',
  humanSymbol: 'X' = 'X'
): number {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;

  // Easy: Mostly random (80% random, 20% block)
  if (difficulty === 'easy') {
    if (Math.random() < 0.2) {
      // Check if can block instant win
      for (const move of available) {
        board[move] = humanSymbol;
        if (checkWinner(board).winner === humanSymbol) {
          board[move] = null;
          return move;
        }
        board[move] = null;
      }
    }
    return available[Math.floor(Math.random() * available.length)];
  }

  // Medium: Heuristic / 50% minimax, 50% tactical
  if (difficulty === 'medium') {
    // 1. Can AI win immediately?
    for (const move of available) {
      board[move] = aiSymbol;
      if (checkWinner(board).winner === aiSymbol) {
        board[move] = null;
        return move;
      }
      board[move] = null;
    }

    // 2. Can AI block player win?
    for (const move of available) {
      board[move] = humanSymbol;
      if (checkWinner(board).winner === humanSymbol) {
        board[move] = null;
        return move;
      }
      board[move] = null;
    }

    // 3. Take center if available (50% chance)
    if (board[4] === null && Math.random() > 0.3) {
      return 4;
    }

    // 4. Random available
    return available[Math.floor(Math.random() * available.length)];
  }

  // Hard: Perfect Minimax with slight randomness if depth=0 on first move for variety
  if (difficulty === 'hard') {
    // First move optimization
    if (available.length === 9) {
      const preferred = [0, 2, 4, 6, 8];
      return preferred[Math.floor(Math.random() * preferred.length)];
    }
    const result = minimax(board, 0, true, aiSymbol, humanSymbol);
    return result.bestMove ?? available[0];
  }

  return available[0];
}
