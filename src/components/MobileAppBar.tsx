import { Link, useLocation } from "react-router-dom";
import { siteContent } from "../data/siteContent";

const { brand, nav } = siteContent;

/**
 * Shell app mobile (escl. Home): barra fissa con wordmark.
 * La chip menu resta sul bordo destro e si allinea a questa barra.
 */
export function MobileAppBar() {
  const { pathname } = useLocation();
  if (pathname === "/") return null;

  return (
    <div className="mobile-app-bar xl:hidden" data-mobile-app-bar>
      <Link
        to="/"
        className="mobile-app-bar-wordmark"
        translate="no"
        aria-label={nav.home}
      >
        {brand.wordmark}
      </Link>
    </div>
  );
}
