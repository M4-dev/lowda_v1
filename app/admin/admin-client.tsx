"use client";

import { useState } from "react";
import Summary from "./summary";
import Container from "../components/container";
import RevenueGraph from "./bar-graph";
import { TimeRange } from "@/actions/get-revenue-graph-data";
import ProductPerformanceChart from "./product-performance-chart";
import UserGrowthChart from "./user-growth-chart";
import OrderStatusChart from "./order-status-chart";
import { User, Role } from "@prisma/client";

type SafeUser = Omit<User, "createdAt" | "updatedAt" | "emailVerified"> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
};

export default function AdminClient({
  initialProducts,
  initialOrders,
  initialUsers,
  initialRevenueData,
  initialProductData,
  initialUserGrowthData,
  initialOrderStatusData,
  currentUser,
}: {
  initialProducts: any[];
  initialOrders: any[];
  initialUsers: any[];
  initialRevenueData: any[];
  initialProductData: any[];
  initialUserGrowthData: any[];
  initialOrderStatusData: any[];
  currentUser: SafeUser;
}) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7days");
  const [revenueData, setRevenueData] = useState(initialRevenueData);
  const [isLoading, setIsLoading] = useState(false);

  const handleRangeChange = async (range: TimeRange) => {
    setTimeRange(range);
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/revenue-data?range=${range}`);
      const data = await response.json();
      setRevenueData(data);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-8">
      <Container>
        <Summary 
          products={initialProducts} 
          orders={initialOrders} 
          users={initialUsers}
          userRole={currentUser.role}
        />

        {/* Product Performance Chart - Visible to both ADMIN and MANAGER */}
        <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-2xl shadow-lg mx-auto max-w-[1150px]">
          <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">🔥</span>
            Hottest Selling Products
          </h2>
          <ProductPerformanceChart data={initialProductData} />
        </div>
        
        {/* Revenue Graph */}
        <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl shadow-lg mx-auto max-w-[1150px]">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">📊</span>
            Revenue & Orders Overview
          </h2>
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-3">Loading data...</p>
            </div>
          ) : (
            <RevenueGraph 
              data={revenueData} 
              onRangeChange={handleRangeChange}
              currentRange={timeRange}
            />
          )}
        </div>

        {/* User Growth and Order Status Charts */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1150px] mx-auto">
          {/* User Growth */}
          <div className="p-6 bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">👥</span>
              User Growth Trends
            </h2>
            <UserGrowthChart data={initialUserGrowthData} />
          </div>

          {/* Order Status Timeline */}
          <div className="p-6 bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📦</span>
              Order Status Timeline
            </h2>
            <OrderStatusChart data={initialOrderStatusData} />
          </div>
        </div>
      </Container>
    </div>
  );
}
