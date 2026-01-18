import { NextResponse } from "next/server";
import prismadb from "@/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

// GET: List all categories
export async function GET() {
  const categories = await prismadb.category.findMany({
    orderBy: { label: "asc" },
  });
  return NextResponse.json(categories);
}

// POST: Create a new category
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  console.log("[DEBUG] Session in category API POST:", session);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const user = session.user as typeof session.user & { role?: string };
  if (user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { label, icon } = await req.json();
  if (!label || !icon) {
    return new NextResponse("Missing label or icon", { status: 400 });
  }
  try {
    const category = await prismadb.category.create({
      data: { label, icon },
    });
    return NextResponse.json(category);
  } catch (e) {
    return new NextResponse("Category creation failed", { status: 500 });
  }
}

// DELETE: Remove a category by id
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  console.log("[DEBUG] Session in category API DELETE:", session);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const user = session.user as typeof session.user & { role?: string };
  if (user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await req.json();
  if (!id) {
    return new NextResponse("Missing id", { status: 400 });
  }
  try {
    await prismadb.category.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return new NextResponse("Category deletion failed", { status: 500 });
  }
}
