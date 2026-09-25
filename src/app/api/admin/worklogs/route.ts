import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { WorkLog } from "@/models/WorkLog";
import "@/models/Project";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const query = projectId ? { projectId } : {};
    const logs = await WorkLog.find(query)
      .populate("projectId", "name type")
      .sort({ date: -1 });

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const newLog = await WorkLog.create(body);
    return NextResponse.json(newLog, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}