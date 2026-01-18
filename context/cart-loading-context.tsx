"use client";

import React, { createContext, useContext, useState } from "react";

interface CartLoadingContextType {
  cartLoading: boolean;
  setCartLoading: (loading: boolean) => void;
}

const CartLoadingContext = createContext<CartLoadingContextType | undefined>(undefined);

export const CartLoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartLoading, setCartLoading] = useState(false);
  return (
    <CartLoadingContext.Provider value={{ cartLoading, setCartLoading }}>
      {children}
    </CartLoadingContext.Provider>
  );
};

export const useCartLoading = () => {
  const context = useContext(CartLoadingContext);
  if (!context) throw new Error("useCartLoading must be used within a CartLoadingProvider");
  return context;
};
