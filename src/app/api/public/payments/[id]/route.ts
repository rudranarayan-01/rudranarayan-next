import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { Payment } from "@/models/Payment"; 
import "@/models/Project"
import "@/models/WorkLog"

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid payment report ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const payment = await Payment.findById(id)
      .populate("projectId", "name clientInfo")
      .populate(
        "tasksCovered",
        "title details hoursSpent date logType techStackUsed"
      )
      .lean();

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Work log report not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: payment }, { status: 200 });
  } catch (error: any) {
    console.error("Public payment fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load work log report." },
      { status: 500 }
    );
  }
}