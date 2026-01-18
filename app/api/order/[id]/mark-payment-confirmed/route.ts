
import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";
import { notificationEmitter } from "@/libs/notification-emitter";
import { sendMulticastNotification } from "@/libs/firebase-admin";
import prismadb from "@/libs/prismadb";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const { claimed, guestToken } = body;
    const currentUser = await getCurrentUser();
    const orderId = params.id;

    // Fetch order
    const order = await prismadb.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify authorization: either logged-in user owns order OR valid guest token
    const isOwner = currentUser && order.userId === currentUser.id;
    const hasValidToken = !order.userId && guestToken && order.guestToken === guestToken;
    if (!isOwner && !hasValidToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update paymentClaimed
    const claimedValue = typeof claimed === "boolean" ? claimed : true;
    const updatedOrder = await prismadb.order.update({
      where: { id: orderId },
      data: { paymentClaimed: claimedValue },
    });


    // Emit notification for both claiming and revoking payment
    if (claimed) {
      notificationEmitter.emit({
        title: "Payment Claimed",
        body: `Customer claims payment for Order #${orderId.slice(-6)} - Amount: ₦${(updatedOrder.amount || 0).toLocaleString()}`,
        orderId: orderId,
        timestamp: new Date().toISOString(),
      });

      // Send push notification to all admins
      const admins = await prismadb.user.findMany({
        where: { role: "ADMIN", fcmToken: { not: null } },
        select: { fcmToken: true }
      });
      const adminTokens = admins.map(a => a.fcmToken).filter((token): token is string => typeof token === "string");
      if (adminTokens.length > 0) {
        await sendMulticastNotification(
          adminTokens,
          "Payment Claimed",
          `Customer claims payment for Order #${orderId.slice(-6)} - Amount: ₦${(updatedOrder.amount || 0).toLocaleString()}`,
          { orderId: orderId }
        );
      }
    } else {
      notificationEmitter.emit({
        title: "Payment Claim Revoked",
        body: `Customer revoked payment claim for Order #${orderId.slice(-6)}`,
        orderId: orderId,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Mark payment confirmed error:", error);
    return NextResponse.json(
      { error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}