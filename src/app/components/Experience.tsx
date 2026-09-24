"use client";

import React, { useEffect, useRef, useState } from "react";

interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Dynamic Data from API
  useEffect(() => {
    async function fetchExperiences() {
      try {
        const res = await fetch("/api/experiences", { cache: "no-store" });
        const data = await res.json();
        setExperiences(data);
      } catch (err) {
        console.error("Failed to load experiences:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchExperiences();
  }, []);

  // 2. Attach IntersectionObserver once data is loaded & rendered
  useEffect(() => {
    if (loading || experiences.length === 0) return;

    const section = sectionRef.current;
    if (!section) return;

    const elements = section.querySelectorAll(".animate-on-scroll");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animated");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [loading, experiences]);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="bg-black text-white py-24 px-4 md:px-16"
    >
      <h4 className="text-[15px] text-center text-neutral-300 font-medium opacity-0 animate-on-scroll fade-right">
        JOURNEY THROUGH MY PROFESSIONAL GROWTH.
      </h4>
      <h2 className="text-3xl md:text-5xl animated-text-gradient font-semibold pt-2 mb-6 md:mb-10 text-center text-neutral-100 opacity-0 animate-on-scroll fade-up">
        Experience
      </h2>

      <div className="relative flex flex-col gap-16 max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center text-neutral-500 font-mono text-xs py-10">
            Loading experience data...
          </div>
        ) : (
          experiences.map((exp, i) => (
            <div
              key={i}
              className={`group relative bg-[#111] border border-gray-800 rounded-xl p-6 shadow-xl hover:shadow-blue-600/30 transition duration-300 overflow-hidden opacity-0 animate-on-scroll fade-up delay-${i % 4}`}
            >
              <div className="absolute top-0 left-0 h-full w-1 animated-text-gradient rounded-full group-hover:scale-y-110 origin-top transition" />
              <div className="pl-4">
                <h3 className="text-2xl font-semibold animated-text-gradient group-hover:text-white transition">
                  {exp.role}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {exp.company} — {exp.duration}
                </p>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  {exp.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .fade-up {
          animation: fadeUp 0.6s ease-out forwards;
        }

        .fade-right {
          animation: fadeRight 0.6s ease-out forwards;
        }

        .delay-0 {
          animation-delay: 0s;
        }

        .delay-1 {
          animation-delay: 0.2s;
        }

        .delay-2 {
          animation-delay: 0.4s;
        }

        .delay-3 {
          animation-delay: 0.6s;
        }

        .animated {
          opacity: 1 !important;
        }

        .animate-on-scroll {
          opacity: 0;
        }

        .delay-0.fade-up.animated {
          animation-delay: 0s !important;
        }

        .delay-1.fade-up.animated {
          animation-delay: 0.2s !important;
        }

        .delay-2.fade-up.animated {
          animation-delay: 0.4s !important;
        }

        .delay-3.fade-up.animated {
          animation-delay: 0.6s !important;
        }
      `}</style>
    </section>
  );
}