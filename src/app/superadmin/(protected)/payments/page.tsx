"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast, Toaster } from "sonner";
import {
  FiDollarSign,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
  FiRefreshCw,
  FiCalendar,
  FiFolder,
  FiLayers,
  FiFileText,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiEdit,
  FiTrash2,
  FiX,
  FiSave,
} from "react-icons/fi";

interface Project {
  _id: string;
  name: string;
  type?: string;
}

interface WorkLog {
  _id: string;
  title: string;
  hoursSpent: number;
  logType?: string;
  paymentId: string | null;
}

interface PaymentRecord {
  _id: string;
  projectId: { _id: string; name: string } | null;
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
  const [status, setStatus] = useState<"pending" | "paid" | "partially-paid">("pending");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterProject, setFilterProject] = useState("ALL");

  // Expanded Row State
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null);

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

      setProjects(Array.isArray(projData) ? projData : projData.projects || projData.data || []);
      setPayments(Array.isArray(payData) ? payData : payData.payments || payData.data || []);
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
          const logs = Array.isArray(data) ? data : data.workLogs || data.data || [];
          let currentUnbilled = logs.filter((l: WorkLog) => !l.paymentId);

          if (editingPaymentId) {
            const currentPayment = payments.find((p) => p._id === editingPaymentId);
            if (currentPayment && currentPayment.tasksCovered) {
              const existingTaskIds = new Set(currentUnbilled.map((l: WorkLog) => l._id));
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
        : ""
    );
    setEndDate(
      payment.timeline?.endDate
        ? new Date(payment.timeline.endDate).toISOString().split("T")[0]
        : ""
    );

    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    toast("Are you sure you want to delete this payment record?", {
      action: {
        label: "Confirm",
        onClick: async () => {
          setDeletingId(id);
          const toastId = toast.loading("Deleting payment record...");

          try {
            const res = await fetch(`/api/admin/payments/${id}`, {
              method: "DELETE",
            });

            if (res.ok) {
              toast.success("Payment record deleted successfully!", { id: toastId });
              if (editingPaymentId === id) {
                closeModal();
              }
              fetchInitialData();
            } else {
              const errData = await res.json().catch(() => ({}));
              toast.error(errData.message || "Failed to delete payment record.", { id: toastId });
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
        onClick: () => { },
      },
    });
  };

  const handleLogToggle = (logId: string) => {
    setSelectedLogs((prev) =>
      prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId]
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
      toast.warning("Please fill in all required fields and select at least one task.");
      return;
    }

    setIsSubmitting(true);
    const isEditMode = !!editingPaymentId;
    const toastId = toast.loading(isEditMode ? "Updating payment record..." : "Saving payment record...");

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
      const url = isEditMode ? `/api/admin/payments/${editingPaymentId}` : "/api/admin/payments";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          isEditMode ? "Payment record updated successfully!" : "Payment record created successfully!",
          { id: toastId }
        );
        closeModal();
        fetchInitialData();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.message || "Failed to save payment record.", { id: toastId });
      }
    } catch (err) {
      console.error("Failed to submit payment record:", err);
      toast.error("An error occurred while submitting.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Analytics Metrics
  const metrics = useMemo(() => {
    const totalAmount = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const paidAmount = payments
      .filter((p) => p.status === "paid")
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const pendingAmount = payments
      .filter((p) => p.status === "pending")
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const totalHoursBilled = payments.reduce((acc, p) => {
      const pTotal = p.tasksCovered?.reduce((tAcc, task) => tAcc + (task.hoursSpent || 0), 0) || 0;
      return acc + pTotal;
    }, 0);

    return { totalAmount, paidAmount, pendingAmount, totalHoursBilled };
  }, [payments]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesStatus = filterStatus === "ALL" || p.status === filterStatus;
      const matchesProject =
        filterProject === "ALL" || p.projectId?._id === filterProject;
      const matchesSearch =
        p.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.projectId?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesProject && matchesSearch;
    });
  }, [payments, filterStatus, filterProject, searchQuery]);

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "paid":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]";
      case "partially-paid":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]";
      case "pending":
      default:
        return "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)]";
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedPaymentId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="md:p-10 max-w-7xl mx-auto bg-[#070709] text-neutral-100 min-h-screen font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      <Toaster position="top-right" theme="dark" richColors />

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
              Payment & Task Revenue Log
            </h1>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-xs text-neutral-400 font-mono mt-1.5">
            Track precise work logs, hours billed, project revenue, and invoice breakdowns
          </p>
        </div>

        {/* CREATE BUTTON */}
        <button
          onClick={openCreateModal}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-2.5 rounded-xl transition duration-200 flex items-center gap-2 text-xs shadow-[0_0_20px_rgba(16,185,129,0.2)] shrink-0"
        >
          <FiPlus className="w-4 h-4" /> Create Payment Record
        </button>
      </div>

      {/* METRICS DASHBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f0f12] border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-neutral-700 transition duration-300">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
            <FiDollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-neutral-400 font-mono uppercase tracking-wider">Total Billed</p>
            <p className="text-2xl font-bold text-white tracking-tight mt-0.5">${metrics.totalAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-[#0f0f12] border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-neutral-700 transition duration-300">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
            <FiCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-neutral-400 font-mono uppercase tracking-wider">Received Revenue</p>
            <p className="text-2xl font-bold text-emerald-400 tracking-tight mt-0.5">${metrics.paidAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-[#0f0f12] border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-neutral-700 transition duration-300">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 shrink-0">
            <FiAlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-neutral-400 font-mono uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-rose-400 tracking-tight mt-0.5">${metrics.pendingAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-[#0f0f12] border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-neutral-700 transition duration-300">
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20 shrink-0">
            <FiClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-neutral-400 font-mono uppercase tracking-wider">Hours Billed</p>
            <p className="text-2xl font-bold text-white tracking-tight mt-0.5">{metrics.totalHoursBilled} hrs</p>
          </div>
        </div>
      </div>

      {/* PAYMENT HISTORY & INVOICE TABLE */}
      <div className="space-y-4">
        {/* SEARCH & FILTER CONTROLS */}
        <div className="bg-[#0f0f12] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3.5 top-3.5 text-neutral-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by description or project name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#18181c] border border-neutral-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-700 transition"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="bg-[#18181c] border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none transition"
            >
              <option value="ALL">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#18181c] border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none transition"
            >
              <option value="ALL">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="partially-paid">Partially Paid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-[#0f0f12] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-400 font-mono flex items-center justify-center gap-2">
              <FiRefreshCw className="animate-spin text-emerald-400" /> Loading payment records...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500 font-mono">
              No payment logs matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-neutral-400 bg-[#141417]">
                    <th className="p-4 font-semibold">Project & Reason</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Tasks & Time Logged</th>
                    <th className="p-4 font-semibold text-right">Timeline</th>
                    <th className="p-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredPayments.map((p) => {
                    const isExpanded = expandedPaymentId === p._id;
                    const isDeleting = deletingId === p._id;
                    const totalTaskHours = p.tasksCovered?.reduce(
                      (sum, t) => sum + (t.hoursSpent || 0),
                      0
                    );

                    return (
                      <React.Fragment key={p._id}>
                        <tr
                          onClick={() => toggleExpand(p._id)}
                          className={`hover:bg-white/[0.02] cursor-pointer transition ${isExpanded ? "bg-white/[0.02]" : ""
                            }`}
                        >
                          {/* Project & Reason */}
                          <td className="p-4">
                            <div className="font-semibold text-white flex items-center gap-2">
                              <FiFileText className="text-emerald-400 shrink-0 w-4 h-4" />
                              <span>{p.reason}</span>
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono mt-1 flex items-center gap-1.5">
                              <FiFolder className="text-neutral-500" />
                              {p.projectId?.name || "Unassigned"}
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="p-4 font-mono font-bold text-white tracking-wide">
                            {p.currency === "USD" ? "$" : p.currency} {p.amount.toLocaleString()}
                          </td>

                          {/* Status Badge */}
                          <td className="p-4">
                            <span
                              className={`text-[10px] font-mono px-3 py-1 rounded-full border font-semibold uppercase tracking-wider ${getStatusBadge(
                                p.status
                              )}`}
                            >
                              {p.status}
                            </span>
                          </td>

                          {/* Tasks & Time Logged */}
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-neutral-300">
                                <FiLayers className="text-neutral-500" />
                                {p.tasksCovered?.length || 0} tasks
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                                <FiClock className="text-emerald-500/70" />
                                {totalTaskHours} hrs spent
                              </span>
                            </div>
                          </td>

                          {/* Timeline */}
                          <td className="p-4 text-right">
                            <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-end gap-1.5">
                              <FiCalendar className="text-neutral-500" />
                              {new Date(p.timeline?.startDate).toLocaleDateString()} -{" "}
                              {new Date(p.timeline?.endDate).toLocaleDateString()}
                            </div>
                          </td>

                          {/* Actions & Expand Toggle */}
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleEditClick(p)}
                                title="Edit Record"
                                className="p-1.5 text-amber-400 hover:text-amber-300 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition"
                              >
                                <FiEdit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(p._id)}
                                disabled={isDeleting}
                                title="Delete Record"
                                className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition disabled:opacity-50"
                              >
                                {isDeleting ? (
                                  <FiRefreshCw className="animate-spin w-3.5 h-3.5" />
                                ) : (
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleExpand(p._id)}
                                title="View Breakdown"
                                className="p-1.5 text-neutral-400 hover:text-white rounded-lg bg-neutral-900 border border-neutral-800 transition"
                              >
                                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDED TASK DETAILS ROW */}
                        {isExpanded && (
                          <tr className="bg-[#121215]">
                            <td colSpan={6} className="p-5 border-t border-b border-white/10">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <h4 className="text-xs font-mono font-bold text-neutral-300 flex items-center gap-2">
                                    <FiLayers className="text-emerald-400" /> COVERED TASKS BREAKDOWN
                                  </h4>
                                  <span className="text-[10px] font-mono text-neutral-500">
                                    Total Time: {totalTaskHours} Hours
                                  </span>
                                </div>

                                {!p.tasksCovered || p.tasksCovered.length === 0 ? (
                                  <p className="text-xs text-neutral-500 font-mono py-2">
                                    No task logs associated with this payment.
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                    {p.tasksCovered.map((task) => (
                                      <div
                                        key={task._id}
                                        className="p-3 bg-[#18181c] border border-neutral-800 rounded-xl flex items-center justify-between"
                                      >
                                        <div className="space-y-0.5 pr-2">
                                          <p className="text-xs font-medium text-white truncate">{task.title}</p>
                                          {task.logType && (
                                            <span className="text-[9px] font-mono uppercase bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">
                                              {task.logType}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg shrink-0">
                                          <FiClock className="text-emerald-400 w-3 h-3" />
                                          <span className="text-xs font-mono text-emerald-400 font-semibold">
                                            {task.hoursSpent} hrs
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
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

      {/* POPUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f0f12] border border-white/10 rounded-2xl p-6 space-y-5 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 sticky top-0 bg-[#0f0f12] z-10 pt-1">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                {editingPaymentId ? (
                  <>
                    <FiEdit className="text-amber-400 w-4 h-4" /> Edit Payment Record
                  </>
                ) : (
                  <>
                    <FiPlus className="text-emerald-400 w-4 h-4" /> Create Payment Record
                  </>
                )}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-neutral-400 hover:text-white p-1 rounded-lg bg-neutral-900 border border-neutral-800 transition"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Project Selection */}
              <div>
                <label className="block text-neutral-300 mb-1.5 font-mono text-[11px]">Target Project *</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full bg-[#18181c] border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500/50 transition"
                  required
                >
                  <option value="">Select Target Project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unbilled Work Logs Picker */}
              {selectedProject && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-neutral-300 font-mono text-[11px]">
                      Tasks Covered ({selectedLogs.length}/{availableLogs.length}) *
                    </label>
                    {availableLogs.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAllLogs}
                        className="text-[10px] text-emerald-400 font-mono hover:underline"
                      >
                        {selectedLogs.length === availableLogs.length ? "Deselect All" : "Select All"}
                      </button>
                    )}
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-neutral-800 rounded-xl p-2 space-y-1.5 bg-[#141417]">
                    {availableLogs.length === 0 ? (
                      <p className="text-neutral-500 text-[11px] font-mono py-3 text-center">
                        No unbilled tasks found for this project.
                      </p>
                    ) : (
                      availableLogs.map((log) => (
                        <label
                          key={log._id}
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${selectedLogs.includes(log._id)
                            ? "bg-emerald-950/20 border-emerald-500/40 text-white"
                            : "bg-transparent border-transparent text-neutral-400 hover:bg-neutral-900"
                            }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden pr-2">
                            <input
                              type="checkbox"
                              checked={selectedLogs.includes(log._id)}
                              onChange={() => handleLogToggle(log._id)}
                              className="rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                            />
                            <span className="truncate text-xs font-medium">{log.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded shrink-0">
                            {log.hoursSpent} hrs
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Amount & Currency */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-neutral-300 mb-1.5 font-mono text-[11px]">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-[#18181c] border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500/50 transition font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1.5 font-mono text-[11px]">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-[#18181c] border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500/50 transition font-mono"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-neutral-300 mb-1.5 font-mono text-[11px]">Payment Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#18181c] border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500/50 transition"
                >
                  <option value="pending">Pending</option>
                  <option value="partially-paid">Partially Paid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              {/* Reason / Notes */}
              <div>
                <label className="block text-neutral-300 mb-1.5 font-mono text-[11px]">Invoice Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Milestone 1 - API Implementation"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#18181c] border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500/50 transition"
                  required
                />
              </div>

              {/* Timeline Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-300 mb-1.5 font-mono text-[11px]">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#18181c] border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1.5 font-mono text-[11px]">End Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#18181c] border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-1/3 py-3 bg-neutral-800 text-neutral-300 font-bold rounded-xl hover:bg-neutral-700 transition duration-200 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedLogs.length === 0}
                  className={`${editingPaymentId ? "bg-amber-500 hover:bg-amber-400" : "bg-emerald-500 hover:bg-emerald-400"
                    } w-2/3 py-3 text-black font-bold rounded-xl transition duration-200 disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]`}
                >
                  {isSubmitting ? (
                    <>
                      <FiRefreshCw className="animate-spin w-4 h-4" />
                      {editingPaymentId ? "Updating..." : "Saving..."}
                    </>
                  ) : editingPaymentId ? (
                    <>
                      <FiSave className="w-4 h-4" /> Update Record
                    </>
                  ) : (
                    "Save Payment Log"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}