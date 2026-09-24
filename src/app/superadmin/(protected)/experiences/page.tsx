"use client";

import React, { useState } from "react";

interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  type: "Full-time" | "Contract" | "Advisory" | "Part-time";
  period: string;
  isCurrent: boolean;
  highlights: string[];
  skillsUsed: string[];
}

const INITIAL_EXPERIENCES: Experience[] = [
  {
    id: "1",
    role: "Lead Full-Stack Systems Engineer",
    company: "HouseXpertz Platform",
    location: "Remote",
    type: "Full-time",
    period: "2026 - Present",
    isCurrent: true,
    highlights: [
      "Engineered an automated handyman service ecosystem using Next.js, Express, and MongoDB.",
      "Architected a generative AI intent-routing pipeline to process customer requests in real-time.",
      "Optimized query response latency by 35% through custom Mongoose database indexing strategies.",
    ],
    skillsUsed: ["Next.js", "TypeScript", "Express", "MongoDB", "Tailwind CSS"],
  },
  {
    id: "2",
    role: "Computer Vision & ML Specialist",
    company: "Supermarket AI Guard Pro Project",
    location: "On-site / Lab",
    type: "Contract",
    period: "2025 - 2026",
    isCurrent: false,
    highlights: [
      "Developed high-throughput automated video tracking scripts combining OpenCV and custom YOLO models.",
      "Implemented item-level recognition layers to simulate real-time automated security tracking.",
      "Reduced false-positive object detection rates by 22% during test simulations.",
    ],
    skillsUsed: ["Python", "OpenCV", "YOLO", "PyTorch"],
  },
  {
    id: "3",
    role: "Full-Stack Web Developer",
    company: "National News Media Platform",
    location: "Hybrid",
    type: "Full-time",
    period: "2025 - 2025",
    isCurrent: false,
    highlights: [
      "Built dynamic layout branding and news presentation components across a nationwide portal.",
      "Integrated lightweight SQLite database configurations to streamline server-side rendering pipelines.",
    ],
    skillsUsed: ["React", "Express", "SQLite", "Vite", "TypeScript"],
  },
];

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>(INITIAL_EXPERIENCES);
  const [filterType, setFilterType] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form State
  const [formData, setFormData] = useState({
    role: "",
    company: "",
    location: "",
    type: "Full-time" as Experience["type"],
    period: "",
    isCurrent: false,
    highlights: "",
    skillsUsed: "",
  });

  const filteredExperiences = experiences.filter(
    (exp) => filterType === "All" || exp.type === filterType
  );

  const handleCreateExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role || !formData.company) return;

    const newExp: Experience = {
      id: Date.now().toString(),
      role: formData.role,
      company: formData.company,
      location: formData.location || "Remote",
      type: formData.type,
      period: formData.period || "2026 - Present",
      isCurrent: formData.isCurrent,
      highlights: formData.highlights.split("\n").filter((line) => line.trim() !== ""),
      skillsUsed: formData.skillsUsed.split(",").map((s) => s.trim()).filter(Boolean),
    };

    setExperiences([newExp, ...experiences]);
    setIsModalOpen(false);
    setFormData({
      role: "",
      company: "",
      location: "",
      type: "Full-time",
      period: "",
      isCurrent: false,
      highlights: "",
      skillsUsed: "",
    });
  };

  const handleDelete = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Work Experience & Timeline</h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Manage career history, key accomplishments, technical stack badges, and roles.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-semibold rounded-xl hover:bg-zinc-200 transition-colors w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Position</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["All", "Full-time", "Contract", "Advisory", "Part-time"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
              filterType === type
                ? "bg-zinc-800 text-white border border-zinc-700/80 shadow-sm"
                : "bg-zinc-950 text-zinc-400 border border-zinc-800/80 hover:text-white"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="space-y-5">
        {filteredExperiences.map((exp) => (
          <div
            key={exp.id}
            className="p-6 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-200 group relative"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {exp.role}
                  </h2>
                  {exp.isCurrent && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  <span className="text-zinc-200 font-medium">{exp.company}</span> • {exp.location}
                </p>
              </div>

              <div className="flex items-center gap-3 self-start md:self-auto">
                <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg">
                  {exp.period}
                </span>
                <span className="text-[11px] font-mono text-zinc-500 border border-zinc-800/80 px-2.5 py-1 rounded-lg">
                  {exp.type}
                </span>
              </div>
            </div>

            {/* Highlights List */}
            {exp.highlights.length > 0 && (
              <ul className="space-y-1.5 my-3 pl-4 list-disc text-xs text-zinc-300 leading-relaxed font-sans">
                {exp.highlights.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}

            {/* Tech Stack Pills & Controls */}
            <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-1.5">
                {exp.skillsUsed.map((skill, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs font-mono justify-end">
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="text-zinc-500 hover:text-red-400 transition-colors"
                >
                  Delete Position
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Position Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">Add Experience Record</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateExperience} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Senior Engineer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="Acme Corp"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Remote / City"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Employment Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Experience["type"] })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 focus:outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Advisory">Advisory</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Time Period</label>
                  <input
                    type="text"
                    placeholder="2025 - Present"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={formData.isCurrent}
                  onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                  className="accent-white rounded"
                />
                <label htmlFor="isCurrent" className="text-zinc-300 font-sans">
                  Current position
                </label>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Highlights / Accomplishments (one per line)</label>
                <textarea
                  rows={4}
                  placeholder="Led migration of core REST API to GraphQL&#10;Engineered automated deployment pipeline"
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none resize-none font-sans"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Technologies Used (comma separated)</label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Express, MongoDB"
                  value={formData.skillsUsed}
                  onChange={(e) => setFormData({ ...formData, skillsUsed: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200"
                >
                  Save Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}