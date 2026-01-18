"use client";

import { useCallback, useEffect, useState } from "react";
import { Rating } from "@mui/material";
import { productRating } from "@/utils/product-rating";
import SetColor from "@/app/components/products/set-color";
import SetQuantity from "@/app/components/products/set-quantity";
import Button from "@/app/components/button";
import ProductImage from "@/app/components/products/product-image";
import { useCart } from "@/context/cart-context";
import { CheckCircle, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { formatPrice } from "@/utils/format-price";
import Status from "@/app/components/status";
import { appConfig } from "@/config/appConfig";

interface ProductDetailsProps {
  product: any;
}


export interface CartProductType {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  selectedImg: SelectedImgType;
  quantity: number;
  price: number;
  dmc: number;
  remainingStock?: number;
}


export type SelectedImgType = {
  color: string;
  colorCode: string;
  image: string;
};

const Horizontal = () => {
  return <hr className="w-[30%] my-2" />;
};

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  
  const normalizedImages = Array.isArray(product.images) 
    ? product.images.map((img: any, index: number) => {
        if (typeof img === 'string') {
          return {
            color: `Variant ${index + 1}`,
            colorCode: "#000000",
            image: img
          };
        }
        return img;
      })
    : [];

  const { cartProducts, handleAddProductToCart } = useCart();
  const [isProductInCart, setIsProductInCart] = useState<boolean>(false);
  const [cartProduct, setCartProduct] = useState<CartProductType>({
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    brand: product.brand,
    selectedImg: normalizedImages[0] ? { ...normalizedImages[0] } : {
      color: "White",
      colorCode: "#FFFFFF",
      image: ""
    },
    quantity: 1,
    price: product.price,
    dmc: product.dmc || 0,
    remainingStock: product.remainingStock ?? product.stock ?? 0,
  });
  const router = useRouter();

  useEffect(() => {
    setIsProductInCart(false);

    if (cartProducts) {
      const existingIndex = cartProducts.findIndex(
        (item) => item.id === product.id
      );

      if (existingIndex > -1) {
        setIsProductInCart(true);
      }
    }
  }, [cartProducts, product.id]);

  const handleColorSelect = useCallback(
    (value: SelectedImgType) => {
      setCartProduct((prev) => {
        return { ...prev, selectedImg: value };
      });
    },
    []
  );

  const handleQuantityIncrease = useCallback(() => {
    const max = product.remainingStock ?? product.stock ?? 99;
    if (cartProduct.quantity >= max) {
      return toast.error(`Only ${max} left in stock`);
    }

    if (cartProduct.quantity === 99) return;

    setCartProduct((prev) => {
      return { ...prev, quantity: prev.quantity + 1 };
    });
  }, [cartProduct]);

  const handleQuantityDecrease = useCallback(() => {
    if (cartProduct.quantity === 1) return;

    setCartProduct((prev) => {
      return { ...prev, quantity: prev.quantity - 1 };
    });
  }, [cartProduct]);

  // Get product link for sharing (always include domain, even on first render)
  const [productLink, setProductLink] = useState(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/product/${product.id}`;
    }
    // fallback for SSR: use env or empty string
    return `${process.env.NEXT_PUBLIC_BASE_URL || ''}/product/${product.id}`;
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const link = `${window.location.origin}/product/${product.id}`;
      setProductLink(link);
      console.log('Product share link:', link);
    }
  }, [product.id]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:mt-6">
      <div>
        <ProductImage
          cartProduct={cartProduct}
          product={product}
          handleColorSelect={handleColorSelect}
          images={normalizedImages}
        />
      </div>
      <div className="flex flex-col gap-1 text-slate-500 text-sm my-auto">
        <h2 className="text-3xl font-medium text-slate-700 mb-1">
          {product.name}
        </h2>
        <div className="flex items-center gap-2">
          <Rating value={productRating(product.reviews)} readOnly />
          <div>{product.reviews.length} reviews</div>
        </div>
        <Horizontal />
        <div className="text-justify">{product.description}</div>
        <Horizontal />
        <div className="flex flex-wrap justify-between">
          <div className="flex-col">
            <div className="mb-2">
              <span className="font-semibold">CATEGORY:</span>{" "}
              {product.category}
            </div>
            <div>
              <span className="font-semibold">BRAND:</span> {product.brand}
            </div>
          </div>

          <div className={`text-xl flex gap-2 sm:w-[50%] mt-1}`}>
            <span className="font-semibold text-sm pt-[5px]">STOCK:</span>
            {(() => {
              const remaining = product.remainingStock ?? product.stock ?? 0;
              let stockText = "Out of stock";
              if (product.inStock && remaining > 0) {
                if (remaining > 20) stockText = "20+ in stock";
                else if (remaining > 10) stockText = "10+ in stock";
                else stockText = `${remaining} in stock`;
              }

              return (
                <Status
                  text={stockText}
                  icon={product.inStock ? Check : X}
                  bg={product.inStock ? "bg-teal-600" : "bg-pink-600"}
                  color="text-white font-normal flex justify-center h-8"
                />
              );
            })()}
          </div>
        </div>
        <Horizontal />

        <div className="flex flex-col gap-1">
          {/* WhatsApp Share Link */}
          {productLink && (
            <a
              href={`https://wa.me/?text=${encodeURIComponent(productLink)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 inline-block text-green-600 hover:text-green-800 text-xs font-medium"
            >
              Share on WhatsApp
            </a>
          )}
          <SetColor
            images={normalizedImages}
            cartProduct={cartProduct}
            handleColorSelect={handleColorSelect}
          />
          <SetQuantity
            cartProduct={cartProduct}
            handleQuantityIncrease={handleQuantityIncrease}
            handleQuantityDecrease={handleQuantityDecrease}
          />

          <Horizontal />
          {product.discount > 0 ? (
            <div className="flex flex-wrap font-normal text-md text-slate-400 gap-2 mb-1">
              <span className="line-through text-2xl">
                {formatPrice(product.price)}
              </span>
              <Status
                text={
                  Math.round(
                    (product.discount / product.price) * 100
                  ) + "% OFF"
                }
                icon={Check}
                bg="bg-pink-600"
                color="text-white font-medium"
              />
            </div>
          ) : null}
          <div className="flex gap-4 text-3xl text-slate-600 font-bold">
            <span>Price</span>
            <div>
              {formatPrice(product.price - (product.discount || 0))}
            </div>
          </div>
          <div className="flex gap-4 text-2xl text-slate-700 font-bold mt-2">
            {/* <span>Total</span>
            <div>
              {formatPrice((product.price + (product.dmc || 0) + (spf || 0)) * cartProduct.quantity)}
            </div> */}
          </div>
          <Horizontal />

          {isProductInCart && (
            <p className="mt-1 text-slate-500 flex  items-center gap-1">
              <CheckCircle size={20} style={{ color: appConfig.themeColor }} />
              <span>Product added to cart</span>
            </p>
          )}
          <div className="max-w-[340px] mt-3">
            <Button
              label={
                !product.inStock
                  ? "Out of stock"
                  : isProductInCart
                  ? "View cart"
                  : "Add to cart"
              }
              disabled={!product.inStock}
              outline={isProductInCart}
              onClick={() => {
                if (isProductInCart) {
                  router.push("/cart");
                } else {
                  handleAddProductToCart(cartProduct);
                  toast.success("Product added to cart.");
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
