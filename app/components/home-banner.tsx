"use client";

import Image from "next/image";
import React from "react";
import { Monoton } from "next/font/google";

const exo = Monoton({ subsets: ["latin"], weight: ["400"] });

const rainbowColors: Record<string, { from: string; to: string }> = {
  red: { from: "from-red-600", to: "to-red-400" },
  orange: { from: "from-orange-600", to: "to-orange-400" },
  yellow: { from: "from-yellow-600", to: "to-yellow-400" },
  green: { from: "from-green-600", to: "to-green-400" },
  blue: { from: "from-blue-600", to: "to-blue-400" },
  indigo: { from: "from-indigo-600", to: "to-indigo-400" },
  purple: { from: "from-purple-600", to: "to-purple-400" },
  black: { from: "from-gray-900", to: "to-gray-700" },
  white: { from: "from-gray-100", to: "to-gray-300" },
};

interface HomeBannerProps {
  title?: string;
  subtitle?: string;
  discount?: string;
  image?: string;
  colors?: string[];
}

const HomeBanner: React.FC<HomeBannerProps> = ({ title, subtitle, discount, image, colors }) => {
  const getGradientClass = () => {
    if (!colors || colors.length === 0) {
      return "bg-gradient-to-r from-sky-800 to-slate-600";
    }
    const firstColor = rainbowColors[colors[0]];
    const lastColor = rainbowColors[colors[colors.length - 1]];
    if (firstColor && lastColor) {
      return `bg-gradient-to-r ${firstColor.from} ${lastColor.to}`;
    }
    return "bg-gradient-to-r from-sky-800 to-slate-600";
  };

  return (
    <div className={`mt-4 sm:mt-0 relative ${getGradientClass()} mb-8 rounded-md overflow-hidden pb-4`}>
      <div className="flex flex-row sm:gap-2 items-center justify-evenly">
        <div className="mb-2 sm:mb-1 text-center pt-7 sm:pt-9">
          <h1
            className={`${exo.className} text-3xl md:text-[3.2rem] font-bold text-white mb-1 sm:mb-4`}
          >
            {title || "Summer Sale!"}
          </h1>
          <p className="text-lg md:text-xl text-white mb-1 sm:mb-2">
            {subtitle || "Enjoy discounts on selected items"}
          </p>
          <p className="text-2xl md:text-5xl bg-gradient-to-r text-transparent bg-clip-text from-yellow-500 to-amber-200 font-bold">
            {discount || "GET 20% OFF"}
          </p>
        </div>
        <div className="w-1/3 2xl:w-1/4 top-2 hidden sm:block relative aspect-video">
          <Image
            src={image || "/banner-image.png"}
            alt="Banner image"
            quality={95}
            fill
            className="object-contain absolute"
          />
        </div>
      </div>
    </div>
  );
};

export default HomeBanner;
