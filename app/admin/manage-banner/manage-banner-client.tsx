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

const FONT_OPTIONS = [
  { label: "Monoton", value: "monoton" },
  { label: "Lobster", value: "lobster" },
  { label: "Oswald", value: "oswald" },
];

const FONT_CLASS_MAP: Record<string, string> = {
  monoton: "font-monoton",
  lobster: "font-lobster",
  oswald: "font-oswald",
};

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
  const [bannerImage, setBannerImage] = useState<string | null>(
    settings?.bannerImage || null
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    settings?.bannerColors || ["blue", "indigo"]
  );
  const [bannerVisible, setBannerVisible] = useState<boolean>(
    settings?.bannerVisible ?? true
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FieldValues>({
    defaultValues: {
      bannerTitle: settings?.bannerTitle || "Summer Sale!",
      bannerSubtitle:
        settings?.bannerSubtitle || "Enjoy discounts on selected items",
      bannerDiscount: settings?.bannerDiscount || "GET 20% OFF",
      bannerFont: settings?.bannerFont || "oswald",
    },
  });

  const watchedTitle = watch("bannerTitle");
  const watchedSubtitle = watch("bannerSubtitle");
  const watchedDiscount = watch("bannerDiscount");
  const watchedFont = watch("bannerFont");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

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
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    maxFiles: 1,
  });

  const toggleColor = (colorValue: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorValue)
        ? prev.filter((c) => c !== colorValue)
        : [...prev, colorValue]
    );
  };

  const getGradientClass = () => {
    if (!selectedColors.length) {
      return "bg-gradient-to-r from-sky-800 to-slate-600";
    }

    const first = rainbowColors.find(
      (c) => c.value === selectedColors[0]
    );
    const last = rainbowColors.find(
      (c) => c.value === selectedColors[selectedColors.length - 1]
    );

    return first && last
      ? `bg-gradient-to-r ${first.from} ${last.to}`
      : "bg-gradient-to-r from-sky-800 to-slate-600";
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    try {
      await axios.put("/api/settings/banner", {
        ...data,
        bannerImage,
        bannerColors: selectedColors,
        bannerVisible,
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
      {bannerVisible && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-600 mb-3">
            Preview
          </h3>

          <div
            className={`relative ${getGradientClass()} rounded-md overflow-hidden pb-4`}
          >
            <div className="flex items-center justify-evenly gap-4">
              <div className="text-center pt-7 pb-4">
                <h1
                  className={`text-3xl md:text-5xl font-bold text-white mb-2 ${
                    FONT_CLASS_MAP[watchedFont] || ""
                  }`}
                >
                  {watchedTitle}
                </h1>

                <p className="text-lg md:text-xl text-white mb-2">
                  {watchedSubtitle}
                </p>

                <p className="text-2xl md:text-5xl bg-gradient-to-r text-transparent bg-clip-text from-yellow-500 to-amber-200 font-bold">
                  {watchedDiscount}
                </p>
              </div>

              {bannerImage && (
                <div className="w-1/3 hidden sm:block relative aspect-video">
                  <Image
                    src={bannerImage}
                    alt="Banner preview"
                    fill
                    className="object-contain"
                    quality={95}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4">Banner Content</h3>

          <Input
            id="bannerTitle"
            label="Banner Title"
            register={register}
            errors={errors}
            disabled={isLoading}
            required
          />

          <Input
            id="bannerSubtitle"
            label="Banner Subtitle"
            register={register}
            errors={errors}
            disabled={isLoading}
            required
          />

          <Input
            id="bannerDiscount"
            label="Discount Text"
            register={register}
            errors={errors}
            disabled={isLoading}
            required
          />

          <label className="text-sm font-semibold block mt-4">
            Banner Title Font
          </label>
          <select
            {...register("bannerFont")}
            disabled={isLoading}
            className="w-full p-2 border rounded-lg"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>

          <label className="text-sm font-semibold block mt-6">
            Background Colors
          </label>

          <div className="grid grid-cols-7 gap-2 mt-2">
            {rainbowColors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => toggleColor(color.value)}
                className={`h-16 rounded-lg bg-gradient-to-br ${color.from} ${color.to} ${
                  selectedColors.includes(color.value)
                    ? "ring-4 ring-offset-2 ring-slate-900"
                    : ""
                }`}
              />
            ))}
          </div>

          <label className="text-sm font-semibold block mt-6">
            Banner Image (Optional)
          </label>

          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-6 cursor-pointer"
          >
            <input {...getInputProps()} />
            <p className="text-center text-slate-500">
              {isDragActive
                ? "Drop image here"
                : "Click or drag image here"}
            </p>
          </div>

          {bannerImage && (
            <button
              type="button"
              onClick={() => setBannerImage(null)}
              className="text-sm text-red-500 mt-2"
            >
              Remove Image
            </button>
          )}

          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={bannerVisible}
              onChange={(e) => setBannerVisible(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
            <span>Show Banner on Homepage</span>
          </div>
        </div>

        <Button
          type="submit"
          label={isLoading ? "Updating..." : "Update Banner"}
          disabled={isLoading}
        />
      </form>
    </div>
  );
};

export default ManageBannerClient;
