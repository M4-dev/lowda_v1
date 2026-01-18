"use client";

import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/utils/format-price";
import { useState, useEffect } from "react";
import { requestNotificationPermission } from "@/libs/firebase-messaging";
import toast from "react-hot-toast";
import Heading from "../components/heading";
import Button from "../components/button";
import { useRouter } from "next/navigation";
import { X, Info } from "lucide-react";

interface CheckoutFormProps {
  handleSetPaymentSuccess: (value: boolean, deliveryInfo?: { name: string; phone: string; address: string; hostel?: string }, orderId?: string) => void;
  spf: number;
  currentUser?: any;
}

interface BankDetails {
  bankName: string;
  bankAccountNumber: string;
  accountHolderName: string;
  hostels: string[];
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  handleSetPaymentSuccess,
  spf,
  currentUser,
}) => {
  const router = useRouter();
  const { cartSubtotal, cartTotalDmc, handleClearCart, cartProducts } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [showGuestBanner, setShowGuestBanner] = useState(!currentUser);
  const [guestFcmToken, setGuestFcmToken] = useState<string | null>(null);

  // Request FCM token for guests on mount
  useEffect(() => {
    if (!currentUser) {
      requestNotificationPermission().then((token) => {
        if (token) setGuestFcmToken(token);
      });
    }
  }, [currentUser]);

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: "",
    address: "",
    hostel: "",
  });

  // Sorting & Packaging Fee = SPF + total DMC
  const sortingPackagingFee = spf + cartTotalDmc;
  const totalWithSpf = cartSubtotal + sortingPackagingFee;
  const formattedPrice = formatPrice(totalWithSpf);

  // Fetch bank details on mount
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setBankDetails(data))
      .catch((error) => {
        console.error("Failed to fetch bank details:", error);
        toast.error("Failed to load payment details");
      });
  }, []);
 
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.phone || !formData.hostel) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartProducts,
          guestEmail: formData.email,
          guestName: formData.name,
          address: formData.address,
          hostel: formData.hostel,
          phone: formData.phone,
          spf: spf,
          guestFcmToken: !currentUser ? guestFcmToken : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const order = await response.json();

      toast.success("Order made successfully!");
      handleClearCart();
      handleSetPaymentSuccess(true, formData, order.orderId);
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-6">
        <Heading title="Enter your details to complete checkout" />
      </div>

      {/* Guest Notification Banner */}
      {!currentUser && showGuestBanner && (
        <div className="mb-6 bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-start gap-3">
          <Info className="text-amber-600 text-xl flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-amber-900 mb-3">
              <strong>Guest Checkout:</strong> You&apos;ll need to check the app manually to know when your order is ready. 
              Create an account to receive notifications!
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="px-4 py-1.5 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700 transition"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="px-4 py-1.5 bg-white text-amber-600 text-sm rounded-md border border-amber-600 hover:bg-amber-50 transition"
              >
                Register
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowGuestBanner(false)}
            className="text-amber-600 hover:text-amber-800 transition"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div className="space-y-6">
        {!bankDetails && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded text-yellow-800 text-sm flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            Please wait for bank details and list of hostels to load before completing checkout.
          </div>
        )}
        {/* Delivery Information */}
        <div>
          <h2 className="font-semibold mb-4">Delivery Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+234 XXX XXX XXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location *</label>
              <select
                name="hostel"
                value={formData.hostel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a location</option>
                {bankDetails?.hostels?.map((hostel, index) => (
                  <option key={index} value={hostel}>
                    {hostel}
                  </option>
                ))}
              </select>
              {bankDetails && bankDetails.hostels && bankDetails.hostels.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No locations available. Please contact admin.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Additional Address (Optional)
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Room number, landmarks, or a lovely message if buying for someone else."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[70px] resize-vertical"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                You can write a message here if you are buying for someone else (e.g. recipient&apos;s name, phone, or instructions). We’ll help deliver it as a nice hand-written note with their order!
              </p>
            </div>
          </div>
        </div>

        {/* Payment Instructions or Bank Details Section */}
        <div>
          <h2 className="font-semibold mb-4">Payment Instructions</h2>
          {/* Show payment instructions until admin confirms, then show bank details */}
          {/* We do not have paymentConfirmed state here, so always show instructions */}
          <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-gray-700 text-base">
              Place your order and we will confirm availability of what you want to buy before showing you the account number to pay to.
            </div>
          </div>
          {/*
          // If you want to show bank details after admin confirmation, you need to fetch order/paymentConfirmed state here.
          // For now, always show instructions as per requirements.
          */}
        </div>
      </div>

      {/* Total */}
      <div className="py-4 border-t border-gray-300 mt-6">
        <div className="flex justify-between text-slate-600 mb-2">
          <span>Subtotal:</span>
          <span>{formatPrice(cartSubtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-600 mb-2">
          <span>Sorting & Packaging Fee:</span>
          <span>{formatPrice(sortingPackagingFee)}</span>
        </div>
        <div className="flex justify-between text-slate-600 mb-2">
          <span>Delivery Fee:</span>
          <span>{formatPrice(0)}</span>
        </div>
        <div className="flex justify-between text-slate-700 text-xl font-bold pt-2 border-t">
          <span>Total Amount:</span>
          <span>{formattedPrice}</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        label={isLoading ? "Processing..." : "Confirm Order"}
        isLoading={isLoading}
        disabled={isLoading || !bankDetails}
        type="submit"
      />

      <p className="text-xs text-gray-500 mt-4 text-center">
        Clicking this link will redirect you to full details of your order
      </p>
    </form>
  );
};

export default CheckoutForm;
