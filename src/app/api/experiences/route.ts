import { NextResponse } from "next/server";
import { experiences as initialData } from "../../data/data";

let experiencesData = [...initialData];

export async function GET() {
  return NextResponse.json(experiencesData);
}

// Sync entire array (Add, Delete, or Bulk Edit)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    experiencesData = body;
    return NextResponse.json({ success: true, data: experiencesData });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
  }
}

// PUT: Update a specific item by index
export async function PUT(request: Request) {
  try {
    const { index, updatedItem } = await request.json();
    if (index >= 0 && index < experiencesData.length) {
      experiencesData[index] = updatedItem;
      return NextResponse.json({ success: true, data: experiencesData });
    }
    return NextResponse.json({ success: false, error: "Invalid index" }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}