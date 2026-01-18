"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface Category {
  label: string;
  icon?: string;
}

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/category");
        const cats = await res.json();
        const allCategory = { label: "All" };
        const filtered = Array.isArray(cats) ? cats.filter((cat: Category) => cat.label !== "All") : [];
        setCategories([allCategory, ...filtered]);
        setError(null);
      } catch (err) {
        setCategories([{ label: "All" }]);
        setError("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, loading, error }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
};
