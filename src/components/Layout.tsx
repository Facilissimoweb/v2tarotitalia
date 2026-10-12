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
    <div className="flex min-h-dvh flex-col bg-ivory text-ink">
      <ScrollToTop />
      <LanguageSeo />
      <Header />
      <main className="flex-1 pt-20 xl:pt-[7rem]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
