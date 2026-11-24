"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast, Toaster } from "sonner";
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiShare2,
  FiExternalLink,
} from "react-icons/fi";
import { downloadWorkLogExcel } from "@/lib/exportWorkLog";
import PaymentFormModal from "@/app/components/PaymentFormModal";

interface Project {
  _id: string;
  name: string;
  type?: string;
}

interface WorkLog {
  _id: string;
  date?: string;
  title: string;
  details?: string;
  hoursSpent: number;
  logType?: string;
  techStackUsed?: string[];
  paymentId: string | null;
}

interface PaymentRecord {
  _id: string;
  projectId: {
    _id: string;
    name: string;
    clientInfo?: { name?: string | null; company?: string | null };
  } | null;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "partially-paid";
  tasksCovered: WorkLog[];
  reason: string;
  timeline: {
    startDate: string;
    endDate: string;
  };
  paidAt?: string;
  createdAt: string;
}

function formatShortDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getCurrencySymbol(currency?: string) {
  switch (currency) {
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "INR":
      return "₹";
    case "USD":
    default:
      return "$";
  }
}

export default function PaymentsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableLogs, setAvailableLogs] = useState<WorkLog[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Control State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [amount, setAmount] = useState<number | "">("");
  const [currency, setCurrency] = useState("USD");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"pending" | "paid" | "partially-paid">(
    "pending",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterProject, setFilterProject] = useState("ALL");

  // Expanded Row State
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(
    null,
  );

  const handleDownloadExcel = async (payment: PaymentRecord) => {
    if (!payment.tasksCovered?.length) {
      toast.warning("No tasks to export for this payment.");
      return;
    }
    try {
      setDownloadingId(payment._id);
      await downloadWorkLogExcel(payment);
      toast.success("Work report downloaded.");
    } catch (err) {
      console.error("Excel export failed:", err);
      toast.error("Failed to generate Excel file.");
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [projRes, payRes] = await Promise.all([
        fetch("/api/admin/projects"),
        fetch("/api/admin/payments"),
      ]);
      const projData = await projRes.json();
      const payData = await payRes.json();

      setProjects(
        Array.isArray(projData)
          ? projData
          : projData.projects || projData.data || [],
      );
      setPayments(
        Array.isArray(payData)
          ? payData
          : payData.payments || payData.data || [],
      );
    } catch (err) {
      console.error("Failed to load initial data:", err);
      toast.error("Failed to load payment and project records.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch unbilled work logs when project changes or when editing a payment
  useEffect(() => {
    if (selectedProject) {
      fetch(`/api/admin/worklogs?projectId=${selectedProject}&unbilled=true`)
        .then((res) => res.json())
        .then((data) => {
          const logs = Array.isArray(data)
            ? data
            : data.workLogs || data.data || [];
          const currentUnbilled = logs.filter((l: WorkLog) => !l.paymentId);

          if (editingPaymentId) {
            const currentPayment = payments.find(
              (p) => p._id === editingPaymentId,
            );
            if (currentPayment && currentPayment.tasksCovered) {
              const existingTaskIds = new Set(
                currentUnbilled.map((l: WorkLog) => l._id),
              );
              currentPayment.tasksCovered.forEach((task) => {
                if (!existingTaskIds.has(task._id)) {
                  currentUnbilled.push(task);
                }
              });
            }
          }

          setAvailableLogs(currentUnbilled);
        })
        .catch((err) => {
          console.error("Error loading work logs:", err);
          toast.error("Failed to fetch project work logs.");
        });
    } else {
      setAvailableLogs([]);
      setSelectedLogs([]);
    }
  }, [selectedProject, editingPaymentId, payments]);

  const resetForm = () => {
    setEditingPaymentId(null);
    setSelectedProject("");
    setSelectedLogs([]);
    setAmount("");
    setCurrency("USD");
    setReason("");
    setStatus("pending");
    setStartDate("");
    setEndDate("");
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleEditClick = (payment: PaymentRecord) => {
    setEditingPaymentId(payment._id);
    setSelectedProject(payment.projectId?._id || "");
    setSelectedLogs(payment.tasksCovered?.map((t) => t._id) || []);
    setAmount(payment.amount);
    setCurrency(payment.currency || "USD");
    setReason(payment.reason);
    setStatus(payment.status);
    setStartDate(
      payment.timeline?.startDate
        ? new Date(payment.timeline.startDate).toISOString().split("T")[0]
        : "",
    );
    setEndDate(
      payment.timeline?.endDate
        ? new Date(payment.timeline.endDate).toISOString().split("T")[0]
        : "",
    );

    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    toast("Delete this payment record?", {
      action: {
        label: "Delete",
        onClick: async () => {
          setDeletingId(id);
          const toastId = toast.loading("Deleting record...");

          try {
            const res = await fetch(`/api/admin/payments/${id}`, {
              method: "DELETE",
            });

            if (res.ok) {
              toast.success("Payment record deleted.", { id: toastId });
              if (editingPaymentId === id) {
                closeModal();
              }
              fetchInitialData();
            } else {
              const errData = await res.json().catch(() => ({}));
              toast.error(
                errData.message || "Failed to delete payment record.",
                { id: toastId },
              );
            }
          } catch (err) {
            console.error("Failed to delete payment record:", err);
            toast.error("An error occurred while deleting.", { id: toastId });
          } finally {
            setDeletingId(null);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleLogToggle = (logId: string) => {
    setSelectedLogs((prev) =>
      prev.includes(logId)
        ? prev.filter((id) => id !== logId)
        : [...prev, logId],
    );
  };

  const handleSelectAllLogs = () => {
    if (selectedLogs.length === availableLogs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(availableLogs.map((l) => l._id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || selectedLogs.length === 0 || !amount || !reason) {
      toast.warning(
        "Complete all required fields and select at least one task.",
      );
      return;
    }

    setIsSubmitting(true);
    const isEditMode = !!editingPaymentId;
    const toastId = toast.loading(
      isEditMode ? "Updating record..." : "Saving record...",
    );

    const payload = {
      ...(isEditMode && { id: editingPaymentId }),
      projectId: selectedProject,
      tasksCovered: selectedLogs,
      amount: Number(amount),
      currency,
      reason,
      status,
      timeline: { startDate, endDate },
      paidAt: status === "paid" ? new Date().toISOString() : null,
    };

    try {
      const url = isEditMode
        ? `/api/admin/payments/${editingPaymentId}`
        : "/api/admin/payments";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          isEditMode ? "Payment record updated." : "Payment record created.",
          { id: toastId },
        );
        closeModal();
        fetchInitialData();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.message || "Failed to save payment record.", {
          id: toastId,
        });
      }
    } catch (err) {
      console.error("Failed to submit payment record:", err);
      toast.error("An error occurred while submitting.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const metrics = useMemo(() => {
    const totalAmount = payments.reduce(
      (acc, curr) => acc + (curr.amount || 0),
      0,
    );
    const paidAmount = payments
      .filter((p) => p.status === "paid")
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const pendingAmount = payments
      .filter((p) => p.status !== "paid")
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const totalHoursBilled = payments.reduce((acc, p) => {
      const pTotal =
        p.tasksCovered?.reduce(
          (tAcc, task) => tAcc + (Number(task.hoursSpent) || 0),
          0,
        ) || 0;
      return acc + pTotal;
    }, 0);

    return { totalAmount, paidAmount, pendingAmount, totalHoursBilled };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesStatus = filterStatus === "ALL" || p.status === filterStatus;
      const matchesProject =
        filterProject === "ALL" || p.projectId?._id === filterProject;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.reason?.toLowerCase().includes(q) ||
        p.projectId?.name?.toLowerCase().includes(q);

      return matchesStatus && matchesProject && matchesSearch;
    });
  }, [payments, filterStatus, filterProject, searchQuery]);

  const getStatusStyle = (st: string) => {
    switch (st) {
      case "paid":
        return "text-emerald-400 bg-emerald-950/50 border-emerald-800/60";
      case "partially-paid":
        return "text-amber-300 bg-amber-950/40 border-amber-800/60";
      case "pending":
      default:
        return "text-rose-300 bg-rose-950/40 border-rose-800/60";
    }
  };

  const formatStatusText = (st: string) => {
    if (st === "partially-paid") return "Partial";
    if (st === "paid") return "Paid";
    return "Pending";
  };

  const toggleExpand = (id: string) => {
    setExpandedPaymentId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 px-4 py-6 sm:px-6 lg:px-10 font-sans">
      <Toaster position="top-right" theme="dark" richColors />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Payments & Work Logs
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Billing cycles, logged task hours, exports, and client report links.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            New Payment
          </button>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border border-zinc-800 rounded-xl bg-[#111114] divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
          <div className="p-4">
            <span className="text-[11px] font-mono text-zinc-500">
              Total Billed
            </span>
            <p className="text-lg sm:text-xl font-semibold font-mono text-white tabular-nums mt-1">
              ${metrics.totalAmount.toLocaleString()}
            </p>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-mono text-zinc-500">Paid</span>
            <p className="text-lg sm:text-xl font-semibold font-mono text-emerald-400 tabular-nums mt-1">
              ${metrics.paidAmount.toLocaleString()}
            </p>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-mono text-zinc-500">
              Unsettled
            </span>
            <p className="text-lg sm:text-xl font-semibold font-mono text-zinc-200 tabular-nums mt-1">
              ${metrics.pendingAmount.toLocaleString()}
            </p>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-mono text-zinc-500">
              Hours Logged
            </span>
            <p className="text-lg sm:text-xl font-semibold font-mono text-white tabular-nums mt-1">
              {metrics.totalHoursBilled}h
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by invoice note or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111114] border border-zinc-800 focus:border-zinc-600 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="bg-[#111114] border border-zinc-800 focus:border-zinc-600 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none transition"
            >
              <option value="ALL">All projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#111114] border border-zinc-800 focus:border-zinc-600 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none transition"
            >
              <option value="ALL">All statuses</option>
              <option value="pending">Pending</option>
              <option value="partially-paid">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        <div className="border border-zinc-800 rounded-xl bg-[#111114] overflow-hidden">
          {loading ? (
            <div className="py-14 px-4 text-center text-xs font-mono text-zinc-400 flex items-center justify-center gap-2">
              <FiRefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Loading payment records...</span>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-14 px-4 text-center text-xs font-mono text-zinc-500">
              No records match the current filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/60 text-[11px] font-mono text-zinc-400">
                    <th className="py-3 px-4 font-medium">Milestone & Project</th>
                    <th className="py-3 px-4 font-medium">Amount</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Work Logged</th>
                    <th className="py-3 px-4 font-medium">Window</th>
                    <th className="py-3 px-4 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 text-xs">
                  {filteredPayments.map((p) => {
                    const isExpanded = expandedPaymentId === p._id;
                    const isDeleting = deletingId === p._id;
                    const totalTaskHours =
                      p.tasksCovered?.reduce(
                        (sum, t) => sum + (Number(t.hoursSpent) || 0),
                        0,
                      ) || 0;

                    return (
                      <React.Fragment key={p._id}>
                        <tr
                          onClick={() => toggleExpand(p._id)}
                          className={`hover:bg-zinc-900/60 cursor-pointer transition ${
                            isExpanded ? "bg-zinc-900/50" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-white">
                              {p.reason}
                            </div>
                            <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                              {p.projectId?.name || "Unassigned"}
                              {p.projectId?.clientInfo?.company
                                ? ` · ${p.projectId.clientInfo.company}`
                                : ""}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-semibold text-white tabular-nums whitespace-nowrap">
                            {getCurrencySymbol(p.currency)}
                            {Number(p.amount || 0).toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-block text-[11px] font-mono px-2 py-0.5 rounded border ${getStatusStyle(
                                p.status,
                              )}`}
                            >
                              {formatStatusText(p.status)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                            <span className="text-zinc-200 tabular-nums">
                              {totalTaskHours}h
                            </span>
                            <span className="text-zinc-500 ml-1.5">
                              ({p.tasksCovered?.length || 0} tasks)
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                            {formatShortDate(p.timeline?.startDate)} –{" "}
                            {formatShortDate(p.timeline?.endDate)}
                          </td>

                          <td
                            className="py-3.5 px-4 text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-1">
                              <a
                                href={`/work-log/${p._id}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Open client log page"
                                className="p-1.5 rounded-md text-emerald-400 hover:bg-zinc-800 transition"
                              >
                                <FiExternalLink className="w-3.5 h-3.5" />
                              </a>

                              <button
                                type="button"
                                onClick={() => {
                                  const shareUrl = `${window.location.origin}/work-log/${p._id}`;
                                  navigator.clipboard.writeText(shareUrl);
                                  toast.success("Client link copied.");
                                }}
                                title="Copy client link"
                                className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                              >
                                <FiShare2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownloadExcel(p)}
                                disabled={downloadingId === p._id}
                                title="Export Excel"
                                className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition disabled:opacity-40 cursor-pointer"
                              >
                                {downloadingId === p._id ? (
                                  <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <FiDownload className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <span className="h-4 w-px bg-zinc-800 mx-0.5" />

                              <button
                                type="button"
                                onClick={() => handleEditClick(p)}
                                title="Edit record"
                                className="p-1.5 rounded-md text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 transition cursor-pointer"
                              >
                                <FiEdit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(p._id)}
                                disabled={isDeleting}
                                title="Delete record"
                                className="p-1.5 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition disabled:opacity-40 cursor-pointer"
                              >
                                {isDeleting ? (
                                  <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleExpand(p._id)}
                                title="Toggle tasks"
                                className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                              >
                                {isExpanded ? (
                                  <FiChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <FiChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-zinc-950/70">
                            <td
                              colSpan={6}
                              className="px-4 py-4 border-t border-zinc-800/80"
                            >
                              <div className="flex items-center justify-between mb-2.5">
                                <span className="text-[11px] font-mono text-zinc-400">
                                  Covered work logs ({p.tasksCovered?.length || 0})
                                </span>
                                <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
                                  Total: {totalTaskHours}h
                                </span>
                              </div>

                              {!p.tasksCovered || p.tasksCovered.length === 0 ? (
                                <p className="text-xs font-mono text-zinc-500 py-2">
                                  No work logs linked to this payment.
                                </p>
                              ) : (
                                <div className="border border-zinc-800/90 rounded-lg bg-[#111114] divide-y divide-zinc-800/70">
                                  {p.tasksCovered.map((task) => (
                                    <div
                                      key={task._id}
                                      className="px-3.5 py-2.5 flex items-center justify-between gap-4"
                                    >
                                      <div className="min-w-0">
                                        <p className="text-xs text-zinc-100 font-medium truncate">
                                          {task.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-zinc-500">
                                          {task.logType && (
                                            <span>{task.logType}</span>
                                          )}
                                          {task.date && (
                                            <span>
                                              · {formatShortDate(task.date)}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <span className="text-xs font-mono text-emerald-400 tabular-nums shrink-0">
                                        {task.hoursSpent}h
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <PaymentFormModal
        isOpen={isModalOpen}
        editingPaymentId={editingPaymentId}
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        availableLogs={availableLogs}
        selectedLogs={selectedLogs}
        handleLogToggle={handleLogToggle}
        handleSelectAllLogs={handleSelectAllLogs}
        amount={amount}
        setAmount={setAmount}
        currency={currency}
        setCurrency={setCurrency}
        status={status}
        setStatus={setStatus}
        reason={reason}
        setReason={setReason}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}