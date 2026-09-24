"use client";

import React, { useEffect, useState } from "react";

interface ExperienceItem {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export default function AdminExperiencesPage() {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [form, setForm] = useState<ExperienceItem>({
    role: "",
    company: "",
    duration: "",
    description: "",
  });

  // Fetch experiences on load
  useEffect(() => {
    fetch("/api/experiences")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  const saveAllExperiences = async (updatedList: ExperienceItem[]) => {
    setItems(updatedList);
    await fetch("/api/experiences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedList),
    });
  };

  // Open Modal for Creating
  const handleOpenCreateModal = () => {
    setEditingIndex(null);
    setForm({ role: "", company: "", duration: "", description: "" });
    setIsModalOpen(true);
  };

  // Open Modal for Editing an existing item
  const handleOpenEditModal = (index: number) => {
    setEditingIndex(index);
    setForm(items[index]);
    setIsModalOpen(true);
  };

  // Handle Form Submit (Handles BOTH Create & Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role || !form.company) return;

    let updatedList: ExperienceItem[];

    if (editingIndex !== null) {
      // EDIT MODE: Update existing item
      updatedList = items.map((item, idx) => (idx === editingIndex ? form : item));
    } else {
      // CREATE MODE: Prepend new item
      updatedList = [form, ...items];
    }

    saveAllExperiences(updatedList);
    setIsModalOpen(false);
    setEditingIndex(null);
    setForm({ role: "", company: "", duration: "", description: "" });
  };

  const handleDelete = (index: number) => {
    const updatedList = items.filter((_, i) => i !== index);
    saveAllExperiences(updatedList);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Experience Management</h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Dynamically create, edit, or delete career milestones.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
        >
          + Add Position
        </button>
      </div>

      {loading ? (
        <p className="text-xs font-mono text-zinc-500">Loading experience records...</p>
      ) : (
        <div className="space-y-4">
          {items.map((exp, idx) => (
            <div key={idx} className="p-5 bg-zinc-950 border border-zinc-800/80 rounded-2xl relative group hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{exp.role}</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {exp.company} • <span className="text-emerald-400">{exp.duration}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <button
                    onClick={() => handleOpenEditModal(idx)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-xs text-zinc-300 mt-3 leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Dynamic Modal (Create / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-xs font-mono font-bold text-white uppercase">
                {editingIndex !== null ? "Edit Experience" : "Add Experience"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">Role</label>
                <input
                  type="text"
                  required
                  placeholder="Full Stack Developer"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Company</label>
                <input
                  type="text"
                  required
                  placeholder="Maastrix Solutions"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Duration</label>
                <input
                  type="text"
                  required
                  placeholder="Mar 2026 – Present"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your primary responsibilities and achievements..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
                  {editingIndex !== null ? "Update Experience" : "Save Position"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}