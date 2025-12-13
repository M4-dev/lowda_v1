import { NextResponse } from "next/server";
import getAdminUser from "@/actions/get-admin-user";
import { MongoClient, ObjectId } from "mongodb";
import { notificationEmitter } from "@/libs/notification-emitter";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const mongoClient = new MongoClient(process.env.DATABASE_URL!);
  
  try {
    const adminUser = await getAdminUser();

    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const orderId = params.id;

    await mongoClient.connect();
    const db = mongoClient.db("windowshopdb");

    // Get order to get userId
    const order = await db.collection("Order").findOne({
      _id: new ObjectId(orderId),
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Mark payment as confirmed by admin
    const result = await db.collection("Order").findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          paymentConfirmed: true,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Emit SSE notification to customer
    notificationEmitter.emit({
      type: "notification",
      message: "Your payment has been confirmed by admin",
      orderId: orderId,
      userId: order.userId, // Send to specific customer
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin confirm payment error:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  } finally {
    await mongoClient.close();
  }
}
