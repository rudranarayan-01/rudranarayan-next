"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HiOutlineSparkles, HiArrowRight, HiXMark } from "react-icons/hi2";

export const BlogToast = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 80, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.96 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 24,
            mass: 0.8,
          }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 rounded-2xl border border-white/10 bg-neutral-950/80 p-2 pl-4 shadow-[0_10px_38px_-10px_rgba(0,0,0,0.8),0_0_20px_0_rgba(255,255,255,0.03)] backdrop-blur-2xl group transition-all duration-300 hover:border-white/20 hover:bg-neutral-950/90"
        >
          {/* Main Clickable Link Area */}
          <a
            href="/blog"
            className="flex items-center gap-3 text-xs text-neutral-300 hover:text-white transition-colors"
          >
            {/* Minimalist Live Pill Badge */}
            {/* <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 tracking-wider uppercase">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </span>
              NEW
            </div> */}

            {/* Title & Icon */}
            <div className="flex items-center gap-1.5 font-medium whitespace-nowrap text-neutral-200 group-hover:text-white transition-colors">
              <HiOutlineSparkles className="text-amber-300 text-sm shrink-0" />
              <span>Mastering Node.js: 50 Q&A</span>
            </div>

            {/* Hover Arrow Effect */}
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-neutral-400 group-hover:bg-white/10 group-hover:text-white transition-all duration-200">
              <HiArrowRight className="text-xs transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </a>

          {/* Vertical Separator */}
          <span className="h-4 w-[1px] bg-white/10" />

          {/* Close / Dismiss Button */}
          <button
            onClick={handleDismiss}
            aria-label="Close notification"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-white/10 hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <HiXMark className="text-sm" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};