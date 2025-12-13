import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    // Update order using native MongoDB driver
    const { MongoClient, ObjectId } = await import("mongodb");
    const mongoClient = new MongoClient(process.env.DATABASE_URL!);
    await mongoClient.connect();

    try {
      const db = mongoClient.db("windowshopdb");
      
      // Verify order belongs to current user
      const order = await db.collection("Order").findOne({
        _id: new ObjectId(params.id),
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (order.userId !== currentUser.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Update the order with address
      const result = await db.collection("Order").findOneAndUpdate(
        { _id: new ObjectId(params.id) },
        {
          $set: {
            address: address,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );

      if (!result) {
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
      }

      return NextResponse.json(result);
    } finally {
      await mongoClient.close();
    }
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
