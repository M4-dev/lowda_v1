import prisma from "@/libs/prismadb";
import moment from "moment";

export type TimeRange = "7days" | "30days" | "3months" | "year";

export async function getRevenueGraphData(timeRange: TimeRange = "7days") {
  try {
    const { startDate, endDate, groupFormat } = getDateRange(timeRange);

    const orders = await prisma.order.findMany({
      where: {
        createDate: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
        paymentConfirmed: true,
      },
    });

    const aggregatedData: {
      [key: string]: {
        label: string;
        date: string;
        revenue: number;
        dmc: number;
        spf: number;
        orders: number;
        paidOrders: number;
        unpaidOrders: number;
        refunds: number;
      };
    } = {};

    // Initialize data structure
    const currentDate = startDate.clone();
    while (currentDate <= endDate) {
      const key = currentDate.format(groupFormat);
      const label = formatLabel(currentDate, timeRange);
      
      if (!aggregatedData[key]) {
        aggregatedData[key] = {
          label,
          date: currentDate.format("YYYY-MM-DD"),
          revenue: 0,
          dmc: 0,
          spf: 0,
          orders: 0,
          paidOrders: 0,
          unpaidOrders: 0,
          refunds: 0,
        };
      }

      currentDate.add(1, timeRange === "year" ? "month" : "day");
    }

    // Aggregate order data
    orders.forEach((order: any) => {
      const key = moment(order.createDate).format(groupFormat);
      
      if (aggregatedData[key]) {
        aggregatedData[key].revenue += order.amount;
        aggregatedData[key].orders += 1;
        
        if (order.paymentConfirmed) {
          aggregatedData[key].paidOrders += 1;
        } else {
          aggregatedData[key].unpaidOrders += 1;
        }

        // Calculate DMC
        const orderDmc = (order as any).totalDmc ?? 
          ((order.products as any[])?.reduce((sum, product) => {
            return sum + ((product.dmc || 0) * (product.quantity || 0));
          }, 0) || 0);
        aggregatedData[key].dmc += orderDmc;

        // Calculate SPF
        const orderSpf = (order as any).spf ?? 
          (order.amount - (order.products as any[])?.reduce((sum, product) => {
            return sum + ((product.price + (product.dmc || 0)) * product.quantity);
          }, 0));
        aggregatedData[key].spf += orderSpf;

        // Add refunds
        if ((order as any).cancelled && (order as any).refundAmount) {
          aggregatedData[key].refunds += (order as any).refundAmount;
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

function getDateRange(timeRange: TimeRange) {
  let startDate: moment.Moment;
  let endDate = moment().endOf("day");
  let groupFormat: string;

  switch (timeRange) {
    case "7days":
      startDate = moment().subtract(6, "days").startOf("day");
      groupFormat = "YYYY-MM-DD";
      break;
    case "30days":
      startDate = moment().subtract(29, "days").startOf("day");
      groupFormat = "YYYY-MM-DD";
      break;
    case "3months":
      startDate = moment().subtract(3, "months").startOf("day");
      groupFormat = "YYYY-MM-DD";
      break;
    case "year":
      startDate = moment().subtract(12, "months").startOf("month");
      endDate = moment().endOf("month");
      groupFormat = "YYYY-MM";
      break;
    default:
      startDate = moment().subtract(6, "days").startOf("day");
      groupFormat = "YYYY-MM-DD";
  }

  return { startDate, endDate, groupFormat };
}

function formatLabel(date: moment.Moment, timeRange: TimeRange): string {
  if (timeRange === "year") {
    return date.format("MMM YY");
  } else if (timeRange === "3months") {
    return date.format("MMM DD");
  } else {
    return date.format("ddd");
  }
}

export default getRevenueGraphData;
