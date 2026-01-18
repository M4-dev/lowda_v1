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

interface ManageHostelsClientProps {
  hostels: string[];
}

const ManageHostelsClient: React.FC<ManageHostelsClientProps> = ({
  hostels,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hostelList, setHostelList] = useState<string[]>(hostels);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      hostelName: "",
    },
  });

  const onSubmit = async (data: FieldValues) => {
    const hostelName = data.hostelName.trim();
    
    if (!hostelName) {
      toast.error("Please enter a location name");
      return;
    }

    if (hostelList.includes(hostelName)) {
      toast.error("This location already exists");
      return;
    }

    setIsLoading(true);

    const updatedHostels = [...hostelList, hostelName];

    try {
      await axios.put("/api/settings", {
        hostels: updatedHostels,
      });

      toast.success("Location added successfully");
      setHostelList(updatedHostels);
      reset();
      router.refresh();
    } catch (error) {
      toast.error("Failed to add location");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (hostelName: string) => {
    if (!confirm(`Are you sure you want to delete "${hostelName}"?`)) {
      return;
    }

    setIsLoading(true);

    const updatedHostels = hostelList.filter((h) => h !== hostelName);

    try {
      await axios.put("/api/settings", {
        hostels: updatedHostels,
      });

      toast.success("Location deleted successfully");
      setHostelList(updatedHostels);
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete hostel");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[800px] m-auto">
      <div className="mb-8 mt-8">
        <Heading title="Manage Locations" center />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Location</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4">
          <div className="flex-1">
            <Input
              id="hostelName"
              label="Location Name"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />
          </div>
          <div className="flex items-end">
            <Button
              label={isLoading ? "Adding..." : "Add Location"}
              icon={Plus}
              disabled={isLoading}
              type="submit"
            />
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          Current Locations ({hostelList.length})
        </h3>
        {hostelList.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            No locations added yet
          </p>
        ) : (
          <div className="space-y-2">
            {hostelList.map((hostel, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded hover:bg-slate-50"
              >
                <span className="font-medium">{hostel}</span>
                <button
                  onClick={() => handleDelete(hostel)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 disabled:opacity-50"
                  title="Delete location"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageHostelsClient;
