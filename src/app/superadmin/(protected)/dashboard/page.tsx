"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Metric {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  timeframe: string;
  type: string;
}

interface Task {
  id: string;
  title: string;
  projectName: string;
  priority: "High" | "Medium" | "Low" | string;
  dueDate: string;
}

interface Project {
  id: string;
  name: string;
  tech: string;
  status: string;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  date: string;
  status: string;
}

interface Visitor {
  id: string;
  ip: string;
  location: string;
  organization: string;
  path: string;
  time: string;
}

interface FreelancerDashboardData {
  userEmail: string;
  metrics: Metric[];
  trafficData: { month: string; value: number }[];
  urgentTasks: Task[];
  recentProjects: Project[];
  recentInquiries: Inquiry[];
  recentVisitors: Visitor[];
}

export default function FreelancerDashboard() {
  const [data, setData] = useState<FreelancerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/admin/dashboard");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally{
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const renderIcon = (type: string) => {
    switch (type) {
      case "money":
        return (
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "box":
        return (
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case "mail":
        return (
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case "eye":
      default:
        return (
          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
    }
  };

  if (loading) {
    return <div className="py-24 text-center font-mono text-xs text-zinc-500 animate-pulse">Loading Freelancer Workspace...</div>;
  }

  if (!data) {
    return <div className="py-20 text-center font-mono text-xs text-red-400">Error loading dashboard data.</div>;
  }

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Freelance Control Center</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md">Live</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1.5 font-mono">
            Operator: <span className="text-zinc-200 font-semibold">{data.userEmail}</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Link href="/superadmin/worklog/new" className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors">
            + Log Hours
          </Link>
          <Link href="/superadmin/projects/new" className="px-3.5 py-2 rounded-xl text-xs font-medium bg-white text-black hover:bg-zinc-200 transition-colors shadow-sm">
            + New Project
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.metrics.map((m) => (
          <div key={m.id} className="p-5 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl flex flex-col justify-between hover:border-zinc-700/80 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">{m.title}</span>
              <div className="p-2 bg-zinc-900 rounded-xl border border-zinc-800/80">{renderIcon(m.type)}</div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white tracking-tight">{m.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-mono text-emerald-400">{m.change}</span>
                <span className="text-[11px] font-mono text-zinc-500">• {m.timeframe}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Pending Tasks & Website Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Work & Tasks List */}
        <div className="p-6 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">My Pending Tasks</h2>
              <Link href="/superadmin/tasks" className="text-[11px] font-mono text-zinc-400 hover:text-white">View All →</Link>
            </div>
            <div className="space-y-3">
              {data.urgentTasks.length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono py-4 text-center">No pending tasks!</p>
              ) : (
                data.urgentTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">{task.title}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">{task.projectName} • Due: {task.dueDate}</p>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      task.priority === "High" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Website Traffic & Engagement Graph */}
        <div className="lg:col-span-2 p-6 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Website Visitors & Traffic</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Real-time portfolio visitors</p>
            </div>
          </div>
          <div className="h-44 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-zinc-800/80">
            {data.trafficData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end">
                <div style={{ height: `${d.value}%` }} className="w-full bg-zinc-800 group-hover:bg-white rounded-t-sm transition-all relative" />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-3">
            {data.trafficData.map((d) => (
              <span key={d.month}>{d.month}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Live Visitors Tracking Table */}
      <div className="p-6 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Recent Live Visitors</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Real-time incoming IP, geolocation, and ISP network data</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800/80 text-zinc-400 text-[10px] uppercase">
                <th className="pb-3 px-2">IP Address</th>
                <th className="pb-3 px-2">Location</th>
                <th className="pb-3 px-2">Network / ISP</th>
                <th className="pb-3 px-2">Page Path</th>
                <th className="pb-3 px-2 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {data.recentVisitors?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-zinc-500">No visitors tracked yet.</td>
                </tr>
              ) : (
                data.recentVisitors?.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-2 text-white font-medium">{visitor.ip}</td>
                    <td className="py-3 px-2 text-zinc-300">{visitor.location}</td>
                    <td className="py-3 px-2 text-zinc-400">{visitor.organization}</td>
                    <td className="py-3 px-2 text-emerald-400">{visitor.path}</td>
                    <td className="py-3 px-2 text-right text-zinc-500">{visitor.time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Communications Table */}
      <div className="p-6 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Recent Client Inquiries</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Leads submitted through your portfolio contact form</p>
          </div>
          <Link href="/superadmin/messages" className="text-xs font-mono px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white">
            Manage Contacts
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 text-zinc-400 font-mono text-[10px] uppercase">
                <th className="pb-3 px-2">Client</th>
                <th className="pb-3 px-2">Subject / Message</th>
                <th className="pb-3 px-2">Date</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {data.recentInquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 px-2">
                    <div className="font-medium text-white">{inquiry.name}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">{inquiry.email}</div>
                  </td>
                  <td className="py-3 px-2 text-zinc-300 font-medium">{inquiry.subject}</td>
                  <td className="py-3 px-2 text-zinc-400 font-mono">{inquiry.date}</td>
                  <td className="py-3 px-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      inquiry.status === "Unread" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                    }`}>
                      {inquiry.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Link href={`/superadmin/messages/${inquiry.id}`} className="text-xs font-mono text-zinc-400 hover:text-white">
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