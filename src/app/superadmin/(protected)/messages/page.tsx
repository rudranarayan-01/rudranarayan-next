"use client";

import { useState } from "react";

interface Message {
  id: string;
  senderName: string;
  email: string;
  subject: string;
  body: string;
  date: string;
  unread: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    senderName: "Alex Rivera",
    email: "alex.rivera@techcorp.io",
    subject: "Full-stack Lead Opportunity",
    body: "Hi! I checked your HouseXpertz project and was thoroughly impressed by the generative AI routing setup. Our engineering team at TechCorp is currently seeking a Lead Full-stack Developer. Let me know if you'd be open for a short introductory call this week.",
    date: "10 mins ago",
    unread: true,
  },
  {
    id: "2",
    senderName: "Sarah Chen",
    email: "sarah@designstudio.co",
    subject: "AI Project Collaboration Proposal",
    body: "Hey there! We have a client in retail security looking to integrate a custom computer vision tracking system. Your work on Supermarket Guard Pro looks like a great benchmark. Are you open for freelance consulting?",
    date: "2 hours ago",
    unread: true,
  },
  {
    id: "3",
    senderName: "Marcus Vance",
    email: "m.vance@venturecap.com",
    subject: "Technical Consultation Request",
    body: "Hello, I wanted to reach out regarding technical advisory services for an upcoming event management application deployment.",
    date: "Yesterday",
    unread: false,
  },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_MESSAGES[0].id);

  const activeMessage = messages.find((m) => m.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setMessages(
      messages.map((m) => (m.id === id ? { ...m, unread: false } : m))
    );
  };

  const handleDelete = (id: string) => {
    const updated = messages.filter((m) => m.id !== id);
    setMessages(updated);
    if (updated.length > 0) setSelectedId(updated[0].id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Messages Inbox</h1>
        <p className="text-xs text-zinc-400 mt-1 font-mono">
          Review and respond to client inquiries, hiring leads, and technical consultation requests.
        </p>
      </div>

      {/* Split View Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        {/* Messages List Sidebar */}
        <div className="lg:col-span-5 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl overflow-y-auto divide-y divide-zinc-800/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => handleSelect(msg.id)}
              className={`p-4 cursor-pointer transition-all duration-200 ${
                selectedId === msg.id
                  ? "bg-zinc-800/80 border-l-2 border-l-white"
                  : "hover:bg-zinc-900/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold ${msg.unread ? "text-white" : "text-zinc-300"}`}>
                  {msg.senderName}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">{msg.date}</span>
              </div>
              <p className="text-xs text-zinc-200 font-medium truncate">{msg.subject}</p>
              <p className="text-[11px] text-zinc-500 truncate mt-1">{msg.body}</p>
            </div>
          ))}
        </div>

        {/* Selected Message Detail Pane */}
        <div className="lg:col-span-7 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between">
          {activeMessage ? (
            <div className="space-y-6 flex-1">
              {/* Message Meta Info */}
              <div className="border-b border-zinc-800/80 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">{activeMessage.subject}</h2>
                  <button
                    onClick={() => handleDelete(activeMessage.id)}
                    className="text-xs font-mono text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Delete Message
                  </button>
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  From: <span className="text-white">{activeMessage.senderName}</span> (&lt;{activeMessage.email}&gt;)
                </div>
              </div>

              {/* Message Body Content */}
              <div className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
                {activeMessage.body}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500 font-mono">
              No message selected.
            </div>
          )}

          {/* Quick Reply Button Anchor */}
          {activeMessage && (
            <div className="pt-4 border-t border-zinc-800/80 flex justify-end">
              <a
                href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(activeMessage.subject)}`}
                className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-xl hover:bg-zinc-200 transition-colors font-mono"
              >
                Reply via Email →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}