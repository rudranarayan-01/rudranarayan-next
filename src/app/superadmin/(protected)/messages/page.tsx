"use client";

import { useState, useEffect, useCallback } from "react";
import { FiRefreshCw, FiTrash2, FiMail, FiInbox, FiCheckCircle } from "react-icons/fi";
import { toast } from "sonner";

interface ContactInquiry {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactInquiry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch contact inquiries
  const fetchMessages = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);
      const res = await fetch("/api/admin/contact");
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setMessages(json.data);
        if (json.data.length > 0 && (!selectedId || isManualRefresh)) {
          setSelectedId(json.data[0]._id);
        }
      } else {
        setError(json.error || "Failed to load messages.");
      }
    } catch {
      setError("Network error loading messages.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const activeMessage = messages.find((m) => m._id === selectedId);
  const unreadCount = messages.filter((m) => m.status === "unread").length;

  // Mark as read on select & trigger PATCH API
  const handleSelect = async (id: string) => {
    setSelectedId(id);

    const targetMsg = messages.find((m) => m._id === id);
    if (targetMsg && targetMsg.status === "unread") {
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: "read" } : m))
      );

      try {
        await fetch(`/api/admin/contacts/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "read" }),
        });
      } catch (err) {
        console.error("Failed to update status on server:", err);
      }
    }
  };

  // Delete inquiry & call DELETE API
  const handleDelete = (id: string) => {
    toast("Are you sure you want to delete this message?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          const previousMessages = [...messages];
          const updated = messages.filter((m) => m._id !== id);
          setMessages(updated);

          if (selectedId === id) {
            setSelectedId(updated.length > 0 ? updated[0]._id : null);
          }

          try {
            const res = await fetch(`/api/admin/contact/${id}`, {
              method: "DELETE",
            });

            if (!res.ok) throw new Error("Delete failed");

            toast.success("Message deleted successfully.");
          } catch (err) {
            console.error(err);
            // Rollback state on error
            setMessages(previousMessages);
            toast.error("Failed to delete message. Changes reverted.");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          // Optional: Any action on cancel
        },
      },
    });
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-950/60 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Messages Inbox
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Review and respond to client inquiries, hiring leads, and technical consultations.
          </p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => fetchMessages(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono text-zinc-300 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/30 rounded-xl transition-all duration-200 disabled:opacity-50"
        >
          <FiRefreshCw
            className={`w-3.5 h-3.5 text-emerald-400 ${refreshing ? "animate-spin" : ""
              }`}
          />
          {refreshing ? "Syncing..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="h-[600px] flex flex-col items-center justify-center gap-3 text-xs font-mono text-zinc-500 bg-zinc-950/40 border border-zinc-900 rounded-2xl">
          <FiRefreshCw className="w-5 h-5 text-emerald-500 animate-spin" />
          <span>Fetching incoming messages...</span>
        </div>
      ) : error ? (
        <div className="h-[600px] flex flex-col items-center justify-center gap-2 text-xs font-mono text-red-400 bg-zinc-950/40 border border-red-950/40 rounded-2xl">
          <span>{error}</span>
          <button
            onClick={() => fetchMessages()}
            className="mt-2 text-xs text-emerald-400 underline underline-offset-4"
          >
            Try Again
          </button>
        </div>
      ) : messages.length === 0 ? (
        <div className="h-[600px] flex flex-col items-center justify-center gap-3 text-xs font-mono text-zinc-500 border border-zinc-900 bg-zinc-950/40 rounded-2xl">
          <FiInbox className="w-8 h-8 text-zinc-700" />
          <span>No messages found in your inbox.</span>
        </div>
      ) : (
        /* Split View Inbox */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
          {/* Messages List Sidebar */}
          <div className="lg:col-span-5 bg-zinc-950/60 border border-zinc-900 rounded-2xl overflow-y-auto divide-y divide-zinc-900/80 custom-scrollbar">
            {messages.map((msg) => {
              const isSelected = selectedId === msg._id;
              const isUnread = msg.status === "unread";

              return (
                <div
                  key={msg._id}
                  onClick={() => handleSelect(msg._id)}
                  className={`p-4 cursor-pointer transition-all duration-200 relative group ${isSelected
                      ? "bg-zinc-900/90 border-l-2 border-l-emerald-500 shadow-inner"
                      : "hover:bg-zinc-900/40"
                    }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      <span
                        className={`text-xs font-semibold truncate ${isUnread ? "text-white" : "text-zinc-300"
                          }`}
                      >
                        {msg.name || "Inquirer"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-200 font-medium truncate mb-1">
                    {msg.subject || "Contact Form Inquiry"}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate line-clamp-1">
                    {msg.message}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Selected Message Detail Pane */}
          <div className="lg:col-span-7 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between relative shadow-xl">
            {activeMessage ? (
              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {/* Message Meta Info */}
                <div className="border-b border-zinc-900 pb-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
                      {activeMessage.subject || "Contact Form Inquiry"}
                    </h2>
                    <button
                      onClick={() => handleDelete(activeMessage._id)}
                      className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-red-400 hover:bg-red-500/10 px-2.5 py-1 rounded-lg border border-transparent hover:border-red-500/20 transition-all duration-200 shrink-0"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-zinc-400 bg-zinc-900/50 p-3 rounded-xl border border-zinc-900">
                    <div>
                      From:{" "}
                      <span className="text-emerald-400 font-medium">
                        {activeMessage.name || "Inquirer"}
                      </span>{" "}
                      <span className="text-zinc-500">
                        (&lt;{activeMessage.email}&gt;)
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {formatDate(activeMessage.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap pt-2">
                  {activeMessage.message}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
                <FiMail className="w-6 h-6 text-zinc-700" />
                <span>Select a message to view content</span>
              </div>
            )}

            {/* Quick Reply Footer */}
            {activeMessage && (
              <div className="pt-4 mt-4 border-t border-zinc-900 flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-500/80 flex items-center gap-1.5">
                  <FiCheckCircle className="w-3.5 h-3.5" /> Ready for response
                </span>
                <a
                  href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(
                    activeMessage.subject || "Inquiry Response"
                  )}`}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-zinc-950 text-xs font-bold rounded-xl hover:bg-emerald-400 transition-all duration-200 font-mono shadow-lg shadow-emerald-500/10"
                >
                  <FiMail className="w-3.5 h-3.5" />
                  Reply via Email
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}