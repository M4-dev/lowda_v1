import "./globals.css";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import NavBar from "./components/nav/nav-bar";
import Footer from "./components/footer/footer";
import CartProvider from "@/provider/cart-provider";
import { CartLoadingProvider } from "@/context/cart-loading-context";
import { CategoryProvider } from "@/context/category-context";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import { appConfig } from "@/config/appConfig";
// import getCurrentUser from "@/actions/get-current-user";
// import CustomerNotifications from "./components/customer/customer-notifications";
// import TopLoader from "./components/top-loader";
// import getSettings from "@/actions/get-settings";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: appConfig.appName,
  description: appConfig.appDescription,
};

import getSettings from "@/actions/get-settings";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <html lang="en">
      <body
        className={`${outfit.className} flex flex-col min-h-screen text-zinc-800 bg-white overflow-x-hidden`}
      >
        <Toaster
          containerStyle={{ top: "88px" }}
          toastOptions={{
            position: "top-right",
            duration: 3000,
            style: {
              background: "rgb(51, 65, 85)",
              color: "#fff",
              fontSize: "16px",
              fontFamily: outfit.style.fontFamily,
            },
          }}
        />
        <CategoryProvider>
          <CartLoadingProvider>
            <CartProvider>
              {/* <TopLoader /> */}
              {/* {currentUser && currentUser.role !== "ADMIN" && (
                <CustomerNotifications userId={currentUser.id} />
              )} */}
              <NavBar nextDeliveryTime={settings?.nextDeliveryEnabled !== false && settings?.nextDeliveryTime ? settings.nextDeliveryTime.toISOString() : null} />
              <main className="flex-grow">{children}</main>
              <Footer whatsappNumber={settings?.whatsappNumber || null} />
            </CartProvider>
          </CartLoadingProvider>
        </CategoryProvider>
        <Analytics />
      </body>
    </html>
  );
}
