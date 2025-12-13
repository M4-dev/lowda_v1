import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";

const MONGO_URI = process.env.DATABASE_URL?.replace("?replicaSet=rs0", "") || "mongodb://localhost:27017/ecommerce-nextjs-app";

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) return NextResponse.error();

  if (currentUser.role !== "ADMIN") {
    return NextResponse.error();
  }

  const body = await request.json();
  const { orderId } = body;

  const mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();
  const db = mongoClient.db("windowshopdb");

  try {
    // Get the order
    const order = await db.collection("Order").findOne({ _id: new ObjectId(orderId) });

    if (!order) {
      await mongoClient.close();
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.cancelled) {
      await mongoClient.close();
      return NextResponse.json({ error: "Order already cancelled" }, { status: 400 });
    }

    // Restore stock for each product
    for (const item of order.products || []) {
      await db.collection("Product").updateOne(
        { _id: new ObjectId(item.id) },
        { 
          $inc: { remainingStock: item.quantity },
          $set: { updatedAt: new Date() }
        }
      );
    }

    // Calculate refund amount (only if payment was confirmed)
    const refundAmount = order.paymentConfirmed ? order.amount : 0;

    // Update order to cancelled
    await db.collection("Order").updateOne(
      { _id: new ObjectId(orderId) },
      { 
        $set: { 
          cancelled: true,
          cancelledAt: new Date(),
          refundAmount: refundAmount,
          status: "cancelled",
          deliveryStatus: "cancelled",
          updatedAt: new Date()
        } 
      }
    );

    await mongoClient.close();

    return NextResponse.json({ 
      success: true, 
      message: "Order cancelled successfully",
      refundAmount: refundAmount
    });
  } catch (error) {
    await mongoClient.close();
    console.error("Cancel order error:", error);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
