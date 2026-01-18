"use client";


import { useState } from "react";
import Heading from "@/app/components/heading";
import Button from "@/app/components/button";
import Input from "@/app/components/inputs/input";
import { FieldValues, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { CATEGORY_ICONS } from "@/app/actions/category-icons";


interface Category {
  id?: string;
  label: string;
  icon: string | null;
}

interface CategoryClientProps {
  categories: Category[];
}



import { useEffect } from "react";

const CategoryClient: React.FC<CategoryClientProps> = ({ categories }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string>(CATEGORY_ICONS[0].name);
  const router = useRouter();

  // Fetch categories from API on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/category");
        const data = await res.json();
        setCategoryList(data.filter((c: Category) => c.label !== "All"));
      } catch {
        toast.error("Failed to load categories");
      }
    }
    fetchCategories();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      categoryName: "",
    },
  });

  const onSubmit = async (data: FieldValues) => {
    const categoryName = data.categoryName.trim();
    if (!categoryName) {
      toast.error("Please enter a category name");
      return;
    }
    if (categoryList.some((c) => c.label.toLowerCase() === categoryName.toLowerCase())) {
      toast.error("This category already exists");
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post("/api/category", {
        label: categoryName,
        icon: selectedIcon,
      }, { withCredentials: true });
      toast.success("Category added successfully");
      setCategoryList([...categoryList, res.data]);
      reset();
      setSelectedIcon(CATEGORY_ICONS[0].name);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add category");
    }
    setIsLoading(false);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm(`Are you sure you want to delete this category?`)) {
      return;
    }
    setIsLoading(true);
    try {
      await axios.delete("/api/category", { data: { id: categoryId }, withCredentials: true });
      toast.success("Category deleted successfully");
      setCategoryList(categoryList.filter((c) => c.id !== categoryId));
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete category");
    }
    setIsLoading(false);
  };

  return (
    <div>
      <Heading title="Manage Product Categories" center />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-2 mt-6 mb-8 items-end">
        <Input
          id="categoryName"
          label="Category Name"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <div className="flex flex-col flex-1 w-full">
          <label className="mb-1 text-sm font-medium">Icon</label>
          <div className="grid grid-cols-5 gap-2 w-full">
            {CATEGORY_ICONS.map(({ name, icon: Icon }) => (
              <button
                type="button"
                key={name}
                className={`border rounded-md p-2 flex items-center justify-center ${selectedIcon === name ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                onClick={() => setSelectedIcon(name)}
                disabled={isLoading}
                aria-label={name}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
        <Button label="Add" type="submit" disabled={isLoading} icon={Plus} small />
      </form>
      <ul className="space-y-2">
        {categoryList.map((category) => {
          const Icon = CATEGORY_ICONS.find((i) => i.name === category.icon)?.icon;
          return (
            <li key={category.id || category.label} className="flex items-center gap-2 border p-2 rounded-md">
              {Icon && <Icon className="w-5 h-5 mr-2 text-gray-700" />}
              <span className="flex-1">{category.label}</span>
              <Button
                label="Remove"
                icon={Trash2}
                outline
                small
                disabled={isLoading}
                onClick={() => handleDelete(category.id!)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CategoryClient;
