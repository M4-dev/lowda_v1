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
    const { items, guestEmail, guestName, address } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in cart" },
        { status: 400 }
      );
    }

    await mongoClient.connect();
    const db = mongoClient.db("windowshopdb");

    // Calculate per-order SPF as sum of (product SPF × quantity) for all products ONLY (do not add DMC)
    let perOrderSpf = 0;
    let totalDmc = 0;
    for (const item of items) {
      let productObjectId;
      try {
        productObjectId = new ObjectId(item.id);
      } catch (err) {
        continue;
      }
      const product = await db.collection("Product").findOne({ _id: productObjectId });
      const productSpf = (product && product.spf !== undefined) ? product.spf : 75; // fallback default
      perOrderSpf += productSpf * (item.quantity || 1);
      totalDmc += (item.dmc || 0) * (item.quantity || 1);
    }

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
    const totalWithSpf = total + perOrderSpf;
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

    // totalDmc already calculated above

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
      spf: perOrderSpf,
      currency: "NGN",
      status: "pending",
      deliveryStatus: "pending",
      paymentIntentId: mockPaymentIntentId,
      paymentConfirmed: false,
      paymentClaimed: false,
      products: filteredProducts,
      address: address || null,
      createDate: now,
      createdAt: now,
      updatedAt: now,
    };
    

    await db.collection("Order").insertOne(orderDoc);

    // Send push notification to admins
    try {
      await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/admin-notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Order Placed!",
          body: `A new order has been placed${currentUser ? ` by ${currentUser.name || currentUser.email}` : " by a guest"}.`,
          url: `/admin/manage-orders`,
        }),
      });
    } catch (notifyErr) {
      console.error("Failed to send admin push notification", notifyErr);
    }

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
