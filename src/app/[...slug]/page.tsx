"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import PacketRecoveryGame from "../components/games/PacketRecoveryGame";

export default function CatchErrorRoutes() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center px-4 sm:px-6 lg:px-10 py-10 font-sans">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <p className="text-xs font-mono text-emerald-400">
              404 · Route Missing
            </p>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mt-1">
              This page drifted off the server.
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Catch <span className="text-emerald-400 font-mono">200 OK</span>{" "}
              packets, dodge{" "}
              <span className="text-rose-400 font-mono">404 / ERR</span> bugs,
              and claim a spot on the leaderboard.
            </p>
          </div>

          <Link
            href="/"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-200 transition"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>

        <PacketRecoveryGame gameId="packet-recovery" />
      </div>
    </div>
  );
}