"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiCheck, FiPlay, FiRotateCcw, FiX } from "react-icons/fi";
import Leaderboard from "./Leaderboard";

interface FlagCipherGameProps {
  gameId?: string;
  compact?: boolean;
}

interface FlagItem {
  code: string; // ISO 3166-1 alpha-2 uppercase
  name: string;
  region: string;
  fallbackSvg: () => React.ReactNode;
}

interface QuestionRound {
  index: number; // 0..14
  target: FlagItem;
  options: FlagItem[];
}

interface ChoiceFeedback {
  selectedCode: string;
  correctCode: string;
  isCorrect: boolean;
  pointsEarned: number;
}

const TOTAL_QUESTIONS = 15;
const ROUND_SECONDS = 60;
const NAME_STORAGE_KEY = "portfolio_game_player_name";

const FLAGS: FlagItem[] = [
  {
    code: "JP",
    name: "Japan",
    region: "East Asia",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="180" height="120" fill="#ffffff" />
        <circle cx="90" cy="60" r="32" fill="#bc002d" />
      </svg>
    ),
  },
  {
    code: "IN",
    name: "India",
    region: "South Asia",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="180" height="40" y="0" fill="#ff9933" />
        <rect width="180" height="40" y="40" fill="#ffffff" />
        <rect width="180" height="40" y="80" fill="#138808" />
        <circle cx="90" cy="60" r="14" fill="none" stroke="#000080" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    code: "DE",
    name: "Germany",
    region: "Europe",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="180" height="40" y="0" fill="#09090b" />
        <rect width="180" height="40" y="40" fill="#dd0000" />
        <rect width="180" height="40" y="80" fill="#ffce00" />
      </svg>
    ),
  },
  {
    code: "FR",
    name: "France",
    region: "Europe",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="60" height="120" x="0" fill="#002395" />
        <rect width="60" height="120" x="60" fill="#ffffff" />
        <rect width="60" height="120" x="120" fill="#ed2939" />
      </svg>
    ),
  },
  {
    code: "IT",
    name: "Italy",
    region: "Europe",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="60" height="120" x="0" fill="#009246" />
        <rect width="60" height="120" x="60" fill="#ffffff" />
        <rect width="60" height="120" x="120" fill="#ce2b37" />
      </svg>
    ),
  },
  {
    code: "SE",
    name: "Sweden",
    region: "Europe",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="180" height="120" fill="#006aa7" />
        <rect width="24" height="120" x="54" fill="#fecc02" />
        <rect width="180" height="24" y="48" fill="#fecc02" />
      </svg>
    ),
  },
  {
    code: "NO",
    name: "Norway",
    region: "Europe",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="180" height="120" fill="#ba0c2f" />
        <rect width="32" height="120" x="50" fill="#ffffff" />
        <rect width="180" height="32" y="44" fill="#ffffff" />
        <rect width="18" height="120" x="57" fill="#00205b" />
        <rect width="180" height="18" y="51" fill="#00205b" />
      </svg>
    ),
  },
  {
    code: "FI",
    name: "Finland",
    region: "Europe",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="180" height="120" fill="#ffffff" />
        <rect width="28" height="120" x="52" fill="#003580" />
        <rect width="180" height="28" y="46" fill="#003580" />
      </svg>
    ),
  },
  {
    code: "CH",
    name: "Switzerland",
    region: "Europe",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="180" height="120" fill="#d52b1e" />
        <rect width="22" height="68" x="79" y="26" fill="#ffffff" />
        <rect width="68" height="22" x="56" y="49" fill="#ffffff" />
      </svg>
    ),
  },
  {
    code: "UA",
    name: "Ukraine",
    region: "Europe",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="180" height="60" y="0" fill="#0057b7" />
        <rect width="180" height="60" y="60" fill="#ffd700" />
      </svg>
    ),
  },
  {
    code: "PL",
    name: "Poland",
    region: "Europe",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="180" height="60" y="0" fill="#ffffff" />
        <rect width="180" height="60" y="60" fill="#dc143c" />
      </svg>
    ),
  },
  {
    code: "NL",
    name: "Netherlands",
    region: "Europe",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="180" height="40" y="0" fill="#ae1c28" />
        <rect width="180" height="40" y="40" fill="#ffffff" />
        <rect width="180" height="40" y="80" fill="#21468b" />
      </svg>
    ),
  },
  {
    code: "BE",
    name: "Belgium",
    region: "Europe",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="60" height="120" x="0" fill="#09090b" />
        <rect width="60" height="120" x="60" fill="#fdda24" />
        <rect width="60" height="120" x="120" fill="#ef3340" />
      </svg>
    ),
  },
  {
    code: "IE",
    name: "Ireland",
    region: "Europe",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="60" height="120" x="0" fill="#169b62" />
        <rect width="60" height="120" x="60" fill="#ffffff" />
        <rect width="60" height="120" x="120" fill="#ff883e" />
      </svg>
    ),
  },
  {
    code: "BD",
    name: "Bangladesh",
    region: "South Asia",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="180" height="120" fill="#006a4e" />
        <circle cx="82" cy="60" r="32" fill="#f42a41" />
      </svg>
    ),
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    region: "Middle East",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="135" height="40" x="45" y="0" fill="#00732f" />
        <rect width="135" height="40" x="45" y="40" fill="#ffffff" />
        <rect width="135" height="40" x="45" y="80" fill="#09090b" />
        <rect width="45" height="120" x="0" y="0" fill="#ff0000" />
      </svg>
    ),
  },
  {
    code: "TH",
    name: "Thailand",
    region: "Southeast Asia",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="180" height="20" y="0" fill="#a51931" />
        <rect width="180" height="20" y="20" fill="#f4f5f8" />
        <rect width="180" height="40" y="40" fill="#2d2a4a" />
        <rect width="180" height="20" y="80" fill="#f4f5f8" />
        <rect width="180" height="20" y="100" fill="#a51931" />
      </svg>
    ),
  },
  {
    code: "ID",
    name: "Indonesia",
    region: "Southeast Asia",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="180" height="60" y="0" fill="#ce1126" />
        <rect width="180" height="60" y="60" fill="#ffffff" />
      </svg>
    ),
  },
  {
    code: "BR",
    name: "Brazil",
    region: "South America",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="180" height="120" fill="#009c3b" />
        <polygon points="90,18 158,60 90,102 22,60" fill="#ffdf00" />
        <circle cx="90" cy="60" r="24" fill="#002776" />
      </svg>
    ),
  },
  {
    code: "KR",
    name: "South Korea",
    region: "East Asia",
    fallbackSvg: () => (
      <svg viewBox="0 0 180 120" className="w-full h-full">
        <rect width="180" height="120" fill="#ffffff" />
        <circle cx="90" cy="60" r="26" fill="#cd2e3a" />
        <path d="M64 60 A26 26 0 0 0 116 60 A13 13 0 0 0 90 60 A13 13 0 0 1 64 60 Z" fill="#0047a0" />
      </svg>
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

function generateFifteenQuestions(): QuestionRound[] {
  const selectedTargets = shuffleArray(FLAGS).slice(0, TOTAL_QUESTIONS);

  return selectedTargets.map((target, index) => {
    const distractors = shuffleArray(
      FLAGS.filter((f) => f.code !== target.code)
    ).slice(0, 3);

    const options = shuffleArray([target, ...distractors]);
    return { index, target, options };
  });
}

function FlagArtwork({ flag }: { flag: FlagItem }) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [flag.code]);

  if (imgFailed) {
    return <>{flag.fallbackSvg()}</>;
  }

  return (
    <img
      src={`https://flagcdn.com/w320/${flag.code.toLowerCase()}.png`}
      alt={`${flag.name} flag`}
      onError={() => setImgFailed(true)}
      className="w-full h-full object-cover"
      loading="eager"
    />
  );
}

