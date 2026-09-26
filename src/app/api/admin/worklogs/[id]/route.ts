import { NextRequest, NextResponse } from "next/server";
import { WorkLog } from "@/models/WorkLog";
import mongoose from "mongoose";
import connectDB from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// UPDATE (PUT / PATCH) Work Log
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid WorkLog ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      projectId,
      date,
      logType,
      title,
      details,
      techStackUsed,
      hoursSpent,
      paymentId,
    } = body;

    // Optional: Validate logType if present in update body
    const validLogTypes = ["feature", "bug-fix", "refactor", "maintenance"];
    if (logType && !validLogTypes.includes(logType)) {
      return NextResponse.json(
        { success: false, error: "Invalid logType value" },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedWorkLog = await WorkLog.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(projectId && { projectId }),
          ...(date && { date }),
          ...(logType && { logType }),
          ...(title && { title }),
          ...(details && { details }),
          ...(techStackUsed && { techStackUsed }),
          ...(hoursSpent !== undefined && { hoursSpent }),
          ...(paymentId !== undefined && { paymentId }),
        },
      },
      { new: true, runValidators: true }
    ).populate("projectId", "title name");

    if (!updatedWorkLog) {
      return NextResponse.json(
        { success: false, error: "WorkLog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedWorkLog },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/admin/worklogs/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update work log" },
      { status: 500 }
    );
  }
}

// DELETE Work Log
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid WorkLog ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const deletedWorkLog = await WorkLog.findByIdAndDelete(id);

    if (!deletedWorkLog) {
      return NextResponse.json(
        { success: false, error: "WorkLog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Work log deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/admin/worklogs/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete work log" },
      { status: 500 }
    );
  }
}