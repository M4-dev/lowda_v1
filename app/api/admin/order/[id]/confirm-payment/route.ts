import { NextResponse } from "next/server";
import getAdminUser from "@/actions/get-admin-user";
import prismadb from "@/libs/prismadb";
import { notificationEmitter } from "@/libs/notification-emitter";
import { sendPushNotification } from "@/libs/firebase-admin";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const orderId = params.id;
    // Find order
    const order = await prismadb.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update paymentConfirmed
    const updatedOrder = await prismadb.order.update({
      where: { id: orderId },
      data: { paymentConfirmed: true },
      include: { user: true },
    });

    // Emit SSE notification to customer
    notificationEmitter.emit({
      type: "notification",
      message: "Your payment has been confirmed by admin",
      orderId: orderId,
      userId: order.userId, // Send to specific customer
    });

    // Send push notification to customer (user or guest) if FCM token exists
    try {
      if (updatedOrder.user && updatedOrder.user.fcmToken) {
        await sendPushNotification(
          updatedOrder.user.fcmToken,
          "Payment Confirmed",
          "Your payment has been confirmed by admin. Thank you!",
          { orderId: orderId, type: "payment_confirmed" }
        );
      } else if (updatedOrder.guestFcmToken) {
        await sendPushNotification(
          updatedOrder.guestFcmToken,
          "Payment Confirmed",
          "Your payment has been confirmed by admin. Thank you!",
          { orderId: orderId, type: "payment_confirmed" }
        );
      }
    } catch (error) {
      console.error("Failed to send push notification to customer:", error);
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Admin confirm payment error:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
