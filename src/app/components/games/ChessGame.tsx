/* eslint-disable no-undef */
"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Chess, PieceSymbol, Square } from "chess.js";
import {
  FiCheck,
  FiPlay,
  FiRotateCcw,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import Leaderboard from "./Leaderboard";
import { startGameSession } from "@/lib/gameSessionClient";

interface ChessGameProps {
  gameId?: string;
  compact?: boolean;
}

type ChessSoundType = "move" | "capture" | "check" | "gameover";

const NAME_STORAGE_KEY = "portfolio_game_player_name";
const SOUND_STORAGE_KEY = "portfolio_chess_sound_enabled";
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"] as const;

const PIECE_MATERIAL_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
};

const CAPTURE_SCORE_VALUES: Record<string, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
};

function createChessSoundPlayer() {
  let ctx: AudioContext | null = null;

  const getContext = (): AudioContext | null => {
    if (typeof window === "undefined") return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  };

  const tone = (
    audioCtx: AudioContext,
    freq: number,
    startOffset: number,
    duration: number,
    gainPeak: number,
    type: OscillatorType = "triangle",
  ) => {
    const now = audioCtx.currentTime + startOffset;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(70, freq * 0.65),
      now + duration,
    );

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  };

  return (kind: ChessSoundType, enabled: boolean) => {
    if (!enabled) return;
    const audioCtx = getContext();
    if (!audioCtx) return;

    if (kind === "move") {
      // Crisp wooden piece tap
      tone(audioCtx, 240, 0, 0.065, 0.18, "triangle");
    } else if (kind === "capture") {
      // Punchier double thud
      tone(audioCtx, 195, 0, 0.08, 0.24, "sawtooth");
      tone(audioCtx, 145, 0.02, 0.09, 0.18, "triangle");
    } else if (kind === "check") {
      // Sharp alert chime
      tone(audioCtx, 587.33, 0, 0.09, 0.16, "sine");
      tone(audioCtx, 880, 0.075, 0.12, 0.15, "sine");
    } else if (kind === "gameover") {
      tone(audioCtx, 440, 0, 0.14, 0.16, "triangle");
      tone(audioCtx, 349.23, 0.13, 0.18, 0.16, "triangle");
      tone(audioCtx, 261.63, 0.27, 0.28, 0.16, "triangle");
    }
  };
}

