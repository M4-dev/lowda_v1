"use client";

import Button from "@/app/components/button";
import Header from "@/app/components/heading";
import CategoryInput from "@/app/components/inputs/category-input";
import * as Icons from "lucide-react";
import CustomCheckbox from "@/app/components/inputs/custom-checkbox";
import Input from "@/app/components/inputs/input";
import SelectColor from "@/app/components/inputs/select-color";
import TextArea from "@/app/components/inputs/text-area";
// import { categories } from "@/utils/categories";
import { colors } from "@/utils/colors";
import { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Product } from "@prisma/client";

export type ImageType = {
  color: string;
  colorCode: string;
  image: File | null;
};

export type UploadedImageType = {
  color: string;
  colorCode: string;
  image: string;
};

const EditProductForm = ({ product }: { product: Product }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<ImageType[] | null>();
  const [oldImages, setOldImages] = useState<UploadedImageType[]>();
  const [categories, setCategories] = useState<{ label: string; icon: string }[]>([]);

  // Helper to get icon component from string
  const getIconComponent = (iconName: string) => {
    // Fallback to Circle if not found
    return (Icons as any)[iconName] || Icons.Circle;
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/category");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        // Always include 'All' category at the start
        const allCategory = { label: "All", icon: "Circle" };
        if (!data || !Array.isArray(data) || data.length === 0) {
          setCategories([allCategory]);
        } else {
          // Remove any duplicate 'All' if present
          const filtered = data.filter((cat) => cat.label !== "All");
          setCategories([allCategory, ...filtered]);
        }
      } catch (err) {
        setCategories([{ label: "All", icon: "Circle" }]);
      }
    };
    fetchCategories();
  }, []);


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      category: "",
      inStock: false,
      stock: 0,
      isVisible: true,
      images: [],
      price: "",
      dmc: "",
      discount: "",
    },
  });

  const setCustomValue = useCallback((id: string, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [setValue]);

  useEffect(() => {
    setCustomValue("name", product.name);
    setCustomValue("description", product.description);
    setCustomValue("brand", product.brand);
    setCustomValue("category", product.category);
    setCustomValue("inStock", product.inStock);
    setCustomValue("stock", (product as any).stock ?? (product as any).remainingStock ?? 0);
    setCustomValue("isVisible", (product as any).isVisible ?? true);
    setCustomValue("price", product.price);
    setCustomValue("dmc", (product as any).dmc || 0);
    setOldImages(
      Array.isArray(product.images)
        ? product.images.map((img: string) => ({
            color: "",
            colorCode: "",
            image: img,
          }))
        : []
    );
  }, [product, setCustomValue]);

  useEffect(() => {
    setCustomValue("images", images);
  }, [images, setCustomValue]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    let uploadedImages: UploadedImageType[] = [];

    if (!data.category) {
      setIsLoading(false);
      return toast.error("Category is not selected!");
    }

    const hasOldImages = oldImages && oldImages.length > 0;
    const hasNewImages = data.images && data.images.length > 0;
    if (!hasOldImages && !hasNewImages) {
      setIsLoading(false);
      return toast.error("No selected image!");
    }

    // 1. Find removed images (present in oldImages but not in new images by color)
    const newColors = (data.images || []).map((img: any) => img.color);
    const removedImages = (oldImages || []).filter(
      (oldImg) => !newColors.includes(oldImg.color)
    );

    // 2. Delete removed images from storage (call DELETE /api/upload)
    if (removedImages.length > 0) {
      await Promise.all(
        removedImages.map(async (img) => {
          if (img.image) {
            try {
              await fetch("/api/upload", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: img.image }),
              });
            } catch (e) {
              // Log but don't block update
              console.error("Failed to delete old image", img.image, e);
            }
          }
        })
      );
    }

    // 3. Upload new images (if any)
    if (data.images && data.images.length > 0) {
      const handleImageUploads = async () => {
        toast("Editing product, please wait...");
        try {
          for (const item of data.images) {
            if (item.image && typeof item.image !== "string") {
              // Only upload if it's a new File (not a string URL)
              const formData = new FormData();
              formData.append("file", item.image);
              formData.append("color", item.color);

              const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
              });

              if (!response.ok) {
                throw new Error("Upload failed");
              }

              const { url } = await response.json();
              uploadedImages.push({
                ...item,
                image: url,
              });
              console.log("File available at", url);
            } else if (item.image && typeof item.image === "string") {
              // Keep existing image URLs
              uploadedImages.push(item);
            }
          }
          return true; // Upload successful
        } catch (error) {
          setIsLoading(false);
          console.log("Error handling image uploads", error);
          toast.error("Error handling image uploads");
          return false; // Upload failed
        }
      };

      const uploadSuccess = await handleImageUploads();
      if (!uploadSuccess) {
        return; // Stop if upload failed
      }
    }

    const dmc = data.dmc === "" || data.dmc === 0 ? 0 : Number(data.dmc);

    // 4. Save only the uploadedImages (new + kept)
    const discount = data.discount === "" || data.discount === 0 ? 0 : Number(data.discount);
    const productData = {
      ...data,
      images: uploadedImages.map(img => img.image),
      dmc: dmc,
      discount: discount,
      stock: data.stock !== undefined ? Number(data.stock) : undefined,
      remainingStock:
        data.remainingStock !== undefined
          ? Number(data.remainingStock)
          : undefined,
    };

    axios
      .put("/api/product/" + product.id, productData)
      .then(() => {
        toast.success("Product edited successfully");
        router.back();
      })
      .catch((error) => {
        toast.error("Oops! Something went wrong.");
        console.log("Error creating product", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const category = watch("category");

  const addImageToState = useCallback((value: ImageType) => {
    setImages((prev) => {
      if (!prev) {
        return [value];
      }

      return [...prev, value];
    });
  }, []);

  const removeImageFromState = useCallback((value: ImageType) => {
    setImages((prev) => {
      if (prev) {
        const filteredImages = prev.filter(
          (item) => item.color !== value.color
        );
        return filteredImages;
      }

      return prev;
    });
  }, []);

  return (
    <>
      <Header title="Edit a Product" center />
      <Input
        id="name"
        label="Name"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <div className="flex w-full gap-3">
        <Input
          id="price"
          label="Price"
          disabled={isLoading}
          register={register}
          errors={errors}
          type="number"
          required
        />
        <Input
          id="discount"
          label="Discount"
          disabled={isLoading}
          register={register}
          errors={errors}
          type="number"
        />
        <Input
          id="dmc"
          label="DMC"
          disabled={isLoading}
          register={register}
          errors={errors}
          type="number"
        />
        <Input
          id="stock"
          label="No. in Stock"
          disabled={isLoading}
          register={register}
          errors={errors}
          type="number"
        />
      </div>
      <Input
        id="brand"
        label="Brand"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <TextArea
        id="description"
        label="Description"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <CustomCheckbox
        id="inStock"
        register={register}
        label="This product is in stock"
      />
      <CustomCheckbox
        id="isVisible"
        register={register}
        label="Make this product visible to customers"
      />
      <div className="w-full font-medium">
        <div className="mb-2 font-semibold">Select a Category</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h[50vh] overfolow-y-auto">
          {categories.map((item) => {
            if (item.label === "All") {
              return null;
            }

            return (
              <div key={item.label} className="col-span">
                <CategoryInput
                  onClick={(category) => setCustomValue("category", category)}
                  selected={category === item.label}
                  label={item.label}
                  icon={getIconComponent(item.icon)}
                />
              </div>
            );
          })}
        </div>
        <div className="w-full flex flex-col flex-wrap gap-4 mt-5">
          <div>
            <div className="font-bold">
              Select the available product colors and upload their images.
            </div>
            <div className="text-small">
              You must upload an image for each of the color selected otherwise
              your color selection will be ignored.
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {colors.map((item, index) => {
              // Only pass previous image if color matches
              const matchedImage = Array.isArray(product.images)
                ? product.images
                    .filter((img: string) => img && item.color && img.toLowerCase().includes(item.color.toLowerCase()))
                    .map((img: string) => ({
                      color: item.color,
                      colorCode: item.colorCode,
                      image: img,
                    }))
                : [];
              return (
                <SelectColor
                  key={index}
                  item={item}
                  addImageToState={addImageToState}
                  removeImageFromState={removeImageFromState}
                  isProductCreated={false}
                  previousImages={matchedImage}
                />
              );
            })}
          </div>
        </div>
      </div>
      <Button
        label={isLoading ? "Loading..." : "Save Product"}
        disabled={isLoading}
        onClick={handleSubmit(onSubmit)}
      />
    </>
  );
};

export default EditProductForm;
