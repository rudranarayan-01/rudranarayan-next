import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

export default async function SuperAdminDashboard() {
  const session = await getSession();

  // Hard protection at page level
  if (!session) {
    redirect("/superadmin/login");
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold">Portfolio Control Panel</h1>
        <form action={logoutAction}>
          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500">
            Logout
          </button>
        </form>
      </div>

      <p className="text-green-400">Welcome, {String(session.user)}</p>
    </div>
  );
}