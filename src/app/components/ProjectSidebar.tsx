/* eslint-disable no-undef */
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ProjectItem {
  _id: string;
  name: string;
  slug: string;
  status: string;
  techStack: string[];
}

export default function ProjectSidebar() {
  const pathname = usePathname();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DEV">("ALL");

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        const json = await res.json();
        if (json.success || json.data || json.projects) {
          setProjects(json.data || json.projects || []);
        }
      } catch (err) {
        console.error("Failed to load sidebar projects:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // Client-side filtering logic
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      const matchesSearch =
        proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.techStack?.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "PUBLISHED"
          ? proj.status === "Published"
          : proj.status !== "Published";

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-6">
      <div className="sticky top-8 p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl backdrop-blur-md shadow-2xl space-y-4 animate-slide-right relative overflow-hidden">
        
        {/* Subtle Ambient Glow Background */}
        <div className="absolute top-0 right-0 -z-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Sidebar Header & Counter */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <h2 className="text-xs font-bold text-white font-mono uppercase tracking-widest">
              Deployments
            </h2>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
            {filteredProjects.length} / {projects.length}
          </span>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search stack or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 pl-8 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <svg
            className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 pt-1 font-mono text-[10px]">
          {(["ALL", "PUBLISHED", "DEV"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`flex-1 py-1 rounded-lg border transition-all uppercase tracking-wider ${
                statusFilter === filter
                  ? "bg-zinc-800 border-zinc-700 text-emerald-400 font-semibold"
                  : "bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Project Links Navigation List */}
        {loading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-zinc-950/60 border border-zinc-800/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
            No matching records
          </div>
        ) : (
          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
            {filteredProjects.map((proj) => {
              const isActive = pathname === `/projects/${proj.slug}`;
              return (
                <Link
                  key={proj._id || proj.slug}
                  href={`/projects/${proj.slug}`}
                  className={`block p-3 rounded-xl border transition-all duration-300 relative group ${
                    isActive
                      ? "bg-zinc-950 text-white border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.12)]"
                      : "bg-zinc-950/40 text-zinc-400 border-zinc-800/60 hover:text-zinc-200 hover:border-zinc-700/80 hover:bg-zinc-900/60"
                  }`}
                >
                  {/* Title & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-semibold font-sans truncate transition-colors ${
                      isActive ? "text-emerald-300" : "group-hover:text-zinc-100"
                    }`}>
                      {proj.name}
                    </span>
                    {/* <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                        proj.status === "Published"
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      }`}
                    >
                      {proj.status}
                    </span> */}
                  </div>

                  {/* Tech Stack Highlights */}
                  {proj.techStack && proj.techStack.length > 0 && (
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-800/40">
                      <p className="text-[10px] font-mono text-zinc-500 truncate max-w-[190px]">
                        {proj.techStack.slice(0, 3).join(" • ")}
                      </p>
                      <span className="text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all text-xs">
                        →
                      </span>
                    </div>
                  )}

                  {/* Active Indicator Pillar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-emerald-400 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,1)]" />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}