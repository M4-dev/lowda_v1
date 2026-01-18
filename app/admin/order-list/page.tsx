import Container from "@/app/components/container";
import OrderListClient from "./order-list-client";
import getCurrentUser from "@/actions/get-current-user";
import NullData from "@/app/components/null-data";
import getOrders from "@/actions/get-orders";

const OrderList = async ({
  searchParams,
}: {
  searchParams: { orders?: string };
}) => {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return <NullData title="Oops! Access denied" />;
  }

  const allOrders = await getOrders();

  return (
    <div className="pt-8">
      <Container>
        <OrderListClient orders={allOrders} />
      </Container>
    </div>
  );
};

export default OrderList;
