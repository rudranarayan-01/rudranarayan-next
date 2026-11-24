"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
import {
  FiSearch,
  FiRefreshCw,
  FiExternalLink,
  FiGithub,
  FiArrowUpRight,
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

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tries public/general projects route first, falls back to admin projects if needed
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
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-zinc-800">
          <div>
            <p className="text-xs font-mono text-emerald-400">
              Project Index
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-white mt-1">
              Projects
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Applications, platforms, and client systems across web, mobile, AI,
              and backend stacks.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 tabular-nums">
            <span>
              Total: <strong className="text-white">{projects.length}</strong>
            </span>
            <span>
              Showing:{" "}
              <strong className="text-emerald-400">
                {filteredProjects.length}
              </strong>
            </span>
          </div>
        </header>

        {/* Search & Type Filter */}
        <section className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by project name, stack, or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111114] border border-zinc-800 focus:border-zinc-600 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition"
            />
          </div>

          {availableTypes.length > 0 && (
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#111114] border border-zinc-800 focus:border-zinc-600 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none transition"
            >
              <option value="ALL">All types</option>
              {availableTypes.map((typeLabel) => (
                <option key={typeLabel} value={typeLabel}>
                  {typeLabel}
                </option>
              ))}
            </select>
          )}
        </section>

        {/* List / States */}
        {loading ? (
          <div className="border border-zinc-800 rounded-xl bg-[#111114] py-16 px-4 text-center text-xs font-mono text-zinc-400 flex items-center justify-center gap-2">
            <FiRefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Loading projects...</span>
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
            No projects match your search or filter.
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project) => {
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
                  className="border border-zinc-800 hover:border-zinc-700 rounded-xl bg-[#111114] overflow-hidden flex flex-col justify-between transition"
                >
                  <div>
                    {coverImage && (
                      <div className="h-40 w-full bg-zinc-950 border-b border-zinc-800/80 overflow-hidden">
                        <img
                          src={coverImage}
                          alt={project.galleryImages?.[0]?.alt || project.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="text-base font-semibold text-white truncate">
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

                        {project.status && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-yellow-300 shrink-0">
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
                              className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800/90 text-blue-300"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 6 && (
                            <span className="text-[11px] font-mono px-1.5 py-0.5 text-zinc-500">
                              +{project.techStack.length - 6}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between gap-2 text-xs font-mono">
                    <a
                      href={detailHref}
                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition"
                    >
                      <span>Case study</span>
                      <FiArrowUpRight className="w-3.5 h-3.5" />
                    </a>

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