import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";
import prisma from "@/libs/prismadb";

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { whatsappNumber } = await request.json();

    if (!whatsappNumber) {
      return NextResponse.json(
        { error: "WhatsApp number is required" },
        { status: 400 }
      );
    }


    // Update the Settings record (assuming only one row)
    await prisma.settings.updateMany({
      data: {
        whatsappNumber,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "WhatsApp number updated successfully" });
  } catch (error) {
    console.error("Error updating WhatsApp number:", error);
    return NextResponse.json(
      { error: "Failed to update WhatsApp number" },
      { status: 500 }
    );
  }
}
