"use client";

import React, { useEffect, useRef } from "react";

const achievements = [
  {
    title: "🚀 Datapirates : Founder and Organizer",
    description:
      "A learning hub offering live courses, workshops, and events focused on practical, hands-on technical skills.",
  },
  {
    title: "🏆 Python Power : The Eccentric Performer",
    description:
      "Awarded for exceptional performance and innovation at an MSCB University Python workshop.",
  },
  {
    title: "🎤 Speaker at Datapirates Workshops 2024",
    description:
      "Delivered a session on building scalable web applications using the MERN stack.",
  },
  {
    title: "💡 Open Source Contributor",
    description:
      "Contributed to major open-source repositories and enhanced developer documentation.",
  },
];

export default function Achievements() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const elements = sectionRef.current?.querySelectorAll(".animate-on-scroll") || [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-neutral-950 flex flex-col justify-center items-center text-neutral-100 py-16 px-6"
    >
      <div className="max-w-5xl mx-auto">
        <h4 className="opacity-0 animate-on-scroll text-[15px] text-center text-neutral-300 font-medium fade-in-right">
          HIGHLIGHTS OF MY JOURNEY
        </h4>
        <h2 className="opacity-0 animate-on-scroll text-3xl animated-text-gradient md:text-5xl font-semibold pt-2 mb-6 md:mb-10 text-neutral-50 text-center">
          🎖 Achievements & Organizations
        </h2>

        <div className="grid md:grid-cols-2 gap-10">
          {achievements.map((item, index) => (
            <div
              key={index}
              className="opacity-0 animate-on-scroll bg-zinc-900 p-6 rounded-xl shadow-lg border border-zinc-800 hover:scale-[1.02] transition-transform duration-300 ease-out"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-zinc-400 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Inline keyframes and animation styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .fade-in-up {
          opacity: 1 !important;
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .fade-in-right {
          opacity: 1 !important;
          animation: fadeInRight 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
