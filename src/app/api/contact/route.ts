import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";

// POST: Store contact inquiry in MongoDB
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const { name, email, phone, subject, message } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required fields." },
        { status: 400 }
      );
    }

    const newInquiry = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    return NextResponse.json(
      { success: true, data: newInquiry, message: "Inquiry stored successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to store contact inquiry." },
      { status: 500 }
    );
  }
}