import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Project } from "@/models/Project";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// 1. GET PROJECT BY SLUG
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { slug } = await params;
    const project = await Project.findOne({ slug });
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: project }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch Project By Slug Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// 2. UPDATE PROJECT BY SLUG (PUT)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { slug } = await params;
    const body = await req.json();

    const updatedProject = await Project.findOneAndUpdate(
      { slug },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedProject }, { status: 200 });
  } catch (error: any) {
    console.error("Update Project Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update project" },
      { status: 400 }
    );
  }
}

// 3. DELETE PROJECT BY SLUG (DELETE)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { slug } = await params;

    const deletedProject = await Project.findOneAndDelete({ slug });

    if (!deletedProject) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Project deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete Project Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete project" },
      { status: 500 }
    );
  }
}