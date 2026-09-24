"use client";
import React from "react";
import { FiCheckCircle, FiActivity, FiGitCommit, FiCpu } from "react-icons/fi";

export const SystemMetrics = () => {
  return (
    <div className="w-full border-y border-neutral-800 bg-neutral-950/50 backdrop-blur-md py-4">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        
        <div className="flex items-center gap-3 p-2 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
          <FiCheckCircle className="text-emerald-400 text-base shrink-0" />
          <div>
            <p className="text-neutral-500 font-medium">System Status</p>
            <p className="text-neutral-200 font-semibold">100% Operational</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
          <FiActivity className="text-blue-400 text-base shrink-0" />
          <div>
            <p className="text-neutral-500 font-medium">Primary Stack</p>
            <p className="text-neutral-200 font-semibold">Node.js / React / AI</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
          <FiGitCommit className="text-purple-400 text-base shrink-0" />
          <div>
            <p className="text-neutral-500 font-medium">GitHub Status</p>
            <p className="text-neutral-200 font-semibold">Active Commits</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
          <FiCpu className="text-amber-400 text-base shrink-0" />
          <div>
            <p className="text-neutral-500 font-medium">Architecture Latency</p>
            <p className="text-neutral-200 font-semibold">&lt; 45ms Avg</p>
          </div>
        </div>

      </div>
    </div>
  );
};