"use client";

import React, { useEffect, useState } from "react";

interface ProjectItem {
  name: string;
  description: string;
  points: string[];
  techStack?: { name: string; color?: string }[];
  liveLink: string;
  githubLink: string;
  image: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [form, setForm] = useState<{
    name: string;
    description: string;
    pointsText: string;
    liveLink: string;
    githubLink: string;
    image: string;
  }>({
    name: "",
    description: "",
    pointsText: "",
    liveLink: "",
    githubLink: "",
    image: "",
  });

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      });
  }, []);

  const saveProjects = async (updatedList: ProjectItem[]) => {
    setProjects(updatedList);
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedList),
    });
  };

  const handleOpenModal = (index?: number) => {
    if (index !== undefined) {
      setEditingIndex(index);
      const prj = projects[index];
      setForm({
        name: prj.name,
        description: prj.description,
        pointsText: prj.points ? prj.points.join("\n") : "",
        liveLink: prj.liveLink,
        githubLink: prj.githubLink,
        image: prj.image,
      });
    } else {
      setEditingIndex(null);
      setForm({
        name: "",
        description: "",
        pointsText: "",
        liveLink: "",
        githubLink: "",
        image: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    const formattedPoints = form.pointsText
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    const updatedItem: ProjectItem = {
      name: form.name,
      description: form.description,
      points: formattedPoints,
      liveLink: form.liveLink,
      githubLink: form.githubLink,
      image: form.image || "/img/default.png",
      techStack: editingIndex !== null ? projects[editingIndex]?.techStack || [] : [],
    };

    let updatedList: ProjectItem[];
    if (editingIndex !== null) {
      updatedList = projects.map((p, i) => (i === editingIndex ? updatedItem : p));
    } else {
      updatedList = [updatedItem, ...projects];
    }

    saveProjects(updatedList);
    setIsModalOpen(false);
  };

  const handleDelete = (index: number) => {
    const updatedList = projects.filter((_, i) => i !== index);
    saveProjects(updatedList);
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Project Showcase Control</h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Manage live links, source repos, and descriptions for your portfolio.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-xl hover:bg-zinc-200"
        >
          + Add Project
        </button>
      </div>

      {loading ? (
        <p className="text-xs font-mono text-zinc-500">Loading projects...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((item, idx) => (
            <div key={idx} className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-bold text-white">{item.name}</h3>
                <div className="flex gap-2 text-xs font-mono">
                  <button onClick={() => handleOpenModal(idx)} className="text-zinc-400 hover:text-white">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(idx)} className="text-zinc-500 hover:text-red-400">
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2">{item.description}</p>
              <div className="flex gap-4 text-[11px] font-mono text-emerald-400">
                <a href={item.liveLink} target="_blank" rel="noreferrer" className="underline">Live Demo</a>
                <a href={item.githubLink} target="_blank" rel="noreferrer" className="underline">Source Code</a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-xs font-mono font-bold text-white uppercase">
              {editingIndex !== null ? "Edit Project" : "Add New Project"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-mono">
              <input
                type="text"
                placeholder="Project Name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
              />
              <textarea
                rows={2}
                placeholder="Short Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none resize-none font-sans"
              />
              <textarea
                rows={3}
                placeholder="Key Features (One point per line)"
                value={form.pointsText}
                onChange={(e) => setForm({ ...form, pointsText: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none resize-none font-sans"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Live URL"
                  value={form.liveLink}
                  onChange={(e) => setForm({ ...form, liveLink: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="GitHub URL"
                  value={form.githubLink}
                  onChange={(e) => setForm({ ...form, githubLink: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Image path (e.g. /img/houseXpertz.png)"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-white text-black font-semibold rounded-xl">
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}