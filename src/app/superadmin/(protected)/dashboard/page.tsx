import { getSession } from "@/lib/auth";
import Link from "next/link";

// Mock data structures for executive analytics
const METRICS = [
  {
    title: "Total Portfolio Views",
    value: "24,892",
    change: "+18.4%",
    isPositive: true,
    timeframe: "vs. last month",
    icon: (
      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: "Active Projects",
    value: "12",
    change: "+2 this week",
    isPositive: true,
    timeframe: "4 in review",
    icon: (
      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    title: "Inquiries Received",
    value: "38",
    change: "+12.5%",
    isPositive: true,
    timeframe: "5 unread",
    icon: (
      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "System Performance",
    value: "99.98%",
    change: "0.02ms lat",
    isPositive: true,
    timeframe: "Optimal condition",
    icon: (
      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const RECENT_MESSAGES = [
  {
    id: "1",
    name: "Alex Rivera",
    email: "alex.rivera@techcorp.io",
    subject: "Full-stack Lead Opportunity",
    date: "10 mins ago",
    status: "Unread",
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah@designstudio.co",
    subject: "AI Project Collaboration Proposal",
    date: "2 hours ago",
    status: "Unread",
  },
  {
    id: "3",
    name: "Marcus Vance",
    email: "m.vance@venturecap.com",
    subject: "Technical Consultation Request",
    date: "Yesterday",
    status: "Read",
  },
];

const RECENT_PROJECTS = [
  { name: "HouseXpertz Platform", tech: "Next.js, MongoDB, AI Route", status: "Published", rating: "4.9/5" },
  { name: "Supermarket Guard Pro", tech: "Python, OpenCV, YOLO", status: "In Development", rating: "Beta" },
  { name: "National News Engine", tech: "TypeScript, Express, SQLite", status: "Published", rating: "5.0/5" },
];

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="space-y-8 pb-10">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
              Executive Overview
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md">
              Live
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1.5 font-mono">
            Authenticated operator:{" "}
            <span className="text-zinc-200 font-semibold">
              {String(session?.user ?? "admin@system.local")}
            </span>
          </p>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-3">
          <Link
            href="/superadmin/projects/new"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white text-black hover:bg-zinc-200 transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Project</span>
          </Link>
          <Link
            href="/superadmin/blogs/new"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Write Article</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((metric, idx) => (
          <div
            key={idx}
            className="p-5 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                {metric.title}
              </span>
              <div className="p-2 bg-zinc-900 rounded-xl border border-zinc-800/80">
                {metric.icon}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white tracking-tight">
                {metric.value}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-medium text-emerald-400 font-mono">
                  {metric.change}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  • {metric.timeframe}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Visualization + Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom Mock Traffic Activity Chart */}
        <div className="lg:col-span-2 p-6 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Traffic & Engagement Metrics
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real-time API requests and visitor interactions
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-white" /> Visits
              </span>
              <span className="flex items-center gap-1.5 text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-zinc-700" /> API Calls
              </span>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-48 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-zinc-800/80">
            {[40, 65, 55, 80, 95, 70, 85, 60, 75, 90, 100, 82].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group h-full justify-end">
                <div
                  style={{ height: `${height}%` }}
                  className="w-full bg-zinc-800 group-hover:bg-white rounded-t-sm transition-all duration-300 relative"
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] font-mono py-0.5 px-1.5 rounded border border-zinc-700 pointer-events-none transition-opacity">
                    {height * 24}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-3 px-1">
            <span>JAN</span>
            <span>FEB</span>
            <span>MAR</span>
            <span>APR</span>
            <span>MAY</span>
            <span>JUN</span>
            <span>JUL</span>
            <span>AUG</span>
            <span>SEP</span>
            <span>OCT</span>
            <span>NOV</span>
            <span>DEC</span>
          </div>
        </div>

        {/* Top Featured Projects Widget */}
        <div className="p-6 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Portfolio Status
              </h2>
              <Link href="/superadmin/projects" className="text-[11px] font-mono text-zinc-400 hover:text-white transition-colors">
                View All →
              </Link>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Current state of highlighted repository deployments.
            </p>

            <div className="space-y-3">
              {RECENT_PROJECTS.map((project, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl flex items-center justify-between hover:border-zinc-700/60 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">{project.name}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">{project.tech}</p>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                      project.status === "Published"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span>Storage Used</span>
            <span className="font-mono text-zinc-200">1.2 GB / 10 GB</span>
          </div>
        </div>
      </div>

      {/* Communications Data Table */}
      <div className="p-6 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Recent Message Inquiries
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Direct contacts submitted through portfolio feedback forms
            </p>
          </div>
          <Link
            href="/superadmin/messages"
            className="text-xs font-mono px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Manage Messages
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-zinc-800/80 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                <th className="pb-3 px-2 font-medium">Sender</th>
                <th className="pb-3 px-2 font-medium">Subject</th>
                <th className="pb-3 px-2 font-medium">Received</th>
                <th className="pb-3 px-2 font-medium">Status</th>
                <th className="pb-3 px-2 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {RECENT_MESSAGES.map((msg) => (
                <tr key={msg.id} className="group hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 px-2">
                    <div className="font-medium text-white">{msg.name}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">{msg.email}</div>
                  </td>
                  <td className="py-3 px-2 text-zinc-300 font-medium">{msg.subject}</td>
                  <td className="py-3 px-2 text-zinc-400 font-mono">{msg.date}</td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                        msg.status === "Unread"
                          ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400"
                      }`}
                    >
                      {msg.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Link
                      href={`/superadmin/messages/${msg.id}`}
                      className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}