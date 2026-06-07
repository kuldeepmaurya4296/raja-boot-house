import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  let filename = searchParams.get("filename");

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN is not configured in environment variables.");
    return NextResponse.json(
      { error: "Vercel Blob Storage token is not configured on the server." },
      { status: 500 }
    );
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
