import prisma from "@/libs/prismadb";
import moment from "moment";

export async function getOrderStatusData() {
  try {
    const startDate = moment().subtract(30, "days").startOf("day");
    const endDate = moment().endOf("day");

    const orders = await prisma.order.findMany({
      where: {
        createDate: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
      },
    });

    const aggregatedData: {
      [date: string]: {
        label: string;
        date: string;
        pending: number;
        dispatched: number;
        delivered: number;
        cancelled: number;
      };
    } = {};

    // Initialize data structure
    const currentDate = startDate.clone();
    while (currentDate <= endDate) {
      const key = currentDate.format("YYYY-MM-DD");
      aggregatedData[key] = {
        label: currentDate.format("MMM DD"),
        date: key,
        pending: 0,
        dispatched: 0,
        delivered: 0,
        cancelled: 0,
      };
      currentDate.add(1, "day");
    }

    // Aggregate order statuses
    orders.forEach((order: any) => {
      const key = moment(order.createDate).format("YYYY-MM-DD");
      
      if (aggregatedData[key]) {
        if ((order as any).cancelled) {
          aggregatedData[key].cancelled += 1;
        } else if (order.deliveryStatus === "delivered") {
          aggregatedData[key].delivered += 1;
        } else if (order.deliveryStatus === "dispatched") {
          aggregatedData[key].dispatched += 1;
        } else {
          aggregatedData[key].pending += 1;
        }
      }
    });

    return Object.values(aggregatedData).sort((a, b) =>
      moment(a.date).diff(moment(b.date))
    );
  } catch (error: any) {
    throw new Error(error);
  }
}

export default getOrderStatusData;
