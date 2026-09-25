/* eslint-disable no-unused-vars */
import { NextResponse } from "next/server";
import { getAllBlogs } from "@/lib/blogs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allBlogs = getAllBlogs();

    // Strip out heavy content body for admin list view
    const blogSummaries = allBlogs.map(({ slug, title, excerpt, date, tags }) => ({
      slug,
      title,
      excerpt,
      date,
      tags,
    }));

    return NextResponse.json(blogSummaries);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read blog directory" },
      { status: 500 }
    );
  }
}