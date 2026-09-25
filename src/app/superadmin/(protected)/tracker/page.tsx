"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  FiPlus,
  FiClock,

  FiSearch,
  FiCode,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiTool,
} from "react-icons/fi";

interface ProjectOption {
  _id: string;
  name: string;
  type: string;
}

interface WorkLog {
  _id: string;
  projectId?: { _id: string; name: string; type: string } | null;
  date: string;
  logType: "feature" | "bug-fix" | "refactor" | "maintenance";
  title: string;
  details: string;
  techStackUsed: string[];
  hoursSpent: number;
}

export default function WorkTrackerPage() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedProject, setSelectedProject] = useState("");
  const [logType, setLogType] = useState<"feature" | "bug-fix" | "refactor" | "maintenance">("feature");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [techInput, setTechInput] = useState("");
  const [hours, setHours] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter & Search State
  const [filterProject, setFilterProject] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [projRes, logsRes] = await Promise.all([
        fetch("/api/admin/projects"),
        fetch("/api/admin/worklogs"),
      ]);
      const projData = await projRes.json();
      const logsData = await logsRes.json();

      setProjects(Array.isArray(projData) ? projData : projData.data || []);
      setLogs(Array.isArray(logsData) ? logsData : logsData.data || []);
    } catch (err) {
      console.error("Failed to load tracker data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !title) return;

    setIsSubmitting(true);
    const techStackUsed = techInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/admin/worklogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          logType,
          title,
          details,
          techStackUsed,
          hoursSpent: Number(hours),
          date: new Date(),
        }),
      });

      if (res.ok) {
        setTitle("");
        setDetails("");
        setTechInput("");
        setHours(1);
        fetchInitialData();
      }
    } catch (err) {
      console.error("Failed to create log:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Logs Calculation
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesProject =
        filterProject === "ALL" || log.projectId?._id === filterProject;
      const matchesType = filterType === "ALL" || log.logType === filterType;
      const matchesSearch =
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.techStackUsed?.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesProject && matchesType && matchesSearch;
    });
  }, [logs, filterProject, filterType, searchQuery]);

  // Analytics Metrics
  const stats = useMemo(() => {
    const totalHours = logs.reduce((acc, curr) => acc + (curr.hoursSpent || 0), 0);
    const featureCount = logs.filter((l) => l.logType === "feature").length;
    const bugFixCount = logs.filter((l) => l.logType === "bug-fix").length;
    return { totalHours, featureCount, bugFixCount, totalLogs: logs.length };
  }, [logs]);

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "feature":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "bug-fix":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      case "refactor":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "maintenance":
        return "bg-sky-500/10 border-sky-500/30 text-sky-400";
      default:
        return "bg-neutral-800 border-neutral-700 text-neutral-400";
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-black text-white min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-900 pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FiCode className="text-emerald-400" /> Work & Task Tracker
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            Track daily code contributions, features, bugs, and engineering hours
          </p>
        </div>
      </div>

      {/* METRICS DASHBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0c0c0e] border border-neutral-800/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <FiClock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-neutral-500 font-mono">Total Hours Logged</p>
            <p className="text-xl font-bold text-white">{stats.totalHours} hrs</p>
          </div>
        </div>

        <div className="bg-[#0c0c0e] border border-neutral-800/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <FiCheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-neutral-500 font-mono">Features Built</p>
            <p className="text-xl font-bold text-white">{stats.featureCount}</p>
          </div>
        </div>

        <div className="bg-[#0c0c0e] border border-neutral-800/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <FiAlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-neutral-500 font-mono">Bugs Resolved</p>
            <p className="text-xl font-bold text-white">{stats.bugFixCount}</p>
          </div>
        </div>

        <div className="bg-[#0c0c0e] border border-neutral-800/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
            <FiTool className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-neutral-500 font-mono">Total Logs</p>
            <p className="text-xl font-bold text-white">{stats.totalLogs}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TASK LOGGING FORM */}
        <div className="bg-[#0c0c0e] border border-neutral-800/80 rounded-2xl p-6 space-y-4 h-fit">
          <h2 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
            <FiPlus className="text-emerald-400" /> Log Work Item
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1 font-mono">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-neutral-700"
                required
              >
                <option value="">Select Target Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-neutral-400 mb-1 font-mono">Type</label>
                <select
                  value={logType}
                  onChange={(e) => setLogType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-neutral-700"
                >
                  <option value="feature">Feature</option>
                  <option value="bug-fix">Bug Fix</option>
                  <option value="refactor">Refactor</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono">Hours Spent</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-neutral-700"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-mono">Title</label>
              <input
                type="text"
                placeholder="e.g. Optimized Mongoose query indexing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-neutral-700"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-mono">
                Tech Stack Used (comma separated)
              </label>
              <input
                type="text"
                placeholder="React, TypeScript, Express"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-neutral-700"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-mono">Details / Notes</label>
              <textarea
                rows={3}
                placeholder="Provide task breakdown or technical details..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-neutral-700 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FiRefreshCw className="animate-spin" /> Saving Log...
                </>
              ) : (
                "Save Work Log"
              )}
            </button>
          </form>
        </div>

        {/* LOG ACTIVITY TIMELINE */}
        <div className="lg:col-span-2 space-y-4">
          {/* SEARCH AND FILTERS */}
          <div className="bg-[#0c0c0e] border border-neutral-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-3 text-neutral-500" />
              <input
                type="text"
                placeholder="Search logs by keyword or tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none"
              >
                <option value="ALL">All Projects</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="feature">Feature</option>
                <option value="bug-fix">Bug Fix</option>
                <option value="refactor">Refactor</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          {/* TIMELINE ITEMS */}
          {loading ? (
            <div className="p-8 text-center bg-[#0c0c0e] border border-neutral-800/80 rounded-2xl text-xs text-neutral-500 font-mono">
              Loading logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center bg-[#0c0c0e] border border-neutral-800/80 rounded-2xl text-xs text-neutral-500 font-mono">
              No work logs matching the criteria.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log._id}
                className="p-5 bg-[#0c0c0e] border border-neutral-800/80 rounded-2xl space-y-3 hover:border-neutral-700 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{log.title}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${getTypeBadgeStyle(
                          log.logType
                        )}`}
                      >
                        {log.logType}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Project:{" "}
                      <span className="text-neutral-200 font-medium">
                        {log.projectId?.name || "Unassigned"}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-emerald-400 block font-semibold">
                      {log.hoursSpent} hrs
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 block">
                      {new Date(log.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {log.details && (
                  <p className="text-xs text-neutral-300 leading-relaxed">{log.details}</p>
                )}

                {log.techStackUsed?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    {log.techStackUsed.map((tech, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}