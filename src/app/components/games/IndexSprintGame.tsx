"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiCheck, FiPlay, FiRotateCcw } from "react-icons/fi";
import Leaderboard from "./Leaderboard";

interface MathChallenge {
  prompt: string;
  answer: number;
  options: number[];
}

interface IndexSprintGameProps {
  gameId?: string;
  compact?: boolean;
}

const ROUND_SECONDS = 30;
const NAME_STORAGE_KEY = "portfolio_game_player_name";

function generateChallenge(streak: number): MathChallenge {
  const maxNum = Math.min(45, 12 + streak * 3);
  const a = Math.floor(Math.random() * maxNum) + 2;
  const b = Math.floor(Math.random() * Math.min(20, maxNum)) + 2;
  const mode = Math.random();

  let prompt = "";
  let answer = 0;

  if (mode < 0.4) {
    prompt = `${a} + ${b}`;
    answer = a + b;
  } else if (mode < 0.75) {
    const hi = Math.max(a, b);
    const lo = Math.min(a, b);
    prompt = `${hi} - ${lo}`;
    answer = hi - lo;
  } else {
    const x = Math.floor(Math.random() * 11) + 2;
    const y = Math.floor(Math.random() * 11) + 2;
    prompt = `${x} × ${y}`;
    answer = x * y;
  }

  const optionSet = new Set<number>([answer]);
  while (optionSet.size < 4) {
    const delta = Math.floor(Math.random() * 7) + 1;
    const candidate = Math.random() < 0.5 ? answer + delta : answer - delta;
    if (candidate >= 0) optionSet.add(candidate);
  }

  const options = Array.from(optionSet).sort(() => Math.random() - 0.5);
  return { prompt, answer, options };
}

