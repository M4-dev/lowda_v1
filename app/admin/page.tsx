import getManagerUser from "@/actions/get-manager-user";
import getProducts from "@/actions/get-products";
import getOrders from "@/actions/get-orders";
import getUsers from "@/actions/get-users";
import getRevenueGraphData from "@/actions/get-revenue-graph-data";
import getProductPerformanceData from "@/actions/get-product-performance-data";
import getUserGrowthData from "@/actions/get-user-growth-data";

import getOrderStatusData from "@/actions/get-order-status-data";
import getOrderLocations from "@/actions/get-order-locations";
import AdminClient from "./admin-client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Admin = async () => {
  const currentUser = await getManagerUser();


  const [
    products,
    orders,
    users,
    revenueData,
    productData,
    userGrowthData,
    orderStatusData,
    locationData,
  ] = await Promise.all([
    getProducts({ category: null }),
    getOrders(),
    getUsers(),
    getRevenueGraphData("7days"),
    getProductPerformanceData(),
    getUserGrowthData(),
    getOrderStatusData(),
    getOrderLocations(),
  ]);

  return (
    <AdminClient
      initialProducts={products}
      initialOrders={orders}
      initialUsers={users}
      initialRevenueData={revenueData}
      initialProductData={productData}
      initialUserGrowthData={userGrowthData}
      initialOrderStatusData={orderStatusData}
      initialLocationData={locationData}
      currentUser={currentUser}
    />
  );
};

export default Admin;
