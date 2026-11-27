/* eslint-disable no-unused-vars */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export type StageTheme = "chase-ball" | "cycle-drone";

interface ArcadeCharactersProps {
  isPlaying?: boolean;
  stageTheme?: StageTheme;
  onStageThemeChange?: (next: StageTheme) => void;
}

export default function ArcadeCharacters({
  isPlaying = false,
  stageTheme = "chase-ball",
  onStageThemeChange,
}: ArcadeCharactersProps) {
  const [hiddenByUser, setHiddenByUser] = useState(false);

  const [leftCallout, setLeftCallout] = useState<string | null>(null);
  const [leftPoke, setLeftPoke] = useState(0);

  const [bottomCallout, setBottomCallout] = useState<string | null>(null);
  const [bottomPoke, setBottomPoke] = useState(0);

  const triggerLeftReaction = () => {
    const lines =
      stageTheme === "chase-ball"
        ? ["Ball up! 🏀", "Boing!", "Nice tap!", "Watch this!"]
        : ["Radar ping!", "Boost online!", "Locked on!", "Zip!"];
    setLeftCallout(lines[leftPoke % lines.length]);
    setLeftPoke((n) => n + 1);
    setTimeout(() => setLeftCallout(null), 1300);
  };

  const triggerBottomReaction = (who: "lead" | "chaser") => {
    const leadLines =
      stageTheme === "chase-ball"
        ? ["Not today!", "Too fast! ⚡", "Keep sprinting!", "No way!"]
        : ["Pedal power!", "Full gear!", "Smooth lane!", "Turbo! ⚡"];

    const chaserLines =
      stageTheme === "chase-ball"
        ? ["Roar! 🐅", "Almost gotcha!", "Pounce!", "Grrr!"]
        : ["Catch up!", "Zoomies!", "On your tail!", "Beep-boop!"];

    const pool = who === "lead" ? leadLines : chaserLines;
    setBottomCallout(pool[bottomPoke % pool.length]);
    setBottomPoke((n) => n + 1);
    setTimeout(() => setBottomCallout(null), 1300);
  };

  // Hide character stage while a game is actively being played so gameplay stays clean
  if (isPlaying) {
    return null;
  }

  if (hiddenByUser) {
    return (
      <div className="fixed bottom-3 right-3 z-30">
        <button
          type="button"
          onClick={() => setHiddenByUser(false)}
          className="px-2.5 py-1 rounded-md border border-zinc-800 bg-[#111114]/95 hover:border-emerald-500/50 text-[11px] font-mono text-zinc-300 hover:text-white transition cursor-pointer"
        >
          Show Stage
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {/* LEFT STAGE: Monkey + Ball OR Hovering Scout Drone */}
      <div
        aria-hidden="true"
        className="hidden xl:flex fixed left-2.5 top-24 bottom-16 w-16 flex-col items-center justify-center"
      >
        <div className="relative h-64 w-14 flex flex-col items-center justify-between pointer-events-auto">
          <AnimatePresence>
            {leftCallout && (
              <motion.span
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: -2, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.9 }}
                className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-400 text-zinc-950 font-mono text-[10px] font-bold whitespace-nowrap shadow-lg z-10"
              >
                {leftCallout}
              </motion.span>
            )}
          </AnimatePresence>

          {stageTheme === "chase-ball" ? (
            <>
              <motion.div
                animate={
                  leftPoke > 0
                    ? { y: [22, -26, 22], scale: [1, 1.15, 1] }
                    : { y: [24, -8, 24] }
                }
                transition={{
                  duration: leftPoke > 0 ? 0.65 : 1.05,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-rose-500 border border-yellow-200/70 shadow-[0_0_12px_rgba(251,146,60,0.55)]"
              />

              <motion.button
                key={leftPoke}
                type="button"
                onClick={triggerLeftReaction}
                title="Tap Koko playing with the ball"
                initial={false}
                animate={
                  leftPoke > 0
                    ? { rotate: [0, -14, 14, 0], scale: [1, 1.12, 1] }
                    : { y: [0, -3, 0] }
                }
                transition={{
                  duration: leftPoke > 0 ? 0.4 : 1.05,
                  repeat: leftPoke > 0 ? 0 : Infinity,
                  ease: "easeInOut",
                }}
                className="cursor-pointer focus:outline-none"
              >
                <svg viewBox="0 0 64 64" className="w-12 h-12 drop-shadow-md">
                  <motion.path
                    d="M44 46 C57 45, 58 31, 50 28"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    animate={{
                      d: [
                        "M44 46 C57 45, 58 31, 50 28",
                        "M44 46 C58 41, 57 25, 48 23",
                        "M44 46 C57 45, 58 31, 50 28",
                      ],
                    }}
                    transition={{ duration: 1.05, repeat: Infinity }}
                  />
                  <circle cx="15" cy="24" r="6.5" fill="#b45309" />
                  <circle cx="15" cy="24" r="3.8" fill="#fcd34d" />
                  <circle cx="49" cy="24" r="6.5" fill="#b45309" />
                  <circle cx="49" cy="24" r="3.8" fill="#fcd34d" />
                  <circle cx="32" cy="25" r="15" fill="#d97706" />
                  <ellipse cx="32" cy="28" rx="11" ry="9" fill="#fde68a" />
                  <circle cx="27" cy="24.5" r="2.2" fill="#18181b" />
                  <circle cx="37" cy="24.5" r="2.2" fill="#18181b" />
                  <circle cx="26.3" cy="23.8" r="0.8" fill="#ffffff" />
                  <circle cx="36.3" cy="23.8" r="0.8" fill="#ffffff" />
                  <path
                    d="M27 32 Q32 36 37 32"
                    fill="none"
                    stroke="#78350f"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <ellipse cx="32" cy="46" rx="9.5" ry="8.5" fill="#b45309" />
                  <ellipse cx="32" cy="46.5" rx="6" ry="5.5" fill="#fde68a" />
                  <motion.path
                    d="M39 41 L44 28"
                    stroke="#d97706"
                    strokeWidth="4"
                    strokeLinecap="round"
                    animate={{
                      d: ["M39 41 L45 25", "M39 41 L42 35", "M39 41 L45 25"],
                    }}
                    transition={{ duration: 1.05, repeat: Infinity }}
                  />
                  <path
                    d="M24 42 L16 36"
                    stroke="#d97706"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                  />
                  <ellipse cx="26" cy="55" rx="4.2" ry="2.8" fill="#fcd34d" />
                  <ellipse cx="38" cy="55" rx="4.2" ry="2.8" fill="#fcd34d" />
                </svg>
              </motion.button>
            </>
          ) : (
            <motion.button
              key={`drone-${leftPoke}`}
              type="button"
              onClick={triggerLeftReaction}
              title="Tap the hovering scout drone"
              animate={{ y: [-12, 14, -12], rotate: [-4, 4, -4] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="my-auto cursor-pointer focus:outline-none"
            >
              <svg viewBox="0 0 64 64" className="w-12 h-12 drop-shadow-md">
                <line
                  x1="12"
                  y1="20"
                  x2="52"
                  y2="20"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <motion.line
                  x1="6"
                  y1="17"
                  x2="18"
                  y2="17"
                  stroke="#a7f3d0"
                  strokeWidth="2"
                  animate={{ scaleX: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                />
                <motion.line
                  x1="46"
                  y1="17"
                  x2="58"
                  y2="17"
                  stroke="#a7f3d0"
                  strokeWidth="2"
                  animate={{ scaleX: [1, 0.4, 1] }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                />
                <rect
                  x="18"
                  y="22"
                  width="28"
                  height="16"
                  rx="8"
                  fill="#18181b"
                  stroke="#34d399"
                  strokeWidth="2"
                />
                <circle cx="32" cy="30" r="5" fill="#22d3ee" />
                <circle cx="32" cy="30" r="2" fill="#09090b" />
                <motion.path
                  d="M26 42 L32 52 L38 42"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  strokeLinecap="round"
                  animate={{ opacity: [0.3, 0.9, 0.3] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                />
              </svg>
            </motion.button>
          )}

          <div className="w-10 h-1 rounded-full bg-zinc-800" />
        </div>
      </div>

      {/* BOTTOM STAGE: Boy + Chasing Tiger OR Boy Riding Cycle + Buddy */}
      <div className="fixed bottom-2 left-0 right-0 h-14 flex items-center">
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent relative">
          <motion.div
            initial={{ x: "4vw" }}
            animate={{
              x: ["4vw", "75vw", "4vw"],
              scaleX: [1, 1, -1, -1, 1],
            }}
            transition={{
              x: {
                duration: 16,
                repeat: Infinity,
                ease: "linear",
              },
              scaleX: {
                duration: 16,
                repeat: Infinity,
                times: [0, 0.49, 0.5, 0.99, 1],
                ease: "linear",
              },
            }}
            className="absolute -bottom-0.5 left-0 flex items-end gap-2 pointer-events-auto"
          >
            <AnimatePresence>
              {bottomCallout && (
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: -4 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="pointer-events-none absolute -top-9 left-10 px-2 py-0.5 rounded bg-emerald-400 text-zinc-950 font-mono text-[10px] font-bold whitespace-nowrap shadow-lg z-10"
                >
                  {bottomCallout}
                </motion.span>
              )}
            </AnimatePresence>

            {stageTheme === "chase-ball" ? (
              <>
                {/* Chasing Tiger */}
                <motion.button
                  key={`tiger-${bottomPoke}`}
                  type="button"
                  onClick={() => triggerBottomReaction("chaser")}
                  title="Click the chasing tiger"
                  animate={{ y: [0, -5, 0, -3, 0] }}
                  transition={{
                    duration: 0.34,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="cursor-pointer focus:outline-none"
                >
                  <svg viewBox="0 0 80 48" className="w-16 h-10 drop-shadow-md">
                    <motion.path
                      d="M14 24 Q3 16 6 9"
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth="4"
                      strokeLinecap="round"
                      animate={{
                        d: [
                          "M14 24 Q3 16 6 9",
                          "M14 24 Q2 24 5 18",
                          "M14 24 Q3 16 6 9",
                        ],
                      }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                    />
                    <rect
                      x="14"
                      y="18"
                      width="34"
                      height="16"
                      rx="8"
                      fill="#f97316"
                    />
                    <rect
                      x="20"
                      y="25"
                      width="20"
                      height="7"
                      rx="3.5"
                      fill="#ffedd5"
                    />
                    <path
                      d="M22 18 L20 26 M30 18 L28 26 M38 18 L36 26"
                      stroke="#18181b"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                    <circle cx="52" cy="18" r="11" fill="#f97316" />
                    <polygon points="45,10 43,3 50,9" fill="#ea580c" />
                    <polygon points="54,9 60,3 60,11" fill="#ea580c" />
                    <ellipse cx="58" cy="21" rx="5.5" ry="4" fill="#ffedd5" />
                    <circle cx="54" cy="16" r="2.2" fill="#facc15" />
                    <circle cx="54.4" cy="16" r="1.1" fill="#09090b" />
                    <circle cx="62" cy="19.5" r="1.6" fill="#18181b" />
                    <motion.line
                      x1="21"
                      y1="34"
                      x2="13"
                      y2="44"
                      stroke="#ea580c"
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      animate={{ x2: [12, 28, 12] }}
                      transition={{ duration: 0.34, repeat: Infinity }}
                    />
                    <motion.line
                      x1="42"
                      y1="34"
                      x2="51"
                      y2="44"
                      stroke="#f97316"
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      animate={{ x2: [52, 34, 52] }}
                      transition={{ duration: 0.34, repeat: Infinity }}
                    />
                  </svg>
                </motion.button>

                {/* Running Boy */}
                <motion.button
                  key={`boy-${bottomPoke}`}
                  type="button"
                  onClick={() => triggerBottomReaction("lead")}
                  title="Click the running boy"
                  animate={{ y: [0, -4, 0, -2, 0] }}
                  transition={{
                    duration: 0.32,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="cursor-pointer focus:outline-none"
                >
                  <svg viewBox="0 0 56 48" className="w-12 h-10 drop-shadow-md">
                    <circle cx="30" cy="10" r="6" fill="#fde68a" />
                    <path
                      d="M24 9 Q30 3 37 8"
                      fill="#38bdf8"
                      stroke="#0284c7"
                      strokeWidth="1.5"
                    />
                    <circle cx="33" cy="10.5" r="1.4" fill="#18181b" />
                    <path
                      d="M28 16 L24 28"
                      stroke="#34d399"
                      strokeWidth="5.5"
                      strokeLinecap="round"
                    />
                    <motion.path
                      d="M27 19 L35 15"
                      stroke="#fde68a"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      animate={{
                        d: [
                          "M27 19 L36 15",
                          "M27 19 L18 23",
                          "M27 19 L36 15",
                        ],
                      }}
                      transition={{ duration: 0.32, repeat: Infinity }}
                    />
                    <motion.path
                      d="M24 28 L33 41"
                      stroke="#60a5fa"
                      strokeWidth="3.6"
                      strokeLinecap="round"
                      animate={{
                        d: [
                          "M24 28 L34 41",
                          "M24 28 L15 39",
                          "M24 28 L34 41",
                        ],
                      }}
                      transition={{ duration: 0.32, repeat: Infinity }}
                    />
                    <motion.path
                      d="M24 28 L15 39"
                      stroke="#3b82f6"
                      strokeWidth="3.4"
                      strokeLinecap="round"
                      animate={{
                        d: [
                          "M24 28 L15 39",
                          "M24 28 L33 41",
                          "M24 28 L15 39",
                        ],
                      }}
                      transition={{ duration: 0.32, repeat: Infinity }}
                    />
                  </svg>
                </motion.button>
              </>
            ) : (
              /* Boy Riding a Cycle */
              <motion.button
                key={`cycle-${bottomPoke}`}
                type="button"
                onClick={() => triggerBottomReaction("lead")}
                title="Click the cyclist"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 0.4, repeat: Infinity }}
                className="cursor-pointer focus:outline-none"
              >
                <svg viewBox="0 0 76 48" className="w-16 h-11 drop-shadow-md">
                  {/* Rear & Front Wheels */}
                  <motion.circle
                    cx="20"
                    cy="36"
                    r="8"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    strokeDasharray="5 3"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{ transformOrigin: "20px 36px" }}
                  />
                  <motion.circle
                    cx="54"
                    cy="36"
                    r="8"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    strokeDasharray="5 3"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{ transformOrigin: "54px 36px" }}
                  />
                  {/* Frame */}
                  <path
                    d="M20 36 L34 36 L46 23 L29 23 Z M46 23 L54 36"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />
                  {/* Rider */}
                  <circle cx="38" cy="10" r="5.5" fill="#fde68a" />
                  <path
                    d="M32 9 Q38 4 44 8"
                    fill="#34d399"
                    stroke="#059669"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M37 15 L32 25"
                    stroke="#60a5fa"
                    strokeWidth="4.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M35 17 L46 22"
                    stroke="#fde68a"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom-Right Scene & Visibility Controls */}
      <div className="fixed bottom-3 right-3 z-30 flex items-center gap-1.5 pointer-events-auto">
        {onStageThemeChange && (
          <button
            type="button"
            onClick={() =>
              onStageThemeChange(
                stageTheme === "chase-ball" ? "cycle-drone" : "chase-ball"
              )
            }
            className="px-2 py-1 rounded border border-zinc-800/80 bg-[#111114]/90 hover:border-emerald-500/50 text-[10px] font-mono text-zinc-400 hover:text-emerald-300 transition cursor-pointer"
          >
            {stageTheme === "chase-ball" ? "Scene: Chase+Ball" : "Scene: Cycle+Drone"}
          </button>
        )}
        <button
          type="button"
          onClick={() => setHiddenByUser(true)}
          className="px-2 py-1 rounded border border-zinc-800/80 bg-[#111114]/85 hover:border-zinc-700 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
        >
          Hide
        </button>
      </div>
    </div>
  );
}