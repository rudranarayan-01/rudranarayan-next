import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Active session initialized for <span className="text-emerald-400 font-mono">{String(session?.user)}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-zinc-950 border border-zinc-800/80 rounded-2xl">
          <p className="text-[11px] text-zinc-400 uppercase font-mono tracking-wider">Status</p>
          <p className="text-lg font-semibold text-emerald-400 mt-1">Active</p>
        </div>
      </div>
    </div>
  );
}