"use client";

import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import CheckoutForm from "./checkout-form";
import Button from "../components/button";


interface Settings {
  spf?: number;
  bankName?: string;
  bankAccountNumber?: string;
  accountHolderName?: string;
  hostels?: string[];
}

interface CheckoutClientProps {
  settings: Settings | null;
  currentUser: any;
}

const CheckoutClient: React.FC<CheckoutClientProps> = ({ settings, currentUser }) => {
      const spf = settings?.spf || 100;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [guestToken, setGuestToken] = useState<string | null>(null);
  const router = useRouter();
  const { cartProducts, paymentIntent, handleSetPaymentIntent, handleClearCart } = useCart();
  // Only handle payment success state and orderId from CheckoutForm
  const handleSetPaymentSuccess = useCallback(
    (value: boolean, deliveryInfo?: { name: string; phone: string; address: string; hostel?: string; email?: string }, orderId?: string, guestToken?: string) => {
      setPaymentSuccess(value);
      if (value && orderId) {
        setOrderId(orderId);
        if (guestToken) setGuestToken(guestToken);
        handleSetPaymentIntent(orderId);
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
      }
    },
    [handleSetPaymentIntent]
  );

  return (
    <div className="w-full">
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin text-blue-500 mr-2" size={28} />
          <span className="text-blue-500 text-base">Loading Checkout...</span>
        </div>
      )}
      {error && (
        <div className="text-center text-rose-500">Something went wrong...</div>
      )}
      {paymentSuccess && (
        <div className="flex items-center flex-col gap-4">
          <div className="text-teal-500 text-center">Order Placed Successfully</div>
          <div className="max-w-[220px] w-full">
            <Button
              label={loading ? "Loading..." : `View Your Order`}
              onClick={() => {
                if (loading || !orderId) return;
                const url = guestToken 
                  ? `/order/${orderId}?token=${guestToken}` 
                  : `/order/${orderId}`;
                router.push(url);
              }}
              disabled={loading || !orderId}
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
