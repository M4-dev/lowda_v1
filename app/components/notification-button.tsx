"use client";

import { appConfig } from "@/config/appConfig";
import { useEffect, useState } from "react";
import { requestNotificationPermission, onMessageListener } from "@/libs/firebase-messaging";
import toast from "react-hot-toast";
import { Bell, BellOff } from "lucide-react";

interface NotificationButtonProps {
  userId?: string;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({ userId }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }

    // Listen for foreground messages
    onMessageListener()
      .then((payload: any) => {
        toast.success(
          payload.notification?.title + "\n" + payload.notification?.body,
          { duration: 5000 }
        );
      })
      .catch((err) => console.log("Failed to listen for messages:", err));
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const token = await requestNotificationPermission();
      
      if (token && userId) {
        // Save token to database
        const response = await fetch("/api/notifications/register-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, userId }),
        });

        if (response.ok) {
          setPermission("granted");
          toast.success("Notifications enabled! You'll receive updates on your device.");
        } else {
          toast.error("Failed to register for notifications");
        }
      } else if (!token) {
        toast.error("Please allow notifications in your browser settings");
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      toast.error("Failed to enable notifications");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }


  const handleDisableNotifications = async () => {
    setIsLoading(true);
    try {
      // Remove token from database
      const response = await fetch("/api/notifications/register-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: null, userId }),
      });
      if (response.ok) {
        setPermission("default");
        toast.success("Notifications disabled. You will not receive push notifications.");
      } else {
        toast.error("Failed to disable notifications");
      }
    } catch (error) {
      console.error("Error disabling notifications:", error);
      toast.error("Failed to disable notifications");
    } finally {
      setIsLoading(false);
    }
  };


  if (permission === "granted") {
    return (
      <div
        className="flex items-center gap-2 text-sm relative group"
        style={{ color: appConfig.headerFooterFontColor }}
      >
        <button
          onClick={handleDisableNotifications}
          disabled={isLoading}
          className="flex items-center"
          aria-label="Disable notifications"
        >
          <Bell size={18} />
        </button>
        {/* Tooltip on hover */}
        <span
          className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg"
          style={{ minWidth: '120px' }}
        >
          Notifications enabled
        </span>
        <button
          onClick={handleDisableNotifications}
          disabled={isLoading}
          className="ml-2 px-2 py-0.5 bg-gray-200 hover:bg-gray-300 text-xs rounded text-black"
        >
          {isLoading ? "Disabling..." : "Disable"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleEnableNotifications}
      disabled={isLoading || permission === "denied"}
      className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-black text-sm rounded-lg transition"
    >
      {permission === "denied" ? (
        <>
          <BellOff size={18} />
          <span className="hidden sm:inline">Blocked</span>
        </>
      ) : (
        <>
          <Bell size={18} />
          <span className="hidden sm:inline">
            {isLoading ? "Enabling..." : "Enable Notifications"}
          </span>
        </>
      )}
    </button>
  );
};

export default NotificationButton;
