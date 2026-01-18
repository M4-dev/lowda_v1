"use client";

import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const AdminNotifications = () => {
  const [count, setCount] = useState<number>(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [sending, setSending] = useState(false);

  const fetchUnread = async () => {
    try {
      const res = await fetch("/api/notifications/unread");
      if (!res.ok) return;
      const json = await res.json();
      setCount(Array.isArray(json) ? json.length : 0);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchUnread();

    // Connect to SSE stream
    const connectSSE = () => {
      const eventSource = new EventSource("/api/admin/notifications/stream");
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("SSE connection established");
      };

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === "connected") {
            console.log("Connected to notification stream");
          } else if (message.type === "notification") {
            // New notification received - just refresh count, don't show toast for admin
            // Refresh unread count
            fetchUnread();
          }
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE error:", error);
        eventSource.close();
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (eventSourceRef.current === eventSource) {
            connectSSE();
          }
        }, 5000);
      };
    };

    connectSSE();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button
        className="relative focus:outline-none"
        onClick={() => setShowModal(true)}
        title="Send Notification"
      >
        <Bell size={22} />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4">Send Notification</h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2 mb-4"
              placeholder="Notification Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={sending}
            />
            <textarea
              className="w-full border border-gray-300 rounded p-2 mb-4 min-h-[80px]"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
            />
            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded disabled:opacity-50"
              onClick={async () => {
                if (!title.trim() || !message.trim()) return;
                setSending(true);
                try {
                  const res = await fetch("/api/admin/notifications/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, message }),
                  });
                  if (res.ok) {
                    toast.success("Notification sent!");
                    setMessage("");
                    setShowModal(false);
                  } else {
                    toast.error("Failed to send notification");
                  }
                } catch {
                  toast.error("Failed to send notification");
                } finally {
                  setSending(false);
                }
              }}
              disabled={sending || !title.trim() || !message.trim()}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
