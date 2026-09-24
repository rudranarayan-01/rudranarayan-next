"use client";

import React, { useState } from "react";
import { FiBox, FiExternalLink, FiCopy, FiCheck, FiTerminal } from "react-icons/fi";

const packages = [
  {
    name: "@rudranarayan01/logaccent",
    installCmd: "npm i @rudranarayan01/logaccent",
    description:
      "Lightweight terminal logger and accent utility built for Node.js backends. Formats server logs with custom color palettes and timestamps.",
    version: "v0.3.1",
    link: "https://www.npmjs.com/package/@rudranarayan01/logaccent",
    tags: ["Node.js", "Express", "CLI"],
  },
  {
    name: "@rudranarayan01/fetch-armor",
    installCmd: "npm i @rudranarayan01/fetch-armor",
    description:
      "Wrapper around modern Fetch API with built-in retry mechanisms, timeout controls, and request rate-limiting protection for Node/Browser environments.",
    version: "v1.0.0",
    link: "https://www.npmjs.com/package/@rudranarayan01/fetch-armor",
    tags: ["TypeScript", "API", "Resilience"],
  },
];

export const OpenSourceGrid = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section id="open-source" className="w-full bg-neutral-950 py-20 px-4 text-neutral-100">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-2">
              <FiTerminal className="text-sm" /> Community & Tooling
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              NPM Packages & Open Source
            </h2>
          </div>
          <p className="text-sm text-neutral-400 max-w-md">
            Production-grade utilities and developer tools built to improve backend velocity and application resilience.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((pkg, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-900/90 hover:shadow-2xl hover:shadow-emerald-950/20"
            >
              <div>
                {/* Card Top Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-base sm:text-lg truncate">
                    <FiBox className="shrink-0 text-emerald-400" />
                    <span className="truncate">{pkg.name}</span>
                  </div>
                  <span className="shrink-0 rounded-full bg-neutral-800 border border-neutral-700/60 px-2.5 py-0.5 text-[11px] font-mono text-neutral-400">
                    {pkg.version}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
                  {pkg.description}
                </p>

                {/* Command Copy Box */}
                <div className="flex items-center justify-between rounded-xl bg-neutral-950 border border-neutral-800 px-3.5 py-2 font-mono text-xs text-neutral-300 mb-6">
                  <span className="truncate text-neutral-400">$ {pkg.installCmd}</span>
                  <button
                    onClick={() => handleCopy(pkg.installCmd, idx)}
                    className="ml-2 flex items-center gap-1 text-neutral-400 hover:text-emerald-400 transition-colors shrink-0"
                    title="Copy command"
                  >
                    {copiedIndex === idx ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                        <FiCheck /> Copied
                      </span>
                    ) : (
                      <FiCopy className="text-sm" />
                    )}
                  </button>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-800/80">
                <div className="flex items-center gap-2">
                  {pkg.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] rounded-md bg-neutral-800/60 text-neutral-400 px-2 py-0.5 border border-neutral-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <a
                  href={pkg.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-emerald-400 font-medium transition-colors"
                >
                  <span>npm</span>
                  <FiExternalLink className="text-xs" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};