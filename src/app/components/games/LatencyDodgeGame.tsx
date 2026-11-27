"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiCheck, FiPlay, FiRotateCcw } from "react-icons/fi";
import Leaderboard from "./Leaderboard";
import { startGameSession } from "@/lib/gameSessionClient";

interface TrafficCarObstacle {
  id: number;
  x: number; // 14..86%
  y: number; // -8..106%
  speed: number;
  label: string;
}

interface LatencyDodgeGameProps {
  gameId?: string;
  compact?: boolean;
}

const TRAFFIC_LABELS = ["502", "504", "TIMEOUT", "JITTER", "DEADLOCK"];
const NAME_STORAGE_KEY = "portfolio_game_player_name";

// Player car positioned near bottom of road (% from top)
const PLAYER_Y_PERCENT = 85;

function PlayerCarIcon({ hitFlash }: { hitFlash: boolean }) {
  return (
    <svg
      viewBox="0 0 48 76"
      className="w-10 h-16 sm:w-11 sm:h-[68px] drop-shadow-[0_8px_14px_rgba(0,0,0,0.75)]"
      aria-hidden="true"
    >
      {/* Wheels */}
      <rect x="3" y="13" width="6" height="15" rx="2.5" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />
      <rect x="39" y="13" width="6" height="15" rx="2.5" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />
      <rect x="3" y="47" width="6" height="15" rx="2.5" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />
      <rect x="39" y="47" width="6" height="15" rx="2.5" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />

      {/* Car Body */}
      <rect
        x="9"
        y="4"
        width="30"
        height="68"
        rx="10"
        fill={hitFlash ? "#ef4444" : "#10b981"}
        stroke={hitFlash ? "#fca5a5" : "#6ee7b7"}
        strokeWidth="1.8"
      />

      {/* Windshield & Rear Glass */}
      <path
        d="M13 21 Q24 17 35 21 L33 33 Q24 31 15 33 Z"
        fill="#09090b"
        opacity="0.85"
      />
      <path
        d="M15 49 Q24 51 33 49 L35 60 Q24 63 13 60 Z"
        fill="#09090b"
        opacity="0.8"
      />

      {/* Roof */}
      <rect x="15" y="34" width="18" height="14" rx="4" fill="#059669" />

      {/* Headlights */}
      <rect x="12" y="5" width="6" height="3" rx="1.5" fill="#fef08a" />
      <rect x="30" y="5" width="6" height="3" rx="1.5" fill="#fef08a" />

      {/* Taillights */}
      <rect x="12" y="68" width="6" height="2.5" rx="1" fill="#fda4af" />
      <rect x="30" y="68" width="6" height="2.5" rx="1" fill="#fda4af" />
    </svg>
  );
}

