import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";
import { notificationEmitter } from "@/libs/notification-emitter";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const { claimed, guestToken } = body;
    
    const currentUser = await getCurrentUser();
    const orderId = params.id;

    // Use native MongoDB driver
    const { MongoClient, ObjectId } = await import("mongodb");
    const mongoClient = new MongoClient(process.env.DATABASE_URL!);
    await mongoClient.connect();

    try {
      const db = mongoClient.db("windowshopdb");
      
      // Fetch order
      const order = await db.collection("Order").findOne({
        _id: new ObjectId(orderId),
      });

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

      const result = await db.collection("Order").findOneAndUpdate(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            paymentClaimed: claimedValue,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );

      if (!result) {
        return NextResponse.json(
          { error: "Failed to update order" },
          { status: 500 }
        );
      }

      // Emit notification for both claiming and revoking payment
      if (claimed) {
        notificationEmitter.emit({
          title: "Payment Claimed",
          body: `Customer claims payment for Order #${orderId.slice(-6)} - Amount: ₦${(result.amount || 0).toLocaleString()}`,
          orderId: orderId,
          timestamp: new Date().toISOString(),
        });
      } else {
        notificationEmitter.emit({
          title: "Payment Claim Revoked",
          body: `Customer revoked payment claim for Order #${orderId.slice(-6)}`,
          orderId: orderId,
          timestamp: new Date().toISOString(),
        });
      }

      return NextResponse.json(result);
    } finally {
      await mongoClient.close();
    }
  } catch (error) {
    console.error("Mark payment confirmed error:", error);
    return NextResponse.json(
      { error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}
