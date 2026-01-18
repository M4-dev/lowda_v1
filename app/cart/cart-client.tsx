"use client";

import { useCart } from "@/context/cart-context";
import Link from "next/link";
import React from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import Heading from "../components/heading";
import Button from "../components/button";
import ItemContent from "./item-content";
import { formatPrice } from "@/utils/format-price";
import { SafeUser } from "@/types";
import { useRouter } from "next/navigation";

interface CartClientProps {
  currentUser: SafeUser | null;
}


import { useCartLoading } from "@/context/cart-loading-context";

const CartClient: React.FC<CartClientProps> = ({ currentUser }) => {
  const { cartProducts, cartSubtotal, handleClearCart } = useCart();
  const router = useRouter();
  const { setCartLoading } = useCartLoading();

  React.useEffect(() => {
    setCartLoading(false);
  }, [setCartLoading]);

  if (!cartProducts || cartProducts.length === 0) {
    return (
      <div
        className="flex justify-center items-center gap-4 sm:gap-8"
        style={{ minHeight: "calc(100vh - 430px)" }}
      >
        <div className="p-4 sm:p-6 border-4 border-slate-700 rounded-full">
          <ShoppingCart size={70} />
        </div>
        <div className="flex flex-col items-start justify-center">
          <div className="text-2xl">Your cart is empty</div>
          <div>
            <Link
              href={"/"}
              className="text-slate-500 flex items-center justify gap-1 mt-2 hover:scale-110 active:scale-100 transition"
            >
              <ArrowLeft />
              <span>Start Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Heading title="Shopping Cart" center />
      <div className="grid grid-cols-5 text-xs gap-4 pb-2 items-center mt-8">
        <div className="col-span-2 justify-self-start">PRODUCT</div>
        <div className="justify-self-center pl-4 sm:pl-0">PRICE</div>
        <div className="justify-self-center pl-4 sm:pl-0">QUANTITY</div>
        <div className="justify-self-end">TOTAL</div>
      </div>
      <div>
        {cartProducts &&
          cartProducts.map((item) => {
            return <ItemContent key={item.id} item={item} />;
          })}
      </div>
      <div className="border-t-[1.5px] border-slate-300 py-4 flex justify-between gap-4">
        <div className="w-[90px]">
          <Button
            label="Clear Cart"
            onClick={() => handleClearCart()}
            small
            outline
          />
        </div>
        <div className="text-sm flex flex-col gap-1 items-start">
          <div className="flex justify-between w-full text-base font-semibold">
            <span>Subtotal</span>
            <span>{formatPrice(cartSubtotal)}</span>
          </div>
          <p></p>
          <p className="text-slate-500">
            Total cost calculated at checkout
          </p>
          <Button
            label="Checkout"
            onClick={() => router.push("/checkout")}
          />
          <Link
            href={"/"}
            className="text-slate-500 flex items-center gap-1 mt-2  hover:scale-110 active:scale-100 transition"
          >
            <ArrowLeft />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartClient;
