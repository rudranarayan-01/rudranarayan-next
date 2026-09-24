"use client";

import React, { useState } from "react";

interface SkillCategory {
  category: string;
  skills: { name: string; level: number }[];
}

const INITIAL_SKILLS: SkillCategory[] = [
  {
    category: "Languages & Core Frameworks",
    skills: [
      { name: "TypeScript", level: 90 },
      { name: "Python", level: 85 },
      { name: "React / Next.js", level: 92 },
      { name: "Express.js", level: 88 },
    ],
  },
  {
    category: "Databases & Cloud Deployments",
    skills: [
      { name: "MongoDB / Mongoose", level: 85 },
      { name: "SQLite", level: 80 },
      { name: "Render", level: 82 },
      { name: "Vite", level: 90 },
    ],
  },
  {
    category: "Computer Vision & Machine Learning",
    skills: [
      { name: "OpenCV", level: 80 },
      { name: "YOLO Detection Models", level: 78 },
    ],
  },
];

export default function SkillsPage() {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>(INITIAL_SKILLS);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Languages & Core Frameworks");
  const [newSkillLevel, setNewSkillLevel] = useState(80);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setSkillCategories(
      skillCategories.map((cat) => {
        if (cat.category === newSkillCategory) {
          return {
            ...cat,
            skills: [...cat.skills, { name: newSkillName.trim(), level: Number(newSkillLevel) }],
          };
        }
        return cat;
      })
    );
    setNewSkillName("");
  };

  const handleRemoveSkill = (catName: string, skillName: string) => {
    setSkillCategories(
      skillCategories.map((cat) => {
        if (cat.category === catName) {
          return {
            ...cat,
            skills: cat.skills.filter((s) => s.name !== skillName),
          };
        }
        return cat;
      })
    );
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Technical Stack & Skills</h1>
        <p className="text-xs text-zinc-400 mt-1.5 font-mono">
          Manage core competencies, proficiency metrics, and backend category groupings.
        </p>
      </div>

      {/* Add Skill Quick Form */}
      <form onSubmit={handleAddSkill} className="p-5 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
          Quick Add Skill
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Skill (e.g. Tailwind CSS)"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 font-mono"
          />

          <select
            value={newSkillCategory}
            onChange={(e) => setNewSkillCategory(e.target.value)}
            className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 font-mono"
          >
            {skillCategories.map((c) => (
              <option key={c.category} value={c.category}>
                {c.category}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl">
            <span className="text-[10px] font-mono text-zinc-400">Level:</span>
            <input
              type="range"
              min="10"
              max="100"
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(Number(e.target.value))}
              className="w-full accent-white"
            />
            <span className="text-xs font-mono text-white font-semibold w-8">{newSkillLevel}%</span>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
          >
            + Add Competency
          </button>
        </div>
      </form>

      {/* Categories Showcase */}
      <div className="space-y-6">
        {skillCategories.map((catGroup) => (
          <div key={catGroup.category} className="p-6 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl space-y-5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              {catGroup.category}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {catGroup.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="p-3.5 bg-zinc-900/60 border border-zinc-800/60 rounded-xl space-y-2 group hover:border-zinc-700/60 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{skill.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-zinc-400 text-[11px]">{skill.level}%</span>
                      <button
                        onClick={() => handleRemoveSkill(catGroup.category, skill.name)}
                        className="text-zinc-600 hover:text-red-400 transition-colors"
                        title="Remove Skill"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-white h-full transition-all duration-500"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}