"use client";

import React, { useState, useEffect } from "react";

interface TaskItem {
  _id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Completed";
  type: "task" | "roadmap";
  dueDate?: string;
  quarter?: string;
  category: string;
  tags?: string[];
}

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "timeline">("pending");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New Task Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as "High" | "Medium" | "Low",
    status: "Pending" as "Pending" | "In Progress" | "Completed",
    type: "task" as "task" | "roadmap",
    dueDate: "",
    quarter: "",
    category: "General",
    tags: "",
  });

  // Fetch Tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/tasks");
      const data = await res.json();

      if (data.success) {
        setTasks(data.data);
      } else {
        setError(data.error || "Failed to load tasks");
      }
    } catch (err) {
        console.log(err)
      setError("An unexpected error occurred while fetching tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter Tasks by Type
  const pendingTasks = tasks.filter((t) => t.type === "task");
  const timelineData = tasks.filter((t) => t.type === "roadmap");

  // Create Task Handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim())
          : [],
      };

      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setTasks((prev) => [data.data, ...prev]);
        setIsModalOpen(false);
        // Reset Form
        setFormData({
          title: "",
          description: "",
          priority: "Medium",
          status: "Pending",
          type: activeTab === "timeline" ? "roadmap" : "task",
          dueDate: "",
          quarter: "",
          category: "General",
          tags: "",
        });
      } else {
        alert(data.error || "Failed to create task");
      }
    } catch (err) {
        console.log(err)
      alert("Error creating task");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Status Handler
  const handleStatusChange = async (
    id: string,
    newStatus: "Pending" | "In Progress" | "Completed"
  ) => {
    try {
      // Optimistic Update
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
      );

      const res = await fetch(`/api/admin/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!data.success) {
        // Rollback on error
        fetchTasks();
      }
    } catch (err) {
        console.log(err)
      fetchTasks();
    }
  };

  // Delete Task Handler
  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      setTasks((prev) => prev.filter((t) => t._id !== id));

      const res = await fetch(`/api/admin/tasks/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!data.success) {
        fetchTasks();
      }
    } catch (err) {
        console.log(err)
      fetchTasks();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-zinc-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Work Overview & Roadmap
            </h1>
            <span className="text-[10px] font-mono tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded uppercase">
              Live API
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Inspect active pending tasks and map out upcoming future milestones.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80 w-fit">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "pending"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Pending Tasks (
            {pendingTasks.filter((t) => t.status !== "Completed").length})
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "timeline"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Future Timeline ({timelineData.length})
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
            HIGH PRIORITY
          </p>
          <p className="text-3xl font-bold text-rose-500 mt-2 font-mono">
            {
              pendingTasks.filter(
                (t) => t.priority === "High" && t.status !== "Completed"
              ).length
            }
          </p>
          <div className="mt-2 text-[11px] text-zinc-500">
            Requires urgent inspection
          </div>
        </div>

        <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
            IN PROGRESS
          </p>
          <p className="text-3xl font-bold text-amber-400 mt-2 font-mono">
            {pendingTasks.filter((t) => t.status === "In Progress").length}
          </p>
          <div className="mt-2 text-[11px] text-zinc-500">
            Active engineering pipelines
          </div>
        </div>

        <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
            PLANNED MILESTONES
          </p>
          <p className="text-3xl font-bold text-emerald-400 mt-2 font-mono">
            {timelineData.length}
          </p>
          <div className="mt-2 text-[11px] text-zinc-500">
            Targeted future quarter deliverables
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800/80">
          Loading items from MongoDB database...
        </div>
      ) : error ? (
        <div className="p-6 text-center text-xs text-rose-400 bg-rose-950/20 rounded-2xl border border-rose-800/40">
          {error}
        </div>
      ) : (
        <>
          {/* Tab Content 1: Pending Tasks */}
          {activeTab === "pending" && (
            <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800/80 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-800/80 flex justify-between items-center bg-zinc-900/40">
                <h2 className="font-semibold text-sm text-zinc-100 uppercase tracking-wider font-mono">
                  Active Task Queue
                </h2>
                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, type: "task" }));
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-zinc-100 text-zinc-900 rounded-lg text-xs font-semibold hover:bg-white transition shadow-sm"
                >
                  + New Task
                </button>
              </div>

              {pendingTasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  No tasks found. Click &#34;+ New Task&quot; to create one.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/60">
                  {pendingTasks.map((task) => (
                    <div
                      key={task._id}
                      className="p-4 hover:bg-zinc-800/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                              task.priority === "High"
                                ? "bg-rose-950/50 text-rose-400 border-rose-800/50"
                                : task.priority === "Medium"
                                ? "bg-amber-950/50 text-amber-400 border-amber-800/50"
                                : "bg-zinc-800 text-zinc-300 border-zinc-700"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <h3 className="font-medium text-white text-sm">
                            {task.title}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-400">
                          {task.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono">
                        {task.dueDate && (
                          <span className="text-zinc-500">
                            Due: {task.dueDate}
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-zinc-800/80 text-zinc-300 rounded border border-zinc-700/50 text-[11px]">
                          {task.category}
                        </span>

                        {/* Interactive Status Selector */}
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(
                              task._id,
                              e.target.value as "Pending" | "In Progress" | "Completed"
                            )
                          }
                          className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>

                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="text-zinc-500 hover:text-rose-400 text-xs px-1"
                          title="Delete Task"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content 2: Future Timeline */}
          {activeTab === "timeline" && (
            <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800/80 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-sm text-zinc-100 uppercase tracking-wider font-mono">
                  Future Roadmap & Milestones
                </h2>
                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, type: "roadmap" }));
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-zinc-100 text-zinc-900 rounded-lg text-xs font-semibold hover:bg-white transition shadow-sm"
                >
                  + Add Milestone
                </button>
              </div>

              {timelineData.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  No roadmap milestones defined yet.
                </div>
              ) : (
                <div className="relative border-l border-zinc-800 ml-4 space-y-8">
                  {timelineData.map((item) => (
                    <div key={item._id} className="relative pl-6">
                      <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-semibold text-emerald-400 tracking-wide uppercase">
                              {item.quarter || "Unscheduled"}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded border border-zinc-700/50">
                              {item.status}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteTask(item._id)}
                            className="text-zinc-500 hover:text-rose-400 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                        <h3 className="text-base font-semibold text-white">
                          {item.title}
                        </h3>
                        <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                          {item.description}
                        </p>

                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-2 pt-1.5">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] font-mono px-2 py-0.5 bg-zinc-800/60 text-zinc-400 rounded border border-zinc-800"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal Form for Creating Tasks / Milestones */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white uppercase font-mono">
                Create New {formData.type === "task" ? "Task" : "Roadmap Item"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
                  placeholder="e.g. Audit Superadmin Schema"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
                  placeholder="Provide task scope details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as any,
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              {formData.type === "task" ? (
                <div>
                  <label className="block text-zinc-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200 focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-zinc-400 mb-1">
                    Quarter / Milestone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Q4 2026 - November"
                    value={formData.quarter}
                    onChange={(e) =>
                      setFormData({ ...formData, quarter: e.target.value })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-zinc-400 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Backend, API, Database"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-emerald-500 text-zinc-950 font-semibold rounded-lg hover:bg-emerald-400 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}