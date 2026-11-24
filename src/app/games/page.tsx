"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiLock, FiPlay, FiX } from "react-icons/fi";
import { PORTFOLIO_GAMES, PortfolioGame } from "@/data/games";
import PacketRecoveryGame from "../components/games/PacketRecoveryGame";
import Leaderboard from "../components/games/Leaderboard";
import LatencyDodgeGame from "../components/games/LatencyDodgeGame";
import IndexSprintGame from "../components/games/IndexSprintGame";
import SequenceMemoryGame from "../components/games/SequenceMemoryGame";
import GridSweepGame from "../components/games/GridSweepGame";

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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 px-4 py-8 sm:px-6 lg:px-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Bar */}
        <header className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <p className="text-xs font-mono text-emerald-400">Games</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white mt-0.5">
              {activePlayingGame ? activePlayingGame.title : "Mini-Games"}
            </h1>
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
              activePlayingGame.id === "packet-recovery" ? (
                <PacketRecoveryGame gameId="packet-recovery" compact />
              ) : activePlayingGame.id === "latency-dodge" ? (
                <LatencyDodgeGame gameId="latency-dodge" compact />
              ) : activePlayingGame.id === "index-sprint" ? (
                <IndexSprintGame gameId="index-sprint" compact />
              ) : activePlayingGame.id === "sequence-memory" ? (
                <SequenceMemoryGame gameId="sequence-memory" compact />
              ) : activePlayingGame.id === "grid-sweep" ? (
                <GridSweepGame gameId="grid-sweep" />
              ) : (
                <div className="border border-zinc-800 rounded-md bg-[#111114] h-80 flex items-center justify-center text-xs font-mono text-zinc-400">
                  {activePlayingGame.title} — not available yet.
                </div>
              )
            ) : (
              <div className="border border-zinc-800 rounded-md bg-[#111114] divide-y divide-zinc-800">
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
                      className={`group px-4 py-3.5 flex items-center justify-between gap-4 transition-colors ${
                        isPlayable
                          ? "cursor-pointer hover:bg-zinc-900/70"
                          : "opacity-60"
                      } ${isBoardSelected ? "bg-zinc-900/40" : ""}`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-sm font-medium text-zinc-100 truncate">
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
                            className="opacity-0 group-hover:opacity-100 focus:opacity-100 px-3 py-1 rounded border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-xs font-mono text-zinc-100 inline-flex items-center gap-1.5 transition-opacity cursor-pointer"
                          >
                            <FiPlay className="w-3 h-3" />
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
