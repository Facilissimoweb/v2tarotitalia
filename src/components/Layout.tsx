import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LanguageSeo } from "./LanguageSeo";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-ivory text-ink">
      <ScrollToTop />
      <LanguageSeo />
      <Header />
      <main className="min-w-0 flex-1 overflow-x-hidden pt-[calc(80px+env(safe-area-inset-top,0px))] xl:pt-[calc(112px+env(safe-area-inset-top,0px))]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
