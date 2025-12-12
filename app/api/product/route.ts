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
    list,
    stock,
    isVisible,
  } = body;

  const stockNum = stock ? parseInt(stock as any, 10) : 0;
  const remaining = stockNum;
  const inStockFlag = remaining > 0;
  const dmcValue = dmc ? parseFloat(dmc) : 0;

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
        images,
        price: parseFloat(price),
        dmc: dmcValue,
        list: parseFloat(list),
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
  const { id, inStock, isVisible } = body;

  const updateData: any = {};
  if (inStock !== undefined) updateData.inStock = inStock;
  if (isVisible !== undefined) updateData.isVisible = isVisible;

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
