import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Task from "@/models/Task";

// GET: Fetch all tasks
export async function GET() {
  try {
    await connectDB();
    
    // Fetch all tasks sorted by creation date (newest first)
    const tasks = await Task.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: tasks }, { status: 200 });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST: Create a new task
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // Basic validation
    if (!body.title || !body.description) {
      return NextResponse.json(
        { success: false, error: "Title and description are required" },
        { status: 400 }
      );
    }

    const newTask = await Task.create(body);

    return NextResponse.json({ success: true, data: newTask }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create task" },
      { status: 500 }
    );
  }
}