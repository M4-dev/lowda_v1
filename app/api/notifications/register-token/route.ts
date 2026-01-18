import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import getCurrentUser from "@/actions/get-current-user";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await request.json();

    // If token is null, remove FCM token (disable notifications)
    if (token === null) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: { fcmToken: null },
      });
      return NextResponse.json({ success: true, message: "Notifications disabled" });
    }

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Update or create user's FCM token
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { fcmToken: token },
    });

    return NextResponse.json({ success: true, message: "Token registered successfully" });
  } catch (error) {
    console.error("Error registering FCM token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
