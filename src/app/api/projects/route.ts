/* eslint-disable no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Project } from "@/models/Project";
import { getSession } from "@/lib/auth";


export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    const projects = await Project.find()
      .sort({ updatedAt: -1 });
    return NextResponse.json(
      { success: true, data: projects },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Fetch Projects API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const body = await req.json();
    // Auto-generate slug from name if not provided
    let slug = body.slug;
    if (!slug && body.name) {
      slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }

    const existing = await Project.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A project with this slug already exists." },
        { status: 400 },
      );
    }

    const newProject = await Project.create({
      ...body,
      slug,
    });

    return NextResponse.json(
      { success: true, data: newProject },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Create Project API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create project" },
      { status: 400 },
    );
  }
}

