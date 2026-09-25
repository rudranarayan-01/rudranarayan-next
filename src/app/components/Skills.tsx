"use client";

import React, { useEffect, useState } from "react";
import { skills as initialSkills } from "../data/data";
import { motion } from "motion/react";
import { fadeInUp, rotateYVariant } from "../data/variants";

interface SkillItem {
  name: string;
  color?: string;
  icon?: React.ComponentType<{ style?: React.CSSProperties }>;
}

const Skills = () => {
  const [skillsList, setSkillsList] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSkills() {
      try {
        const res = await fetch("/api/skills", { cache: "no-store" });
        const data = await res.json();

        // Match fetched names with local icon components from data.ts
        const mappedSkills = data.map((item: { name: string; color?: string }) => {
          const match = initialSkills.find((s) => s.name === item.name);
          return {
            name: item.name,
            color: item.color || match?.color || "#ffffff",
            icon: match?.icon,
          };
        });

        setSkillsList(mappedSkills);
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSkills();
  }, []);

  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      className="bg-neutral-950 flex flex-col justify-center text-neutral-100"
    >
      <h2 className="text-lg font-semibold mb-2 self-start text-neutral-100">
        Tech Stack
      </h2>

      <div className="flex gap-1.5 md:gap-2 flex-wrap max-w-3xl">
        {loading ? (
          <div className="text-xs font-mono text-neutral-500 py-2">
            Loading skills...
          </div>
        ) : (
          skillsList.map((skill, index) => {
            const Icon = skill.icon;
            const color = skill.color;
            return (
              <motion.span
                variants={rotateYVariant}
                initial="initial"
                whileInView="whileInView"
                whileHover={{ rotateZ: -7, rotateX: 5 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                key={index}
                className="inline-flex justify-center items-center gap-2 px-3 rounded-full py-1 text-xs md:text-sm border border-neutral-600"
              >
                {Icon ? (
                  <Icon style={{ color: color }} />
                ) : (
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: color || "#fff" }}
                  />
                )}
                {skill.name}
              </motion.span>
            );
          })
        )}
      </div>
    </motion.section>
  );
};

export default Skills;