"use client";

import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Chart } from "react-chartjs-2";
import { useMemo } from "react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);


interface LocationGraphProps {
  data?: { address: string; orderCount: number; cancelCount: number }[];
}


const LocationGraph: React.FC<LocationGraphProps> = ({ data }) => {
  const safeData = useMemo(() => Array.isArray(data) ? data : [], [data]);
  const chartData = useMemo(() => ({
    labels: safeData.map((d) => d.address),
    datasets: [
      {
        label: "Orders",
        data: safeData.map((d) => d.orderCount),
        backgroundColor: "rgba(34,197,94,0.7)",
      },
      {
        label: "Cancels",
        data: safeData.map((d) => d.cancelCount),
        backgroundColor: "rgba(239,68,68,0.7)",
      },
    ],
  }), [safeData]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {},
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Count" },
      },
    },
  };

  if (!safeData.length) {
    return (
      <div className="my-8">
        <h3 className="text-lg font-semibold mb-2">Top Locations (Orders & Cancels)</h3>
        <div className="text-gray-500 text-center py-8">No location data available.</div>
      </div>
    );
  }
  return (
    <div className="my-8">
      <h3 className="text-lg font-semibold mb-2">Top Locations (Orders & Cancels)</h3>
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
};

export default LocationGraph;
