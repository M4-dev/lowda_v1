import prismadb from "@/libs/prismadb";

interface GetOrderByIdParams {
  orderId: string;
}

export default async function getOrderById(
  params: GetOrderByIdParams & { token?: string }
) {
  const { orderId, token } = params;
  if (!orderId) return null;

  try {
    const order = await prismadb.order.findUnique({
      where: {
        id: orderId,
        ...(token ? { guestToken: token } : {}),
      },
      // No includes: products is a scalar field (String[]), not a relation
    });
    return order;
  } catch (error) {
    console.error("Failed to fetch order by id:", error);
    return null;
  }
}
