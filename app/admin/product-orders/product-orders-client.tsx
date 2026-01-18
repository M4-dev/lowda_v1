"use client";

import { Order, User } from "@prisma/client";
import Heading from "@/app/components/heading";
import { formatPrice } from "@/utils/format-price";
import { CheckCircle, X, Printer } from "lucide-react";
import Button from "@/app/components/button";

type OrderWithUser = Order & {
  user: User;
};

interface OrderListClientProps {
  orders: OrderWithUser[];
}

const OrderListClient: React.FC<OrderListClientProps> = ({ orders }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-[1200px] m-auto">
      <div className="mb-6 mt-8 print:hidden">
        <Heading title="Order List" center />
        <div className="flex justify-center mt-4">
          <Button label="Print List" icon={Printer} onClick={handlePrint} />
        </div>
      </div>

      <div className="print:block">
        <h1 className="hidden print:block text-2xl font-bold mb-6 text-center">
          Order List Report
        </h1>
        
        {orders.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            No orders found
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              return (
                <div
                  key={order.id}
                  className="border rounded-lg p-6 bg-white shadow-sm print:shadow-none print:border-2 print:break-inside-avoid"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Customer Details
                      </h3>
                      {(() => {
                        let addressObj: any = null;
                        if (order.address) {
                          try {
                            addressObj = typeof order.address === "string" ? JSON.parse(order.address) : order.address;
                          } catch {
                            addressObj = null;
                          }
                        }
                        return (
                          <>
                            <p className="text-sm">
                              <span className="font-medium">Name:</span>{" "}
                              {addressObj?.name || order.user.name || "N/A"}
                            </p>
                            {addressObj?.phone && (
                              <p className="text-sm">
                                <span className="font-medium">Phone:</span>{" "}
                                {addressObj.phone}
                              </p>
                            )}
                            {addressObj?.address && (
                              <p className="text-sm">
                                <span className="font-medium">Address:</span>{" "}
                                {addressObj.address}
                              </p>
                            )}
                            {addressObj?.hostel && (
                              <p className="text-sm">
                                <span className="font-medium">Hostel:</span>{" "}
                                {addressObj.hostel}
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Order Details
                      </h3>
                      <p className="text-sm">
                        <span className="font-medium">Order ID:</span>{" "}
                        ...{order.id.slice(-8)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(order.createDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-medium text-sm">
                          Payment Confirmed:
                        </span>
                        {order.paymentConfirmed ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={18} />
                            <span className="text-sm">Yes</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <X size={18} />
                            <span className="text-sm">No</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-3">
                      Order Items
                    </h3>
                    <div className="space-y-2">
                      {order.products.map((product: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b last:border-b-0"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-slate-600">
                              {product.brand} - {product.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              Qty: {product.quantity}
                            </p>
                            <p className="text-sm text-slate-600">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block,
          .print\\:block * {
            visibility: visible;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-2 {
            border-width: 2px !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderListClient;
