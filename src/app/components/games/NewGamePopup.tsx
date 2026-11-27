"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { HiArrowRight, HiXMark } from "react-icons/hi2";
import { IoGameController } from "react-icons/io5";

interface NewGameToastProps {
  /** Delay before sliding in (ms) */
  delayMs?: number;
}

export const NewGameToast: React.FC<NewGameToastProps> = ({
  delayMs = 1200,
}) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/games")) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [pathname, delayMs]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsVisible(false);
  };

  const handleNavigate = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 90, y: 8, scale: 0.94 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 90, y: 6, scale: 0.94 }}
          transition={{
            type: "spring",
            stiffness: 290,
            damping: 22,
            mass: 0.85,
          }}
          className="fixed bottom-20 right-6 z-50 overflow-hidden rounded-xl border border-emerald-500/30 bg-[#0c0f10]/90 p-1.5 pl-3.5 shadow-[0_14px_40px_-10px_rgba(0,0,0,0.9),0_0_24px_-6px_rgba(16,185,129,0.25)] backdrop-blur-2xl group transition-colors duration-300 hover:border-emerald-400/55"
        >
          {/* Animated top HUD scanline */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              repeat: Infinity,
              repeatDelay: 3.2,
              duration: 1.4,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute top-0 left-0 h-[1.5px] w-1/2 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80"
          />

          <div className="relative flex items-center gap-3">
            <Link
              href="/games"
              onClick={handleNavigate}
              className="flex items-center gap-3 text-xs font-mono"
            >
              {/* Animated Controller Badge */}
              <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <IoGameController className="text-sm transition-transform duration-200 group-hover:rotate-[-8deg] group-hover:scale-110" />
              </div>

              {/* Label + Play CTA */}
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-300 uppercase border border-emerald-500/25">
                  New
                </span>
                <span className="font-medium text-zinc-100 group-hover:text-white transition-colors">
                  Game Drop
                </span>
              </div>

              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-bold tracking-wide text-zinc-950 uppercase transition-all duration-200 group-hover:bg-emerald-400">
                <span>Play</span>
                <HiArrowRight className="text-xs transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </Link>

            <span className="h-4 w-[1px] bg-white/10" />

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close notification"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/10 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <HiXMark className="text-sm" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};