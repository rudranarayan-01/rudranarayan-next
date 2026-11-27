import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Project } from "@/models/Project";
import { getSession } from "@/lib/auth";

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

    return NextResponse.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const session = await getSession();
        if (!session) {
          return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 },
          );
        }

    if (!body?.name || !body?.description) {
      return NextResponse.json(
        { success: false, error: "Project name and description are required." },
        { status: 400 },
      );
    }

    const slug = body.slug ? toSlug(body.slug) : toSlug(body.name);
    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Invalid project slug." },
        { status: 400 },
      );
    }

    const existing = await Project.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `A project with slug "${slug}" already exists.`,
        },
        { status: 409 },
      );
    }

    const newProject = await Project.create({
      name: body.name.trim(),
      slug,
      description: body.description.trim(),
      longDescription: body.longDescription?.trim() || "",
      status: body.status || "Published",
      thumbnailUrl: body.thumbnailUrl?.trim() || "",
      galleryImages: Array.isArray(body.galleryImages)
        ? body.galleryImages
        : [],
      links: Array.isArray(body.links) ? body.links : [],
      architectureFlow: Array.isArray(body.architectureFlow)
        ? body.architectureFlow
        : [],
      techStack: Array.isArray(body.techStack) ? body.techStack : [],
      clientInfo: body.clientInfo
        ? {
            name: body.clientInfo.name?.trim() || "",
            company: body.clientInfo.company?.trim() || "",
          }
        : undefined,
    });

    return NextResponse.json(
      { success: true, data: newProject },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create project." },
      { status: 400 },
    );
  }
}
