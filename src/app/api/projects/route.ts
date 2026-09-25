/* eslint-disable no-unused-vars */
import { NextResponse } from "next/server";
import { projects as initialProjects } from "../../data/data";

// In-memory runtime state
let projectsData = [...initialProjects];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(projectsData);
}

// Bulk Sync (Create, Update, Delete)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    projectsData = body;
    return NextResponse.json({ success: true, data: projectsData });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update projects" },
      { status: 500 }
    );
  }
}