"use client";

import React, { useEffect, useState } from "react";
import { skills as initialSkills } from "../../../data/data";

interface SkillItem {
  name: string;
  color?: string;
  icon?: React.ComponentType<{ style?: React.CSSProperties }>;
}

export default function AdminSkillsPage() {
  const [skillsList, setSkillsList] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form input states
  const [name, setName] = useState("");
  const [color, setColor] = useState("#38B2AC");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch("/api/skills");
      const data = await res.json();

      const mappedSkills = data.map((item: { name: string; color: string }) => {
        const match = initialSkills.find((s) => s.name === item.name);
        return {
          name: item.name,
          color: item.color,
          icon: match?.icon,
        };
      });

      setSkillsList(mappedSkills);
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color }),
      });

      if (res.ok) {
        setName("");
        setColor("#38B2AC");
        await fetchSkills();
      }
    } catch (error) {
      console.error("Failed to add skill:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="border-b border-neutral-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Skills Dashboard</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage dynamic skills list sourced from data.ts
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-emerald-500">
          Total Skills: {skillsList.length}
        </span>
      </div>

      {/* CREATE NEW SKILL FORM */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 max-w-xl">
        <h2 className="text-sm font-semibold text-emerald-500 mb-4">Add New Skill</h2>
        <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Skill Name (e.g. Docker)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-600"
            required
          />
          <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 px-3 py-2 rounded-xl">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-6 h-6 rounded bg-transparent cursor-pointer border-0"
            />
            <span className="text-xs font-mono text-neutral-400">{color}</span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-white hover:bg-neutral-200 text-black font-medium text-sm rounded-xl transition disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      {/* SKILLS DISPLAY GRID */}
      {loading ? (
        <div className="text-neutral-500 text-sm font-mono py-12 text-center">
          Loading skills...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {skillsList.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl hover:border-neutral-700 transition"
              >
                {Icon ? (
                  <span className="text-2xl">
                    <Icon style={{ color: skill.color }} />
                  </span>
                ) : (
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: skill.color || "#fff" }}
                  />
                )}
                <span className="text-sm font-medium text-neutral-200 truncate">
                  {skill.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}