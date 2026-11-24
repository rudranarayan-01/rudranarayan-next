"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiCheck, FiPlay, FiRotateCcw } from "react-icons/fi";
import Leaderboard from "./Leaderboard";

interface SpikeObstacle {
  id: number;
  x: number; // 10..90%
  y: number; // -6..105%
  speed: number;
  label: string;
}

interface LatencyDodgeGameProps {
  gameId?: string;
  compact?: boolean;
}

const SPIKE_LABELS = ["502", "504", "TIMEOUT", "JITTER", "DEADLOCK"];
const NAME_STORAGE_KEY = "portfolio_game_player_name";

export default function LatencyDodgeGame({
  gameId = "latency-dodge",
  compact = false,
}: LatencyDodgeGameProps) {
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">(
    "idle"
  );
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [playerX, setPlayerX] = useState(50);
  const [spikes, setSpikes] = useState<SpikeObstacle[]>([]);
  const [hitFlash, setHitFlash] = useState(false);

  const [playerName, setPlayerName] = useState("");
  const [submittingScore, setSubmittingScore] = useState(false);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [leaderboardTick, setLeaderboardTick] = useState(0);

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const playerXRef = useRef(50);
  const keysRef = useRef<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });
  const nextIdRef = useRef(1);
  const lastSpawnRef = useRef(0);
  const scoreAccumulatorRef = useRef(0);
  const scoreRef = useRef(0);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerHitFlash = useCallback(() => {
    setHitFlash(true);
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => setHitFlash(false), 180);
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
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

  const updatePlayerX = useCallback((next: number) => {
    const clamped = Math.max(10, Math.min(90, next));
    playerXRef.current = clamped;
    setPlayerX(clamped);
  }, []);

  const startGame = () => {
    scoreRef.current = 0;
    scoreAccumulatorRef.current = 0;
    setScore(0);
    setLives(3);
    setSpikes([]);
    setHitFlash(false);
    setSubmittedScore(null);
    setSubmitError(null);
    updatePlayerX(50);
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
        keysRef.current.left = true;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keysRef.current.right = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keysRef.current.left = false;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keysRef.current.right = false;
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

      // Survival points (10 pts per second)
      scoreAccumulatorRef.current += dt * 10;
      const nextPoints = Math.floor(scoreAccumulatorRef.current);
      if (nextPoints > scoreRef.current) {
        scoreRef.current = nextPoints;
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
      }

      const moveSpeed = 76;
      if (keysRef.current.left && !keysRef.current.right) {
        updatePlayerX(playerXRef.current - moveSpeed * dt);
      } else if (keysRef.current.right && !keysRef.current.left) {
        updatePlayerX(playerXRef.current + moveSpeed * dt);
      }

      const spawnInterval = Math.max(290, 760 - scoreRef.current * 2.2);
      if (now - lastSpawnRef.current >= spawnInterval) {
        lastSpawnRef.current = now;
        const label =
          SPIKE_LABELS[Math.floor(Math.random() * SPIKE_LABELS.length)];
        setSpikes((prev) => [
          ...prev,
          {
            id: nextIdRef.current++,
            x: 10 + Math.random() * 80,
            y: -5,
            speed:
              38 +
              Math.random() * 18 +
              Math.min(34, scoreRef.current * 0.14),
            label,
          },
        ]);
      }

      setSpikes((prev) => {
        const remaining: SpikeObstacle[] = [];
        let collisions = 0;

        for (const spike of prev) {
          const nextY = spike.y + spike.speed * dt;
          const hitPlayer =
            nextY >= 81 &&
            nextY <= 91 &&
            Math.abs(spike.x - playerXRef.current) <= 10.5;

          if (hitPlayer) {
            collisions += 1;
            continue;
          }

          if (nextY > 104) continue;
          remaining.push({ ...spike, y: nextY });
        }

        if (collisions > 0) {
          triggerHitFlash();
          setLives((prevLives) => {
            const nextLives = Math.max(0, prevLives - collisions);
            if (nextLives === 0) setGameState("gameover");
            return nextLives;
          });
        }

        return remaining;
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [gameState, gameId, triggerHitFlash, updatePlayerX]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== "playing" || !arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 100;
    updatePlayerX(relX);
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

  const arenaHeightClass = compact
    ? "h-80 sm:h-96"
    : "h-96 sm:h-[26rem] lg:h-[29rem]";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start select-none">
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
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
            <span className="text-zinc-500 block text-[10px]">SHIELD</span>
            <div className="flex items-center gap-1.5 mt-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`h-2.5 w-6 rounded-full transition-colors ${
                    i < lives ? "bg-amber-400" : "bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          ref={arenaRef}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          className={`relative w-full rounded-xl border ${
            hitFlash ? "border-rose-500/70" : "border-zinc-800"
          } bg-[#111114] overflow-hidden touch-none transition-colors duration-150 ${arenaHeightClass}`}
        >
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {spikes.map((spike) => (
            <div
              key={spike.id}
              style={{ left: `${spike.x}%`, top: `${spike.y}%` }}
              className="-translate-x-1/2 -translate-y-1/2 absolute px-2 py-0.5 rounded bg-rose-950/90 border border-rose-500/40 text-rose-300 text-[11px] font-mono pointer-events-none"
            >
              {spike.label}
            </div>
          ))}

          {/* Player Node */}
          <div
            style={{ left: `${playerX}%` }}
            className={`-translate-x-1/2 absolute bottom-6 w-6 h-6 rounded-lg border transition-colors pointer-events-none ${
              hitFlash
                ? "bg-rose-500/30 border-rose-400"
                : "bg-emerald-500/20 border-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.4)]"
            }`}
          />

          {gameState !== "playing" && (
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[2px] flex items-center justify-center p-5">
              <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#111114]/95 p-6 text-center space-y-4 shadow-2xl">
                {gameState === "gameover" ? (
                  <>
                    <span className="inline-block text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded border border-rose-800/60 bg-rose-950/40 text-rose-300">
                      Node Overloaded
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
                        Latency Dodge
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Evade incoming{" "}
                        <span className="font-mono text-rose-400">
                          502 / TIMEOUT / JITTER
                        </span>{" "}
                        spikes. Move with{" "}
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
                Finish a run with points to save.
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