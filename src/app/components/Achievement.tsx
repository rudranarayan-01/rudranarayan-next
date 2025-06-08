"use client";
import { useRef } from "react";
import { useIsVisible } from "../../../hooks/useIsVisible";

interface Achievement {
  title: string;
  description: string;
}

const achievementsData: Achievement[] = [
  { title: "Top Performer Award", description: "Awarded by MSCB University in 2025" },
  { title: "Self‑Driving Car Workshop", description: "Completed live project track with IoT integration" },
  // add more...
];

export default function Achievements() {
  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-3xl font-semibold text-center mb-8 text-gray-900 dark:text-white">
        Achievements & Behind Organizations
      </h2>
      <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
        {achievementsData.map((item, idx) => (
          <AchievementCard key={idx} {...item} />
        ))}
      </div>
    </section>
  );
}

function AchievementCard({ title, description }: Achievement) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIsVisible(ref, 0.15);

  return (
    <div
      ref={ref}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-opacity transform ease-out duration-700
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`
      }
    >
      <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
