import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";

const MONGO_URI = process.env.DATABASE_URL?.replace("?replicaSet=rs0", "") || "mongodb://localhost:27017/ecommerce-nextjs-app";

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) return NextResponse.error();

  const body = await request.json();
  const { row } = body;

  if (row.paymentStatus !== "pending" || row.deliveryStatus !== "pending") {
    return NextResponse.error();
  }

  const mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();
  const db = mongoClient.db("windowshopdb");

  const result = await db.collection("Order").deleteOne({
    _id: new ObjectId(row.id),
  });

  await mongoClient.close();

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, deletedCount: result.deletedCount });
}
