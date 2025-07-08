"use client";

import React, { useEffect, useRef } from "react";
import { education1, education2 } from "../data/data";

const Education = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("fade-in-up-left");
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="pb-4 border-b border-neutral-600 opacity-0 transition-opacity duration-700"
    >
      <div className="flex flex-col">
        <h3 className="text-lg text-neutral-100 font-semibold mb-2">
          Education
        </h3>

        <div className="flex flex-col gap-5">
          <div>
            <p className="text-neutral-100 text-sm flex justify-between">
              <span className="font-semibold">{education1.college}</span>
              <span>{education1.duration}</span>
            </p>
            <p className="text-neutral-100 text-sm flex justify-between">
              <span>{education1.course}</span>{" "}
              <span>CGPA: {education1.cgpa}</span>
            </p>
          </div>

          <div>
            <p className="text-neutral-100 text-sm flex justify-between">
              <span className="font-semibold">{education2.college}</span>
              <span>{education2.duration}</span>
            </p>
            <p className="text-neutral-100 text-sm flex justify-between">
              <span>{education2.course}</span>{" "}
              <span>CGPA: {education2.cgpa}</span>
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUpLeft {
          from {
            opacity: 0;
            transform: translate3d(30px, 30px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .fade-in-up-left {
          opacity: 1 !important;
          animation: fadeInUpLeft 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Education;
