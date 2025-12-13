import "./globals.css";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import NavBar from "./components/nav/nav-bar";
import Footer from "./components/footer/footer";
import CartProvider from "@/provider/cart-provider";
import { Toaster } from "react-hot-toast";
// import getCurrentUser from "@/actions/get-current-user";
// import CustomerNotifications from "./components/customer/customer-notifications";
// import TopLoader from "./components/top-loader";
// import getSettings from "@/actions/get-settings";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "easyByFar",
  description: "easyByFar - The Easiest Shop On Campus",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Move user/settings fetching into pages or context providers as needed
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
        <CartProvider>
          {/* <TopLoader /> */}
          {/* {currentUser && currentUser.role !== "ADMIN" && (
            <CustomerNotifications userId={currentUser.id} />
          )} */}
          <NavBar /* currentUser={currentUser} nextDeliveryTime={settings?.nextDeliveryTime?.toISOString() || null} */ />
          <main className="flex-grow">{children}</main>
          <Footer /* whatsappNumber={(settings as any)?.whatsappNumber} */ />
        </CartProvider>
      </body>
    </html>
  );
}