function StauntonPieceSvg({
  color,
  type,
}: {
  color: "w" | "b";
  type: PieceSymbol;
}) {
  const uid = useId().replace(/:/g, "");
  const isWhite = color === "w";
  const gradId = `neo-grad-${uid}-${color}-${type}`;
  const highlightId = `neo-hi-${uid}-${color}-${type}`;

  const mainFill = `url(#${gradId})`;
  const stroke = isWhite ? "#23211E" : "#F3F2EE";
  const innerLine = isWhite ? "#3A3732" : "#CFCBC2";

  const renderDefs = () => (
    <defs>
      <linearGradient id={gradId} x1="15%" y1="5%" x2="85%" y2="100%">
        {isWhite ? (
          <>
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#F8F6F0" />
            <stop offset="100%" stopColor="#E3DFD3" />
          </>
        ) : (
          <>
            <stop offset="0%" stopColor="#4A4844" />
            <stop offset="50%" stopColor="#2E2D2A" />
            <stop offset="100%" stopColor="#191816" />
          </>
        )}
      </linearGradient>
      <linearGradient id={highlightId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop
          offset="0%"
          stopColor={isWhite ? "#FFFFFF" : "#78756E"}
          stopOpacity={isWhite ? "0.85" : "0.45"}
        />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
    </defs>
  );

  switch (type) {
    case "p":
      return (
        <svg
          viewBox="0 0 45 45"
          className="w-[86%] h-[86%] drop-shadow-[0_3px_4px_rgba(0,0,0,0.45)]"
        >
          {renderDefs()}
          <g
            fill={mainFill}
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Head */}
            <circle cx="22.5" cy="13.5" r="5.5" />
            {/* Collar */}
            <path d="M16.5 20.2h12c.7 0 1.2.5 1.2 1.2s-.5 1.2-1.2 1.2h-12c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2z" />
            {/* Tapered body */}
            <path d="M18 22.6c0 4.6-2.8 8.6-7.5 12.4h24c-4.7-3.8-7.5-7.8-7.5-12.4" />
            {/* Base */}
            <rect x="9.5" y="34.5" width="26" height="4.2" rx="1.8" />
          </g>
          <path
            d="M20.2 10.2a4.2 4.2 0 0 1 3.8.6"
            fill="none"
            stroke={`url(#${highlightId})`}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "r":
      return (
        <svg
          viewBox="0 0 45 45"
          className="w-[88%] h-[88%] drop-shadow-[0_3px_4px_rgba(0,0,0,0.45)]"
        >
          {renderDefs()}
          <g
            fill={mainFill}
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Battlement crown */}
            <path d="M10.5 9.5h3.5v3.5h5.5V9.5h6v3.5H31V9.5h3.5v7.5l-2.5 2.2v13.2l2.5 2.2v4.1h-24v-4.1l2.5-2.2V19.2l-2.5-2.2V9.5z" />
            {/* Collar & base trim */}
            <path
              d="M13 19.2h19M13 32.4h19"
              stroke={innerLine}
              strokeWidth="1.45"
            />
          </g>
        </svg>
      );

    case "n":
      return (
        <svg
          viewBox="0 0 45 45"
          className="w-[90%] h-[90%] drop-shadow-[0_4px_5px_rgba(0,0,0,0.5)]"
        >
          {renderDefs()}
          <g
            fill={mainFill}
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Sculpted Knight head & arched neck */}
            <path d="M11.5 38.5h22v-3.2c-2.2-1.4-3.6-3.8-3.6-8.2 0-5.4 3.5-8.6 4.6-13.6.7-3.3-1.4-6.4-4.7-6.8-1.5-.2-2.7.4-3.6 1.5l-1.4-1.7c-1.2 1.1-1.9 2.6-2.1 4.3-3.6 1.6-7.4 4.4-9.5 8.2-1.4 2.5-1.1 5.1.8 6.4 1.6 1.1 3.7.5 4.9-.8l1.6-1.7c.7 3.1-.3 6.9-5.3 12.6v3.2z" />
            {/* Eye */}
            <circle cx="16.8" cy="14.2" r="1.4" fill={stroke} stroke="none" />
            {/* Mane ridge */}
            <path
              d="M26.5 9.8c1.6 3.8 1.8 8.8.4 14.8"
              fill="none"
              stroke={innerLine}
              strokeWidth="1.4"
            />
          </g>
        </svg>
      );

    case "b":
      return (
        <svg
          viewBox="0 0 45 45"
          className="w-[88%] h-[88%] drop-shadow-[0_3px_4px_rgba(0,0,0,0.45)]"
        >
          {renderDefs()}
          <g
            fill={mainFill}
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Finial */}
            <circle cx="22.5" cy="7.5" r="2.3" />
            {/* Miter body */}
            <path d="M22.5 10.2c-5.4 3.6-8.3 8.1-8.3 12.6 0 3.1 1.7 5.3 3.4 6.8l-5.6 4.9h21l-5.6-4.9c1.7-1.5 3.4-3.7 3.4-6.8 0-4.5-2.9-9-8.3-12.6z" />
            {/* Miter slit & neck ring */}
            <path
              d="M19.2 16.5l6.4 6.2M25.6 16.5l-2.4 2.4M16.2 29.6h12.6"
              stroke={innerLine}
              strokeWidth="1.45"
            />
            {/* Base */}
            <rect x="10" y="34.5" width="25" height="4.2" rx="1.8" />
          </g>
        </svg>
      );

    case "q":
      return (
        <svg
          viewBox="0 0 45 45"
          className="w-[90%] h-[90%] drop-shadow-[0_4px_5px_rgba(0,0,0,0.5)]"
        >
          {renderDefs()}
          <g
            fill={mainFill}
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Crown jewels */}
            <circle cx="7.2" cy="13" r="2.2" />
            <circle cx="14.8" cy="9.8" r="2.2" />
            <circle cx="22.5" cy="8.4" r="2.3" />
            <circle cx="30.2" cy="9.8" r="2.2" />
            <circle cx="37.8" cy="13" r="2.2" />
            {/* Coronet & body */}
            <path d="M8.6 15l3.4 15.2h21L36.4 15l-6.1 9-3.3-12.2-4.5 12-4.5-12L14.7 24 8.6 15z" />
            <path d="M11.8 30.2h21.4l2 4.3H9.8l2-4.3z" />
            <rect x="9.5" y="34.5" width="26" height="4.2" rx="1.8" />
          </g>
        </svg>
      );

    case "k":
    default:
      return (
        <svg
          viewBox="0 0 45 45"
          className="w-[90%] h-[90%] drop-shadow-[0_4px_5px_rgba(0,0,0,0.5)]"
        >
          {renderDefs()}
          <g
            fill={mainFill}
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Cross */}
            <path d="M22.5 5.5v6.8M19 8.8h7" strokeWidth="2.2" />
            {/* Crown & body */}
            <path d="M22.5 12.3c-4.4 2.1-6.2 6.5-4.8 11.4-4.5 1.3-7.4 4.8-6.4 10.8h22.4c1-6-1.9-9.5-6.4-10.8 1.4-4.9-.4-9.3-4.8-11.4z" />
            <path
              d="M15.2 24.4h14.6M12.5 29.6h20"
              stroke={innerLine}
              strokeWidth="1.45"
            />
            <rect x="9.5" y="34.5" width="26" height="4.2" rx="1.8" />
          </g>
        </svg>
      );
  }
}

