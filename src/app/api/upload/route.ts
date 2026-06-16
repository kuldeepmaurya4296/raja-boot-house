import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  let filename = searchParams.get("filename");

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn("BLOB_READ_WRITE_TOKEN not set. Falling back to local filesystem storage...");
    try {
      const { writeFile, mkdir } = await import("fs/promises");
      const path = await import("path");

      const contentType = request.headers.get("content-type") || "";
      let fileToUpload: File | Blob;

      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        if (!file) {
          return NextResponse.json({ error: "No file field found in form data" }, { status: 400 });
        }
        fileToUpload = file;
        if (!filename) {
          filename = file.name;
        }
      } else {
        const blob = await request.blob();
        fileToUpload = blob;
      }

      if (!filename) {
        filename = `upload-${Date.now()}.bin`;
      }

      const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, safeFilename);
      const buffer = Buffer.from(await fileToUpload.arrayBuffer());
      await writeFile(filePath, buffer);

      console.log(`Successfully uploaded to local filesystem: /uploads/${safeFilename}`);
      return NextResponse.json({
        success: true,
        url: `/uploads/${safeFilename}`,
        size: fileToUpload.size,
      });
    } catch (err: any) {
      console.error("Local filesystem upload error:", err);
      return NextResponse.json(
        { error: err.message || "Failed to upload to local filesystem" },
        { status: 500 }
      );
    }
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let fileToUpload: File | Blob;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      if (!file) {
        return NextResponse.json({ error: "No file field found in form data" }, { status: 400 });
      }
      fileToUpload = file;
      if (!filename) {
        filename = file.name;
      }
    } else {
      // Direct binary body upload
      const blob = await request.blob();
      fileToUpload = blob;
    }

    if (!filename) {
      filename = `upload-${Date.now()}.bin`;
    }

    console.log(`Uploading file "${filename}" to Vercel Blob...`);
    const blob = await put(filename, fileToUpload, {
      access: "public",
    });

    console.log(`Successfully uploaded to Vercel Blob: ${blob.url}`);
    return NextResponse.json({
      success: true,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      size: fileToUpload.size,
    });
  } catch (error: any) {
    console.error("Vercel Blob upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload to Vercel Blob failed" },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";
