"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiCheck, FiPlay, FiRotateCcw } from "react-icons/fi";
import Leaderboard from "./Leaderboard";

interface FallingItem {
  id: number;
  x: number;
  y: number;
  speed: number;
  kind: "packet" | "bug";
  label: string;
}

interface PacketRecoveryGameProps {
  gameId?: string;
  compact?: boolean;
}

const PACKET_LABELS = ["200 OK", "JSON", "TSX", "API", "GIT"];
const BUG_LABELS = ["404", "NaN", "ERR", "NULL"];
const NAME_STORAGE_KEY = "portfolio_game_player_name";

export default function PacketRecoveryGame({
  gameId = "packet-recovery",
  compact = false,
}: PacketRecoveryGameProps) {
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">(
    "idle"
  );
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [paddleX, setPaddleX] = useState(50);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [feedback, setFeedback] = useState<"catch" | "hit" | null>(null);

  // Score submission & leaderboard refresh
  const [playerName, setPlayerName] = useState("");
  const [submittingScore, setSubmittingScore] = useState(false);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [leaderboardTick, setLeaderboardTick] = useState(0);

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const paddleXRef = useRef(50);
  const keysPressedRef = useRef<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });
  const nextIdRef = useRef(1);
  const lastSpawnRef = useRef(0);
  const scoreRef = useRef(0);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerFeedback = useCallback((type: "catch" | "hit") => {
    setFeedback(type);
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
    }, 180);
  }, []);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

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

  const updatePaddle = useCallback((nextX: number) => {
    const clamped = Math.max(10, Math.min(90, nextX));
    paddleXRef.current = clamped;
    setPaddleX(clamped);
  }, []);

  const startGame = () => {
    scoreRef.current = 0;
    setScore(0);
    setLives(3);
    setItems([]);
    setFeedback(null);
    setSubmittedScore(null);
    setSubmitError(null);
    updatePaddle(50);
    lastSpawnRef.current = performance.now();
    setGameState("playing");
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keysPressedRef.current.left = true;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keysPressedRef.current.right = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keysPressedRef.current.left = false;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keysPressedRef.current.right = false;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;

    let frameId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const moveSpeed = 74;
      if (keysPressedRef.current.left && !keysPressedRef.current.right) {
        updatePaddle(paddleXRef.current - moveSpeed * dt);
      } else if (keysPressedRef.current.right && !keysPressedRef.current.left) {
        updatePaddle(paddleXRef.current + moveSpeed * dt);
      }

      const spawnInterval = Math.max(370, 880 - scoreRef.current * 14);
      if (now - lastSpawnRef.current >= spawnInterval) {
        lastSpawnRef.current = now;
        const isBug = Math.random() < 0.32;
        const pool = isBug ? BUG_LABELS : PACKET_LABELS;
        const label = pool[Math.floor(Math.random() * pool.length)];

        setItems((prev) => [
          ...prev,
          {
            id: nextIdRef.current++,
            x: 8 + Math.random() * 84,
            y: -4,
            speed:
              33 + Math.random() * 14 + Math.min(28, scoreRef.current * 0.7),
            kind: isBug ? "bug" : "packet",
            label,
          },
        ]);
      }

      setItems((prev) => {
        const next: FallingItem[] = [];
        let pointsGained = 0;
        let livesLost = 0;

        for (const item of prev) {
          const nextY = item.y + item.speed * dt;
          const hitPaddle =
            nextY >= 83 &&
            nextY <= 92 &&
            Math.abs(item.x - paddleXRef.current) <= 12;

          if (hitPaddle) {
            if (item.kind === "packet") {
              pointsGained += 1;
            } else {
              livesLost += 1;
            }
            continue;
          }

          if (nextY > 103) {
            if (item.kind === "packet") {
              livesLost += 1;
            }
            continue;
          }

          next.push({ ...item, y: nextY });
        }

        if (pointsGained > 0) {
          scoreRef.current += pointsGained;
          setScore(scoreRef.current);
          triggerFeedback("catch");
          setBestScore((prevBest) => {
            const updated = Math.max(prevBest, scoreRef.current);
            try {
              localStorage.setItem(`best_${gameId}`, String(updated));
            } catch {
              // Ignore storage errors
            }
            return updated;
          });
        }

        if (livesLost > 0) {
          triggerFeedback("hit");
          setLives((prevLives) => {
            const remaining = Math.max(0, prevLives - livesLost);
            if (remaining === 0) {
              setGameState("gameover");
            }
            return remaining;
          });
        }

        return next;
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [gameState, gameId, triggerFeedback, updatePaddle]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== "playing" || !arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 100;
    updatePaddle(relX);
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
        body: JSON.stringify({
          gameId,
          playerName: trimmed,
          score,
        }),
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

  const arenaBorderClass =
    feedback === "catch"
      ? "border-emerald-500/60"
      : feedback === "hit"
        ? "border-rose-500/60"
        : "border-zinc-800";

  const arenaHeightClass = compact
    ? "h-80 sm:h-96"
    : "h-96 sm:h-[26rem] lg:h-[29rem]";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start select-none">
      {/* Left / Main Game Column */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* HUD Strip */}
        <div className="grid grid-cols-3 border border-zinc-800 rounded-xl bg-[#111114] divide-x divide-zinc-800 text-xs font-mono">
          <div className="px-4 py-3">
            <span className="text-zinc-500 block text-[10px]">SCORE</span>
            <span className="text-white font-semibold text-base tabular-nums">
              {score}
            </span>
          </div>

          <div className="px-4 py-3">
            <span className="text-zinc-500 block text-[10px]">BEST</span>
            <span className="text-emerald-400 font-semibold text-base tabular-nums">
              {bestScore}
            </span>
          </div>

          <div className="px-4 py-3">
            <span className="text-zinc-500 block text-[10px]">INTEGRITY</span>
            <div className="flex items-center gap-1.5 mt-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`h-2.5 w-6 rounded-full transition-colors ${
                    i < lives ? "bg-emerald-400" : "bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Larger Game Arena */}
        <div
          ref={arenaRef}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          className={`relative w-full rounded-xl border ${arenaBorderClass} bg-[#111114] overflow-hidden touch-none transition-colors duration-150 ${arenaHeightClass}`}
        >
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #3f3f46 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Catch zone guide line */}
          <div className="pointer-events-none absolute inset-x-4 bottom-10 h-px bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent" />

          {/* Falling Packets & Bugs */}
          {items.map((item) => (
            <div
              key={item.id}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              className={`-translate-x-1/2 -translate-y-1/2 absolute px-2.5 py-1 rounded-md text-[11px] font-mono border pointer-events-none ${
                item.kind === "packet"
                  ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/90 border-rose-500/40 text-rose-300"
              }`}
            >
              {item.label}
            </div>
          ))}

          {/* Collector Paddle */}
          <div
            style={{ left: `${paddleX}%` }}
            className={`-translate-x-1/2 absolute bottom-6 w-28 h-3 rounded-full transition-transform duration-75 pointer-events-none ${
              feedback === "hit"
                ? "bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.5)]"
                : "bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.45)]"
            }`}
          />

          {/* Clean Idle / Game Over Dialog */}
          {gameState !== "playing" && (
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[2px] flex items-center justify-center p-5">
              <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#111114]/95 p-6 text-center space-y-4 shadow-2xl">
                {gameState === "gameover" ? (
                  <>
                    <span className="inline-block text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded border border-rose-800/60 bg-rose-950/40 text-rose-300">
                      Connection Lost
                    </span>

                    <div>
                      <p className="text-2xl font-semibold text-white font-mono tabular-nums">
                        {score} {score === 1 ? "packet" : "packets"}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {score > 0
                          ? "Save your score in the panel on the right or below."
                          : "Catch at least 1 packet to log a score."}
                      </p>
                    </div>

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
                        Packet Recovery
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Catch{" "}
                        <span className="font-mono text-emerald-400">
                          200 OK
                        </span>{" "}
                        packets and dodge{" "}
                        <span className="font-mono text-rose-400">
                          404 / ERR
                        </span>{" "}
                        bugs. Move with{" "}
                        <span className="font-mono text-zinc-200">← / →</span>,{" "}
                        <span className="font-mono text-zinc-200">A / D</span>,
                        or drag.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={startGame}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition cursor-pointer"
                    >
                      <FiPlay className="w-3.5 h-3.5" />
                      <span>Start game</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Name Entry + Leaderboard */}
      <aside className="lg:col-span-5 xl:col-span-4 space-y-4">
        {/* Enter Name & Save Score Card */}
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
                <span>Saved {score} pts for {playerName.trim()}</span>
              </p>
            )}

            {submitError && (
              <p className="text-[11px] font-mono text-rose-400">
                {submitError}
              </p>
            )}

            {gameState !== "gameover" && submittedScore !== score && (
              <p className="text-[11px] font-mono text-zinc-500">
                Finish a run with at least 1 packet to save.
              </p>
            )}
          </form>
        </div>

        {/* Reusable Leaderboard */}
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