
import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";
import prisma from "@/libs/prismadb";

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nextDeliveryTime, nextDeliveryEnabled } = body;

    if (!nextDeliveryTime && typeof nextDeliveryEnabled !== "boolean") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updateData: any = {};
    if (nextDeliveryTime) {
      // Ensure seconds for ISO string (datetime-local input has no seconds)
      const localTimeWithSeconds = nextDeliveryTime.length === 16 ? nextDeliveryTime + ':00' : nextDeliveryTime;
      const parsedDate = new Date(localTimeWithSeconds);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: "Invalid delivery time format" }, { status: 400 });
      }
      updateData.nextDeliveryTime = parsedDate;
    }
    // Persist nextDeliveryEnabled in Settings
    if (typeof nextDeliveryEnabled === "boolean") {
      updateData.nextDeliveryEnabled = nextDeliveryEnabled;
    }
    updateData.updatedAt = new Date();

    await prisma.settings.upsert({
      where: { id: "settings" },
      update: updateData,
      create: {
        id: "settings",
        bankName: "",
        bankAccountNumber: "",
        accountHolderName: "",
        hostels: [],
        spf: 100,
        ...updateData,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update delivery time error:", error);
    return NextResponse.json({ error: "Failed to update delivery time" }, { status: 500 });
  }
}
