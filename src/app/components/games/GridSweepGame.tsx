"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiCheck, FiPlay, FiRotateCcw } from "react-icons/fi";
import Leaderboard from "./Leaderboard";
import { startGameSession } from "@/lib/gameSessionClient";

interface GridSweepGameProps {
  gameId?: string;
  compact?: boolean;
}

interface CellData {
  row: number;
  col: number;
  hasFault: boolean;
  adjacentFaults: number;
  revealed: boolean;
  flagged: boolean;
}

const SIZE = 6;
const FAULT_COUNT = 6;
const NAME_STORAGE_KEY = "portfolio_game_player_name";

function createBoard(safeRow: number, safeCol: number): CellData[][] {
  const board: CellData[][] = Array.from({ length: SIZE }, (_, r) =>
    Array.from({ length: SIZE }, (_, c) => ({
      row: r,
      col: c,
      hasFault: false,
      adjacentFaults: 0,
      revealed: false,
      flagged: false,
    }))
  );

  let placed = 0;
  while (placed < FAULT_COUNT) {
    const r = Math.floor(Math.random() * SIZE);
    const c = Math.floor(Math.random() * SIZE);
    const nearStart =
      Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1;

    if (!board[r][c].hasFault && !nearStart) {
      board[r][c].hasFault = true;
      placed += 1;
    }
  }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c].hasFault) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
            if (board[nr][nc].hasFault) count += 1;
          }
        }
      }
      board[r][c].adjacentFaults = count;
    }
  }

  return board;
}

function revealFlood(
  grid: CellData[][],
  startR: number,
  startC: number
): number {
  const stack: [number, number][] = [[startR, startC]];
  let newlyRevealed = 0;

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    const cell = grid[r][c];
    if (cell.revealed || cell.flagged || cell.hasFault) continue;

    cell.revealed = true;
    newlyRevealed += 1;

    if (cell.adjacentFaults === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (
            nr >= 0 &&
            nr < SIZE &&
            nc >= 0 &&
            nc < SIZE &&
            !grid[nr][nc].revealed &&
            !grid[nr][nc].hasFault
          ) {
            stack.push([nr, nc]);
          }
        }
      }
    }
  }

  return newlyRevealed;
}

