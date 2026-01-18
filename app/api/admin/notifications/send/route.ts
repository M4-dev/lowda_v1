import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";
import prismadb from "@/libs/prismadb";
import { sendMulticastNotification } from "@/libs/firebase-admin";

export async function POST(request: Request) {
  console.log(" [API] POST /api/admin/notifications/send called");

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      console.log(" [API] Unauthorized: No user logged in");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.role !== "ADMIN") {
      console.log(` [API] Forbidden: User ${currentUser.id} is ${currentUser.role}, not ADMIN`);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, message } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    // Fetch all users with an FCM token
    const users = await prismadb.user.findMany({
      where: {
        fcmToken: {
          not: null,
        },
      },
      select: {
        fcmToken: true,
      },
    });

    const tokens = users
      .map((user) => user.fcmToken)
      .filter((token): token is string => !!token && token.trim() !== "");

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, message: "No users to notify" });
    }

    const result = await sendMulticastNotification(tokens, title, message);
    
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error(" [API] Error in notification route:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