function RedObstacleCarIcon({ label }: { label: string }) {
  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox="0 0 48 76"
        className="w-10 h-16 sm:w-11 sm:h-[68px] drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)]"
        aria-hidden="true"
      >
        {/* Wheels */}
        <rect x="3" y="13" width="6" height="15" rx="2.5" fill="#09090b" stroke="#52525b" strokeWidth="1.2" />
        <rect x="39" y="13" width="6" height="15" rx="2.5" fill="#09090b" stroke="#52525b" strokeWidth="1.2" />
        <rect x="3" y="47" width="6" height="15" rx="2.5" fill="#09090b" stroke="#52525b" strokeWidth="1.2" />
        <rect x="39" y="47" width="6" height="15" rx="2.5" fill="#09090b" stroke="#52525b" strokeWidth="1.2" />

        {/* Red Car Body */}
        <rect
          x="9"
          y="4"
          width="30"
          height="68"
          rx="10"
          fill="#dc2626"
          stroke="#fca5a5"
          strokeWidth="1.6"
        />

        {/* Cabin Windows */}
        <path
          d="M14 20 Q24 17 34 20 L32 32 Q24 30 16 32 Z"
          fill="#18181b"
          opacity="0.85"
        />
        <rect x="15" y="34" width="18" height="14" rx="4" fill="#991b1b" />
        <path
          d="M16 49 Q24 51 32 49 L34 60 Q24 63 14 60 Z"
          fill="#18181b"
          opacity="0.8"
        />

        {/* Brake Lights (facing toward player) */}
        <rect x="12" y="67.5" width="6" height="3" rx="1" fill="#fecdd3" />
        <rect x="30" y="67.5" width="6" height="3" rx="1" fill="#fecdd3" />
      </svg>

      <span className="-mt-1 px-1.5 py-0.5 rounded bg-zinc-950/90 border border-rose-500/40 text-rose-300 text-[9px] font-mono leading-none tracking-tight">
        {label}
      </span>
    </div>
  );
}

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
  const [cars, setCars] = useState<TrafficCarObstacle[]>([]);
  const [roadOffset, setRoadOffset] = useState(0);
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
  const roadOffsetRef = useRef(0);
  const scoreAccumulatorRef = useRef(0);
  const scoreRef = useRef(0);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionTokenRef = useRef<string | null>(null);

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
    const clamped = Math.max(15, Math.min(85, next));
    playerXRef.current = clamped;
    setPlayerX(clamped);
  }, []);

  const startGame = async () => {
    scoreRef.current = 0;
    scoreAccumulatorRef.current = 0;
    roadOffsetRef.current = 0;
    setScore(0);
    setLives(3);
    setCars([]);
    setRoadOffset(0);
    setHitFlash(false);
    setSubmittedScore(null);
    setSubmitError(null);
    updatePlayerX(50);
    lastSpawnRef.current = performance.now();
    setGameState("playing");
    sessionTokenRef.current = await startGameSession(gameId);
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

      // Scroll road markings smoothly
      const roadSpeedPx = 240 + Math.min(220, scoreRef.current * 0.8);
      roadOffsetRef.current = (roadOffsetRef.current + roadSpeedPx * dt) % 48;
      setRoadOffset(roadOffsetRef.current);

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

      const moveSpeed = 78;
      if (keysRef.current.left && !keysRef.current.right) {
        updatePlayerX(playerXRef.current - moveSpeed * dt);
      } else if (keysRef.current.right && !keysRef.current.left) {
        updatePlayerX(playerXRef.current + moveSpeed * dt);
      }

      const spawnInterval = Math.max(360, 820 - scoreRef.current * 2.0);
      if (now - lastSpawnRef.current >= spawnInterval) {
        lastSpawnRef.current = now;
        const label =
          TRAFFIC_LABELS[Math.floor(Math.random() * TRAFFIC_LABELS.length)];

        // Pick a lane position with clear horizontal separation from recently spawned top cars
        const lanes = [20, 38, 50, 62, 80];
        let candidateX = lanes[Math.floor(Math.random() * lanes.length)];
        setCars((prev) => {
          const nearTop = prev.filter((c) => c.y < 18);
          if (nearTop.length > 0) {
            const safeLanes = lanes.filter((lx) =>
              nearTop.every((other) => Math.abs(other.x - lx) >= 14)
            );
            if (safeLanes.length > 0) {
              candidateX =
                safeLanes[Math.floor(Math.random() * safeLanes.length)];
            }
          }

          return [
            ...prev,
            {
              id: nextIdRef.current++,
              x: candidateX,
              y: -8,
              speed:
                36 +
                Math.random() * 14 +
                Math.min(30, scoreRef.current * 0.12),
              label,
            },
          ];
        });
      }

      setCars((prev) => {
        const remaining: TrafficCarObstacle[] = [];
        let collisions = 0;

        for (const car of prev) {
          const nextY = car.y + car.speed * dt;
          const dx = Math.abs(car.x - playerXRef.current);
          const dy = Math.abs(nextY - PLAYER_Y_PERCENT);

          // Tight hitbox matching actual car dimensions so nearby lanes do not false-crash
          const hitPlayer = dx <= 5.8 && dy <= 7.5;

          if (hitPlayer) {
            collisions += 1;
            continue;
          }

          if (nextY > 106) continue;
          remaining.push({ ...car, y: nextY });
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

        {/* Highway Road Arena */}
        <div
          ref={arenaRef}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          style={gameState === "playing" ? { cursor: "none" } : undefined}
          className={`relative z-10 w-full rounded-xl border ${
            hitFlash ? "border-rose-500/80" : "border-zinc-800"
          } bg-zinc-950 overflow-hidden touch-none transition-colors duration-150 ${
            gameState === "playing" ? "cursor-none" : ""
          } ${arenaHeightClass}`}
        >
          {/* Road shoulders & asphalt surface */}
          <div className="absolute inset-x-6 sm:inset-x-10 inset-y-0 bg-[#141418] border-x-2 border-zinc-700/80 pointer-events-none" />

          {/* Animated dashed lane dividers */}
          <div
            className="absolute inset-y-0 left-1/3 -translate-x-1/2 w-[2px] pointer-events-none opacity-45"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, #a1a1aa 0px, #a1a1aa 20px, transparent 20px, transparent 48px)",
              backgroundPositionY: `${roadOffset}px`,
            }}
          />
          <div
            className="absolute inset-y-0 left-2/3 -translate-x-1/2 w-[2px] pointer-events-none opacity-45"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, #a1a1aa 0px, #a1a1aa 20px, transparent 20px, transparent 48px)",
              backgroundPositionY: `${roadOffset}px`,
            }}
          />

          {/* Red Obstacle Cars */}
          {cars.map((car) => (
            <div
              key={car.id}
              style={{ left: `${car.x}%`, top: `${car.y}%` }}
              className="-translate-x-1/2 -translate-y-1/2 absolute pointer-events-none"
            >
              <RedObstacleCarIcon label={car.label} />
            </div>
          ))}

          {/* Player Car */}
          <div
            style={{ left: `${playerX}%`, top: `${PLAYER_Y_PERCENT}%` }}
            className="-translate-x-1/2 -translate-y-1/2 absolute pointer-events-none"
          >
            <PlayerCarIcon hitFlash={hitFlash} />
          </div>

          {gameState !== "playing" && (
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[2px] flex items-center justify-center p-5">
              <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#111114]/95 p-6 text-center space-y-4 shadow-2xl">
                {gameState === "gameover" ? (
                  <>
                    <span className="inline-block text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded border border-rose-800/60 bg-rose-950/40 text-rose-300">
                      Crash · Shield Depleted
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
                      <span>Drive again</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <p className="text-base font-semibold text-white">
                        Latency Dodge · Highway Run
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Steer your car down the road and dodge red traffic cars.
                        Move with{" "}
                        <span className="font-mono text-zinc-200">← / →</span>,{" "}
                        <span className="font-mono text-zinc-200">A / D</span>,
                        or pointer.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={startGame}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition cursor-pointer"
                    >
                      <FiPlay className="w-3.5 h-3.5" />
                      <span>Start drive</span>
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