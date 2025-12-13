import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const MONGO_URI = process.env.DATABASE_URL?.replace("?replicaSet=rs0", "") || "mongodb://localhost:27017/ecommerce-nextjs-app";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { title, body: message, orderId } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Missing title or body" }, { status: 400 });
    }

    const mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    const db = mongoClient.db("windowshopdb");

    const notification = await db.collection("Notification").insertOne({
      title,
      body: message,
      orderId: orderId || null,
      read: false,
      createdAt: new Date(),
    });

    const insertedNotification = await db.collection("Notification").findOne({ _id: notification.insertedId });
    
    await mongoClient.close();

    return NextResponse.json(insertedNotification);
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
