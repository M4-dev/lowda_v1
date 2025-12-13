import { NextRequest, NextResponse } from "next/server";

// POST - Convert image to Base64 data URL (no external storage needed)
export async function POST(request: NextRequest) {
  try {
    console.log("=== Upload route started ===");
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const color = formData.get("color") as string;

    if (!file) {
      console.error("No file provided in request");
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log("File received:", file.name, file.type, file.size);

    // Convert File to Base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    console.log("Image converted to Base64, size:", dataUrl.length);

    return NextResponse.json({
      url: dataUrl,
      color: color || "",
    });
  } catch (error: any) {
    console.error("=== Upload error ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}

// DELETE - No-op for Base64 images (no external storage to delete from)
export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "No URL provided" },
        { status: 400 }
      );
    }

    // Base64 images are stored in the database, nothing to delete here
    // The image will be removed when the product is deleted
    console.log("DELETE called for Base64 image (no-op)");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in delete endpoint:", error);
    return NextResponse.json(
      { error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}
