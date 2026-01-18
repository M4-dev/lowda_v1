"use client";


import Container from "../container";
import { CATEGORY_ICONS } from "@/app/actions/category-icons";
import Category from "./category";
import { usePathname, useSearchParams } from "next/navigation";
import { useCategories } from "@/context/category-context";



import { Suspense } from "react";

function CategoriesContent() {
  const params = useSearchParams();
  const category = params?.get("category");
  const pathname = usePathname();
  const { categories, loading } = useCategories();
  const isMainPage = pathname === "/";
  if (!isMainPage) return null;
  return (
    <div className="border-b-[0.5px] bg-slate-300">
      <Container>
        <div className="pt-1 flex flex-wrap items-center justify-between overlow-x-auto">
          {loading && (
            <div className="text-xs text-gray-500">Loading categories...</div>
          )}
          {!loading && categories.map((item) => {
            let Icon;
            if (item.label === "All") {
              Icon = CATEGORY_ICONS.find(i => i.name === "Store")?.icon;
            } else {
              Icon = CATEGORY_ICONS.find(i => i.name === item.icon)?.icon;
            }
            if (!Icon) {
              Icon = CATEGORY_ICONS.find(i => i.name === "Tag")?.icon;
            }
            return (
              <Category
                key={item.label}
                label={item.label}
                icon={Icon as React.ElementType}
                selected={
                  category === item.label ||
                  (category === null && item.label === "All")
                }
              />
            );
          })}
        </div>
      </Container>
    </div>
  );
}

const Categories = () => (
  <Suspense fallback={<div className="text-xs text-gray-500">Loading categories...</div>}>
    <CategoriesContent />
  </Suspense>
);

export default Categories;
