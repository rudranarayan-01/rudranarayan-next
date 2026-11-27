"use client";

import React, { RefObject, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { navbarData } from "../data/data";
import { motion, useMotionValue, animate } from "motion/react";
import { liVariants, tooltipVariants } from "../data/variants";
import { FiMove, FiRotateCcw } from "react-icons/fi";

interface HeaderProps {
  sectionRefs?: Record<string, RefObject<HTMLElement | null>>;
}

const Header: React.FC<HeaderProps> = ({ sectionRefs }) => {
  const pathname = usePathname();
  const router = useRouter();

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const didDragRef = useRef(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  const handleNavClick = (
    section: string,
    type: "scroll" | "link",
    url?: string
  ) => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    if (type === "link" && url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    const key = section.toLowerCase();
    const targetRef = sectionRefs?.[key];

    if (pathname === "/" && targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (key === "home") {
      router.push("/");
    } else {
      router.push(`/#${key}`);
    }
  };

  const handleResetPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    animate(x, 0, { type: "spring", stiffness: 280, damping: 24 });
    animate(y, 0, { type: "spring", stiffness: 280, damping: 24 });
    setHasMoved(false);
  };

  return (
    <>
      {/* Full-viewport boundary so the navbar never leaves the screen */}
      <div
        ref={viewportRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-2 sm:inset-4 z-40"
      />

      <nav className="pointer-events-none fixed top-0 left-0 right-0 z-50 pt-4 flex justify-center text-sm text-neutral-100">
        <motion.div
          drag
          dragConstraints={viewportRef}
          dragMomentum={true}
          dragElastic={0.12}
          dragTransition={{
            power: 0.22,
            timeConstant: 200,
            bounceStiffness: 300,
            bounceDamping: 26,
          }}
          style={{ x, y }}
          onDragStart={() => {
            didDragRef.current = true;
            setIsDragging(true);
          }}
          onDragEnd={(_, info) => {
            setIsDragging(false);
            if (
              Math.abs(info.offset.x) > 4 ||
              Math.abs(info.offset.y) > 4
            ) {
              setHasMoved(true);
            }
            setTimeout(() => {
              didDragRef.current = false;
            }, 0);
          }}
          initial={{ y: -8, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 22,
          }}
          className={`pointer-events-auto select-none flex items-center gap-1.5 md:gap-2 w-fit bg-neutral-950/90 backdrop-blur-xl border rounded-full px-3 py-1.5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.85)] transition-colors ${
            isDragging
              ? "border-emerald-400/60 cursor-grabbing"
              : "border-neutral-700 hover:border-neutral-500"
          }`}
        >
          {/* Drag Handle */}
          <div
            title="Drag navbar"
            className="px-1.5 py-1 text-neutral-500 hover:text-neutral-300 cursor-grab active:cursor-grabbing flex items-center"
          >
            <FiMove className="w-3.5 h-3.5" />
          </div>

          <ul className="flex items-center gap-2 md:gap-3 navbar">
            {navbarData.map((item, index) => {
              const Icon = item.icon;
              const size = item.size;
              return (
                <motion.li
                  key={index}
                  className="navbar-li relative cursor-pointer"
                  initial="rest"
                  whileHover={isDragging ? undefined : "hover"}
                  variants={liVariants}
                  transition={{
                    type: "spring",
                    stiffness: 240,
                    damping: 16,
                  }}
                  onClick={() =>
                    handleNavClick(item.name, item.type, item.url)
                  }
                >
                  <motion.span className="relative flex items-center justify-center">
                    <Icon style={{ fontSize: size }} />
                    <motion.span
                      className={`pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-white text-neutral-900 text-xs rounded-md whitespace-nowrap shadow-md ${
                        isDragging ? "hidden" : ""
                      }`}
                      variants={tooltipVariants}
                      transition={{ duration: 0.16 }}
                    >
                      {item.name}
                    </motion.span>
                  </motion.span>
                </motion.li>
              );
            })}
          </ul>

          {hasMoved && (
            <button
              type="button"
              title="Reset position"
              onClick={handleResetPosition}
              className="ml-0.5 p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <FiRotateCcw className="w-3 h-3" />
            </button>
          )}
        </motion.div>
      </nav>
    </>
  );
};

export default Header;