export default function ChessGame({
  gameId = "chess-tactics",
  compact = false,
}: ChessGameProps) {
  const chessRef = useRef<Chess>(new Chess());
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const botTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playSoundRef = useRef(createChessSoundPlayer());
  const sessionTokenRef = useRef<string | null>(null);

  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">(
    "idle",
  );
  const [board, setBoard] = useState(() => chessRef.current.board());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalTargets, setLegalTargets] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(
    null,
  );
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedByWhite, setCapturedByWhite] = useState<
    { color: "w" | "b"; type: PieceSymbol }[]
  >([]);
  const [capturedByBlack, setCapturedByBlack] = useState<
    { color: "w" | "b"; type: PieceSymbol }[]
  >([]);
  const [checkedKingSquare, setCheckedKingSquare] = useState<Square | null>(
    null,
  );
  const [statusText, setStatusText] = useState("White to move");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Score submission & leaderboard refresh
  const [playerName, setPlayerName] = useState("");
  const [submittingScore, setSubmittingScore] = useState(false);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [leaderboardTick, setLeaderboardTick] = useState(0);

  useEffect(() => {
    try {
      const savedName = localStorage.getItem(NAME_STORAGE_KEY);
      if (savedName) setPlayerName(savedName);

      const savedBest = localStorage.getItem(`best_${gameId}`);
      if (savedBest) setBestScore(Number(savedBest) || 0);

      const savedSound = localStorage.getItem(SOUND_STORAGE_KEY);
      if (savedSound !== null) setSoundEnabled(savedSound === "true");
    } catch {
      // Ignore storage errors
    }
  }, [gameId]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  useEffect(() => {
    return () => {
      if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    };
  }, []);

  const findKingSquare = useCallback(
    (chess: Chess, color: "w" | "b"): Square | null => {
      const grid = chess.board();
      for (let r = 0; r < 8; r += 1) {
        for (let f = 0; f < 8; f += 1) {
          const p = grid[r][f];
          if (p && p.color === color && p.type === "k") {
            return `${FILES[f]}${RANKS[r]}` as Square;
          }
        }
      }
      return null;
    },
    [],
  );

  const updateBest = useCallback(
    (nextScore: number) => {
      setBestScore((prev) => {
        const updated = Math.max(prev, nextScore);
        try {
          localStorage.setItem(`best_${gameId}`, String(updated));
        } catch {
          // Ignore storage errors
        }
        return updated;
      });
    },
    [gameId],
  );

  const syncAfterMove = useCallback(
    (chess: Chess, deltaScore: number, wasCapture: boolean) => {
      setBoard(chess.board());
      setMoveHistory(chess.history());
      setSelectedSquare(null);
      setLegalTargets([]);

      const inCheck = chess.inCheck();
      setCheckedKingSquare(
        inCheck ? findKingSquare(chess, chess.turn()) : null,
      );

      setScore((prev) => {
        let nextScore = Math.max(0, prev + deltaScore);
        if (chess.isGameOver() && chess.isCheckmate() && chess.turn() === "b") {
          nextScore += 250;
        }
        updateBest(nextScore);
        return nextScore;
      });

      if (chess.isGameOver()) {
        playSoundRef.current("gameover", soundEnabled);
        if (chess.isCheckmate()) {
          setStatusText(
            chess.turn() === "b"
              ? "Checkmate · White wins"
              : "Checkmate · Black wins",
          );
        } else if (chess.isDraw()) {
          setStatusText("Draw");
        } else {
          setStatusText("Game over");
        }
        setGameState("gameover");
        return;
      }

      if (inCheck) {
        playSoundRef.current("check", soundEnabled);
      } else if (wasCapture) {
        playSoundRef.current("capture", soundEnabled);
      } else {
        playSoundRef.current("move", soundEnabled);
      }

      const turnLabel =
        chess.turn() === "w" ? "White to move" : "Black bot thinking...";
      setStatusText(inCheck ? `${turnLabel} · Check` : turnLabel);
    },
    [findKingSquare, soundEnabled, updateBest],
  );

  const runBotMove = useCallback(() => {
    const chess = chessRef.current;
    if (chess.isGameOver() || chess.turn() !== "b") return;

    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return;

    const weighted = moves.map((m) => ({
      move: m,
      weight: m.captured ? (CAPTURE_SCORE_VALUES[m.captured] || 10) + 6 : 1,
    }));
    const total = weighted.reduce((sum, item) => sum + item.weight, 0);
    let r = Math.random() * total;
    let chosen = weighted[0].move;

    for (const item of weighted) {
      r -= item.weight;
      if (r <= 0) {
        chosen = item.move;
        break;
      }
    }

    const result = chess.move({
      from: chosen.from,
      to: chosen.to,
      promotion: "q",
    });

    if (result) {
      setLastMove({ from: result.from, to: result.to });
      if (result.captured) {
        setCapturedByBlack((prev) => [
          ...prev,
          { color: "w", type: result.captured as PieceSymbol },
        ]);
      }
      syncAfterMove(chess, 0, Boolean(result.captured));
    }
  }, [syncAfterMove]);

  useEffect(() => {
    if (gameState !== "playing") return;
    if (chessRef.current.turn() === "b") {
      botTimeoutRef.current = setTimeout(runBotMove, 320);
      return () => {
        if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
      };
    }
  }, [board, gameState, runBotMove]);

  const startGame = async () => {
    sessionTokenRef.current = null;
    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    const fresh = new Chess();
    chessRef.current = fresh;
    setBoard(fresh.board());
    setMoveHistory([]);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setCheckedKingSquare(null);
    setSelectedSquare(null);
    setLegalTargets([]);
    setLastMove(null);
    setScore(0);
    setSubmittedScore(null);
    setSubmitError(null);
    setStatusText("White to move");
    setGameState("playing");
    sessionTokenRef.current = await startGameSession(gameId);
  };

  const handleSquareClick = (square: Square) => {
    if (gameState !== "playing") return;
    const chess = chessRef.current;
    if (chess.turn() !== "w") return;

    if (selectedSquare && legalTargets.includes(square)) {
      const move = chess.move({
        from: selectedSquare,
        to: square,
        promotion: "q",
      });

      if (move) {
        setLastMove({ from: move.from, to: move.to });
        if (move.captured) {
          setCapturedByWhite((prev) => [
            ...prev,
            { color: "b", type: move.captured as PieceSymbol },
          ]);
        }
        const points = move.captured
          ? CAPTURE_SCORE_VALUES[move.captured] || 10
          : 0;
        syncAfterMove(chess, points, Boolean(move.captured));
        return;
      }
    }

    const piece = chess.get(square);
    if (piece && piece.color === "w") {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalTargets([]);
        return;
      }
      const moves = chess.moves({ square, verbose: true });
      setSelectedSquare(square);
      setLegalTargets(moves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setLegalTargets([]);
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
        body: JSON.stringify({
          gameId,
          playerName: trimmed,
          score,
          sessionToken: sessionTokenRef.current,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Could not save score.");
      }
      sessionTokenRef.current = null;
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

  const materialAdvantage = useMemo(() => {
    const whiteMat = capturedByWhite.reduce(
      (sum, p) => sum + (PIECE_MATERIAL_VALUES[p.type] || 0),
      0,
    );
    const blackMat = capturedByBlack.reduce(
      (sum, p) => sum + (PIECE_MATERIAL_VALUES[p.type] || 0),
      0,
    );
    return whiteMat - blackMat;
  }, [capturedByBlack, capturedByWhite]);

  const movePairs = useMemo(() => {
    const rows: { turn: number; white?: string; black?: string }[] = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      rows.push({
        turn: Math.floor(i / 2) + 1,
        white: moveHistory[i],
        black: moveHistory[i + 1],
      });
    }
    return rows;
  }, [moveHistory]);

  const boardSizeClass = compact
    ? "max-w-[440px]"
    : "max-w-[540px] xl:max-w-[580px]";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start select-none">
      {/* Left Column: Expansive Chess.com-style Board */}
      <div className="lg:col-span-8 space-y-2.5">
        {/* Opponent Tray (Top) */}
        <div className="flex items-center justify-between px-4 py-2 rounded-xl border border-zinc-800 bg-[#111114] text-xs font-mono">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
              <StauntonPieceSvg color="b" type="k" />
            </div>
            <span className="text-zinc-200 font-semibold truncate">
              Tactical Bot
            </span>
            <div className="flex items-center -space-x-1 overflow-x-auto">
              {capturedByBlack.map((p, idx) => (
                <span key={`${p.type}-${idx}`} className="w-4 h-4 inline-flex">
                  <StauntonPieceSvg color={p.color} type={p.type} />
                </span>
              ))}
              {materialAdvantage < 0 && (
                <span className="pl-2 text-[11px] text-zinc-400">
                  +{Math.abs(materialAdvantage)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[11px] text-emerald-400">{statusText}</span>
            <button
              type="button"
              onClick={toggleSound}
              title={soundEnabled ? "Mute chess sounds" : "Unmute chess sounds"}
              className="p-1.5 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition cursor-pointer"
            >
              {soundEnabled ? (
                <FiVolume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <FiVolumeX className="w-3.5 h-3.5 text-zinc-500" />
              )}
            </button>
          </div>
        </div>

        {/* Large 8x8 Chess Board */}
        <div className="relative rounded-xl border border-zinc-800 bg-[#18181b] p-3 sm:p-5 flex items-center justify-center">
          <div
            className={`relative w-full aspect-square ${boardSizeClass} rounded-md overflow-hidden shadow-2xl grid grid-cols-8 grid-rows-8 border border-zinc-900`}
          >
            {RANKS.map((rank, rIdx) =>
              FILES.map((file, fIdx) => {
                const square = `${file}${rank}` as Square;
                const isLight = (rIdx + fIdx) % 2 === 0;
                const piece = board[rIdx]?.[fIdx] || null;
                const isSelected = selectedSquare === square;
                const isTarget = legalTargets.includes(square);
                const isLastMove =
                  lastMove?.from === square || lastMove?.to === square;
                const isCheckedKing = checkedKingSquare === square;

                const squareBg = isCheckedKing
                  ? "bg-rose-600/90"
                  : isSelected
                    ? isLight
                      ? "bg-[#F5F682]"
                      : "bg-[#B9CA43]"
                    : isLastMove
                      ? isLight
                        ? "bg-[#F5F682]/85"
                        : "bg-[#B9CA43]/85"
                      : isLight
                        ? "bg-[#EBECD0]"
                        : "bg-[#779556]";

                const coordTextColor = isLight
                  ? "text-[#779556]"
                  : "text-[#EBECD0]";

                return (
                  <button
                    key={square}
                    type="button"
                    onClick={() => handleSquareClick(square)}
                    className={`relative flex items-center justify-center ${squareBg} transition-colors cursor-pointer`}
                  >
                    {fIdx === 0 && (
                      <span
                        className={`pointer-events-none absolute top-0.5 left-1 text-[10px] sm:text-[11px] font-mono font-bold leading-none ${coordTextColor}`}
                      >
                        {rank}
                      </span>
                    )}

                    {rIdx === 7 && (
                      <span
                        className={`pointer-events-none absolute bottom-0.5 right-1 text-[10px] sm:text-[11px] font-mono font-bold leading-none ${coordTextColor}`}
                      >
                        {file}
                      </span>
                    )}

                    {isTarget && !piece && (
                      <span className="pointer-events-none w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-zinc-900/25" />
                    )}
                    {isTarget && piece && (
                      <span className="pointer-events-none absolute inset-1 rounded-full ring-4 ring-zinc-900/35" />
                    )}

                    {piece && (
                      <span
                        className={`pointer-events-none w-full h-full flex items-center justify-center transition-transform duration-100 ${
                          isSelected ? "-translate-y-0.5 scale-105" : ""
                        }`}
                      >
                        <StauntonPieceSvg
                          color={piece.color}
                          type={piece.type}
                        />
                      </span>
                    )}
                  </button>
                );
              }),
            )}
          </div>

          {/* Start / Rematch Overlay */}
          {gameState !== "playing" && (
            <div className="absolute inset-0 bg-zinc-950/75 backdrop-blur-[2px] flex items-center justify-center p-5 rounded-xl">
              <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#111114]/95 p-6 text-center space-y-4 shadow-2xl">
                {gameState === "gameover" ? (
                  <>
                    <span className="inline-block text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded border border-emerald-700/60 bg-emerald-950/40 text-emerald-300">
                      {statusText}
                    </span>
                    <p className="text-2xl font-semibold text-white font-mono tabular-nums">
                      {score} pts
                    </p>
                    <button
                      type="button"
                      onClick={startGame}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#779556] hover:bg-[#85a662] text-white font-semibold text-xs transition cursor-pointer"
                    >
                      <FiRotateCcw className="w-3.5 h-3.5" />
                      <span>New Match</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <p className="text-base font-semibold text-white">
                        Chess Tactics
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Play White against the bot with move, capture, and check
                        sounds. Checkmate awards a{" "}
                        <span className="font-mono text-emerald-400">+250</span>{" "}
                        bonus.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={startGame}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#779556] hover:bg-[#85a662] text-white font-semibold text-xs transition cursor-pointer"
                    >
                      <FiPlay className="w-3.5 h-3.5" />
                      <span>Play White</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Player Tray (Bottom) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 rounded-xl border border-zinc-800 bg-[#111114] text-xs font-mono">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-[#779556] flex items-center justify-center shrink-0">
              <StauntonPieceSvg color="w" type="k" />
            </div>
            <span className="text-white font-semibold">You</span>
            <div className="flex items-center -space-x-1 overflow-x-auto">
              {capturedByWhite.map((p, idx) => (
                <span key={`${p.type}-${idx}`} className="w-4 h-4 inline-flex">
                  <StauntonPieceSvg color={p.color} type={p.type} />
                </span>
              ))}
              {materialAdvantage > 0 && (
                <span className="pl-2 text-[11px] text-emerald-400 font-semibold">
                  +{materialAdvantage}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 tabular-nums">
            <span className="text-zinc-400">
              Score: <strong className="text-white">{score}</strong>
            </span>
            <span className="text-zinc-400">
              Best: <strong className="text-emerald-400">{bestScore}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Move List + Score Form + Leaderboard */}
      <aside className="lg:col-span-4 space-y-4">
        <div className="border border-zinc-800 rounded-xl bg-[#111114] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-200 font-medium">Move History</span>
            <span className="text-zinc-500">{moveHistory.length} plies</span>
          </div>
          <div className="max-h-44 overflow-y-auto divide-y divide-zinc-800/60 text-xs font-mono">
            {movePairs.length === 0 ? (
              <p className="p-4 text-center text-zinc-500">
                No moves played yet.
              </p>
            ) : (
              movePairs.map((row) => (
                <div
                  key={row.turn}
                  className="grid grid-cols-12 px-3.5 py-1.5 items-center text-zinc-300"
                >
                  <span className="col-span-2 text-zinc-500">{row.turn}.</span>
                  <span className="col-span-5 text-white">{row.white}</span>
                  <span className="col-span-5 text-zinc-400">
                    {row.black || ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

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
                Finish a match with points to save.
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
