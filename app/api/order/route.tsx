import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";
import { notificationEmitter } from "@/libs/notification-emitter";
import { sendPushNotification } from "@/libs/firebase-admin";

const MONGO_URI = process.env.DATABASE_URL?.replace("?replicaSet=rs0", "") || "mongodb://localhost:27017/ecommerce-nextjs-app";

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) return NextResponse.error();

  if (currentUser.role !== "ADMIN") {
    return NextResponse.error();
  }

  const body = await request.json();
  const { id, deliveryStatus } = body;

  const mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();
  const db = mongoClient.db("windowshopdb");

  // Get the order first to check userId and send notification
  const order = await db.collection("Order").findOne({ _id: new ObjectId(id) });

  if (!order) {
    await mongoClient.close();
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const result = await db.collection("Order").updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: { 
        deliveryStatus,
        updatedAt: new Date()
      } 
    }
  );

  // If order is being dispatched, send notification to customer
  if (deliveryStatus === "dispatched" && order.userId) {
    const notification = {
      userId: order.userId.toString(),
      type: "order_dispatched",
      message: "Your order is on the way! 🚚",
      orderId: id,
      createdAt: new Date(),
      read: false,
    };

    // Save notification to database
    await db.collection("Notification").insertOne(notification);

    // Emit real-time notification
    notificationEmitter.emit({
      type: "notification",
      data: notification,
    });

    // Send push notification to mobile device
    try {
      const user = await db.collection("User").findOne({ _id: new ObjectId(order.userId) });
      
      if (user?.fcmToken) {
        await sendPushNotification(
          user.fcmToken,
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

  await mongoClient.close();

  return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
}