export default function FlagCipherGame({
  gameId = "flag-cipher",
  compact = false,
}: FlagCipherGameProps) {
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">(
    "idle"
  );
  const [questions, setQuestions] = useState<QuestionRound[]>(() =>
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

  const finishRound = useCallback((finalScore: number) => {
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
  }, [clearAdvanceTimer, gameId]);

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
    (chosen: FlagItem) => {
      if (gameState !== "playing" || choiceFeedback || !currentQuestion) return;

      const isCorrect = chosen.code === currentQuestion.target.code;
      let pointsEarned = 0;

      if (isCorrect) {
        const nextStreak = streakRef.current + 1;
        // Base 20 pts + up to +15 streak bonus + time speed bonus (up to +10)
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
        selectedCode: chosen.code,
        correctCode: currentQuestion.target.code,
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
              {/* Question Header */}
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>
                  Q{currentIdx + 1} of {TOTAL_QUESTIONS} ·{" "}
                  <span className="text-zinc-500">
                    {currentQuestion.target.region}
                  </span>
                </span>
                <span className="text-zinc-500">Keys 1–4 or click</span>
              </div>

              {/* Flag Card */}
              <div className="flex flex-col items-center">
                <div className="w-48 h-32 sm:w-56 sm:h-36 rounded-xl overflow-hidden border border-zinc-700/90 bg-zinc-950 shadow-xl">
                  <FlagArtwork flag={currentQuestion.target} />
                </div>
              </div>

              {/* Instant Feedback Banner */}
              <div className="min-h-[28px] flex items-center justify-center">
                {choiceFeedback ? (
                  choiceFeedback.isCorrect ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                      <FiCheck className="w-3.5 h-3.5" />
                      <span>
                        Correct! +{choiceFeedback.pointsEarned} pts
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-mono">
                      <FiX className="w-3.5 h-3.5" />
                      <span>
                        You picked{" "}
                        <strong className="text-rose-200">
                          {
                            currentQuestion.options.find(
                              (o) => o.code === choiceFeedback.selectedCode
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
                    Select the country matching this flag
                  </p>
                )}
              </div>

              {/* 4 Answer Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = choiceFeedback?.selectedCode === opt.code;
                  const isCorrectOption =
                    choiceFeedback?.correctCode === opt.code;

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
                      key={opt.code}
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
                <span>Play 15 new flags</span>
              </button>
            </div>
          ) : (
            <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950/90 p-6 text-center space-y-4">
              <div className="space-y-1.5">
                <p className="text-base font-semibold text-white">
                  Flag Cipher · 15-Flag Sprint
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Answer{" "}
                  <span className="font-mono text-zinc-200">
                    15 non-repeating flags
                  </span>{" "}
                  within{" "}
                  <span className="font-mono text-zinc-200">60 seconds</span>.
                  Wrong picks immediately reveal the right answer.
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
                Finish the 15-flag round to save your score.
              </p>
            )}
          </form>
        </div>

        <Leaderboard
          gameId={gameId}
          limit={10}
          refreshTrigger={leaderboardTick}
          title="Flag Cipher — Top Scores"
          unitLabel="pts"
        />
      </aside>
    </div>
  );
}