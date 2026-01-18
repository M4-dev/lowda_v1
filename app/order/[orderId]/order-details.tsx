"use client";

import Heading from "@/app/components/heading";
import Status from "@/app/components/status";
import { formatPrice } from "@/utils/format-price";
import { Order } from "@prisma/client";
import moment from "moment";
import { Clock, Truck, Check } from "lucide-react";
import { use, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface OrderDetailsProps {
  order: Order;
  guestToken?: string;
}

interface BankDetails {
  bankName: string;
  bankAccountNumber: string;
  accountHolderName: string;
}


const OrderDetails: React.FC<OrderDetailsProps> = ({ order, guestToken }) => {
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [hasClaimedPayment, setHasClaimedPayment] = useState(order.paymentClaimed || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [userConfirmedDelivery, setUserConfirmedDelivery] = useState((order as any).userConfirmedDelivery || false);
  // Delivery confirmation handler (copied from orders-client)
  const handleDeliveryConfirmation = async (orderId: string, confirmed: boolean) => {
    setDeliveryLoading(true);
    try {
      await axios.put("/api/order/confirm-delivery", {
        orderId,
        confirmed,
      });
      toast.success(confirmed ? "Delivery confirmed!" : "Confirmation removed");
      setUserConfirmedDelivery(confirmed);
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update confirmation");
      console.error(error);
    } finally {
      setDeliveryLoading(false);
    }
  };

  const router = useRouter();

  useEffect(() => {
    // Fetch bank details
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setBankDetails(data))
      .catch((error) => {
        console.error("Failed to fetch bank details:", error);
      });
  }, []);

  const handleMarkAsPaid = async () => {
    // Toggle customer's payment-claimed state so they can revoke if needed
    const newState = !hasClaimedPayment;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/order/${order.id}/mark-payment-confirmed`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          claimed: newState,
          guestToken: guestToken 
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || "Failed to update payment status");
      }

      setHasClaimedPayment(newState);
      if (newState) {
        toast.success("Thank you! Payment marked as pending confirmation.");
        router.refresh();
        // notify admin
        try {
          await fetch("/api/notifications/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "Payment claimed",
              body: `Order ${order.id} marked as paid by customer.`,
              orderId: order.id,
            }),
          });
        } catch (e) {
          // ignore notification errors
        }
      } else {
        toast.success("Payment claim revoked.");
        // notify admin about revocation
        try {
          await fetch("/api/notifications/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "Payment claim revoked",
              body: `Customer revoked payment claim for order ${order.id}.`,
              orderId: order.id,
            }),
          });
        } catch (e) {
          // ignore
        }
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update payment status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 mb-10 max-w-[1150px] flex flex-col sm:flex-row gap-8">
      <div className="flex flex-col gap-2 sm:w-1/2">
        <div className="mb-2">
          <Heading title="Order Details" />
        </div>
        <div>Order ID: {order.id}</div>
        <div>
          Total Amount:{" "}
          <span className="font-bold">{formatPrice(order.amount)}</span>
        </div>
        <div className="flex gap-2 items-center">
          <div>Payment status:</div>
          <div>
            {!hasClaimedPayment ? (
              <Status
                text="pending"
                icon={Clock}
                bg="bg-slate-200"
                color="text-slate-700"
              />
            ) : (
              hasClaimedPayment && (
                <Status
                  text="completed"
                  icon={Check}
                  bg="bg-green-200"
                  color="text-green-700"
                />
              )
            )}
          </div>
        </div>

        {/* Payment Confirmation (admin) */}
        <div className="flex gap-2 items-center">
          <div>Payment Confirmed:</div>
          <div>
            {order.paymentConfirmed ? (
              <Status
                text="confirmed"
                icon={Check}
                bg="bg-green-200"
                color="text-green-700"
              />
            ) : (
              <Status
                text="awaiting confirmation"
                icon={Clock}
                bg="bg-yellow-200"
                color="text-yellow-700"
              />
            )}
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <div>Delivery status:</div>
          <div>
            {order.deliveryStatus === "pending" ? (
              <Status
                text="pending"
                icon={Clock}
                bg="bg-slate-200"
                color="text-slate-700"
              />
            ) : order.deliveryStatus === "dispatched" ? (
              <Status
                text="dispatched"
                icon={Truck}
                bg="bg-purple-200"
                color="text-purple-700"
              />
            ) : (
              order.deliveryStatus === "delivered" && (
                <Status
                  text="delivered"
                  icon={Check}
                  bg="bg-green-200"
                  color="text-green-700"
                />
              )
            )}
          </div>
        </div>
        <div>Date: {moment(order.createDate).fromNow()}</div>

        {/* Mark as Paid or Delivery Confirmation Button */}
        {/* Show 'I have paid' only if not dispatched, otherwise show 'I have received' */}
        {!order.paymentConfirmed && order.adminConfirmedAvailability && bankDetails && order.deliveryStatus !== "dispatched" && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <button
              onClick={handleMarkAsPaid}
              disabled={isSubmitting}
              className={
                  hasClaimedPayment
                    ? "px-4 py-2 bg-gray-400 text-white rounded font-medium text-sm hover:bg-gray-500 disabled:opacity-50"
                    : "px-4 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 disabled:opacity-50"
                }
              >
                {isSubmitting ? "Updating..." : hasClaimedPayment ? "I have not paid" : "✓ I have paid"}
            </button>
              <p className="text-xs text-gray-600 mt-2">
                {hasClaimedPayment
                  ? "You have marked this order as paid. Click to revoke if necessary."
                  : "Tick this after you have paid the amount to the account details provided"}
              </p>
          </div>
        )}
        {/* Show delivery confirmation button if dispatched */}
        {order.deliveryStatus === "dispatched" && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <button
              onClick={() => handleDeliveryConfirmation(order.id, !userConfirmedDelivery)}
              disabled={deliveryLoading}
              className={`px-4 py-2 rounded font-medium text-sm transition active:scale-95 ${
                !userConfirmedDelivery
                  ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
                  : "bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {deliveryLoading
                ? "Updating..."
                : !userConfirmedDelivery
                  ? "✓ I have received"
                  : "I have not received"}
            </button>
            <p className="text-xs text-gray-600 mt-2">
              {!userConfirmedDelivery
                ? "Tick this after you have received your order."
                : "You have marked this order as received. Click to revoke if necessary."}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:w-1/2">
        {/* Payment Instructions or Bank Details Section */}
        <div>
          <div className="mb-2">
            <Heading title="Payment Instructions" />
          </div>
          {!order.adminConfirmedAvailability ? (
            <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-gray-700 text-base">
                We are confirming the availability of what you ordered. You will see the account number to pay to once we confirm your order.
              </div>
            </div>
          ) : bankDetails ? (
            <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div>
                <p className="text-sm text-gray-600">Bank Name</p>
                <p className="text-lg font-semibold text-gray-800">
                  {bankDetails.bankName || "Not configured"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Holder</p>
                <p className="text-lg font-semibold text-gray-800">
                  {bankDetails.accountHolderName || "Not configured"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Number</p>
                <p className="text-lg font-semibold text-gray-800">
                  {bankDetails.bankAccountNumber || "Not configured"}
                </p>
              </div>
              <div className="pt-3 border-t border-blue-200">
                <p className="text-sm text-gray-600">Amount to Pay</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(order.amount)}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
              Loading payment details...
            </div>
          )}
        </div>

        {/* Delivery Address */}
        <div className="mt-6">
          <div className="mb-2">
            <Heading
              title={
                order.deliveryStatus === "delivered"
                  ? "Delivered Address"
                  : "Delivery Address"
              }
            />
          </div>
          <div className="space-y-2">
            {(() => {
              if (!order.address) {
                return <div>No address provided</div>;
              }
              let addressObj: any = null;
              try {
                addressObj = typeof order.address === "string" ? JSON.parse(order.address) : order.address;
              } catch {
                addressObj = null;
              }
              const parts: string[] = [];
              if (addressObj?.name) parts.push(`Name: ${addressObj.name}`);
              if (addressObj?.phone) parts.push(`Phone: ${addressObj.phone}`);
              if (addressObj?.address) parts.push(`Address: ${addressObj.address}`);
              if (addressObj?.hostel) parts.push(addressObj.hostel);

              if (parts.length === 0) {
                return <div>No address provided</div>;
              }

              return (
                <div className="space-y-1">
                  {parts.map((part, i) => (
                    <div key={i}>{part}</div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
