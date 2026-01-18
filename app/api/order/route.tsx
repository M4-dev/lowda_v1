
import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";
import { notificationEmitter } from "@/libs/notification-emitter";
import { sendPushNotification } from "@/libs/firebase-admin";
import prismadb from "@/libs/prismadb";

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.error();
  if (currentUser.role !== "ADMIN") {
    return NextResponse.error();
  }

  const body = await request.json();
  const { id, deliveryStatus } = body;

  // Get the order first to check userId and send notification
  const order = await prismadb.order.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const updatedOrder = await prismadb.order.update({
    where: { id },
    data: {
      deliveryStatus,
    },
    include: { user: true },
  });

  // If order is being dispatched, send notification to customer (user or guest)
  if (deliveryStatus === "dispatched" && (order.userId || order.guestFcmToken)) {
    if (order.userId) {
      const notification = await prismadb.notification.create({
        data: {
          userId: order.userId,
          title: "Order Dispatched 🚚",
          body: "Your order is on the way! 🚚",
          orderId: order.id,
          read: false,
        },
      });
      // Emit real-time notification
      notificationEmitter.emit({
        type: "notification",
        data: notification,
      });
    }

    // Send push notification to mobile device (user or guest)
    try {
      if (order.user && order.user.fcmToken) {
        await sendPushNotification(
          order.user.fcmToken,
          "Order Dispatched 🚚",
          "Your order is on the way! Track your delivery in the app.",
          {
            type: "order_dispatched",
            orderId: id,
            url: `/order/${id}`,
          }
        );
      } else if (order.guestFcmToken) {
        await sendPushNotification(
          order.guestFcmToken,
          "Order Dispatched 🚚",
          "Your order is on the way! Track your delivery in the app.",
          {
            type: "order_dispatched",
            orderId: id,
            url: `/order/${id}`,
          }
        );
      }
    } catch (error) {
      console.error("Failed to send push notification:", error);
      // Don't fail the whole request if push notification fails
    }
  }

  return NextResponse.json({ success: true });
}
