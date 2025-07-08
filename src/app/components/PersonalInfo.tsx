"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { personalInfo } from "../data/data";
import { GrLocation } from "react-icons/gr";

const PersonalInfo = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const children = root.querySelectorAll(".fade-in-up-right");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animated");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    children.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="lg:w-1/3 lg:max-w-3xl text-center flex flex-col items-center gap-3 pt-6 lg:px-6"
    >
      {/* Avatar & Glow */}
      <div className="relative flex items-center justify-center w-[180px] h-[180px] group fade-in-up-right opacity-0">
        {/* Pulsing Radar Ring */}
        <div className="absolute rounded-full border border-neutral-700 w-[180px] h-[180px] animate-pulse-ring z-0" />

        {/* Solid Border Ring */}
        <div className="absolute rounded-full border-[2px] border-neutral-700 w-[180px] h-[180px] z-0" />

        {/* Glow on Hover */}
        <div className="absolute w-[180px] h-[180px] rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-400 blur-xl opacity-0 group-hover:opacity-100 scale-100 group-hover:scale-105 transition duration-500 z-0" />

        {/* Image */}
        <div className="relative z-10 w-[170px] h-[170px] rounded-full overflow-hidden border-[2px] border-black bg-black transform transition-transform duration-300 group-hover:scale-105">
          <Image
            src={personalInfo.pfp}
            alt={personalInfo.alt}
            width={170}
            height={170}
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Summary */}
      <p className="text-neutral-100 border-b border-neutral-600 pb-2 fade-in-up-right opacity-0">
        {personalInfo.summary}
      </p>

      {/* Location */}
      <div className="hidden lg:flex items-center gap-2 text-neutral-100 fade-in-up-right opacity-0">
        <GrLocation className="text-neutral-100" />
        <span>{personalInfo.location}</span>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes fadeInUpRight {
          from {
            opacity: 0;
            transform: translate3d(-30px, 30px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .fade-in-up-right.animated {
          opacity: 1 !important;
          animation: fadeInUpRight 0.7s ease-out forwards;
        }

        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.25);
            opacity: 0;
          }
        }

        .animate-pulse-ring {
          animation: pulseRing 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PersonalInfo;
