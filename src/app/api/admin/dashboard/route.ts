import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import Contact from "@/models/Contact";
import Task from "@/models/Task";
import connectDB from "@/lib/db";
import { Payment } from "@/models/Payment";
import { Project } from "@/models/Project";
import { WorkLog } from "@/models/WorkLog";
import { VisitorLog } from "@/models/VisitorLog";

export async function GET() {
  try {
    await connectDB();
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 1. Calculate Financials from Payment Model
    const pendingPayments = await Payment.aggregate([
      { $match: { status: "Pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalPendingAmount = pendingPayments[0]?.total || 0;

    // 2. Count Active Projects & Pending Tasks
    const activeProjectsCount = await Project.countDocuments();
    const pendingTasksCount = await Task.countDocuments({
      status: { $in: ["Pending", "In Progress"] },
    });

    // 3. Work Logs (Hours logged this month)
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const workLogs = await WorkLog.aggregate([
      { $match: { createdAt: {$gte: startOfMonth } } },
      { $group: { _id: null, totalHours: { $sum: "$hours" } } },
    ]);
    const hoursLoggedThisMonth = workLogs[0]?.totalHours || 0;

    // 4. Contact Inquiries (Case-insensitive status query)
    const unreadInquiriesCount = await Contact.countDocuments({
      status: { $regex: /^unread$/i },
    });

    const recentInquiries = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(4);

    // 5. Urgent Pending Tasks
    const urgentTasks = await Task.find({ status: { $ne: "Completed" } })
      .sort({ dueDate: 1 })
      .limit(3);

    // 6. Recent Projects Status
    const recentProjects = await Project.find()
      .sort({ updatedAt: -1 })
      .limit(3);

    // 7. System & Website Metrics from Visitor Logs
    const totalPortfolioViews = await VisitorLog.countDocuments();
    const uniqueVisitors = await VisitorLog.distinct("ip");
    const recentVisitors = await VisitorLog.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const data = {
      userEmail: session.user?.email || "freelancer@system.local",
      metrics: [
        {
          id: "pending_payments",
          title: "Pending Payments",
          value: `$${totalPendingAmount.toLocaleString()}`,
          change: "Unpaid invoices",
          isPositive: false,
          timeframe: "Requires follow-up",
          type: "money",
        },
        {
          id: "active_projects",
          title: "Active Projects",
          value: String(activeProjectsCount),
          change: `${pendingTasksCount} tasks pending`,
          isPositive: true,
          timeframe: `${hoursLoggedThisMonth} hrs logged this mo.`,
          type: "box",
        },
        {
          id: "inquiries",
          title: "Inquiries Received",
          value: String(await Contact.countDocuments()),
          change: `+${unreadInquiriesCount} new`,
          isPositive: true,
          timeframe: "Unread messages",
          type: "mail",
        },
        {
          id: "views",
          title: "Portfolio Views",
          value: totalPortfolioViews.toLocaleString(),
          change: `${uniqueVisitors.length} unique IPs`,
          isPositive: true,
          timeframe: "Total tracked",
          type: "eye",
        },
      ],
      recentVisitors: recentVisitors.map((v) => ({
        id: v._id,
        ip: v.ip,
        location: v.city && v.country ? `${v.city}, ${v.country}` : "Unknown Location",
        organization: v.org || "Unknown ISP",
        path: v.path || "/",
        time: new Date(v.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
      trafficData: [
        { month: "JAN", value: 40 },
        { month: "FEB", value: 65 },
        { month: "MAR", value: 55 },
        { month: "APR", value: 80 },
        { month: "MAY", value: 95 },
        { month: "JUN", value: 70 },
        { month: "JUL", value: 85 },
        { month: "AUG", value: 60 },
        { month: "SEP", value: 75 },
        { month: "OCT", value: 90 },
        { month: "NOV", value: 100 },
        { month: "DEC", value: 82 },
      ],
      urgentTasks: urgentTasks.map((t: any) => ({
        id: t._id,
        title: t.title,
        projectName: t.project?.name || "General",
        priority: t.priority || "Medium",
        dueDate: t.dueDate
          ? new Date(t.dueDate).toLocaleDateString()
          : "No date",
      })),
      recentProjects: recentProjects.map((p) => ({
        id: p._id,
        name: p.name,
        tech: p.techStack || p.category || "Development",
        status: p.status,
      })),
      recentInquiries: recentInquiries.map((c) => ({
        id: c._id,
        name: c.name,
        email: c.email,
        subject: c.subject || c.message?.substring(0, 30) + "...",
        date: new Date(c.createdAt).toLocaleDateString(),
        status: c.status || "Unread",
      })),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Dashboard DB Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}