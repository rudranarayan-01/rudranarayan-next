"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiCheck, FiPlay, FiRotateCcw, FiX } from "react-icons/fi";
import Leaderboard from "./Leaderboard";

interface StackGuesserGameProps {
  gameId?: string;
  compact?: boolean;
}

interface TechLogoItem {
  id: string;
  name: string;
  category: string;
  deviconSlug: string;
  invertOnDark?: boolean;
  fallbackSvg: () => React.ReactNode;
}

interface LogoQuestion {
  index: number;
  target: TechLogoItem;
  options: TechLogoItem[];
}

interface ChoiceFeedback {
  selectedId: string;
  correctId: string;
  isCorrect: boolean;
  pointsEarned: number;
}

const TOTAL_QUESTIONS = 15;
const ROUND_SECONDS = 60;
const NAME_STORAGE_KEY = "portfolio_game_player_name";

const TECH_LOGOS: TechLogoItem[] = [
  {
    id: "react",
    name: "React",
    category: "Frontend Library",
    deviconSlug: "react",
    fallbackSvg: () => (
      <svg viewBox="0 0 100 100" className="w-16 h-16 text-cyan-400">
        <circle cx="50" cy="50" r="8" fill="currentColor" />
        <ellipse cx="50" cy="50" rx="40" ry="15" fill="none" stroke="currentColor" strokeWidth="4" />
        <ellipse cx="50" cy="50" rx="40" ry="15" fill="none" stroke="currentColor" strokeWidth="4" transform="rotate(60 50 50)" />
        <ellipse cx="50" cy="50" rx="40" ry="15" fill="none" stroke="currentColor" strokeWidth="4" transform="rotate(120 50 50)" />
      </svg>
    ),
  },
  {
    id: "nextjs",
    name: "Next.js",
    category: "React Framework",
    deviconSlug: "nextjs",
    invertOnDark: true,
    fallbackSvg: () => (
      <svg viewBox="0 0 100 100" className="w-16 h-16">
        <circle cx="50" cy="50" r="42" fill="#09090b" stroke="#e4e4e7" strokeWidth="4" />
        <path d="M35 68 V32 L68 74" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="65" y1="32" x2="65" y2="54" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "Typed JavaScript",
    deviconSlug: "typescript",
    fallbackSvg: () => (
      <svg viewBox="0 0 100 100" className="w-16 h-16">
        <rect x="18" y="18" width="64" height="64" rx="10" fill="#2563eb" />
        <text x="64" y="73" textAnchor="middle" fill="#ffffff" fontSize="30" fontWeight="bold" fontFamily="monospace">TS</text>
      </svg>
    ),
  },
  {
    id: "nodejs",
    name: "Node.js",
    category: "Backend Runtime",
    deviconSlug: "nodejs",
    fallbackSvg: () => (
      <svg viewBox="0 0 100 100" className="w-16 h-16">
        <polygon points="50,14 82,32 82,68 50,86 18,68 18,32" fill="#16a34a" />
        <text x="50" y="58" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="bold" fontFamily="monospace">JS</text>
      </svg>
    ),
  },
  {
    id: "express",
    name: "Express",
    category: "Node Web Framework",
    deviconSlug: "express",
    invertOnDark: true,
    fallbackSvg: () => (
      <div className="font-mono text-sm font-bold text-zinc-200">ex</div>
    ),
  },
  {
    id: "mongodb",
    name: "MongoDB",
    category: "NoSQL Database",
    deviconSlug: "mongodb",
    fallbackSvg: () => (
      <svg viewBox="0 0 100 100" className="w-16 h-16">
        <path d="M50 14 C65 32, 68 54, 52 76 L50 86 L48 76 C32 54, 35 32, 50 14 Z" fill="#10b981" />
      </svg>
    ),
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "Relational Database",
    deviconSlug: "postgresql",
    fallbackSvg: () => (
      <div className="font-mono text-sm font-bold text-sky-400">PG</div>
    ),
  },
  {
    id: "redis",
    name: "Redis",
    category: "In-Memory Cache",
    deviconSlug: "redis",
    fallbackSvg: () => (
      <svg viewBox="0 0 100 100" className="w-16 h-16 text-rose-500">
        <polygon points="50,62 84,74 50,86 16,74" fill="#be123c" />
        <polygon points="50,48 84,60 50,72 16,60" fill="#e11d48" />
        <polygon points="50,34 84,46 50,58 16,46" fill="#f43f5e" />
      </svg>
    ),
  },
  {
    id: "docker",
    name: "Docker",
    category: "Containerization",
    deviconSlug: "docker",
    fallbackSvg: () => (
      <svg viewBox="0 0 100 100" className="w-16 h-16 text-sky-400">
        <rect x="24" y="42" width="10" height="9" rx="1.5" fill="currentColor" />
        <rect x="36" y="42" width="10" height="9" rx="1.5" fill="currentColor" />
        <rect x="48" y="42" width="10" height="9" rx="1.5" fill="currentColor" />
        <path d="M16 54 H78 C76 70, 62 78, 42 78 C24 78, 16 68, 16 54 Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    category: "Container Orchestration",
    deviconSlug: "kubernetes",
    fallbackSvg: () => (
      <div className="font-mono text-sm font-bold text-blue-400">K8s</div>
    ),
  },
  {
    id: "python",
    name: "Python",
    category: "Programming Language",
    deviconSlug: "python",
    fallbackSvg: () => (
      <svg viewBox="0 0 100 100" className="w-16 h-16">
        <path d="M49 18 C35 18, 34 25, 34 32 V40 H52 V44 H28 C21 44, 18 50, 18 58 C18 66, 22 70, 29 70 H34 V61 C34 54, 39 50, 46 50 H60 C65 50, 68 46, 68 41 V28 C68 21, 61 18, 49 18 Z" fill="#38bdf8" />
        <path d="M51 82 C65 82, 66 75, 66 68 V60 H48 V56 H72 C79 56, 82 50, 82 42 C82 34, 78 30, 71 30 H66 V39 C66 46, 61 50, 54 50 H40 C35 50, 32 54, 32 59 V72 C32 79, 39 82, 51 82 Z" fill="#facc15" />
      </svg>
    ),
  },
  {
    id: "tailwindcss",
    name: "Tailwind CSS",
    category: "Utility CSS",
    deviconSlug: "tailwindcss",
    fallbackSvg: () => (
      <svg viewBox="0 0 100 100" className="w-16 h-16 text-cyan-400">
        <path d="M34 42 C38 32, 46 28, 56 30 C62 31, 65 36, 70 40 C75 44, 80 44, 86 38 C82 48, 74 52, 64 50 C58 49, 55 44, 50 40 C45 36, 40 36, 34 42 Z" fill="currentColor" />
        <path d="M14 62 C18 52, 26 48, 36 50 C42 51, 45 56, 50 60 C55 64, 60 64, 66 58 C62 68, 54 72, 44 70 C38 69, 35 64, 30 60 C25 56, 20 56, 14 62 Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "graphql",
    name: "GraphQL",
    category: "API Query Layer",
    deviconSlug: "graphql",
    fallbackSvg: () => (
      <svg viewBox="0 0 100 100" className="w-16 h-16 text-pink-500">
        <polygon points="50,16 80,33 80,67 50,84 20,67 20,33" fill="none" stroke="currentColor" strokeWidth="3.5" />
        <circle cx="50" cy="16" r="5" fill="currentColor" />
        <circle cx="80" cy="33" r="5" fill="currentColor" />
        <circle cx="80" cy="67" r="5" fill="currentColor" />
        <circle cx="50" cy="84" r="5" fill="currentColor" />
        <circle cx="20" cy="67" r="5" fill="currentColor" />
        <circle cx="20" cy="33" r="5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "git",
    name: "Git",
    category: "Version Control",
    deviconSlug: "git",
    fallbackSvg: () => (
      <div className="font-mono text-sm font-bold text-orange-400">GIT</div>
    ),
  },
  {
    id: "linux",
    name: "Linux",
    category: "Operating System",
    deviconSlug: "linux",
    fallbackSvg: () => (
      <div className="font-mono text-sm font-bold text-amber-300">🐧</div>
    ),
  },
  {
    id: "rust",
    name: "Rust",
    category: "Systems Language",
    deviconSlug: "rust",
    invertOnDark: true,
    fallbackSvg: () => (
      <div className="font-mono text-sm font-bold text-orange-400">RS</div>
    ),
  },
  {
    id: "go",
    name: "Go",
    category: "Systems Language",
    deviconSlug: "go",
    fallbackSvg: () => (
      <div className="font-mono text-sm font-bold text-cyan-400">GO</div>
    ),
  },
  {
    id: "firebase",
    name: "Firebase",
    category: "App Platform",
    deviconSlug: "firebase",
    fallbackSvg: () => (
      <div className="font-mono text-sm font-bold text-amber-400">FB</div>
    ),
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "Postgres Backend",
    deviconSlug: "supabase",
    fallbackSvg: () => (
      <div className="font-mono text-sm font-bold text-emerald-400">SB</div>
    ),
  },
  {
    id: "tensorflow",
    name: "TensorFlow",
    category: "Machine Learning",
    deviconSlug: "tensorflow",
    fallbackSvg: () => (
      <div className="font-mono text-sm font-bold text-orange-400">TF</div>
    ),
  },
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateFifteenQuestions(): LogoQuestion[] {
  const targets = shuffleArray(TECH_LOGOS).slice(0, TOTAL_QUESTIONS);

  return targets.map((target, index) => {
    const distractors = shuffleArray(
      TECH_LOGOS.filter((item) => item.id !== target.id)
    ).slice(0, 3);

    const options = shuffleArray([target, ...distractors]);
    return { index, target, options };
  });
}

function StackArtwork({ item }: { item: TechLogoItem }) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [item.id]);

  if (imgFailed) {
    return <>{item.fallbackSvg()}</>;
  }

  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${item.deviconSlug}/${item.deviconSlug}-original.svg`}
      alt={`${item.name} logo`}
      onError={() => setImgFailed(true)}
      className={`w-16 h-16 object-contain ${
        item.invertOnDark ? "invert brightness-95" : ""
      }`}
      loading="eager"
    />
  );
}

export default function StackGuesserGame({
  gameId = "stack-guesser",
  compact = false,
}: StackGuesserGameProps) {
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">(
    "idle"
  );
  const [questions, setQuestions] = useState<LogoQuestion[]>(() =>
    generateFifteenQuestions()
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [choiceFeedback, setChoiceFeedback] = useState<ChoiceFeedback | null>(
    null
  );

  const [playerName, setPlayerName] = useState("");
  const [submittingScore, setSubmittingScore] = useState(false);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [leaderboardTick, setLeaderboardTick] = useState(0);

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearAdvanceTimer();
  }, [clearAdvanceTimer]);

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

  const finishRound = useCallback(
    (finalScore: number) => {
      clearAdvanceTimer();
      setChoiceFeedback(null);
      setGameState("gameover");
      setBestScore((prev) => {
        const updated = Math.max(prev, finalScore);
        try {
          localStorage.setItem(`best_${gameId}`, String(updated));
        } catch {
          // Ignore storage errors
        }
        return updated;
      });
    },
    [clearAdvanceTimer, gameId]
  );

  const startGame = () => {
    clearAdvanceTimer();
    const deck = generateFifteenQuestions();
    setQuestions(deck);
    setCurrentIdx(0);
    setTimeLeft(ROUND_SECONDS);
    setScore(0);
    scoreRef.current = 0;
    streakRef.current = 0;
    setCorrectCount(0);
    setStreak(0);
    setChoiceFeedback(null);
    setSubmittedScore(null);
    setSubmitError(null);
    setGameState("playing");
  };

  useEffect(() => {
    if (gameState !== "playing") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishRound(scoreRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [finishRound, gameState]);

  const currentQuestion = questions[currentIdx];

  const handleSelect = useCallback(
    (chosen: TechLogoItem) => {
      if (gameState !== "playing" || choiceFeedback || !currentQuestion) return;

      const isCorrect = chosen.id === currentQuestion.target.id;
      let pointsEarned = 0;

      if (isCorrect) {
        const nextStreak = streakRef.current + 1;
        const streakBonus = Math.min(15, (nextStreak - 1) * 3);
        const speedBonus = Math.floor((timeLeft / ROUND_SECONDS) * 10);
        pointsEarned = 20 + streakBonus + speedBonus;

        const nextScore = scoreRef.current + pointsEarned;
        scoreRef.current = nextScore;
        streakRef.current = nextStreak;

        setScore(nextScore);
        setStreak(nextStreak);
        setCorrectCount((c) => c + 1);
      } else {
        streakRef.current = 0;
        setStreak(0);
      }

      setChoiceFeedback({
        selectedId: chosen.id,
        correctId: currentQuestion.target.id,
        isCorrect,
        pointsEarned,
      });

      advanceTimerRef.current = setTimeout(() => {
        setChoiceFeedback(null);
        if (currentIdx + 1 >= TOTAL_QUESTIONS) {
          finishRound(scoreRef.current);
        } else {
          setCurrentIdx((idx) => idx + 1);
        }
      }, isCorrect ? 650 : 1250);
    },
    [choiceFeedback, currentIdx, currentQuestion, finishRound, gameState, timeLeft]
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
      if (idx !== -1 && currentQuestion?.options[idx]) {
        handleSelect(currentQuestion.options[idx]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentQuestion, gameState, handleSelect]);

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

  const arenaMinHeight = compact
    ? "min-h-[24rem]"
    : "min-h-[27rem] lg:min-h-[30rem]";

  const timeProgressPercent = Math.max(0, (timeLeft / ROUND_SECONDS) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start select-none">
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* HUD Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border border-zinc-800 rounded-xl bg-[#111114] divide-y sm:divide-y-0 sm:divide-x divide-zinc-800 text-xs font-mono overflow-hidden">
          <div className="px-4 py-3">
            <span className="text-zinc-500 block text-[10px]">SCORE</span>
            <span className="text-white font-semibold text-base tabular-nums">
              {score}
            </span>
          </div>
          <div className="px-4 py-3">
            <span className="text-zinc-500 block text-[10px]">QUESTION</span>
            <span className="text-zinc-200 font-semibold text-base tabular-nums">
              {gameState === "idle"
                ? `0/${TOTAL_QUESTIONS}`
                : `${Math.min(currentIdx + 1, TOTAL_QUESTIONS)}/${TOTAL_QUESTIONS}`}
            </span>
          </div>
          <div className="px-4 py-3">
            <span className="text-zinc-500 block text-[10px]">STREAK</span>
            <span className="text-amber-300 font-semibold text-base tabular-nums">
              {streak}x
            </span>
          </div>
          <div className="px-4 py-3">
            <span className="text-zinc-500 block text-[10px]">TIME LEFT</span>
            <span
              className={`font-semibold text-base tabular-nums ${
                timeLeft <= 10 ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* 60-Second Timer Progress Strip */}
        <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800/80">
          <div
            style={{ width: `${timeProgressPercent}%` }}
            className={`h-full transition-all duration-500 ${
              timeLeft <= 10 ? "bg-rose-500" : "bg-emerald-400"
            }`}
          />
        </div>

        {/* Main Game Stage */}
        <div
          className={`relative w-full rounded-xl border border-zinc-800 bg-[#111114] p-5 sm:p-7 flex flex-col items-center justify-center ${arenaMinHeight}`}
        >
          {gameState === "playing" && currentQuestion ? (
            <div className="w-full max-w-lg space-y-6">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>
                  Q{currentIdx + 1} of {TOTAL_QUESTIONS} ·{" "}
                  <span className="text-zinc-500">
                    {currentQuestion.target.category}
                  </span>
                </span>
                <span className="text-zinc-500">Keys 1–4 or click</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-28 h-28 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-lg">
                  <StackArtwork item={currentQuestion.target} />
                </div>
              </div>

              {/* Instant Feedback Banner */}
              <div className="min-h-[28px] flex items-center justify-center">
                {choiceFeedback ? (
                  choiceFeedback.isCorrect ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                      <FiCheck className="w-3.5 h-3.5" />
                      <span>Correct! +{choiceFeedback.pointsEarned} pts</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-mono">
                      <FiX className="w-3.5 h-3.5" />
                      <span>
                        You picked{" "}
                        <strong className="text-rose-200">
                          {
                            currentQuestion.options.find(
                              (o) => o.id === choiceFeedback.selectedId
                            )?.name
                          }
                        </strong>{" "}
                        · Answer:{" "}
                        <strong className="text-emerald-300">
                          {currentQuestion.target.name}
                        </strong>
                      </span>
                    </div>
                  )
                ) : (
                  <p className="text-xs font-mono text-zinc-500">
                    Identify this stack or tool
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = choiceFeedback?.selectedId === opt.id;
                  const isCorrectOption =
                    choiceFeedback?.correctId === opt.id;

                  let buttonStyle =
                    "bg-zinc-950 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-600 text-zinc-100";

                  if (choiceFeedback) {
                    if (isCorrectOption) {
                      buttonStyle =
                        "bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40";
                    } else if (isSelected && !choiceFeedback.isCorrect) {
                      buttonStyle =
                        "bg-rose-950/80 border-rose-500 text-rose-200";
                    } else {
                      buttonStyle =
                        "bg-zinc-950/50 border-zinc-800/60 text-zinc-500 opacity-65";
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={Boolean(choiceFeedback)}
                      onClick={() => handleSelect(opt)}
                      className={`px-4 py-3 rounded-xl border text-xs font-mono flex items-center justify-between gap-2.5 transition-all cursor-pointer disabled:cursor-default ${buttonStyle}`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-medium truncate">{opt.name}</span>
                      </span>

                      {choiceFeedback && isCorrectOption && (
                        <span className="text-[10px] uppercase font-bold text-emerald-400 shrink-0">
                          Correct
                        </span>
                      )}
                      {choiceFeedback &&
                        isSelected &&
                        !choiceFeedback.isCorrect && (
                          <span className="text-[10px] uppercase font-bold text-rose-400 shrink-0">
                            Picked
                          </span>
                        )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : gameState === "gameover" ? (
            <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6 text-center space-y-4">
              <span className="inline-block text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded border border-emerald-800/60 bg-emerald-950/40 text-emerald-300">
                Round Complete
              </span>
              <div className="space-y-1">
                <p className="text-3xl font-semibold text-white font-mono tabular-nums">
                  {score} pts
                </p>
                <p className="text-xs font-mono text-zinc-400 tabular-nums">
                  Accuracy: {correctCount}/{TOTAL_QUESTIONS} · Best: {bestScore}
                </p>
              </div>
              <button
                type="button"
                onClick={startGame}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs font-mono transition cursor-pointer"
              >
                <FiRotateCcw className="w-3.5 h-3.5" />
                <span>Play 15 new stacks</span>
              </button>
            </div>
          ) : (
            <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950/90 p-6 text-center space-y-4">
              <div className="space-y-1.5">
                <p className="text-base font-semibold text-white">
                  Stack Guesser · 15-Stack Sprint
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Identify{" "}
                  <span className="font-mono text-zinc-200">
                    15 non-repeating developer stacks
                  </span>{" "}
                  within{" "}
                  <span className="font-mono text-zinc-200">60 seconds</span>.
                  Wrong picks immediately highlight the right answer.
                </p>
              </div>
              <button
                type="button"
                onClick={startGame}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs font-mono transition cursor-pointer"
              >
                <FiPlay className="w-3.5 h-3.5" />
                <span>Start sprint</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Score Submission + Leaderboard */}
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
                Finish the 15-stack round to save your score.
              </p>
            )}
          </form>
        </div>

        <Leaderboard
          gameId={gameId}
          limit={10}
          refreshTrigger={leaderboardTick}
          title="Stack Guesser — Top Scores"
          unitLabel="pts"
        />
      </aside>
    </div>
  );
}