"use client";

import React, { useEffect, useRef, forwardRef } from "react";
import Skills from "./Skills";
import Education from "./Education";
import PersonalInfo from "./PersonalInfo";

const AboutMe = forwardRef<HTMLElement>((_, ref) => {
  const h4Ref = useRef<HTMLHeadingElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeIn");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    [h4Ref.current, h2Ref.current, contentRef.current].forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="bg-neutral-950 flex flex-col items-center text-neutral-50 px-4 lg:px-6 py-16"
    >
      <h4
        ref={h4Ref}
        className="opacity-0 text-[15px] text-center text-neutral-300 font-medium animate-on-scroll-right"
      >
        GET TO KNOW ME
      </h4>

      <h2
        ref={h2Ref}
        className="opacity-0 text-3xl animated-text-gradient md:text-5xl font-semibold pt-2 mb-6 md:mb-10 text-neutral-50 animate-on-scroll-up"
      >
        About Me
      </h2>

      <div className="flex max-lg:flex-col max-w-4xl w-full">
        <PersonalInfo />
        <div
          ref={contentRef}
          className="opacity-0 animate-on-scroll-up lg:w-2/3 p-2 lg:p-6 space-y-4 lg:border-l lg:border-neutral-600"
        >
          <Education />
          <Skills />
        </div>
      </div>

      {/* Custom inline styles for animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInRight {
          0% {
            opacity: 0;
            transform: translateX(40px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-on-scroll-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-on-scroll-right {
          animation: fadeInRight 0.6s ease-out forwards;
        }

        .animate-fadeIn {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  );
});

AboutMe.displayName = "AboutMe";
export default AboutMe;
