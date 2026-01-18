import prisma from "@/libs/prismadb";

export async function getProductPerformanceData() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        paymentConfirmed: true,
      },
    });

    const productStats: {
      [productId: string]: {
        name: string;
        revenue: number;
        quantity: number;
        orders: number;
      };
    } = {};

    orders.forEach((order: any) => {
      (order.products as any[]).forEach((product) => {
        if (!productStats[product.id]) {
          productStats[product.id] = {
            name: product.name,
            revenue: 0,
            quantity: 0,
            orders: 0,
          };
        }

        productStats[product.id].revenue += product.price * product.quantity;
        productStats[product.id].quantity += product.quantity;
        productStats[product.id].orders += 1;
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return topProducts;
  } catch (error: any) {
    throw new Error(error);
  }
}

export default getProductPerformanceData;
