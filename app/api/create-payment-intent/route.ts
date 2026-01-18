import { NextResponse } from "next/server";
import { CartProductType } from "@/app/product/[productId]/product-details";
import getCurrentUser from "@/actions/get-current-user";
import { sendMulticastNotification } from "@/libs/firebase-admin";
import crypto from "crypto";
import prismadb from "@/libs/prismadb";

const calculateOrderAmount = (items: CartProductType[]) => {
  const totalPrice = items.reduce((acc, item) => {
    const itemTotal = (item.price + (item.dmc || 0)) * item.quantity;

    return acc + itemTotal;
  }, 0);

  return totalPrice;
};

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { items, guestEmail, guestName, address, guestFcmToken } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in cart" },
        { status: 400 }
      );
    }

    // Calculate per-order SPF: use settings.spf or fallback default (e.g. 100)
    let perOrderSpf = 100;
    let totalDmc = 0;
    for (const item of items) {
      totalDmc += (item.dmc || 0) * (item.quantity || 1);
    }

    // Fetch SPF from settings if available
    const settings = await prismadb.settings.findFirst();
    if (settings && settings.spf !== undefined) {
      perOrderSpf = settings.spf;
    }

    // Calculate total
    const total = Math.round(calculateOrderAmount(items));
    const totalWithSpf = total + perOrderSpf;

    // Generate guest token for anonymous users
    const guestToken = !currentUser ? crypto.randomBytes(32).toString('hex') : null;

    // Save order in DB
    const order = await prismadb.order.create({
      data: {
        userId: currentUser?.id || null,
        guestEmail: !currentUser ? guestEmail : null,
        guestName: !currentUser ? guestName : null,
        guestToken: guestToken,
        guestFcmToken: !currentUser ? guestFcmToken : null,
        amount: totalWithSpf,
        totalDmc: totalDmc,
        spf: perOrderSpf,
        currency: "NGN",
        status: "pending",
        deliveryStatus: "pending",
        paymentIntentId: crypto.randomBytes(16).toString('hex'),
        paymentConfirmed: false,
        paymentClaimed: false,
        products: items.map((item: any) => JSON.stringify(item)),
        address: typeof address === 'string' ? address : JSON.stringify(address),
      },
    });


    // Send push notification to all admins
    const admins = await prismadb.user.findMany({
      where: { role: "ADMIN", fcmToken: { not: null } },
      select: { fcmToken: true }
    });
    const adminTokens = admins.map(a => a.fcmToken).filter((t): t is string => typeof t === 'string');
    if (adminTokens.length > 0) {
      await sendMulticastNotification(
        adminTokens,
        "New Order Placed",
        `A new order has been placed${currentUser ? ` by ${currentUser.name || currentUser.email}` : guestName ? ` by ${guestName}` : ''}.`,
        { orderId: order.id }
      );
    }

    return NextResponse.json({ 
      orderId: order.id,
      guestToken: order.guestToken || undefined
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
