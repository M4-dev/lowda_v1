"use client";

import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
import React from "react";
import { ShoppingCart } from "lucide-react";
import { useCartLoading } from "@/context/cart-loading-context";

const CartCount = () => {
  const { cartTotalQuantity } = useCart();
  const router = useRouter();
  const { cartLoading, setCartLoading } = useCartLoading();

  const handleClick = () => {
    setCartLoading(true);
    router.push("/cart");
  };

  return (
    <div
      className="relative cursor-pointer hover:scale-110 active:scale-[0.9] transition"
      onClick={handleClick}
    >
      <div className="text-[1.7rem] sm:text-[1.95rem] text-white pb-[0.1rem]">
        {cartLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-6 w-6 text-pink-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </span>
        ) : (
          <ShoppingCart />
        )}
      </div>
      <span
        className={`absolute top-[-4px] right-[-10px] bg-pink-600 text-white font-semibold h-5 w-5 rounded-full flex items-center justify-center text-sm
      ${cartTotalQuantity === 0 ? "hidden" : "block"}
      `}
      >
        {cartTotalQuantity}
      </span>
    </div>
  );
};

export default CartCount;
