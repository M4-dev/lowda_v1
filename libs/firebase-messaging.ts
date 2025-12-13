"use client";

import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import firebaseApp from "./firebase";

let messaging: Messaging | null = null;

// Initialize messaging only on client side
if (typeof window !== "undefined") {
  messaging = getMessaging(firebaseApp);
}

export const requestNotificationPermission = async () => {
  try {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return null;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === "granted" && messaging) {
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      
      return token;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log("Message received in foreground:", payload);
        resolve(payload);
      });
    }
  });

export { messaging };
