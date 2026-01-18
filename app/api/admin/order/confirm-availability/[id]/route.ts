import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";
import prismadb from "@/libs/prismadb";
import { sendPushNotification } from "@/libs/firebase-admin";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    const { adminConfirmedAvailability = true } = body;

    const order = await prismadb.order.update({
      where: { id: params.id },
      data: {
        adminConfirmedAvailability,
        adminConfirmedAvailabilityAt: adminConfirmedAvailability ? new Date() : null,
      },
      include: { user: true },
    });

    // Send push notification to customer (user or guest) if available and confirmed
    if (adminConfirmedAvailability) {
      if (order.user?.fcmToken) {
        await sendPushNotification(
          order.user.fcmToken,
          "Order Availability Confirmed",
          "What you want is available. You can now make payment.",
          { orderId: order.id }
        );
      } else if (order.guestFcmToken) {
        await sendPushNotification(
          order.guestFcmToken,
          "Order Availability Confirmed",
          "What you want is available. You can now make payment.",
          { orderId: order.id }
        );
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error updating order" }, { status: 500 });
  }
}