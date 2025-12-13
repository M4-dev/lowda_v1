"use client";

import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import CheckoutForm from "./checkout-form";
import Button from "../components/button";
import { Settings } from "@prisma/client";

interface CheckoutClientProps {
  settings: Settings | null;
  currentUser: any;
}

const CheckoutClient: React.FC<CheckoutClientProps> = ({ settings, currentUser }) => {
  const router = useRouter();
  const { cartProducts, paymentIntent, handleSetPaymentIntent, handleClearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const hasRunOnce = useRef(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const spf = (settings as any)?.spf || 100;


  useEffect(() => {
    if (hasRunOnce.current) return;
    hasRunOnce.current = true;

      if (cartProducts && cartProducts.length > 0) {
      setLoading(true);
        setError(null);
      // Always create a fresh order (don't pass old payment_intent_id)
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartProducts,
          payment_intent_id: null,
          // Guest checkout data will be added by CheckoutForm if not logged in
        }),
      })
          .then(async (res) => {
              setLoading(false);
              const json = await res.json().catch(() => ({}));

              if (!res.ok) {
                const message = json?.error || `HTTP ${res.status}`;
                // If stock issue, redirect to cart so user can adjust quantities
                if (res.status === 400) {
                  setError(message);
                  toast.error(message);
                  router.push("/cart");
                  return Promise.reject(new Error(message));
                }

                return Promise.reject(new Error(message));
              }

              // Log response for debugging in case orderId is missing
              console.debug("create-payment-intent response json:", json);
              if (!json || typeof json !== 'object') {
                console.error('API did not return a valid JSON object:', json);
              }
              if (!json.orderId) {
                console.error('API response missing orderId:', json);
              }
              return json;
            })
          .then((data) => {
            console.debug('Order creation .then() data:', data);
            if (data?.orderId) {
              setOrderId(data.orderId);
              if (data?.guestToken) {
                setGuestToken(data.guestToken);
              }
              console.log("Order ID:", data.orderId);
              handleSetPaymentIntent(data.orderId);
            } else {
              console.error('No orderId in response:', data);
              throw new Error("No orderId in response");
            }
          })
          .catch((error: any) => {
            const message = error?.message || "Something went wrong. Please try again.";
            setError(message);
            console.error("Checkout error:", error);
            toast.error(message);
          });
    }
  }, []);

  const handleSetPaymentSuccess = useCallback(
    (value: boolean, deliveryInfo?: { name: string; phone: string; address: string }) => {
      setPaymentSuccess(value);
      if (value && deliveryInfo && orderId) {
        // Update order with delivery info
        fetch(`/api/order/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: deliveryInfo }),
        }).catch(err => console.error('Failed to update delivery info:', err));
      }
      if (value) {
        // Show success notification with payment instructions
        toast.success(
          (t) => (
            <div className="text-sm">
              <p className="font-semibold mb-2">Order placed successfully!</p>
              <p className="mb-2">Kindly pay to the account details provided.</p>
              <p className="mb-2">Then tick <em>I have paid</em> on your order when done.</p>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="mt-3 px-3 py-1 bg-white text-teal-600 rounded font-medium text-xs"
              >
                Dismiss
              </button>
            </div>
          ),
          { duration: 8000 }
        );
        // Reset payment state after successful checkout
        handleClearCart();
        handleSetPaymentIntent(null);
      }
    },
    [cartProducts, paymentIntent, handleClearCart, handleSetPaymentIntent, orderId]
  );

  return (
    <div className="w-full">
      {loading && <div className="text-center">Loading Checkout...</div>}
      {error && (
        <div className="text-center text-rose-500">Something went wrong...</div>
      )}
      {paymentSuccess && (
        <div className="flex items-center flex-col gap-4">
          <div className="text-teal-500 text-center">Order Placed Successfully</div>
          <div className="max-w-[220px] w-full">
            <Button
              label={`View Your Order`}
              onClick={() => {
                const url = guestToken 
                  ? `/order/${orderId}?token=${guestToken}` 
                  : `/order/${orderId}`;
                router.push(url);
              }}
            />
          </div>
        </div>
      )}
      {cartProducts && (
        <CheckoutForm
          handleSetPaymentSuccess={handleSetPaymentSuccess}
          spf={spf}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default CheckoutClient;
