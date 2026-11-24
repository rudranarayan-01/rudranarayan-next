/* eslint-disable no-unused-vars */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FiEdit, FiPlus, FiRefreshCw, FiSave, FiX } from "react-icons/fi";

export interface ProjectOption {
  _id: string;
  name: string;
}

export interface WorkLogItem {
  _id: string;
  title: string;
  hoursSpent: number;
}

export type PaymentStatus = "pending" | "partially-paid" | "paid";

interface PaymentFormModalProps {
  isOpen: boolean;
  editingPaymentId: string | null;
  projects: ProjectOption[];
  selectedProject: string;
  setSelectedProject: (projectId: string) => void;
  availableLogs: WorkLogItem[];
  selectedLogs: string[];
  handleLogToggle: (logId: string) => void;
  handleSelectAllLogs: () => void;
  amount: number | "";
  setAmount: (val: number | "") => void;
  currency: string;
  setCurrency: (val: string) => void;
  status: PaymentStatus;
  setStatus: (val: PaymentStatus) => void;
  reason: string;
  setReason: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function PaymentFormModal({
  isOpen,
  editingPaymentId,
  projects,
  selectedProject,
  setSelectedProject,
  availableLogs,
  selectedLogs,
  handleLogToggle,
  handleSelectAllLogs,
  amount,
  setAmount,
  currency,
  setCurrency,
  status,
  setStatus,
  reason,
  setReason,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isSubmitting,
  onClose,
  onSubmit,
}: PaymentFormModalProps) {
  const [hourlyRate, setHourlyRate] = useState<number | "">("");

  const totalSelectedHours = useMemo(() => {
    return availableLogs
      .filter((log) => selectedLogs.includes(log._id))
      .reduce((sum, log) => sum + (Number(log.hoursSpent) || 0), 0);
  }, [availableLogs, selectedLogs]);

  // Reset hourly rate when modal opens or switches between create/edit
  useEffect(() => {
    if (!isOpen) {
      setHourlyRate("");
    }
  }, [isOpen, editingPaymentId]);

  // Recalculate amount automatically when hourly rate or selected hours change
  useEffect(() => {
    if (hourlyRate === "" || Number.isNaN(Number(hourlyRate))) return;
    const calculated = Number((totalSelectedHours * Number(hourlyRate)).toFixed(2));
    setAmount(calculated);
  }, [hourlyRate, totalSelectedHours, setAmount]);

  if (!isOpen) return null;

  return (
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
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg bg-neutral-900 border border-neutral-800 transition"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          {/* Project Selection */}
          <div>
            <label className="block text-neutral-300 mb-1.5 font-mono text-[11px]">
              Target Project *
            </label>
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
                  Tasks Covered ({selectedLogs.length}/{availableLogs.length}) •{" "}
                  <span className="text-emerald-400">{totalSelectedHours} hrs</span> *
                </label>
                {availableLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllLogs}
                    className="text-[10px] text-emerald-400 font-mono hover:underline"
                  >
                    {selectedLogs.length === availableLogs.length
                      ? "Deselect All"
                      : "Select All"}
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
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                        selectedLogs.includes(log._id)
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
                        <span className="truncate text-xs font-medium">
                          {log.title}
                        </span>
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

          {/* Per Hour Rate, Calculated Amount & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-neutral-300 mb-1.5 font-mono text-[11px]">
                Rate / Hr
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={hourlyRate}
                onChange={(e) =>
                  setHourlyRate(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-full bg-[#18181c] border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500/50 transition font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-neutral-300 font-mono text-[11px]">
                  Amount *
                </label>
                {hourlyRate !== "" && (
                  <span className="text-[10px] font-mono text-emerald-400">
                    {totalSelectedHours}h × {hourlyRate}
                  </span>
                )}
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-full bg-[#18181c] border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500/50 transition font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-300 mb-1.5 font-mono text-[11px]">
                Currency
              </label>
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
            <label className="block text-neutral-300 mb-1.5 font-mono text-[11px]">
              Payment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PaymentStatus)}
              className="w-full bg-[#18181c] border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500/50 transition"
            >
              <option value="pending">Pending</option>
              <option value="partially-paid">Partially Paid</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block text-neutral-300 mb-1.5 font-mono text-[11px]">
              Invoice Description *
            </label>
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
              <label className="block text-neutral-300 mb-1.5 font-mono text-[11px]">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#18181c] border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-300 mb-1.5 font-mono text-[11px]">
                End Date *
              </label>
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
              onClick={onClose}
              className="w-1/3 py-3 bg-neutral-800 text-neutral-300 font-bold rounded-xl hover:bg-neutral-700 transition duration-200 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedLogs.length === 0}
              className={`${
                editingPaymentId
                  ? "bg-amber-500 hover:bg-amber-400"
                  : "bg-emerald-500 hover:bg-emerald-400"
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
  );
}