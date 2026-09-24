/* eslint-disable no-undef */
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "../../components/superadmin/Sidebar";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/superadmin/login");
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex font-sans">
      <Sidebar userEmail={String(session.user)} />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}