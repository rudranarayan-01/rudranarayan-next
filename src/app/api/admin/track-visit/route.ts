// app/api/track-visit/route.ts
import { NextResponse } from "next/server";
import { VisitorLog } from "@/models/VisitorLog";
import connectDB from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectDB();
    
    // Get IP address from headers
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";

    // Fetch IP location using a free IP API
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
    const geoData = await geoRes.json();

    await VisitorLog.create({
      ip,
      country: geoData.country_name || "Unknown",
      city: geoData.city || "Unknown",
      org: geoData.org || "Unknown",
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ success: false }, { status: 500 });
  }
}