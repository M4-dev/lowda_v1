"use client";

import Button from "@/app/components/button";
import Header from "@/app/components/heading";
import CategoryInput from "@/app/components/inputs/category-input";
import CustomCheckbox from "@/app/components/inputs/custom-checkbox";
import Input from "@/app/components/inputs/input";
import SelectColor from "@/app/components/inputs/select-color";
import TextArea from "@/app/components/inputs/text-area";
import { categories } from "@/utils/categories";
import { colors } from "@/utils/colors";
import { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

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

const AddProductForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<ImageType[] | null>();
  const [isProductCreated, setIsProductCreated] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
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
      list: "",
    },
  });

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  useEffect(() => {
    setCustomValue("images", images);
  }, [images]);

  useEffect(() => {
    if (isProductCreated) {
      reset();
      setImages(null);
      setIsProductCreated(false);
    }
  }, [isProductCreated]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    let uploadedImages: UploadedImageType[] = [];

    if (!data.category) {
      setIsLoading(false);
      return toast.error("Category is not selected!");
    }

    if (!data.images || data.images.length === 0) {
      setIsLoading(false);
      return toast.error("No selected image!");
    }

    const handleImageUploads = async () => {
      toast("Creating product, please wait...");
      try {
        for (const item of data.images) {
          if (item.image) {
            // Upload to server API
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

    const list = data.list === "" || data.list === 0 ? data.price : data.list;
    const dmc = data.dmc === "" || data.dmc === 0 ? 0 : Number(data.dmc);

    const productData = {
      ...data,
      images: uploadedImages,
      list: list,
      dmc: dmc,
      stock: data.stock ? Number(data.stock) : 0,
    };

    axios
      .post("/api/product", productData)
      .then(() => {
        toast.success("Product created");
        setIsProductCreated(true);
        router.push("/admin/manage-products");
      })
      .catch((error) => {
        toast.error("Something went wrong.");
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
    <div className="max-w-[1000px] mx-auto">
      <div className="mb-8">
        <Header title="Add a Product" center />
      </div>

      {/* Product Information Section */}
      <div className="bg-white rounded-lg p-6 mb-6 border border-slate-300" style={{boxShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
        <h3 className="text-lg font-semibold mb-4 text-slate-700">Product Information</h3>
        <div className="space-y-4">
          <Input
            id="name"
            label="Product Name"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
          <TextArea
            id="description"
            label="Product Description"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="brand"
              label="Brand"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white rounded-lg p-6 mb-6 border border-slate-300" style={{boxShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
        <h3 className="text-lg font-semibold mb-4 text-slate-700">Pricing & Stock</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            id="price"
            label="Price (₦)"
            disabled={isLoading}
            register={register}
            errors={errors}
            type="number"
            required
          />
          <Input
            id="dmc"
            label="DMC (₦)"
            disabled={isLoading}
            register={register}
            errors={errors}
            type="number"
          />
          <Input
            id="list"
            label="List Price (₦)"
            disabled={isLoading}
            register={register}
            errors={errors}
            type="number"
          />
          <Input
            id="stock"
            label="Stock Quantity"
            disabled={isLoading}
            register={register}
            errors={errors}
            type="number"
          />
        </div>
        <div className="mt-4 flex gap-6">
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
        </div>
      </div>

      {/* Category Section */}
      <div className="bg-white rounded-lg p-6 mb-6 border border-slate-300" style={{boxShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
        <h3 className="text-lg font-semibold mb-4 text-slate-700">Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((item) => {
            if (item.label === "All") {
              return null;
            }

            return (
              <div key={item.label}>
                <CategoryInput
                  onClick={(category) => setCustomValue("category", category)}
                  selected={category === item.label}
                  label={item.label}
                  icon={item.icon}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Color & Images Section */}
      <div className="bg-white rounded-lg p-6 mb-6 border border-slate-300" style={{boxShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
        <h3 className="text-lg font-semibold mb-2 text-slate-700">Product Colors & Images</h3>
        <p className="text-sm text-slate-600 mb-4">
          Select available colors and upload an image for each. Colors without images will be ignored.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {colors.map((item, index) => {
            return (
              <SelectColor
                key={index}
                item={item}
                addImageToState={addImageToState}
                removeImageFromState={removeImageFromState}
                isProductCreated={isProductCreated}
              />
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center mb-8">
        <div className="w-full md:w-96">
          <Button
            label={isLoading ? "Creating Product..." : "Add Product"}
            disabled={isLoading}
            onClick={handleSubmit(onSubmit)}
            type="submit"
          />
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
