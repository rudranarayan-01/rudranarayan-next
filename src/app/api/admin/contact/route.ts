import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";

const VALID_STATUSES = ["unread", "read", "replied", "archived"] as const;
type ContactStatus = (typeof VALID_STATUSES)[number];

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");

    // Inline typing ensures TS matches the filter overload
    const filter: { status?: ContactStatus } = {};

    if (statusParam && VALID_STATUSES.includes(statusParam as ContactStatus)) {
      filter.status = statusParam as ContactStatus;
    }

    const inquiries = await Contact.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: inquiries }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/contacts error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch inquiries." },
      { status: 500 }
    );
  }
}