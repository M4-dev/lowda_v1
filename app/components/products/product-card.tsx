"use client";

import { truncateText } from "@/utils/truncate-text";
import { formatPrice } from "@/utils/format-price";
import { Rating } from "@mui/material";
import Image from "next/image";
import ProductImage from "./product-image";
import React, { useState } from "react";
import Link from "next/link";
import { productRating } from "@/utils/product-rating";
import { ChevronDown } from "lucide-react";
import Status from "../status";
import { Check, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { CartProductType } from "@/app/product/[productId]/product-details";
import Button from "../button";
import toast from "react-hot-toast";

interface ProductCardProps {
  data: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
  const { handleAddProductToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showImage, setShowImage] = useState(false);

  const remaining = data.remainingStock ?? data.stock ?? 0;

  const getStockText = () => {
    if (!data.inStock || remaining === 0) return "Out of stock";
    if (remaining > 20) return "20+ left";
    if (remaining > 10) return "10+ left";
    return `${remaining} left`;
  };

  const handleQuantityIncrease = () => {
    if (quantity >= remaining) {
      return toast.error(`Only ${remaining} left in stock`);
    }
    setQuantity((prev) => prev + 1);
  };

  const handleQuantityDecrease = () => {
    if (quantity === 1) return;
    setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = () => {
    if (!data.inStock || remaining === 0) {
      toast.error("Out of stock");
      return;
    }

    const cartProduct: CartProductType = {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      brand: data.brand,
      selectedImg: { ...data.images[0] },
      quantity,
      price: data.price,
      dmc: data.dmc || 0,
      remainingStock: remaining,
    };

    handleAddProductToCart(cartProduct);
    toast.success(`${quantity}x ${truncateText(data.name)} added to cart`);
    setQuantity(1);
  };

  return (
    <div className="col-span-1 bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col h-full">
      {/* Product Image - Lazy load with button */}
      <div className="aspect-square overflow-hidden relative w-full bg-gray-50 flex items-center justify-center">
        {!showImage ? (
          <button
            className="px-3 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
            onClick={() => setShowImage(true)}
          >
            Show Image
          </button>
        ) : (
          data.images && data.images.length > 0 ? (
            <ProductImage
              cartProduct={{
                id: data.id,
                name: data.name,
                description: data.description,
                category: data.category,
                brand: data.brand,
                selectedImg: typeof data.images[0] === 'string' ? { color: 'Default', colorCode: '#000', image: data.images[0] } : data.images[0],
                quantity: 1,
                price: data.price,
                dmc: data.dmc || 0,
                remainingStock: remaining,
              }}
              product={data}
              handleColorSelect={() => {}}
              images={data.images.map((img: any, idx: number) =>
                typeof img === 'string'
                  ? { color: `Variant ${idx + 1}`, colorCode: '#000', image: img }
                  : img
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
              No Image
            </div>
          )
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col items-center w-full gap-1 flex-1 p-3 text-center">
                {/* WhatsApp Share Link */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/product/${data.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-green-600 hover:text-green-800 text-xs font-medium"
                >
                  Share on WhatsApp
                </a>
        <Link href={`/product/${data.id}`}>
          <div className="font-medium text-[1.04rem] mb-1 hover:text-slate-700 cursor-pointer transition">
            {truncateText(data.name)}
          </div>
        </Link>


        {/* Product Description */}
        {data.description && (
          <div className="text-xs text-slate-500 mb-1 line-clamp-3 min-h-[3.8em]">
            {truncateText(data.description, 180)}
          </div>
        )}



        {/* Price & Discount */}
        {data.discount > 0 ? (
          <div className="flex flex-col items-center gap-1 mt-3">
            <div className="flex flex-wrap font-normal text-md text-slate-400 gap-2 mb-1 items-center justify-center">
              <span className="line-through text-lg">{formatPrice(data.price)}</span>
              <span className="bg-pink-600 text-white text-xs font-semibold px-2 py-1 rounded">{Math.round((data.discount / data.price) * 100)}% OFF</span>
            </div>
            <div className="font-bold text-[1.3rem] text-slate-800">{formatPrice(data.price - data.discount)}</div>
          </div>
        ) : (
          <div className="flex items-center gap-1 mt-3">
            <div className="font-semibold text-[1.3rem]">
              {formatPrice(data.price)}
            </div>
          </div>
        )}

        <div className="mt-3">free delivery</div>

        {/* Stock Status */}
        <div className="mt-3 mb-2 flex gap-2 items-center justify-center">
          <span className="text-xs font-medium">STOCK:</span>
          <Status
            text={getStockText()}
            icon={data.inStock && remaining > 0 ? Check : X}
            bg={data.inStock && remaining > 0 ? "bg-teal-600" : "bg-pink-600"}
            color="text-white font-normal text-xs flex justify-center h-6"
          />
        </div>
      </div>

      {/* Quantity & Add to Cart Controls (sticky to bottom) */}
      {data.inStock && remaining > 0 ? (
        <div className="flex flex-col gap-2 mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleQuantityDecrease}
              disabled={quantity === 1}
              className="border-[1px] border-slate-300 flex items-center justify-center w-6 h-6 rounded transition active:scale-[0.9] hover:bg-slate-50 disabled:opacity-50"
            >
              <span className="pb-[1px] text-sm">−</span>
            </button>
            <div className="font-semibold text-sm w-4 text-center">{quantity}</div>
            <button
              onClick={handleQuantityIncrease}
              disabled={quantity >= remaining}
              className="border-[1px] border-slate-300 flex items-center justify-center w-6 h-6 rounded transition active:scale-[0.9] hover:bg-slate-50 disabled:opacity-50"
            >
              <span className="pb-[1px] text-sm">+</span>
            </button>
          </div>

          {/* Add to Cart Button */}
          <div className="w-full">
            <Button
              label="Add to Cart"
              onClick={handleAddToCart}
              small
              roundedBottom
            />
          </div>
        </div>
      ) : (
        <div className="mt-2 py-2 text-pink-600 font-semibold text-sm">
          Out of Stock
        </div>
      )}
    </div>
  );
};

export default ProductCard;
