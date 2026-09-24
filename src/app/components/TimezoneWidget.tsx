"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const TimezoneWidget = () => {
  const [times, setTimes] = useState({ ist: "", est: "" });

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();

      const istString = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const estString = now.toLocaleTimeString("en-US", {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      setTimes({ ist: istString, est: estString });
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="absolute top-6 left-6 z-30 hidden sm:flex items-center gap-3 rounded-full border border-neutral-700/80 bg-neutral-900/90 px-4 py-2 text-xs text-neutral-200 shadow-lg backdrop-blur-md"
    >
      <div className="flex items-center gap-1.5">
        <span className="text-xs">🇮🇳</span>
        <span className="font-mono font-medium text-white">{times.ist || "00:00 AM"}</span>
        <span className="text-[10px] text-neutral-400 font-semibold">IST</span>
      </div>
      <span className="h-3 w-[1px] bg-neutral-700" />
      <div className="flex items-center gap-1.5">
        <span className="text-xs">🇺🇸</span>
        <span className="font-mono font-medium text-white">{times.est || "00:00 AM"}</span>
        <span className="text-[10px] text-neutral-400 font-semibold">EST</span>
      </div>
    </motion.div>
  );
};