export default function GridSweepGame({
  gameId = "grid-sweep",
  compact = false,
}: GridSweepGameProps) {
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">(
    "idle"
  );
  const [board, setBoard] = useState<CellData[][]>(() => createBoard(-1, -1));
  const [initialized, setInitialized] = useState(false);
  const [clearedSafe, setClearedSafe] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const [playerName, setPlayerName] = useState("");
  const [submittingScore, setSubmittingScore] = useState(false);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [leaderboardTick, setLeaderboardTick] = useState(0);

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const totalSafeCells = SIZE * SIZE - FAULT_COUNT;
  const sessionTokenRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      const savedName = localStorage.getItem(NAME_STORAGE_KEY);
      if (savedName) setPlayerName(savedName);
      const savedBest = localStorage.getItem(`best_${gameId}`);
      if (savedBest) setBestScore(Number(savedBest) || 0);
    } catch {
      // Ignore storage errors
    }
  }, [gameId]);

  const startGame = async () => {
    setBoard(createBoard(-1, -1));
    setInitialized(false);
    setClearedSafe(0);
    setScore(0);
    setSubmittedScore(null);
    setSubmitError(null);
    setGameState("playing");
    sessionTokenRef.current = await startGameSession(gameId);
  };

  const updateScore = (nextPoints: number) => {
    setScore(nextPoints);
    setBestScore((prev) => {
      const updated = Math.max(prev, nextPoints);
      try {
        localStorage.setItem(`best_${gameId}`, String(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  };

  const handleReveal = (r: number, c: number) => {
    if (gameState !== "playing") return;

    let working = board.map((row) => row.map((cell) => ({ ...cell })));
    if (!initialized) {
      working = createBoard(r, c);
      setInitialized(true);
    }

    const target = working[r][c];
    if (target.revealed || target.flagged) return;

    if (target.hasFault) {
      for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
          if (working[i][j].hasFault) working[i][j].revealed = true;
        }
      }
      setBoard(working);
      setGameState("gameover");
      return;
    }

    const added = revealFlood(working, r, c);
    const nextCleared = clearedSafe + added;
    const nextScore = nextCleared * 10 + (nextCleared === totalSafeCells ? 50 : 0);

    setBoard(working);
    setClearedSafe(nextCleared);
    updateScore(nextScore);

    if (nextCleared === totalSafeCells) {
      setGameState("gameover");
    }
  };

  const handleToggleFlag = (
    e: React.MouseEvent<HTMLButtonElement>,
    r: number,
    c: number
  ) => {
    e.preventDefault();
    if (gameState !== "playing") return;
    const cell = board[r][c];
    if (cell.revealed) return;

    const working = board.map((row, ri) =>
      row.map((item, ci) =>
        ri === r && ci === c ? { ...item, flagged: !item.flagged } : item
      )
    );
    setBoard(working);
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = playerName.trim();
    if (!trimmed) {
      setSubmitError("Enter your name first.");
      nameInputRef.current?.focus();
      return;
    }
    if (score <= 0 || submittedScore === score) return;

    try {
      setSubmittingScore(true);
      setSubmitError(null);

      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, playerName: trimmed, score, sessionToken: sessionTokenRef.current, }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Could not save score.");
      }

      try {
        localStorage.setItem(NAME_STORAGE_KEY, trimmed);
      } catch {
        // Ignore storage errors
      }

      setSubmittedScore(score);
      setLeaderboardTick((n) => n + 1);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to save score.");
    } finally {
      setSubmittingScore(false);
    }
  };

  const arenaHeightClass = compact
    ? "h-80 sm:h-96"
    : "h-96 sm:h-[26rem] lg:h-[29rem]";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start select-none">
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        <div className="grid grid-cols-3 border border-zinc-800 rounded-md bg-[#111114] divide-x divide-zinc-800 text-xs font-mono">
          <div className="px-4 py-2.5">
            <span className="text-zinc-500 block text-[10px]">SCORE</span>
            <span className="text-zinc-100 font-semibold text-sm tabular-nums">
              {score}
            </span>
          </div>
          <div className="px-4 py-2.5">
            <span className="text-zinc-500 block text-[10px]">BEST</span>
            <span className="text-emerald-400 font-semibold text-sm tabular-nums">
              {bestScore}
            </span>
          </div>
          <div className="px-4 py-2.5">
            <span className="text-zinc-500 block text-[10px]">CLEARED</span>
            <span className="text-zinc-200 font-semibold text-sm tabular-nums">
              {clearedSafe}/{totalSafeCells}
            </span>
          </div>
        </div>

        <div
          className={`relative w-full rounded-md border border-zinc-800 bg-[#111114] p-4 flex flex-col items-center justify-center ${arenaHeightClass}`}
        >
          <div className="grid grid-cols-6 gap-1.5 w-full max-w-[310px] aspect-square">
            {board.flatMap((row, r) =>
              row.map((cell, c) => {
                let content = "";
                let cellStyle =
                  "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400";

                if (cell.revealed) {
                  if (cell.hasFault) {
                    content = "ERR";
                    cellStyle =
                      "bg-rose-950/80 border-rose-500/70 text-rose-300";
                  } else {
                    content =
                      cell.adjacentFaults > 0
                        ? String(cell.adjacentFaults)
                        : "·";
                    cellStyle =
                      "bg-zinc-950 border-zinc-800/70 text-emerald-400";
                  }
                } else if (cell.flagged) {
                  content = "F";
                  cellStyle =
                    "bg-zinc-900 border-amber-500/50 text-amber-300";
                }

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={gameState !== "playing"}
                    onClick={() => handleReveal(r, c)}
                    onContextMenu={(e) => handleToggleFlag(e, r, c)}
                    className={`rounded border font-mono text-xs font-medium transition-colors flex items-center justify-center tabular-nums cursor-pointer disabled:cursor-default ${cellStyle}`}
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>

          <p className="text-[11px] font-mono text-zinc-500 mt-3">
            Left-click to scan · Right-click to flag
          </p>

          {(phaseIsIdleOrOver(gameState)) && (
            <div className="absolute inset-0 bg-zinc-950/85 flex items-center justify-center p-5">
              <div className="w-full max-w-xs rounded-md border border-zinc-800 bg-[#111114] p-5 text-center space-y-3.5">
                {gameState === "gameover" ? (
                  <>
                    <p className="text-xs font-mono text-zinc-400">
                      {clearedSafe === totalSafeCells
                        ? "All safe sectors cleared"
                        : "Fault sector triggered"}
                    </p>
                    <p className="text-xl font-semibold text-white font-mono tabular-nums">
                      {score} pts
                    </p>
                    <button
                      type="button"
                      onClick={startGame}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs font-mono transition cursor-pointer"
                    >
                      <FiRotateCcw className="w-3.5 h-3.5" />
                      <span>Play again</span>
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-white">Grid Sweep</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Reveal safe cells using adjacent fault counts and avoid{" "}
                      <span className="font-mono text-rose-400">ERR</span>{" "}
                      sectors.
                    </p>
                    <button
                      type="button"
                      onClick={startGame}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs font-mono transition cursor-pointer"
                    >
                      <FiPlay className="w-3.5 h-3.5" />
                      <span>Start</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="lg:col-span-5 xl:col-span-4 space-y-4">
        <div className="border border-zinc-800 rounded-md bg-[#111114] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-300">Save Score</span>
            <span className="text-xs font-mono text-emerald-400 tabular-nums">
              {score} pts
            </span>
          </div>

          <form onSubmit={handleScoreSubmit} className="space-y-2.5">
            <div className="flex items-center gap-2">
              <input
                ref={nameInputRef}
                type="text"
                maxLength={24}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name"
                className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-md px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={
                  submittingScore ||
                  gameState !== "gameover" ||
                  score <= 0 ||
                  submittedScore === score
                }
                className="px-3 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-semibold text-xs font-mono transition shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {submittingScore ? "Saving..." : "Save"}
              </button>
            </div>

            {submittedScore === score && score > 0 && (
              <p className="text-[11px] font-mono text-emerald-400 inline-flex items-center gap-1.5">
                <FiCheck className="w-3.5 h-3.5" />
                <span>Saved</span>
              </p>
            )}

            {submitError && (
              <p className="text-[11px] font-mono text-rose-400">
                {submitError}
              </p>
            )}
          </form>
        </div>

        <Leaderboard
          gameId={gameId}
          limit={10}
          refreshTrigger={leaderboardTick}
          title="Grid Sweep — Scores"
          unitLabel="pts"
        />
      </aside>
    </div>
  );
}

function phaseIsIdleOrOver(state: "idle" | "playing" | "gameover") {
  return state === "idle" || state === "gameover";
}