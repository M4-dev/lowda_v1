"use client";

import Link from "next/link";
import Container from "../container";
import React, { useState, useEffect, useRef } from "react";
import { Monoton } from "next/font/google";
import CartCount from "./cart-count";
import UserMenu from "./user-menu";
import Categories from "./categories";
import SearchBar from "./search-bar";
import { Search } from "lucide-react";
import { SafeUser } from "@/types";
import { ChevronLeft, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Spinner from "../spinner";
import DeliveryCountdown from "../delivery-countdown";
import NotificationButton from "../notification-button";
import { appConfig } from "@/config/appConfig";

const exo = Monoton({ subsets: ["latin"], weight: ["400"] });

interface NavBarPros {
  currentUser?: SafeUser | null;
  nextDeliveryTime?: string | null;
}

const ClientNavBar: React.FC<NavBarPros> = ({ currentUser = null, nextDeliveryTime = null }) => {
  const [searchBar, setSearchBar] = useState<boolean>(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const logoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const path = usePathname();
  const prevPathRef = useRef<string | null>(null);

  // Hide spinner when path changes (navigation complete)
  useEffect(() => {
    if (logoLoading && prevPathRef.current !== path) {
      setLogoLoading(false);
      if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current);
    }
    prevPathRef.current = path;
  }, [path, logoLoading]);
  const router = useRouter();

  const resetSearch = () => {
    router.push("/");
  };

  // Show spinner if home logo is clicked and navigation is slow
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (path === "/") return;
    if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current);
    logoTimeoutRef.current = setTimeout(() => setLogoLoading(true), 300); // Show spinner if not loaded in 300ms
    // Fallback: hide spinner after 5s
    setTimeout(() => setLogoLoading(false), 5000);
  };

  return (
    <div className="sticky top-0 w-full z-30 shadow-xl" style={{ background: appConfig.headerFooterBgColor }}>
      <div className="py-4 border-b-[1px] border-slate-500">
        <Container>
          <div className="flex items-center justify-between sm:px-2 xl:px-0">
            <Link
              href="/"
              className="relative flex items-center text-white font-semibold text-[1.1rem] sm:text-[1.8rem] hover:scale-105 active:scale-100 transition"
              onClick={handleLogoClick}
            >
              {path && path.includes("/product") && (
                <ChevronLeft className="text-[1rem] sm:text-[1.25rem] mb-1 sm:mb-[1.75px]" />
              )}
              <span style={{ color: appConfig.themeColor }}>{appConfig.appName}</span>
              {logoLoading && (
                <span className="ml-2">
                  <Spinner size={22} />
                </span>
              )}
            </Link>

            <div className="flex items-center gap-4 md:gap-8 xl:gap-12">
              {nextDeliveryTime && <DeliveryCountdown deliveryTime={nextDeliveryTime} />}
              {currentUser && (
                <NotificationButton userId={currentUser.id} />
              )}
              <div className="flex items-center gap-4">
                <div
                  className={`hidden md:block opacity-0 transition 
                    ${searchBar ? "opacity-100" : "opacity-0"}
                  `}
                >
                  <SearchBar searchBar={searchBar} />
                </div>
                {searchBar ? (
                  <X
                    className="text-[1.9rem] text-gray-200 pb-[0.1rem] cursor-pointer hidden md:block hover:scale-110 active:scale-[0.9] transition"
                    onClick={() => {
                      setSearchBar(false);
                      resetSearch();
                    }}
                  />
                ) : (
                  <Search
                    className="text-[1.9rem] text-white pb-[0.1rem] cursor-pointer hidden md:block hover:scale-110 active:scale-[0.9] transition"
                    onClick={() => setSearchBar(true)}
                  />
                )}
              </div>
              <CartCount />
              <UserMenu currentUser={currentUser} />
            </div>
          </div>
        </Container>
      </div>
      <Categories />
    </div>
  );
};

export default ClientNavBar;