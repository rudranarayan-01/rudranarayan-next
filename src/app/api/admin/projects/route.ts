import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Project } from "@/models/Project";

// GET /api/projects - Fetch all projects with optional query filtering
export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    // Build filter dynamically based on query params
    const filter: Record<string, any> = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const projects = await Project.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, count: projects.length, data: projects });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const newProject = await Project.create(body);

    return NextResponse.json(
      { success: true, data: newProject },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}