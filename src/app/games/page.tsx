"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { FiArrowLeft, FiLock, FiPlay, FiX } from "react-icons/fi";
import { PORTFOLIO_GAMES, PortfolioGame } from "@/data/games";
import PacketRecoveryGame from "../components/games/PacketRecoveryGame";
import Leaderboard from "../components/games/Leaderboard";
import LatencyDodgeGame from "../components/games/LatencyDodgeGame";
import IndexSprintGame from "../components/games/IndexSprintGame";
import SequenceMemoryGame from "../components/games/SequenceMemoryGame";
import GridSweepGame from "../components/games/GridSweepGame";
import ArcadeCharacters from "../components/games/ArcadeCharacters";
import FlagCipherGame from "../components/games/FlagCipherGame";
import StackGuesserGame from "../components/games/StackGuesserGame";

export default function GamesDashboardPage() {
  const [selectedBoardGameId, setSelectedBoardGameId] = useState<string>(
    PORTFOLIO_GAMES[0]?.id || "packet-recovery",
  );
  const [playingGameId, setPlayingGameId] = useState<string | null>(null);

  const activePlayingGame: PortfolioGame | undefined = playingGameId
    ? PORTFOLIO_GAMES.find((g) => g.id === playingGameId)
    : undefined;

  const boardGame: PortfolioGame =
    PORTFOLIO_GAMES.find((g) => g.id === selectedBoardGameId) ||
    PORTFOLIO_GAMES[0];

  const handlePlayGame = (game: PortfolioGame) => {
    if (game.status !== "playable") return;
    setSelectedBoardGameId(game.id);
    setPlayingGameId(game.id);
  };

  return (
    <div className="relative min-h-screen bg-[#09090b] text-zinc-100 px-4 py-8 sm:px-6 lg:px-10 font-sans overflow-x-clip">
      {/* Subtle game-zone ambient grid & top scanline */}
      <ArcadeCharacters isPlaying={Boolean(activePlayingGame)} />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #52525b 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-6xl mx-auto space-y-6">
        {/* Top Bar with Animated HUD Accent */}
        <header className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#111114] px-5 py-4 flex items-center justify-between gap-4">
          <motion.div
            aria-hidden="true"
            initial={{ x: "-100%" }}
            animate={{ x: "220%" }}
            transition={{
              repeat: Infinity,
              repeatDelay: 4,
              duration: 1.8,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute top-0 left-0 h-[1.5px] w-1/3 bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent"
          />

          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <motion.span
                animate={{ scale: [1, 1.7, 1], opacity: [0.75, 0.1, 0.75] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
              />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>

            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                Arcade Zone
              </p>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                {activePlayingGame ? activePlayingGame.title : "Mini-Games"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {activePlayingGame && (
              <button
                type="button"
                onClick={() => setPlayingGameId(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-200 transition cursor-pointer"
              >
                <FiX className="w-3.5 h-3.5 text-rose-400" />
                <span>All Games</span>
              </button>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-200 transition"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Portfolio</span>
            </Link>
          </div>
        </header>

        {/* Main Split: Games / Active Game on Left, Leaderboard on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column */}
          <section
            className={
              activePlayingGame
                ? "lg:col-span-12"
                : "lg:col-span-7 xl:col-span-8"
            }
          >
            {activePlayingGame ? (
              <motion.div
                key={activePlayingGame.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activePlayingGame.id === "packet-recovery" ? (
                  <PacketRecoveryGame gameId="packet-recovery" compact />
                ) : activePlayingGame.id === "latency-dodge" ? (
                  <LatencyDodgeGame gameId="latency-dodge" compact />
                ) : activePlayingGame.id === "index-sprint" ? (
                  <IndexSprintGame gameId="index-sprint" compact />
                ) : activePlayingGame.id === "sequence-memory" ? (
                  <SequenceMemoryGame gameId="sequence-memory" compact />
                ) : activePlayingGame.id === "grid-sweep" ? (
                  <GridSweepGame gameId="grid-sweep" />
                ) : activePlayingGame.id === "flag-cipher" ? (
                  <FlagCipherGame gameId="flag-cipher" compact />
                ) : activePlayingGame.id === "stack-guesser" ? (
                  <StackGuesserGame gameId="stack-guesser" compact />
                ) : (
                  <div className="border border-zinc-800 rounded-md bg-[#111114] h-80 flex items-center justify-center text-xs font-mono text-zinc-400">
                    {activePlayingGame.title} — not available yet.
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="border border-zinc-800 rounded-xl bg-[#111114] divide-y divide-zinc-800 overflow-hidden">
                {PORTFOLIO_GAMES.map((game) => {
                  const isPlayable = game.status === "playable";
                  const isBoardSelected = game.id === boardGame.id;

                  return (
                    <div
                      key={game.id}
                      onMouseEnter={() => setSelectedBoardGameId(game.id)}
                      onClick={() => {
                        setSelectedBoardGameId(game.id);
                        if (isPlayable) handlePlayGame(game);
                      }}
                      className={`group relative px-5 py-4 flex items-center justify-between gap-4 transition-colors ${
                        isPlayable
                          ? "cursor-pointer hover:bg-zinc-900/75"
                          : "opacity-60"
                      } ${isBoardSelected ? "bg-zinc-900/45" : ""}`}
                    >
                      {/* Animated active selection bar */}
                      {isBoardSelected && (
                        <motion.span
                          layoutId="activeGameIndicator"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                          className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r bg-emerald-400"
                        />
                      )}

                      <div className="min-w-0 space-y-0.5 pl-1">
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-sm font-medium text-zinc-100 group-hover:text-white transition-colors truncate">
                            {game.title}
                          </h2>
                          <span className="text-[11px] font-mono text-zinc-500">
                            {game.tag}
                          </span>
                          {!isPlayable && (
                            <span className="text-[11px] font-mono text-zinc-500">
                              (soon)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 truncate">
                          {game.tagline}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="hidden sm:inline text-[11px] font-mono text-zinc-500">
                          {game.controls}
                        </span>

                        {isPlayable ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayGame(game);
                            }}
                            className="opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 focus:opacity-100 focus:translate-x-0 px-3 py-1 rounded-md border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-zinc-950 font-semibold text-xs font-mono inline-flex items-center gap-1.5 transition-all duration-150 cursor-pointer"
                          >
                            <FiPlay className="w-3 h-3 fill-current" />
                            <span>Play</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 text-[11px] font-mono text-zinc-600 inline-flex items-center gap-1">
                            <FiLock className="w-3 h-3" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Right Column: Leaderboard while browsing games */}
          {!activePlayingGame && (
            <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6">
              <Leaderboard
                gameId={boardGame.id}
                limit={10}
                title={`${boardGame.title} — Scores`}
                unitLabel="pts"
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
