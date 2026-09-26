import { NextRequest, NextResponse } from "next/server";
import { Payment } from "@/models/Payment";
// eslint-disable-next-line no-unused-vars
import { WorkLog } from "@/models/WorkLog";
import connectDB from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Payment ID is required" },
        { status: 400 }
      );
    }

    const payment = await Payment.findById(id)
      .populate("projectId", "name type")
      .populate("tasksCovered");

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: payment }, { status: 200 });
  } catch (error: any) {
    console.error("GET Payment Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Payment ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (body.status === "paid" && !body.paidAt) {
      body.paidAt = new Date();
    } else if (body.status && body.status !== "paid") {
      body.paidAt = null;
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate("projectId", "name type")
      .populate("tasksCovered");

    if (!updatedPayment) {
      return NextResponse.json(
        { success: false, message: "Payment record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedPayment },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE Payment
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Payment ID is required" },
        { status: 400 }
      );
    }

    const deletedPayment = await Payment.findByIdAndDelete(id);

    if (!deletedPayment) {
      return NextResponse.json(
        { success: false, message: "Payment record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Payment deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
