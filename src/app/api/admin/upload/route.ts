import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function sanitizeFolderSegment(raw: string): string {
  return raw
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9 _-]/g, "-")
    .replace(/\s+/g, " ");
}

export async function POST(req: NextRequest) {
  try {
    if (
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Cloudinary environment variables are missing.",
        },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const files = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No image files received." },
        { status: 400 },
      );
    }

    const rawFolder =
      typeof formData.get("folder") === "string"
        ? (formData.get("folder") as string)
        : "";
    const cleanProjectFolder = sanitizeFolderSegment(rawFolder) || "General";
    const targetFolder = `Portfolio/${cleanProjectFolder}`;

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          {
            success: false,
            error: `Only image files are allowed (${file.name}).`,
          },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      const secureUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: targetFolder,
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result?.secure_url) {
              reject(error || new Error("Cloudinary upload failed."));
              return;
            }
            resolve(result.secure_url);
          },
        );

        uploadStream.end(buffer);
      });

      uploadedUrls.push(secureUrl);
    }

    return NextResponse.json(
      {
        success: true,
        folder: targetFolder,
        urls: uploadedUrls,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload images." },
      { status: 500 },
    );
  }
}
