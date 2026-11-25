"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import { FiArrowLeft, FiRefreshCw, FiSearch, FiTrash2 } from "react-icons/fi";
import { PORTFOLIO_GAMES } from "@/data/games";

interface LeaderboardEntry {
  _id: string;
  gameId: string;
  gameTitle: string;
  playerName: string;
  score: number;
  playsCount: number;
  ipAddress: string;
  createdAt: string;
  updatedAt: string;
}

interface GameSummary {
  gameId: string;
  gameTitle: string;
  totalPlays: number;
  entriesCount: number;
  highestScore: number;
  topPlayer: string;
  uniqueIps: number;
}

interface IpSummary {
  ipAddress: string;
  totalPlays: number;
  peakScore: number;
  players: string[];
  games: string[];
  lastSeen: string;
}

interface TelemetryPayload {
  kpis: {
    totalPlays: number;
    totalRecords: number;
    highestScore: number;
    uniquePlayers: number;
    uniqueIps: number;
  };
  byGame: GameSummary[];
  byIp: IpSummary[];
  leaderboard: LeaderboardEntry[];
}

export default function AdminGamesDashboardPage() {
  const [selectedGameId, setSelectedGameId] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<TelemetryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTelemetry = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedGameId !== "ALL") params.set("gameId", selectedGameId);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await fetch(`/api/admin/games?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load game telemetry.");
      }
      setData(json);
    } catch (err: any) {
      toast.error(err.message || "Could not load telemetry.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedGameId]);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  const handleDeleteEntry = async (id: string) => {
    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/games?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Delete failed.");
      }
      toast.success("Score entry removed.");
      await fetchTelemetry();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove entry.");
    } finally {
      setDeletingId(null);
    }
  };

  const kpis = data?.kpis || {
    totalPlays: 0,
    totalRecords: 0,
    highestScore: 0,
    uniquePlayers: 0,
    uniqueIps: 0,
  };

  return (
    <div className="min-h-screen text-zinc-100 px-4 py-8 sm:px-6 lg:px-10 font-sans">
      <Toaster position="top-right" theme="dark" richColors />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
          <div>
            <p className="text-xs font-mono text-emerald-400">
              Admin Telemetry // Game Zone
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-white mt-0.5">
              Game Activity & Leaderboard Monitor
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Track high scores, player sessions, per-game play volume, and
              source IP addresses.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchTelemetry}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-200 transition cursor-pointer"
            >
              <FiRefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`}
              />
              <span>Refresh</span>
            </button>

            <Link
              href="/games"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-200 transition"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Game Zone</span>
            </Link>
          </div>
        </header>

        {/* KPI Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="border border-zinc-800 rounded-xl bg-[#111114] p-4">
            <span className="text-[10px] text-zinc-500 block">
              HIGHEST SCORE
            </span>
            <span className="text-xl font-semibold text-emerald-400 tabular-nums mt-1 block">
              {kpis.highestScore} pts
            </span>
          </div>
          <div className="border border-zinc-800 rounded-xl bg-[#111114] p-4">
            <span className="text-[10px] text-zinc-500 block">TOTAL PLAYS</span>
            <span className="text-xl font-semibold text-white tabular-nums mt-1 block">
              {kpis.totalPlays}
            </span>
          </div>
          <div className="border border-zinc-800 rounded-xl bg-[#111114] p-4">
            <span className="text-[10px] text-zinc-500 block">PLAYERS</span>
            <span className="text-xl font-semibold text-zinc-100 tabular-nums mt-1 block">
              {kpis.uniquePlayers}
            </span>
          </div>
          <div className="border border-zinc-800 rounded-xl bg-[#111114] p-4">
            <span className="text-[10px] text-zinc-500 block">UNIQUE IPS</span>
            <span className="text-xl font-semibold text-cyan-400 tabular-nums mt-1 block">
              {kpis.uniqueIps}
            </span>
          </div>
        </section>

        {/* Filters */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player name, IP address, or game..."
              className="w-full bg-[#111114] border border-zinc-800 focus:border-emerald-500/60 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setSelectedGameId("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border whitespace-nowrap transition cursor-pointer ${
                selectedGameId === "ALL"
                  ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold"
                  : "bg-[#111114] border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All Games
            </button>
            {PORTFOLIO_GAMES.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGameId(g.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border whitespace-nowrap transition cursor-pointer ${
                  selectedGameId === g.id
                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold"
                    : "bg-[#111114] border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {g.title}
              </button>
            ))}
          </div>
        </section>

        {/* Per-Game Breakdown + IP Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Game Popularity & High Score Table */}
          <section className="lg:col-span-6 border border-zinc-800 rounded-xl bg-[#111114] overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                Plays & Top Scores by Game
              </h2>
              <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
                {data?.byGame.length || 0} games
              </span>
            </div>

            <div className="divide-y divide-zinc-800/80 text-xs font-mono">
              {!data || data.byGame.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  No game play data yet.
                </div>
              ) : (
                data.byGame.map((g) => (
                  <div
                    key={g.gameId}
                    className="px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-zinc-100 font-medium truncate">
                        {g.gameTitle}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate">
                        Leader:{" "}
                        <span className="text-zinc-300">{g.topPlayer}</span> ·{" "}
                        {g.uniqueIps} IPs
                      </p>
                    </div>
                    <div className="text-right shrink-0 tabular-nums">
                      <p className="text-emerald-400 font-semibold">
                        {g.highestScore} pts
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        {g.totalPlays} {g.totalPlays === 1 ? "play" : "plays"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Source IP Activity Monitor */}
          <section className="lg:col-span-6 border border-zinc-800 rounded-xl bg-[#111114] overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                Visitor IP Activity
              </h2>
              <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
                {data?.byIp.length || 0} IPs
              </span>
            </div>

            <div className="divide-y divide-zinc-800/80 text-xs font-mono">
              {!data || data.byIp.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  No IP records match filter.
                </div>
              ) : (
                data.byIp.slice(0, 12).map((ipRow) => (
                  <div
                    key={ipRow.ipAddress}
                    className="px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-cyan-300 font-medium truncate">
                        {ipRow.ipAddress}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        Players: {ipRow.players.join(", ")}
                      </p>
                      <p className="text-[10px] text-zinc-500 truncate">
                        Games: {ipRow.games.join(", ")}
                      </p>
                    </div>
                    <div className="text-right shrink-0 tabular-nums">
                      <p className="text-white font-semibold">
                        {ipRow.totalPlays} plays
                      </p>
                      <p className="text-[11px] text-emerald-400">
                        Peak: {ipRow.peakScore}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Full Leaderboard & Player Log Table */}
        <section className="border border-zinc-800 rounded-xl bg-[#111114] overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300">
              Player Leaderboard & Session Log
            </h2>
            <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
              {data?.leaderboard.length || 0} entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 uppercase bg-zinc-950/60">
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Player</th>
                  <th className="py-2.5 px-4">Game</th>
                  <th className="py-2.5 px-4">Score</th>
                  <th className="py-2.5 px-4">Plays</th>
                  <th className="py-2.5 px-4">IP Address</th>
                  <th className="py-2.5 px-4">Updated</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {!data || data.leaderboard.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 px-4 text-center text-zinc-500"
                    >
                      No leaderboard records found.
                    </td>
                  </tr>
                ) : (
                  data.leaderboard.map((row, idx) => (
                    <tr
                      key={row._id}
                      className="hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-zinc-500 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 text-white font-medium">
                        {row.playerName}
                      </td>
                      <td className="py-2.5 px-4 text-zinc-300">
                        {row.gameTitle}
                      </td>
                      <td className="py-2.5 px-4 text-emerald-400 font-semibold tabular-nums">
                        {row.score} pts
                      </td>
                      <td className="py-2.5 px-4 text-zinc-300 tabular-nums">
                        {row.playsCount}
                      </td>
                      <td className="py-2.5 px-4 text-cyan-300">
                        {row.ipAddress}
                      </td>
                      <td className="py-2.5 px-4 text-zinc-500 whitespace-nowrap">
                        {new Date(
                          row.updatedAt || row.createdAt,
                        ).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={deletingId === row._id}
                          onClick={() => handleDeleteEntry(row._id)}
                          title="Delete entry"
                          className="p-1.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800/80 transition cursor-pointer disabled:opacity-40"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
