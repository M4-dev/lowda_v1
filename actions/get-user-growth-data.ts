import prisma from "@/libs/prismadb";
import moment from "moment";

export async function getUserGrowthData() {
  try {
    const startDate = moment().subtract(30, "days").startOf("day");
    const endDate = moment().endOf("day");

    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate.toDate(),
          lte: endDate.toDate(),
        },
      },
      include: {
        orders: true,
      },
    });

    const aggregatedData: {
      [date: string]: {
        label: string;
        date: string;
        newUsers: number;
        repeatCustomers: number;
      };
    } = {};

    // Initialize data structure
    const currentDate = startDate.clone();
    while (currentDate <= endDate) {
      const key = currentDate.format("YYYY-MM-DD");
      aggregatedData[key] = {
        label: currentDate.format("MMM DD"),
        date: key,
        newUsers: 0,
        repeatCustomers: 0,
      };
      currentDate.add(1, "day");
    }

    // Count new users per day
    users.forEach((user: any) => {
      const key = moment(user.createdAt).format("YYYY-MM-DD");
      if (aggregatedData[key]) {
        aggregatedData[key].newUsers += 1;

        // Check if repeat customer (has more than 1 order)
        if (user.orders.length > 1) {
          aggregatedData[key].repeatCustomers += 1;
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

export default getUserGrowthData;
