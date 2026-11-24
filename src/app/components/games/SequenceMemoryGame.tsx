"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiCheck, FiPlay, FiRotateCcw } from "react-icons/fi";
import Leaderboard from "./Leaderboard";

interface SequenceMemoryGameProps {
  gameId?: string;
  compact?: boolean;
}

const GRID_SIZE = 9; // 3x3
const NAME_STORAGE_KEY = "portfolio_game_player_name";

export default function SequenceMemoryGame({
  gameId = "sequence-memory",
  compact = false,
}: SequenceMemoryGameProps) {
  const [phase, setPhase] = useState<
    "idle" | "showing" | "input" | "gameover"
  >("idle");
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [errorCell, setErrorCell] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const [playerName, setPlayerName] = useState("");
  const [submittingScore, setSubmittingScore] = useState(false);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [leaderboardTick, setLeaderboardTick] = useState(0);

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

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

  const playSequence = useCallback(
    (seq: number[]) => {
      clearAllTimers();
      setPhase("showing");
      setUserStep(0);
      setActiveCell(null);

      seq.forEach((cellIndex, idx) => {
        const onDelay = 350 + idx * 560;
        const offDelay = onDelay + 340;

        const t1 = setTimeout(() => {
          setActiveCell(cellIndex);
        }, onDelay);

        const t2 = setTimeout(() => {
          setActiveCell((curr) => (curr === cellIndex ? null : curr));
          if (idx === seq.length - 1) {
            setPhase("input");
          }
        }, offDelay);

        timersRef.current.push(t1, t2);
      });
    },
    [clearAllTimers]
  );

  const startNewRun = () => {
    clearAllTimers();
    const first = Math.floor(Math.random() * GRID_SIZE);
    const initialSeq = [first];
    setSequence(initialSeq);
    setRound(1);
    setScore(0);
    setErrorCell(null);
    setSubmittedScore(null);
    setSubmitError(null);
    playSequence(initialSeq);
  };

  const handleCellClick = (index: number) => {
    if (phase !== "input") return;

    const expected = sequence[userStep];
    if (index === expected) {
      setActiveCell(index);
      const resetTimer = setTimeout(() => {
        setActiveCell((curr) => (curr === index ? null : curr));
      }, 150);
      timersRef.current.push(resetTimer);

      const nextStep = userStep + 1;
      if (nextStep === sequence.length) {
        const roundPoints = round * 15;
        const nextScore = score + roundPoints;
        setScore(nextScore);
        setBestScore((prev) => {
          const updated = Math.max(prev, nextScore);
          try {
            localStorage.setItem(`best_${gameId}`, String(updated));
          } catch {
            // Ignore storage errors
          }
          return updated;
        });

        const nextRound = round + 1;
        const nextSeq = [
          ...sequence,
          Math.floor(Math.random() * GRID_SIZE),
        ];
        setRound(nextRound);
        setSequence(nextSeq);
        setUserStep(0);

        const nextPlayTimer = setTimeout(() => {
          playSequence(nextSeq);
        }, 500);
        timersRef.current.push(nextPlayTimer);
      } else {
        setUserStep(nextStep);
      }
    } else {
      clearAllTimers();
      setErrorCell(index);
      setActiveCell(null);
      setPhase("gameover");
    }
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
        body: JSON.stringify({ gameId, playerName: trimmed, score }),
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

  const statusText =
    phase === "showing"
      ? "Watch pattern..."
      : phase === "input"
        ? `Repeat sequence (${userStep}/${sequence.length})`
        : phase === "gameover"
          ? "Sequence mismatch"
          : "Ready";

  const arenaHeightClass = compact
    ? "h-80 sm:h-96"
    : "h-96 sm:h-[26rem] lg:h-[29rem]";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start select-none">
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        <div className="grid grid-cols-4 border border-zinc-800 rounded-md bg-[#111114] divide-x divide-zinc-800 text-xs font-mono">
          <div className="px-3.5 py-2.5">
            <span className="text-zinc-500 block text-[10px]">SCORE</span>
            <span className="text-zinc-100 font-semibold text-sm tabular-nums">
              {score}
            </span>
          </div>
          <div className="px-3.5 py-2.5">
            <span className="text-zinc-500 block text-[10px]">BEST</span>
            <span className="text-emerald-400 font-semibold text-sm tabular-nums">
              {bestScore}
            </span>
          </div>
          <div className="px-3.5 py-2.5">
            <span className="text-zinc-500 block text-[10px]">ROUND</span>
            <span className="text-zinc-200 font-semibold text-sm tabular-nums">
              {round || 0}
            </span>
          </div>
          <div className="px-3.5 py-2.5">
            <span className="text-zinc-500 block text-[10px]">STATE</span>
            <span className="text-zinc-300 font-medium text-xs truncate block mt-0.5">
              {statusText}
            </span>
          </div>
        </div>

        <div
          className={`relative w-full rounded-md border border-zinc-800 bg-[#111114] p-5 flex flex-col items-center justify-center ${arenaHeightClass}`}
        >
          <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] aspect-square">
            {Array.from({ length: GRID_SIZE }).map((_, idx) => {
              const isLit = activeCell === idx;
              const isErr = errorCell === idx;
              const canClick = phase === "input";

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!canClick}
                  onClick={() => handleCellClick(idx)}
                  className={`rounded-md border font-mono text-xs transition-colors flex items-center justify-center ${
                    isErr
                      ? "bg-rose-950/80 border-rose-500 text-rose-300"
                      : isLit
                        ? "bg-emerald-500/25 border-emerald-400 text-emerald-300"
                        : "bg-zinc-950 border-zinc-800 text-zinc-600"
                  } ${
                    canClick
                      ? "hover:border-zinc-600 cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  0{idx + 1}
                </button>
              );
            })}
          </div>

          {(phase === "idle" || phase === "gameover") && (
            <div className="absolute inset-0 bg-zinc-950/85 flex items-center justify-center p-5">
              <div className="w-full max-w-xs rounded-md border border-zinc-800 bg-[#111114] p-5 text-center space-y-3.5">
                {phase === "gameover" ? (
                  <>
                    <p className="text-xs font-mono text-rose-400">
                      Run ended · Round {round}
                    </p>
                    <p className="text-xl font-semibold text-white font-mono tabular-nums">
                      {score} pts
                    </p>
                    <button
                      type="button"
                      onClick={startNewRun}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs font-mono transition cursor-pointer"
                    >
                      <FiRotateCcw className="w-3.5 h-3.5" />
                      <span>Play again</span>
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-white">
                      Sequence Memory
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Watch the highlighted nodes, then click them in the same
                      order. Each cleared round increases the sequence by 1.
                    </p>
                    <button
                      type="button"
                      onClick={startNewRun}
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
                  phase !== "gameover" ||
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
          title="Sequence Memory — Scores"
          unitLabel="pts"
        />
      </aside>
    </div>
  );
}