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
    const { bannerTitle, bannerSubtitle, bannerDiscount, bannerImage, bannerColors, bannerVisible } = body;

    if (!bannerTitle || !bannerSubtitle || !bannerDiscount) {
      return NextResponse.json({ error: "All banner fields are required" }, { status: 400 });
    }

    const updateData: any = {
      bannerTitle,
      bannerSubtitle,
      bannerDiscount,
    };

    if (bannerImage) {
      updateData.bannerImage = bannerImage;
    }

    if (bannerColors && Array.isArray(bannerColors)) {
      updateData.bannerColors = bannerColors;
    }

    if (typeof bannerVisible === 'boolean') {
      updateData.bannerVisible = bannerVisible;
    }

    await prisma.settings.upsert({
      where: { id: "settings" },
      update: updateData,
      create: {
        id: "settings",
        bankName: "",
        bankAccountNumber: "",
        accountHolderName: "",
        ...updateData,
        bannerVisible: typeof bannerVisible === 'boolean' ? bannerVisible : true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update banner error:", error);
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}
