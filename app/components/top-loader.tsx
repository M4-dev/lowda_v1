"use client";


import { Suspense } from "react";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

NProgress.configure({ showSpinner: false, trickleSpeed: 100 });

function TopLoaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor && anchor.href && !anchor.target) {
        const currentUrl = window.location.href;
        const targetUrl = anchor.href;
        if (targetUrl !== currentUrl && !targetUrl.includes("#")) {
          NProgress.start();
        }
      }
    };
    const handleFormSubmit = () => {
      NProgress.start();
    };
    document.addEventListener("click", handleAnchorClick);
    document.addEventListener("submit", handleFormSubmit);
    return () => {
      document.removeEventListener("click", handleAnchorClick);
      document.removeEventListener("submit", handleFormSubmit);
    };
  }, []);
  return null;
}

export default function TopLoader() {
  return (
    <Suspense fallback={null}>
      <TopLoaderContent />
    </Suspense>
  );
}
