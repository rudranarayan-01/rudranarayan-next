import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH: Update inquiry status (unread, read, replied, archived)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const { status } = await request.json();

    if (!["unread", "read", "replied", "archived"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value." },
        { status: 400 }
      );
    }

    const updatedInquiry = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedInquiry) {
      return NextResponse.json(
        { success: false, error: "Inquiry not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedInquiry });
  } catch (error) {
    console.error("PATCH /api/admin/contacts/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update inquiry status." },
      { status: 500 }
    );
  }
}

// DELETE: Remove an inquiry
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const deletedInquiry = await Contact.findByIdAndDelete(id);

    if (!deletedInquiry) {
      return NextResponse.json(
        { success: false, error: "Inquiry not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inquiry deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/admin/contacts/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete inquiry." },
      { status: 500 }
    );
  }
}