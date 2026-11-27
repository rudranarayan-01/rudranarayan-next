"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";

export default function GameScrollbar() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isScrubbingRef = useRef(false);

  const [hasScrollbar, setHasScrollbar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverPct, setHoverPct] = useState<number | null>(null);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 32,
    restDelta: 0.001,
  });

  useEffect(() => {
    const checkOverflow = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setHasScrollbar(scrollable > 4);
    };

    checkOverflow();
    const observer = new MutationObserver(checkOverflow);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    window.addEventListener("resize", checkOverflow);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, []);

  const scrollToClientX = useCallback((clientX: number, smooth = false) => {
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;

    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const doc = document.documentElement;
    const maxScroll = Math.max(0, doc.scrollHeight - doc.clientHeight);

    window.scrollTo({
      top: ratio * maxScroll,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      if (rect.width > 0) {
        const ratio = Math.min(
          1,
          Math.max(0, (e.clientX - rect.left) / rect.width)
        );
        setHoverPct(Math.round(ratio * 100));
      }

      if (isScrubbingRef.current) {
        scrollToClientX(e.clientX, false);
      }
    };

    const handlePointerUp = () => {
      if (isScrubbingRef.current) {
        isScrubbingRef.current = false;
        setIsDragging(false);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [scrollToClientX]);

  if (!hasScrollbar) return null;

  const active = isHovered || isDragging;

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label="Page scroll position"
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false);
        setHoverPct(null);
      }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        isScrubbingRef.current = true;
        setIsDragging(true);
        scrollToClientX(e.clientX, true);
      }}
      onKeyDown={(e) => {
        const step = 120;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          window.scrollBy({ top: step, behavior: "smooth" });
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          window.scrollBy({ top: -step, behavior: "smooth" });
        }
      }}
      className={`fixed top-0 left-0 right-0 z-[60] select-none cursor-ew-resize transition-[height] duration-150 ${
        active ? "h-2.5 bg-zinc-900/95" : "h-[3px] bg-zinc-900/70"
      }`}
    >
      {/* Smooth spring-interpolated fill bar */}
      <motion.div
        style={{ scaleX: smoothProgress, transformOrigin: "0% 50%" }}
        className="h-full w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.55)]"
      />

      {/* Hover / Scrub Position Pill */}
      {active && hoverPct !== null && (
        <div
          style={{ left: `${hoverPct}%` }}
          className="pointer-events-none fixed top-3 -translate-x-1/2 px-2 py-0.5 rounded bg-zinc-950/95 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 tabular-nums shadow-lg"
        >
          {hoverPct}%
        </div>
      )}
    </div>
  );
}