import { NextResponse } from "next/server";
import { CartProductType } from "@/app/product/[productId]/product-details";
import getCurrentUser from "@/actions/get-current-user";
import { notificationEmitter } from "@/libs/notification-emitter";
import { MongoClient, ObjectId } from "mongodb";
import crypto from "crypto";

const calculateOrderAmount = (items: CartProductType[]) => {
  const totalPrice = items.reduce((acc, item) => {
    const itemTotal = (item.price + (item.dmc || 0)) * item.quantity;

    return acc + itemTotal;
  }, 0);

  return totalPrice;
};

export async function POST(request: Request) {
  const mongoClient = new MongoClient(process.env.DATABASE_URL!);
  
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { items, guestEmail, guestName } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in cart" },
        { status: 400 }
      );
    }

    await mongoClient.connect();
    const db = mongoClient.db("windowshopdb");

    // Fetch SPF from settings
    const settings = await db.collection("Settings").findOne({ _id: "settings" } as any);
    const spf = (settings as any)?.spf || 100;

    // Pre-check stock availability for all items
    for (const item of items) {
      if (!item.id) continue;
      
      console.log('Looking up product with ID:', item.id);
      console.log('Item details:', JSON.stringify(item, null, 2));
      
      let productObjectId;
      try {
        productObjectId = new ObjectId(item.id);
      } catch (err) {
        console.error('Invalid ObjectId format for item.id:', item.id, err);
        return NextResponse.json({ error: `Invalid product ID format: ${item.id}` }, { status: 400 });
      }
      
      const product = await db.collection("Product").findOne({ _id: productObjectId });
      
      if (!product) {
        console.error('Product not found in database for ID:', item.id);
        return NextResponse.json({ error: `Product not found: ${item.name || item.id}` }, { status: 400 });
      }

      const available = (product as any).remainingStock ?? (product as any).stock ?? 0;
      const desired = item.quantity || 0;
      if (available < desired) {
        return NextResponse.json({
          error: `Insufficient stock for product ${product.name || product.id}. Available: ${available}`,
        }, { status: 400 });
      }
    }

    const total = Math.round(calculateOrderAmount(items));
    const totalWithSpf = total + spf;
    const mockPaymentIntentId = `mock_payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Filter items to only include fields defined in CartProductType schema
    const filteredProducts = items.map((item: any) => {
      console.log(`Creating order - Product: ${item.name}, DMC: ${item.dmc}, Price: ${item.price}, Qty: ${item.quantity}`);
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        brand: item.brand,
        selectedImg: item.selectedImg,
        quantity: item.quantity,
        price: item.price,
        dmc: item.dmc || 0,
      };
    });
    
    console.log('Filtered products for order:', JSON.stringify(filteredProducts, null, 2));

    // Calculate total DMC separately
    const totalDmc = items.reduce((acc: number, item: CartProductType) => {
      return acc + ((item.dmc || 0) * item.quantity);
    }, 0);

    // Generate guest token for anonymous users
    const guestToken = !currentUser ? crypto.randomBytes(32).toString('hex') : null;

    // Create order
    const now = new Date();
    const orderDoc = {
      _id: new ObjectId(),
      userId: currentUser?.id || null,
      guestEmail: !currentUser ? guestEmail : null,
      guestName: !currentUser ? guestName : null,
      guestToken: guestToken,
      amount: totalWithSpf,
      totalDmc: totalDmc,
      spf: spf,
      currency: "NGN",
      status: "pending",
      deliveryStatus: "pending",
      paymentIntentId: mockPaymentIntentId,
      paymentConfirmed: false,
      paymentClaimed: false,
      products: filteredProducts,
      createDate: now,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.collection("Order").insertOne(orderDoc);

    // Decrement product remainingStock for each purchased item
    for (const item of items) {
      if (!item.id) continue;
      const product = await db.collection("Product").findOne({ _id: new ObjectId(item.id) });
      if (!product) continue;

      const currentRemaining = (product as any).remainingStock ?? (product as any).stock ?? 0;
      const newRemaining = Math.max(0, currentRemaining - (item.quantity || 0));

      await db.collection("Product").updateOne(
        { _id: new ObjectId(item.id) },
        { 
          $set: {
            remainingStock: newRemaining,
            inStock: newRemaining > 0,
            updatedAt: new Date(),
          }
        }
      );
    }

    return NextResponse.json({ 
      orderId: orderDoc._id.toString(),
      guestToken: guestToken 
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  } finally {
    await mongoClient.close();
  }
}
