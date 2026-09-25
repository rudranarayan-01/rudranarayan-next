import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db"; // Adjust path to your database connection helper
import { Project } from "@/models/Project";
import { WorkLog } from "@/models/WorkLog";
import { Payment } from "@/models/Payment";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    // Filter by project if `projectId` query param is supplied
    const projectFilter = projectId ? { _id: projectId } : {};

    // 1. Fetch Projects
    const projects = await Project.find(projectFilter).lean();

    // 2. Fetch all Work Logs and Payments for analysis
    const workLogs = await WorkLog.find(
      projectId ? { projectId } : {}
    ).lean();

    const payments = await Payment.find(
      projectId ? { projectId } : {}
    ).lean();

    // 3. Aggregate metrics per project
    const projectSummaries = projects.map((project) => {
      const projIdStr = project._id.toString();

      // Logs for this project
      const projLogs = workLogs.filter(
        (log) => log.projectId?.toString() === projIdStr
      );

      // Payments for this project
      const projPayments = payments.filter(
        (payment) => payment.projectId?.toString() === projIdStr
      );

      // Total hours spent
      const totalHours = projLogs.reduce(
        (sum, log) => sum + (log.hoursSpent || 0),
        0
      );

      // Total earnings calculations
      const totalEarnings = projPayments.reduce(
        (sum, pay) => sum + (pay.amount || 0),
        0
      );

      const paidEarnings = projPayments
        .filter((pay) => pay.status === "paid")
        .reduce((sum, pay) => sum + (pay.amount || 0), 0);

      const pendingEarnings = projPayments
        .filter((pay) => pay.status === "pending")
        .reduce((sum, pay) => sum + (pay.amount || 0), 0);

      // Effective Hourly Rate
      const effectiveHourlyRate =
        totalHours > 0 ? (totalEarnings / totalHours).toFixed(2) : 0;

      // Group Work Logs by Feature / Module / LogType
      const featureBreakdownMap: Record<
        string,
        { featureName: string; totalHours: number; taskCount: number; tasks: any[] }
      > = {};

      projLogs.forEach((log) => {
        const featureKey = log.logType || log.feature || "General Work";
        if (!featureBreakdownMap[featureKey]) {
          featureBreakdownMap[featureKey] = {
            featureName: featureKey,
            totalHours: 0,
            taskCount: 0,
            tasks: [],
          };
        }
        featureBreakdownMap[featureKey].totalHours += log.hoursSpent || 0;
        featureBreakdownMap[featureKey].taskCount += 1;
        featureBreakdownMap[featureKey].tasks.push({
          id: log._id,
          title: log.title,
          hoursSpent: log.hoursSpent,
          createdAt: log.createdAt,
          paymentId: log.paymentId,
        });
      });

      const featureBreakdown = Object.values(featureBreakdownMap);

      return {
        _id: projIdStr,
        name: project.name,
        description: project.description,
        type: project.type || "Web App",
        status: project.status || "active",
        metrics: {
          totalHours,
          totalEarnings,
          paidEarnings,
          pendingEarnings,
          effectiveHourlyRate: Number(effectiveHourlyRate),
          totalTasks: projLogs.length,
          totalPaymentsCount: projPayments.length,
        },
        featureBreakdown,
        workLogs: projLogs,
        payments: projPayments,
      };
    });

    return NextResponse.json({
      success: true,
      projects: projectSummaries,
    });
  } catch (error: any) {
    console.error("Error generating project overview:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server Error" },
      { status: 500 }
    );
  }
}