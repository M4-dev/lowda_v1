import { NextResponse } from "next/server";
import getAdminUser from "@/actions/get-admin-user";
import prisma from "@/libs/prismadb";
import { sendPushNotification } from "@/libs/firebase-admin";

export async function PUT(request: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const { orderId } = body;

  try {
    // Get the order
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow if user has confirmed delivery
    if (!order.userConfirmedDelivery) {
      return NextResponse.json({ error: "User has not confirmed delivery" }, { status: 400 });
    }

    // Only allow if not already delivered
    if (order.deliveryStatus === "delivered") {
      return NextResponse.json({ error: "Order already marked as delivered" }, { status: 400 });
    }

    // Mark as delivered
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryStatus: "delivered",
      },
      include: { user: true },
    });

    // Send push notification to customer if available
    if (updatedOrder.user?.fcmToken) {
      await sendPushNotification(
        updatedOrder.user.fcmToken,
        "Order Complete",
        "Your order is complete. Thank you!",
        { orderId: updatedOrder.id }
      );
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error confirming delivery:", error);
    return NextResponse.json({ error: "Failed to confirm delivery" }, { status: 500 });
  }
}
