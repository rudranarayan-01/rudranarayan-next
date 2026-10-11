import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Payment } from "@/models/Payment";
import { WorkLog } from "@/models/WorkLog";
import connectDB from "@/lib/db";

export async function POST(req: Request) {
  await connectDB();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const body = await req.json();
    const { projectId, amount, currency, status, tasksCovered, reason, timeline, paidAt } = body;

    // Validation
    if (!projectId || !tasksCovered || tasksCovered.length === 0 || !amount || !reason) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // 1. Create Payment
    const [newPayment] = await Payment.create(
      [
        {
          projectId,
          amount,
          currency: currency || "USD",
          status,
          tasksCovered,
          reason,
          timeline,
          paidAt: status === "paid" ? paidAt || new Date() : null,
        },
      ],
      { session }
    );

    // 2. Link Payment ID to corresponding Work Logs
    await WorkLog.updateMany(
      { _id: { $in: tasksCovered } },
      { $set: { paymentId: newPayment._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({ success: true, payment: newPayment }, { status: 201 });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  await connectDB();
  try {
    const payments = await Payment.find()
      .populate("projectId", "name clientInfo")
      .populate(
        "tasksCovered",
        "title logType details techStackUsed hoursSpent date createdAt"
      )
      .sort({ createdAt: -1 });

    // Optional: Transform the output slightly if `date` needs fallback to `createdAt`
    const formattedPayments = payments.map((payment: any) => {
      const paymentObj = payment.toObject();
      paymentObj.tasksCovered = paymentObj.tasksCovered.map((task: any) => ({
        _id: task._id,
        date: task.date || task.createdAt || payment.createdAt,
        logType: task.logType || "feature",
        title: task.title,
        details: task.details || "No details provided.",
        techStackUsed: task.techStackUsed || [],
        hoursSpent: task.hoursSpent || 0,
      }));
      return paymentObj;
    });

    return NextResponse.json({ payments: formattedPayments }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}