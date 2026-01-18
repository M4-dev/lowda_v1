import prismadb from "@/libs/prismadb";

export default async function getOrdersByUserId(userId: string) {
  try {
    const orders = await prismadb.order.findMany({
      where: { userId },
      orderBy: { createDate: "desc" },
      include: {
        user: true,
      },
    });
    return orders;
  } catch (error: any) {
    console.error("Error fetching orders by user ID:", error);
    throw new Error(error);
  }
}
