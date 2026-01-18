import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";
import prisma from "@/libs/prismadb";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.error();
  }

  const body = await request.json();
  const {
    name,
    description,
    price,
    dmc,
    brand,
    category,
    inStock,
    images,
    stock,
    isVisible,
    discount,
  } = body;

  // Ensure images is an array of strings (URLs)
  const imageUrls = Array.isArray(images)
    ? images.map((img: any) => typeof img === "string" ? img : img.url || img.image).filter(Boolean)
    : [];

  const stockNum = stock ? parseInt(stock as any, 10) : 0;
  const remaining = stockNum;
  const inStockFlag = remaining > 0;
  const dmcValue = dmc ? parseFloat(dmc) : 0;
  const discountValue = discount ? parseFloat(discount) : 0;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        brand,
        category,
        inStock: inStockFlag,
        stock: stockNum,
        remainingStock: remaining,
        isVisible: isVisible !== undefined ? isVisible : true,
        images: imageUrls,
        price: parseFloat(price),
        dmc: dmcValue,
        discount: discountValue,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) return NextResponse.error();

  if (currentUser.role !== "ADMIN") {
    return NextResponse.error();
  }
  
  const body = await request.json();
  const { id, inStock, isVisible, discount, images } = body;

  const updateData: any = {};
  if (inStock !== undefined) updateData.inStock = inStock;
  if (isVisible !== undefined) updateData.isVisible = isVisible;
  if (discount !== undefined) updateData.discount = parseFloat(discount);
  if (images !== undefined) {
    updateData.images = Array.isArray(images)
      ? images.map((img: any) => typeof img === "string" ? img : img.url || img.image).filter(Boolean)
      : [];
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }
}
