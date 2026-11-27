"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import { FiCheck, FiCopy, FiRefreshCw } from "react-icons/fi";

interface PublicWorkLog {
  _id: string;
  date?: string;
  title: string;
  details?: string;
  hoursSpent: number;
  logType?: string;
  techStackUsed?: string[];
}

interface PublicWorkLogReport {
  _id: string;
  projectId: {
    _id: string;
    name: string;
    clientInfo?: {
      name?: string | null;
      company?: string | null;
    };
  } | null;
  status: "pending" | "paid" | "partially-paid";
  tasksCovered: PublicWorkLog[];
  reason: string;
  timeline?: {
    startDate?: string;
    endDate?: string;
  };
  createdAt?: string;
}

function formatDate(value?: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatStatusLabel(status?: string): string {
  if (status === "paid") return "Settled";
  if (status === "partially-paid") return "Partial";
  return "Open";
}

export default function PublicWorkLogPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [report, setReport] = useState<PublicWorkLogReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/public/payments/${id}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.error || "Unable to load work log.");
        }
        if (!cancelled) {
          setReport(json.data);
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err.message || "Failed to load work log.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const totalHours = useMemo(() => {
    if (!report?.tasksCovered?.length) return 0;
    const sum = report.tasksCovered.reduce(
      (acc, task) => acc + (Number(task.hoursSpent) || 0),
      0
    );
    return Number(sum.toFixed(2));
  }, [report]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-400 flex items-center justify-center gap-2 text-xs font-mono">
        <FiRefreshCw className="animate-spin text-emerald-400 w-3.5 h-3.5" />
        <span>Fetching work log...</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-300 flex items-center justify-center p-6">
        <div className="w-full max-w-md border border-zinc-800 bg-[#111114] rounded-xl p-6 space-y-2">
          <p className="text-xs font-mono text-rose-400">Work log unavailable</p>
          <p className="text-sm text-zinc-200 font-medium">
            {error || "This link is invalid or no longer active."}
          </p>
        </div>
      </div>
    );
  }

  const startLabel = formatDate(report.timeline?.startDate);
  const endLabel = formatDate(report.timeline?.endDate);
  const rangeText =
    startLabel && endLabel
      ? `${startLabel} – ${endLabel}`
      : startLabel || endLabel || "Not specified";

  const clientLine = [
    report.projectId?.name,
    report.projectId?.clientInfo?.company || report.projectId?.clientInfo?.name,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 py-10 px-4 sm:px-8">
      <Toaster position="top-right" theme="dark" richColors />

      <main className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div className="space-y-1.5">
            {clientLine && (
              <p className="text-xs font-mono text-emerald-400/90">
                {clientLine}
              </p>
            )}
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              {report.reason || "Work Log Summary"}
            </h1>
            <p className="text-xs text-zinc-400">
              Completed engineering tasks and time breakdown shared for review.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="self-start shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-200 transition"
          >
            {copied ? (
              <>
                <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <FiCopy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy link</span>
              </>
            )}
          </button>
        </header>

        {/* Compact Meta Strip */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-zinc-800/80 border border-zinc-800/80 rounded-xl overflow-hidden">
          <div className="bg-[#111114] p-4">
            <p className="text-[11px] font-mono text-zinc-500">Logged hours</p>
            <p className="text-lg font-semibold font-mono text-white mt-1">
              {totalHours}h
            </p>
          </div>

          <div className="bg-[#111114] p-4">
            <p className="text-[11px] font-mono text-zinc-500">Tasks</p>
            <p className="text-lg font-semibold font-mono text-white mt-1">
              {report.tasksCovered?.length || 0}
            </p>
          </div>

          <div className="bg-[#111114] p-4">
            <p className="text-[11px] font-mono text-zinc-500">Status</p>
            <p className="text-sm font-mono text-emerald-400 mt-2">
              {formatStatusLabel(report.status)}
            </p>
          </div>

          <div className="bg-[#111114] p-4">
            <p className="text-[11px] font-mono text-zinc-500">Window</p>
            <p className="text-xs font-mono text-zinc-200 mt-2 leading-snug">
              {rangeText}
            </p>
          </div>
        </section>

        {/* Task Entries */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono text-zinc-400">
              Activity breakdown
            </h2>
            <span className="text-xs font-mono text-zinc-500">
              {totalHours}h total
            </span>
          </div>

          {!report.tasksCovered || report.tasksCovered.length === 0 ? (
            <div className="border border-zinc-800/80 bg-[#111114] rounded-xl p-8 text-center text-xs font-mono text-zinc-500">
              No tasks recorded in this log.
            </div>
          ) : (
            <div className="border border-zinc-800/80 bg-[#111114] rounded-xl divide-y divide-zinc-800/70">
              {report.tasksCovered.map((task, idx) => {
                const taskDate = formatDate(task.date);

                return (
                  <article
                    key={task._id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono text-zinc-500">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <h3 className="text-sm font-medium text-white">
                          {task.title}
                        </h3>
                        {task.logType && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                            {task.logType}
                          </span>
                        )}
                        {taskDate && (
                          <span className="text-[11px] font-mono text-zinc-500">
                            {taskDate}
                          </span>
                        )}
                      </div>

                      {task.details && (
                        <p className="text-xs text-zinc-400 leading-relaxed pl-0 sm:pl-6">
                          {task.details}
                        </p>
                      )}

                      {task.techStackUsed && task.techStackUsed.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 pl-0 sm:pl-6">
                          {task.techStackUsed.map((tech, i) => (
                            <span
                              key={`${task._id}-tech-${i}`}
                              className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900/90 text-zinc-400 border border-zinc-800/80"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-xs font-mono text-emerald-400 shrink-0 sm:pt-0.5">
                      {task.hoursSpent}h
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}