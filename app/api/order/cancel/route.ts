
import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";
import prismadb from "@/libs/prismadb";

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.error();
  if (currentUser.role !== "ADMIN") {
    return NextResponse.error();
  }

  const body = await request.json();
  const { orderId } = body;

  try {
    // Get the order
    const order = await prismadb.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.cancelled) {
      return NextResponse.json({ error: "Order already cancelled" }, { status: 400 });
    }

    // Restore stock for each product
    for (const itemStr of order.products || []) {
      let item: any;
      try {
        item = typeof itemStr === "string" ? JSON.parse(itemStr) : itemStr;
      } catch {
        item = null;
      }
      if (item && item.id && item.quantity) {
        await prismadb.product.update({
          where: { id: item.id },
          data: {
            remainingStock: { increment: item.quantity }
          }
        });
      }
    }

    // Calculate refund amount (only if payment was confirmed)
    const refundAmount = order.paymentConfirmed ? order.amount : 0;

    // Update order to cancelled
    await prismadb.order.update({
      where: { id: orderId },
      data: {
        cancelled: true,
        cancelledAt: new Date(),
        refundAmount: refundAmount,
        status: "cancelled",
        deliveryStatus: "cancelled"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      refundAmount: refundAmount
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
