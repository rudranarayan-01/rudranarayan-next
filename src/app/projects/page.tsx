"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import {
  FiSearch,
  FiRefreshCw,
  FiExternalLink,
  FiGithub,
  FiPlay,
  FiTerminal,
} from "react-icons/fi";

interface ProjectItem {
  _id: string;
  name: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  type?: string;
  category?: string;
  status?: string;
  techStack?: string[];
  liveUrl?: string;
  repoUrl?: string;
  clientInfo?: {
    name?: string | null;
    company?: string | null;
  };
  galleryImages?: Array<{
    url: string;
    alt?: string;
  }>;
  updatedAt?: string;
  createdAt?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      let res = await fetch("/api/projects");
      if (!res.ok && res.status === 404) {
        res = await fetch("/api/admin/projects");
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to load projects.");
      }

      const list = Array.isArray(data)
        ? data
        : data.projects || data.data || [];
      setProjects(list);
    } catch (err: any) {
      console.error("Failed to fetch projects:", err);
      setError(err.message || "Could not load projects.");
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Press '/' to focus search bar
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    projects.forEach((p) => {
      const label = (p.type || p.category || "").trim();
      if (label) types.add(label);
    });
    return Array.from(types).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((p) => {
      const label = (p.type || p.category || "").trim();
      const matchesType = selectedType === "ALL" || label === selectedType;

      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.clientInfo?.company?.toLowerCase().includes(q) ||
        p.clientInfo?.name?.toLowerCase().includes(q) ||
        p.techStack?.some((t) => t.toLowerCase().includes(q));

      return matchesType && matchesSearch;
    });
  }, [projects, searchQuery, selectedType]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 px-4 py-8 sm:px-6 lg:px-10 font-sans">
      <Toaster position="top-right" theme="dark" richColors />

      <main className="max-w-6xl mx-auto space-y-6">
        {/* Gaming Stage Header */}
        <header className="relative overflow-hidden border border-zinc-800 rounded-xl bg-[#111114] p-5 sm:p-6">
          <div className="pointer-events-none absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400">
                <FiTerminal className="w-3.5 h-3.5" />
                <span>STAGE SELECT // PROJECT ARCHIVE</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Shipped Builds & Systems
              </h1>
              <p className="text-xs text-zinc-400 max-w-xl">
                Select a build to inspect architecture, live deployments, and
                source repositories across web, mobile, AI, and backend systems.
              </p>
            </div>

            {/* Telemetry Counter Strip */}
            <div className="grid grid-cols-2 border border-zinc-800 rounded-lg bg-zinc-950/90 divide-x divide-zinc-800 text-xs font-mono shrink-0">
              <div className="px-3.5 py-2">
                <span className="text-[10px] text-zinc-500 block">
                  TOTAL BUILDS
                </span>
                <span className="text-white font-semibold text-sm tabular-nums">
                  {String(projects.length).padStart(2, "0")}
                </span>
              </div>
              <div className="px-3.5 py-2">
                <span className="text-[10px] text-zinc-500 block">ACTIVE</span>
                <span className="text-emerald-400 font-semibold text-sm tabular-nums">
                  {String(filteredProjects.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Search & Mode Filter Bar */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xl">
            <FiSearch className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Filter builds by name, stack, or client... (press /)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111114] border border-zinc-800 focus:border-emerald-500/60 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition"
            />
          </div>

          {availableTypes.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {["ALL", ...availableTypes].map((typeLabel) => {
                const active = selectedType === typeLabel;
                return (
                  <button
                    key={typeLabel}
                    type="button"
                    onClick={() => setSelectedType(typeLabel)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap border transition cursor-pointer ${
                      active
                        ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold"
                        : "bg-[#111114] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                    }`}
                  >
                    {typeLabel === "ALL" ? "ALL MODES" : typeLabel}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* List / States */}
        {loading ? (
          <div className="border border-zinc-800 rounded-xl bg-[#111114] py-16 px-4 text-center text-xs font-mono text-zinc-400 flex items-center justify-center gap-2">
            <FiRefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Loading build index...</span>
          </div>
        ) : error ? (
          <div className="border border-zinc-800 rounded-xl bg-[#111114] py-14 px-4 text-center space-y-3">
            <p className="text-xs font-mono text-rose-400">{error}</p>
            <button
              type="button"
              onClick={loadProjects}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-200 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="border border-zinc-800 rounded-xl bg-[#111114] py-16 px-4 text-center text-xs font-mono text-zinc-500">
            No builds match your current filter.
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project, index) => {
              const coverImage = project.galleryImages?.[0]?.url;
              const summary =
                project.shortDescription ||
                project.description ||
                "No summary provided.";
              const detailHref = `/projects/${project.slug || project._id}`;
              const typeLabel = project.type || project.category;

              return (
                <article
                  key={project._id}
                  className="group relative border border-zinc-800 hover:border-emerald-500/45 rounded-xl bg-[#111114] overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div>
                    {coverImage && (
                      <div className="relative h-44 w-full bg-zinc-950 border-b border-zinc-800/80 overflow-hidden">
                        <img
                          src={coverImage}
                          alt={project.galleryImages?.[0]?.alt || project.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-transparent opacity-80" />

                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-zinc-950/90 border border-zinc-800 text-[10px] font-mono text-zinc-400 tabular-nums">
                          #{String(index + 1).padStart(2, "0")}
                        </span>

                        {project.status && (
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-zinc-950/90 border border-zinc-800 text-[10px] font-mono text-emerald-400">
                            {project.status}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          {!coverImage && (
                            <span className="text-[10px] font-mono text-zinc-500 block mb-1 tabular-nums">
                              BUILD #{String(index + 1).padStart(2, "0")}
                            </span>
                          )}
                          <h2 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                            {project.name}
                          </h2>
                          {(typeLabel || project.clientInfo?.company) && (
                            <p className="text-[11px] font-mono text-zinc-400 mt-0.5 truncate">
                              {[typeLabel, project.clientInfo?.company]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </div>

                        {!coverImage && project.status && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 shrink-0">
                            {project.status}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                        {summary}
                      </p>

                      {project.techStack && project.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.techStack.slice(0, 6).map((tech, idx) => (
                            <span
                              key={`${project._id}-stack-${idx}`}
                              className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800/90 text-zinc-300"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 6 && (
                            <span className="text-[11px] font-mono px-1.5 py-0.5 text-zinc-500 tabular-nums">
                              +{project.techStack.length - 6}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Action Bar */}
                  <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-950/50 flex items-center justify-between gap-2 text-xs font-mono">
                    <Link
                      href={detailHref}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 group-hover:bg-emerald-500 text-zinc-200 group-hover:text-zinc-950 font-semibold transition-colors"
                    >
                      <FiPlay className="w-3 h-3 fill-current" />
                      <span>Inspect</span>
                    </Link>

                    <div className="flex items-center gap-3">
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition"
                        >
                          <FiGithub className="w-3.5 h-3.5" />
                          <span>Code</span>
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition"
                        >
                          <FiExternalLink className="w-3.5 h-3.5" />
                          <span>Live</span>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}