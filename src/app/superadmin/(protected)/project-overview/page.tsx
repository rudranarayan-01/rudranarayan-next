"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FiClock,
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiLayers,
  FiSearch,
  FiRefreshCw,
  FiList,
  FiActivity,
} from "react-icons/fi";

interface FeatureTask {
  id: string;
  title: string;
  hoursSpent: number;
  createdAt: string;
  paymentId: string | null;
}

interface FeatureGroup {
  featureName: string;
  totalHours: number;
  taskCount: number;
  tasks: FeatureTask[];
}

interface ProjectSummary {
  _id: string;
  name: string;
  description?: string;
  type?: string;
  status?: string;
  metrics: {
    totalHours: number;
    totalEarnings: number;
    paidEarnings: number;
    pendingEarnings: number;
    effectiveHourlyRate: number;
    totalTasks: number;
    totalPaymentsCount: number;
  };
  featureBreakdown: FeatureGroup[];
  workLogs: any[];
  payments: any[];
}

export default function ProjectOverviewPage() {
  const [projectsData, setProjectsData] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"features" | "worklogs" | "payments">("features");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProjectOverview();
  }, []);

  const fetchProjectOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/projects/overview");
      const data = await res.json();
      if (data.success) {
        setProjectsData(data.projects);
      }
    } catch (err) {
      console.error("Failed to load project overview:", err);
    }  finally {
      setLoading(false);
    }
  };

  // Compute Active Selection or Combined Overall Summary
  const selectedProject = useMemo(() => {
    if (selectedProjectId === "ALL") return null;
    return projectsData.find((p) => p._id === selectedProjectId) || null;
  }, [projectsData, selectedProjectId]);

  // Overall Aggregates when "ALL Projects" is selected
  const overallMetrics = useMemo(() => {
    if (selectedProject) return selectedProject.metrics;

    return projectsData.reduce(
      (acc, p) => ({
        totalHours: acc.totalHours + p.metrics.totalHours,
        totalEarnings: acc.totalEarnings + p.metrics.totalEarnings,
        paidEarnings: acc.paidEarnings + p.metrics.paidEarnings,
        pendingEarnings: acc.pendingEarnings + p.metrics.pendingEarnings,
        effectiveHourlyRate:
          acc.totalHours + p.metrics.totalHours > 0
            ? Number(
                (
                  (acc.totalEarnings + p.metrics.totalEarnings) /
                  (acc.totalHours + p.metrics.totalHours)
                ).toFixed(2)
              )
            : 0,
        totalTasks: acc.totalTasks + p.metrics.totalTasks,
        totalPaymentsCount: acc.totalPaymentsCount + p.metrics.totalPaymentsCount,
      }),
      {
        totalHours: 0,
        totalEarnings: 0,
        paidEarnings: 0,
        pendingEarnings: 0,
        effectiveHourlyRate: 0,
        totalTasks: 0,
        totalPaymentsCount: 0,
      }
    );
  }, [projectsData, selectedProject]);

  // Active Feature Breakdown
  const activeFeatures = useMemo(() => {
    if (selectedProject) return selectedProject.featureBreakdown;

    // Combine features across all projects
    const combinedMap: Record<string, FeatureGroup> = {};
    projectsData.forEach((p) => {
      p.featureBreakdown.forEach((f) => {
        if (!combinedMap[f.featureName]) {
          combinedMap[f.featureName] = {
            featureName: f.featureName,
            totalHours: 0,
            taskCount: 0,
            tasks: [],
          };
        }
        combinedMap[f.featureName].totalHours += f.totalHours;
        combinedMap[f.featureName].taskCount += f.taskCount;
        combinedMap[f.featureName].tasks.push(...f.tasks);
      });
    });
    return Object.values(combinedMap);
  }, [projectsData, selectedProject]);

  // Active WorkLogs
  const activeWorkLogs = useMemo(() => {
    const logs = selectedProject
      ? selectedProject.workLogs
      : projectsData.flatMap((p) => p.workLogs);

    if (!searchQuery) return logs;
    return logs.filter((l) =>
      l.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projectsData, selectedProject, searchQuery]);

  // Active Payments
  const activePayments = useMemo(() => {
    return selectedProject
      ? selectedProject.payments
      : projectsData.flatMap((p) => p.payments);
  }, [projectsData, selectedProject]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 bg-[#070709] text-neutral-100 min-h-screen font-sans">
      {/* HEADER & PROJECT SELECTOR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Project Analytics Overview
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-1.5">
            Analyze time allocation, feature worklogs, and financial output per project
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-mono text-neutral-400 shrink-0">
            Select Project:
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-[#141417] border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition w-full md:w-64 font-mono"
          >
            <option value="ALL">All Projects Aggregate</option>
            {projectsData.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#0f0f12] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-neutral-400 uppercase">
              Total Time Billed
            </span>
            <FiClock className="text-sky-400 w-4 h-4" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-white font-mono">
              {overallMetrics.totalHours} <span className="text-xs text-neutral-400 font-sans">hrs</span>
            </p>
            <span className="text-[10px] text-neutral-500 font-mono">
              Across {overallMetrics.totalTasks} task entries
            </span>
          </div>
        </div>

        <div className="bg-[#0f0f12] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-neutral-400 uppercase">
              Total Revenue
            </span>
            <FiDollarSign className="text-emerald-400 w-4 h-4" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-emerald-400 font-mono">
              ${overallMetrics.totalEarnings.toLocaleString()}
            </p>
            <span className="text-[10px] text-neutral-500 font-mono">
              Total created invoices
            </span>
          </div>
        </div>

        <div className="bg-[#0f0f12] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-neutral-400 uppercase">
              Received Earnings
            </span>
            <FiCheckCircle className="text-emerald-500 w-4 h-4" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-white font-mono">
              ${overallMetrics.paidEarnings.toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-400/80 font-mono">
              Cleared payments
            </span>
          </div>
        </div>

        <div className="bg-[#0f0f12] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-neutral-400 uppercase">
              Pending Earnings
            </span>
            <FiAlertCircle className="text-rose-400 w-4 h-4" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-rose-400 font-mono">
              ${overallMetrics.pendingEarnings.toLocaleString()}
            </p>
            <span className="text-[10px] text-rose-400/80 font-mono">
              Unpaid invoices
            </span>
          </div>
        </div>

        <div className="bg-[#0f0f12] border border-white/10 rounded-2xl p-4 flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-neutral-400 uppercase">
              Effective Hourly Rate
            </span>
            <FiTrendingUp className="text-amber-400 w-4 h-4" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-amber-400 font-mono">
              ${overallMetrics.effectiveHourlyRate} <span className="text-xs font-sans text-neutral-400">/hr</span>
            </p>
            <span className="text-[10px] text-neutral-500 font-mono">
              Revenue / Hours worked
            </span>
          </div>
        </div>
      </div>

      {/* VIEW TABS */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("features")}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition flex items-center gap-2 ${
              activeTab === "features"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "bg-[#141417] text-neutral-400 hover:text-white"
            }`}
          >
            <FiLayers className="w-3.5 h-3.5" /> Feature Breakdown ({activeFeatures.length})
          </button>
          <button
            onClick={() => setActiveTab("worklogs")}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition flex items-center gap-2 ${
              activeTab === "worklogs"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "bg-[#141417] text-neutral-400 hover:text-white"
            }`}
          >
            <FiList className="w-3.5 h-3.5" /> Detailed Worklogs ({activeWorkLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition flex items-center gap-2 ${
              activeTab === "payments"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "bg-[#141417] text-neutral-400 hover:text-white"
            }`}
          >
            <FiDollarSign className="w-3.5 h-3.5" /> Earnings & Invoices ({activePayments.length})
          </button>
        </div>

        {activeTab === "worklogs" && (
          <div className="relative w-64">
            <FiSearch className="absolute left-3 top-2.5 text-neutral-500 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Filter worklogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141417] border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* CONTENT PANELS */}
      {loading ? (
        <div className="p-16 text-center text-xs font-mono text-neutral-400 flex justify-center items-center gap-2">
          <FiRefreshCw className="animate-spin text-emerald-400" /> Calculating project analytics...
        </div>
      ) : (
        <>
          {/* TAB 1: FEATURE BREAKDOWN */}
          {activeTab === "features" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeFeatures.length === 0 ? (
                <div className="col-span-2 p-12 text-center text-xs font-mono text-neutral-500 bg-[#0f0f12] rounded-2xl border border-white/10">
                  No features or work logs logged for this selection.
                </div>
              ) : (
                activeFeatures.map((group, idx) => {
                  const percentage = overallMetrics.totalHours
                    ? ((group.totalHours / overallMetrics.totalHours) * 100).toFixed(1)
                    : "0";

                  return (
                    <div
                      key={idx}
                      className="bg-[#0f0f12] border border-white/10 rounded-2xl p-5 space-y-4 hover:border-neutral-700 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-bold text-white capitalize flex items-center gap-2">
                            <FiActivity className="text-emerald-400" /> {group.featureName}
                          </h3>
                          <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                            {group.taskCount} task logs recorded
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-mono font-bold text-emerald-400">
                            {group.totalHours} hrs
                          </span>
                          <p className="text-[10px] font-mono text-neutral-500">{percentage}% of project time</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-1.5 rounded-full"
                          style={{ width: `${Math.min(Number(percentage), 100)}%` }}
                        />
                      </div>

                      {/* Individual Tasks List preview */}
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase">Key Tasks:</span>
                        {group.tasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className="text-xs bg-[#141417] p-2 rounded-lg flex justify-between items-center text-neutral-300"
                          >
                            <span className="truncate pr-2">{task.title}</span>
                            <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">
                              {task.hoursSpent} hrs
                            </span>
                          </div>
                        ))}
                        {group.tasks.length > 3 && (
                          <p className="text-[10px] font-mono text-neutral-500 text-right">
                            +{group.tasks.length - 3} more tasks
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: WORKLOGS HISTORY */}
          {activeTab === "worklogs" && (
            <div className="bg-[#0f0f12] border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-mono uppercase text-neutral-400 bg-[#141417]">
                    <th className="p-4 font-semibold">Task Title</th>
                    <th className="p-4 font-semibold">Feature / Module</th>
                    <th className="p-4 font-semibold">Time Spent</th>
                    <th className="p-4 font-semibold">Billed Status</th>
                    <th className="p-4 font-semibold text-right">Logged Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeWorkLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-medium text-white">{log.title}</td>
                      <td className="p-4 font-mono text-neutral-400">
                        {log.logType || log.feature || "General Work"}
                      </td>
                      <td className="p-4 font-mono text-emerald-400 font-semibold">
                        {log.hoursSpent} hrs
                      </td>
                      <td className="p-4 font-mono">
                        {log.paymentId ? (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                            BILLED
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                            UNBILLED
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-neutral-500 text-right">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: PAYMENTS & INVOICES */}
          {activeTab === "payments" && (
            <div className="bg-[#0f0f12] border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-mono uppercase text-neutral-400 bg-[#141417]">
                    <th className="p-4 font-semibold">Description</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Tasks Included</th>
                    <th className="p-4 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activePayments.map((pay) => (
                    <tr key={pay._id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-medium text-white">{pay.reason}</td>
                      <td className="p-4 font-mono font-bold text-white">
                        ${pay.amount?.toLocaleString()}
                      </td>
                      <td className="p-4 font-mono">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded font-semibold uppercase ${
                            pay.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {pay.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-neutral-400">
                        {pay.tasksCovered?.length || 0} tasks
                      </td>
                      <td className="p-4 font-mono text-neutral-500 text-right">
                        {new Date(pay.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}