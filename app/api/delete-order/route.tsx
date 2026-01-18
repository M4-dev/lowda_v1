
import getCurrentUser from "@/actions/get-current-user";
import { NextResponse } from "next/server";
import prismadb from "@/libs/prismadb";

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.error();

  const body = await request.json();
  const { row } = body;

  if (row.paymentStatus !== "pending" || row.deliveryStatus !== "pending") {
    return NextResponse.error();
  }

  try {
    const deletedOrder = await prismadb.order.delete({
      where: { id: row.id },
    });
    return NextResponse.json({ success: true, deletedOrder });
  } catch (error: any) {
    if (error.code === "P2025") {
      // Record not found
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || "Failed to delete order" }, { status: 500 });
  }
}