export default function IndexSprintGame({
  gameId = "index-sprint",
  compact = false,
}: IndexSprintGameProps) {
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">(
    "idle"
  );
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [challenge, setChallenge] = useState<MathChallenge>(() =>
    generateChallenge(0)
  );
  const [pulse, setPulse] = useState<"ok" | "bad" | null>(null);

  const [playerName, setPlayerName] = useState("");
  const [submittingScore, setSubmittingScore] = useState(false);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [leaderboardTick, setLeaderboardTick] = useState(0);

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const streakRef = useRef(0);
  const scoreRef = useRef(0);

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

  const startGame = () => {
    streakRef.current = 0;
    scoreRef.current = 0;
    setStreak(0);
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setPulse(null);
    setSubmittedScore(null);
    setSubmitError(null);
    setChallenge(generateChallenge(0));
    setGameState("playing");
  };

  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState("gameover");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const handleAnswer = useCallback(
    (choice: number) => {
      if (gameState !== "playing") return;

      if (choice === challenge.answer) {
        const nextStreak = streakRef.current + 1;
        const gained = 10 + Math.min(15, (nextStreak - 1) * 2);
        const nextScore = scoreRef.current + gained;

        streakRef.current = nextStreak;
        scoreRef.current = nextScore;
        setStreak(nextStreak);
        setScore(nextScore);
        setPulse("ok");

        setBestScore((prev) => {
          const updated = Math.max(prev, nextScore);
          try {
            localStorage.setItem(`best_${gameId}`, String(updated));
          } catch {
            // Ignore storage errors
          }
          return updated;
        });

        setChallenge(generateChallenge(nextStreak));
      } else {
        streakRef.current = 0;
        setStreak(0);
        setPulse("bad");
        setChallenge(generateChallenge(0));
      }

      setTimeout(() => setPulse(null), 160);
    },
    [challenge.answer, gameId, gameState]
  );

  useEffect(() => {
    if (gameState !== "playing") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      const idx = ["1", "2", "3", "4"].indexOf(e.key);
      if (idx !== -1 && challenge.options[idx] !== undefined) {
        handleAnswer(challenge.options[idx]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [challenge.options, gameState, handleAnswer]);

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

  const arenaHeightClass = compact
    ? "h-80 sm:h-96"
    : "h-96 sm:h-[26rem] lg:h-[29rem]";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start select-none">
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        <div className="grid grid-cols-4 border border-zinc-800 rounded-xl bg-[#111114] divide-x divide-zinc-800 text-xs font-mono">
          <div className="px-3.5 py-3">
            <span className="text-zinc-500 block text-[10px]">SCORE</span>
            <span className="text-white font-semibold text-base tabular-nums">
              {score}
            </span>
          </div>
          <div className="px-3.5 py-3">
            <span className="text-zinc-500 block text-[10px]">BEST</span>
            <span className="text-emerald-400 font-semibold text-base tabular-nums">
              {bestScore}
            </span>
          </div>
          <div className="px-3.5 py-3">
            <span className="text-zinc-500 block text-[10px]">STREAK</span>
            <span className="text-amber-300 font-semibold text-base tabular-nums">
              {streak}x
            </span>
          </div>
          <div className="px-3.5 py-3">
            <span className="text-zinc-500 block text-[10px]">TIME</span>
            <span
              className={`font-semibold text-base tabular-nums ${
                timeLeft <= 5 ? "text-rose-400" : "text-zinc-200"
              }`}
            >
              {timeLeft}s
            </span>
          </div>
        </div>

        <div
          className={`relative w-full rounded-xl border ${
            pulse === "ok"
              ? "border-emerald-500/60"
              : pulse === "bad"
                ? "border-rose-500/60"
                : "border-zinc-800"
          } bg-[#111114] p-6 flex flex-col items-center justify-center transition-colors duration-150 ${arenaHeightClass}`}
        >
          {gameState === "playing" ? (
            <div className="w-full max-w-md space-y-6 text-center">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-zinc-500">
                  KEYS 1–4 OR CLICK
                </span>
                <p className="text-3xl sm:text-4xl font-semibold text-white font-mono tabular-nums">
                  {challenge.prompt}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {challenge.options.map((opt, idx) => (
                  <button
                    key={`${opt}-${idx}`}
                    type="button"
                    onClick={() => handleAnswer(opt)}
                    className="py-3.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-sm font-mono font-semibold text-white tabular-nums flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="text-[10px] text-zinc-500">{idx + 1}</span>
                    <span>{opt}</span>
                    <span className="w-3" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950/90 p-6 text-center space-y-4 shadow-2xl">
              {gameState === "gameover" ? (
                <>
                  <span className="inline-block text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded border border-emerald-800/60 bg-emerald-950/40 text-emerald-300">
                    Sprint Complete
                  </span>
                  <p className="text-2xl font-semibold text-white font-mono tabular-nums">
                    {score} pts
                  </p>
                  <button
                    type="button"
                    onClick={startGame}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition cursor-pointer"
                  >
                    <FiRotateCcw className="w-3.5 h-3.5" />
                    <span>Play again</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <p className="text-base font-semibold text-white">
                      Index Sprint
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Solve as many expressions as you can in{" "}
                      <span className="font-mono text-zinc-200">30s</span>.
                      Consecutive answers boost your streak bonus.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startGame}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition cursor-pointer"
                  >
                    <FiPlay className="w-3.5 h-3.5" />
                    <span>Start sprint</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <aside className="lg:col-span-5 xl:col-span-4 space-y-4">
        <div className="border border-zinc-800 rounded-xl bg-[#111114] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-zinc-200">
              Submit Score
            </span>
            <span className="text-xs font-mono text-emerald-400 tabular-nums">
              Current: {score} pts
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
                placeholder="Enter your name"
                className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={
                  submittingScore ||
                  gameState !== "gameover" ||
                  score <= 0 ||
                  submittedScore === score
                }
                className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-semibold text-xs font-mono transition shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {submittingScore ? "Saving..." : "Save"}
              </button>
            </div>

            {submittedScore === score && score > 0 && (
              <p className="text-[11px] font-mono text-emerald-400 inline-flex items-center gap-1.5">
                <FiCheck className="w-3.5 h-3.5" />
                <span>
                  Saved {score} pts for {playerName.trim()}
                </span>
              </p>
            )}

            {submitError && (
              <p className="text-[11px] font-mono text-rose-400">
                {submitError}
              </p>
            )}

            {gameState !== "gameover" && submittedScore !== score && (
              <p className="text-[11px] font-mono text-zinc-500">
                Finish the sprint with points to save.
              </p>
            )}
          </form>
        </div>

        <Leaderboard
          gameId={gameId}
          limit={10}
          refreshTrigger={leaderboardTick}
          title="Top Scores"
          unitLabel="pts"
        />
      </aside>
    </div>
  );
}