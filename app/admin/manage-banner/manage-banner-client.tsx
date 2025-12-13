"use client";

import { useCallback, useState } from "react";
import Heading from "@/app/components/heading";
import Input from "@/app/components/inputs/input";
import Button from "@/app/components/button";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

interface ManageBannerClientProps {
  settings: any;
}

const rainbowColors = [
  { name: "Red", from: "from-red-600", to: "to-red-400", value: "red" },
  { name: "Orange", from: "from-orange-600", to: "to-orange-400", value: "orange" },
  { name: "Yellow", from: "from-yellow-600", to: "to-yellow-400", value: "yellow" },
  { name: "Green", from: "from-green-600", to: "to-green-400", value: "green" },
  { name: "Blue", from: "from-blue-600", to: "to-blue-400", value: "blue" },
  { name: "Indigo", from: "from-indigo-600", to: "to-indigo-400", value: "indigo" },
  { name: "Purple", from: "from-purple-600", to: "to-purple-400", value: "purple" },
  { name: "Black", from: "from-gray-900", to: "to-gray-700", value: "black" },
  { name: "White", from: "from-gray-100", to: "to-gray-300", value: "white" },
];

const ManageBannerClient: React.FC<ManageBannerClientProps> = ({ settings }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [bannerImage, setBannerImage] = useState<string | null>(settings?.bannerImage || null);
  const [selectedColors, setSelectedColors] = useState<string[]>(
    settings?.bannerColors || ["blue", "indigo"]
  );
  const [bannerVisible, setBannerVisible] = useState<boolean>(settings?.bannerVisible ?? true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FieldValues>({
    defaultValues: {
      bannerTitle: settings?.bannerTitle || "Summer Sale!",
      bannerSubtitle: settings?.bannerSubtitle || "Enjoy discounts on selected items",
      bannerDiscount: settings?.bannerDiscount || "GET 20% OFF",
    },
  });

  const watchedTitle = watch("bannerTitle");
  const watchedSubtitle = watch("bannerSubtitle");
  const watchedDiscount = watch("bannerDiscount");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onloadstart = () => {
        toast.loading("Uploading image...", { id: "banner-upload" });
      };
      reader.onload = () => {
        setBannerImage(reader.result as string);
        toast.success("Image uploaded successfully!", { id: "banner-upload" });
      };
      reader.onerror = () => {
        toast.error("Failed to upload image", { id: "banner-upload" });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    maxFiles: 1,
  });

  const toggleColor = (colorValue: string) => {
    setSelectedColors((prev) => {
      if (prev.includes(colorValue)) {
        return prev.filter((c) => c !== colorValue);
      } else {
        return [...prev, colorValue];
      }
    });
  };

  const getGradientClass = () => {
    if (selectedColors.length === 0) {
      return "bg-gradient-to-r from-sky-800 to-slate-600";
    }
    const firstColor = rainbowColors.find((c) => c.value === selectedColors[0]);
    const lastColor = rainbowColors.find((c) => c.value === selectedColors[selectedColors.length - 1]);
    if (firstColor && lastColor) {
      return `bg-gradient-to-r ${firstColor.from} ${lastColor.to}`;
    }
    return "bg-gradient-to-r from-sky-800 to-slate-600";
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    try {
      await axios.put("/api/settings/banner", {
        ...data,
        bannerImage: bannerImage,
        bannerColors: selectedColors,
        bannerVisible: bannerVisible,
      });
      toast.success("Banner updated successfully!");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update banner");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[800px] m-auto">
      <div className="mb-6 mt-6">
        <Heading title="Manage Home Banner" center />
        <p className="text-center text-slate-500 mt-2">
          Customize the promotional banner on the homepage
        </p>
      </div>

      {/* Preview */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-600 mb-3">Preview</h3>
        <div className={`relative ${getGradientClass()} rounded-md overflow-hidden pb-4`}>
          <div className="flex flex-row sm:gap-2 items-center justify-evenly">
            <div className="text-center pt-7 sm:pt-9 pb-4">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                {watchedTitle || "Summer Sale!"}
              </h1>
              <p className="text-lg md:text-xl text-white mb-2">
                {watchedSubtitle || "Enjoy discounts on selected items"}
              </p>
              <p className="text-2xl md:text-5xl bg-gradient-to-r text-transparent bg-clip-text from-yellow-500 to-amber-200 font-bold">
                {watchedDiscount || "GET 20% OFF"}
              </p>
            </div>
            {bannerImage && (
              <div className="w-1/3 2xl:w-1/4 top-2 hidden sm:block relative aspect-video">
                <Image
                  src={bannerImage}
                  alt="Banner preview"
                  quality={95}
                  fill
                  className="object-contain absolute"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg p-6 border border-slate-300">
          <h3 className="text-lg font-semibold mb-4">Banner Content</h3>
          
          <div className="space-y-4">
            <Input
              id="bannerTitle"
              label="Banner Title"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />

            <Input
              id="bannerSubtitle"
              label="Banner Subtitle"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />

            <Input
              id="bannerDiscount"
              label="Discount Text"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />

            <div>
              <label className="text-sm font-semibold text-slate-600 mb-2 block">
                Background Colors
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Select colors for the banner gradient (first to last selected)
              </p>
              <div className="grid grid-cols-7 gap-2">
                {rainbowColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => toggleColor(color.value)}
                    disabled={isLoading}
                    className={`relative h-16 rounded-lg transition-all ${
                      selectedColors.includes(color.value)
                        ? "ring-4 ring-offset-2 ring-slate-900 scale-105"
                        : "hover:scale-105"
                    } bg-gradient-to-br ${color.from} ${color.to}`}
                  >
                    {selectedColors.includes(color.value) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {selectedColors.length > 0 ? (
                  <span>
                    Selected: {selectedColors.map((c) => rainbowColors.find((rc) => rc.value === c)?.name).join(" → ")}
                  </span>
                ) : (
                  <span>No colors selected (default gradient will be used)</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 mb-2 block">
                Banner Image (Optional)
              </label>
              <div
                {...getRootProps()}
                className="border-2 border-slate-300 border-dashed rounded-lg p-6 cursor-pointer hover:border-slate-400 transition"
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p className="text-center text-slate-500">Drop the image here...</p>
                ) : (
                  <p className="text-center text-slate-500">
                    {bannerImage ? "Click or drag to replace image" : "Click or drag to add banner image"}
                  </p>
                )}
              </div>
              {bannerImage && (
                <button
                  type="button"
                  onClick={() => setBannerImage(null)}
                  className="mt-2 text-sm text-red-500 hover:text-red-700"
                >
                  Remove Image
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <label htmlFor="bannerVisible" className="font-medium text-slate-700">Show Banner on Homepage</label>
              <input
                id="bannerVisible"
                type="checkbox"
                checked={bannerVisible}
                onChange={e => setBannerVisible(e.target.checked)}
                className="w-5 h-5 accent-blue-600"
              />
            </div>
          </div>
        </div>

        <Button
          label={isLoading ? "Updating..." : "Update Banner"}
          disabled={isLoading}
          type="submit"
        />
      </form>
    </div>
  );
};

export default ManageBannerClient;
