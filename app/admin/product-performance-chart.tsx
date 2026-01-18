"use client";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type ProductData = {
  name: string;
  revenue: number;
  quantity: number;
  orders: number;
};

interface ProductPerformanceChartProps {
  data: ProductData[];
}

const ProductPerformanceChart: React.FC<ProductPerformanceChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map((item) => typeof item.name === "string" ? item.name.substring(0, 20) : ""),
    datasets: [
      {
        label: "Revenue (₦)",
        data: data.map((item) => item.revenue),
        backgroundColor: "rgba(147, 51, 234, 0.6)",
        borderColor: "rgba(147, 51, 234, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const product = data[context.dataIndex];
            return [
              `Revenue: ₦${product.revenue.toLocaleString()}`,
              `Quantity Sold: ${product.quantity}`,
              `Orders: ${product.orders}`,
            ];
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          callback: function(value: any) {
            return '₦' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Top 5 Products by Revenue</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ProductPerformanceChart;
