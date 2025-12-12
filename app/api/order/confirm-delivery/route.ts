import getCurrentUser from "@/actions/get-current-user";
import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const { orderId, confirmed } = body;

  try {
    // Get the order to check if it's already delivered
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order belongs to current user
    if (order.userId !== currentUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Don't allow changes if order is already marked as delivered
    if (order.deliveryStatus === "delivered") {
      return NextResponse.json(
        { error: "Cannot change confirmation after order is delivered" },
        { status: 400 }
      );
    }

    // Update user confirmation status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        userConfirmedDelivery: confirmed,
        userConfirmedDeliveryAt: confirmed ? new Date() : null,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("Error updating delivery confirmation:", error);
    return NextResponse.json(
      { error: "Failed to update delivery confirmation" },
      { status: 500 }
    );
  }
}
