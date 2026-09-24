"use client";

import React, { useState } from "react";

interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  status: "Published" | "In Development" | "Archived";
  featured: boolean;
  githubUrl: string;
  liveUrl: string;
  updatedAt: string;
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: "1",
    title: "HouseXpertz Platform",
    description: "Full-stack handyman service platform featuring an AI task routing system and live customer chat.",
    techStack: ["Next.js", "TypeScript", "Express", "MongoDB"],
    status: "Published",
    featured: true,
    githubUrl: "https://github.com/admin/housexpertz",
    liveUrl: "https://housexpertz.app",
    updatedAt: "2026-04-12",
  },
  {
    id: "2",
    title: "Supermarket AI Guard Pro",
    description: "Real-time automated surveillance script utilizing custom detection layers for security tracking.",
    techStack: ["Python", "OpenCV", "YOLO"],
    status: "In Development",
    featured: true,
    githubUrl: "https://github.com/admin/supermarket-guard",
    liveUrl: "",
    updatedAt: "2026-01-20",
  },
  {
    id: "3",
    title: "National News Website Engine",
    description: "High-throughput news aggregator with dynamic page layouts and structured media asset branding.",
    techStack: ["React", "Express", "SQLite", "Tailwind CSS"],
    status: "Published",
    featured: false,
    githubUrl: "https://github.com/admin/news-engine",
    liveUrl: "https://news.local",
    updatedAt: "2026-01-08",
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    status: "Published" as Project["status"],
    githubUrl: "",
    liveUrl: "",
  });

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const newProject: Project = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      techStack: formData.techStack.split(",").map((s) => s.trim()).filter(Boolean),
      status: formData.status,
      featured: false,
      githubUrl: formData.githubUrl,
      liveUrl: formData.liveUrl,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
    setFormData({ title: "", description: "", techStack: "", status: "Published", githubUrl: "", liveUrl: "" });
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const toggleFeatured = (id: string) => {
    setProjects(
      projects.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Projects Directory</h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Manage software repositories, deployment URLs, and showcase priority.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-semibold rounded-xl hover:bg-zinc-200 transition-colors w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Project</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 font-mono"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["All", "Published", "In Development", "Archived"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "bg-zinc-950 text-zinc-400 border border-zinc-800/80 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="p-5 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-200 group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                    project.status === "Published"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  }`}
                >
                  {project.status}
                </span>

                <button
                  onClick={() => toggleFeatured(project.id)}
                  title="Toggle Featured status"
                  className={`p-1 rounded-md transition-colors ${
                    project.featured ? "text-amber-400 bg-amber-500/10" : "text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                {project.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                {project.description}
              </p>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {project.techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>Updated {project.updatedAt}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDelete(project.id)}
                  className="hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Creating Projects */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">Add New Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Express"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}