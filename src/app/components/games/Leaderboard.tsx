"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";

export interface LeaderboardEntry {
  _id: string;
  playerName: string;
  score: number;
  createdAt?: string;
}

interface LeaderboardProps {
  gameId: string;
  limit?: number;
  refreshTrigger?: number;
  title?: string;
  unitLabel?: string;
  className?: string;
}

export default function Leaderboard({
  gameId,
  limit = 10,
  refreshTrigger = 0,
  title = "Leaderboard",
  unitLabel = "pts",
  className = "",
}: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadScores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `/api/leaderboard?gameId=${encodeURIComponent(gameId)}&limit=${limit}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (!res.ok || !json.success || !Array.isArray(json.data)) {
        throw new Error(json.error || "Could not load leaderboard.");
      }
      setEntries(json.data);
    } catch (err: any) {
      console.error("Leaderboard load error:", err);
      setError(err.message || "Failed to load leaderboard.");
    } finally {
      setLoading(false);
    }
  }, [gameId, limit]);

  useEffect(() => {
    loadScores();
  }, [loadScores, refreshTrigger]);

  return (
    <div
      className={`border border-zinc-800 rounded-xl bg-[#111114] overflow-hidden ${className}`}
    >
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-zinc-200">
            {title}
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            top {limit}
          </span>
        </div>

        <button
          type="button"
          onClick={loadScores}
          disabled={loading}
          title="Refresh leaderboard"
          className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition disabled:opacity-40 cursor-pointer"
        >
          <FiRefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`}
          />
        </button>
      </div>

      {loading && entries.length === 0 ? (
        <div className="p-6 text-center text-xs font-mono text-zinc-500">
          Loading scores...
        </div>
      ) : error ? (
        <div className="p-6 text-center space-y-2">
          <p className="text-xs font-mono text-rose-400">{error}</p>
          <button
            type="button"
            onClick={loadScores}
            className="text-[11px] font-mono text-zinc-300 hover:text-white underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div className="p-6 text-center text-xs font-mono text-zinc-500">
          No scores yet. Post the first run.
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/70 text-xs font-mono">
          {entries.map((entry, idx) => {
            const rankColor =
              idx === 0
                ? "text-amber-300"
                : idx === 1
                  ? "text-zinc-200"
                  : idx === 2
                    ? "text-amber-600"
                    : "text-zinc-500";

            return (
              <div
                key={entry._id}
                className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-zinc-900/40 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-5 tabular-nums font-semibold ${rankColor}`}>
                    #{idx + 1}
                  </span>
                  <span className="text-zinc-100 truncate">
                    {entry.playerName}
                  </span>
                </div>

                <span className="text-emerald-400 font-semibold tabular-nums shrink-0">
                  {entry.score}{" "}
                  <span className="text-[10px] font-normal text-zinc-500">
                    {unitLabel}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}