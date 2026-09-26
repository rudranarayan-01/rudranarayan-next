import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Setting } from "@/models/Setting";

export async function GET() {
  try {
    await connectDB();
    let settings = await Setting.findOne({});
    if (!settings) {
      settings = await Setting.create({});
    }
    return NextResponse.json({ success: true, data: settings }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const updatedSettings = await Setting.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: updatedSettings }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update settings" },
      { status: 400 }
    );
  }
}