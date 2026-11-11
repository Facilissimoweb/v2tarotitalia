import { Link } from "react-router-dom";
import { siteContent } from "../data/siteContent";

const { brand, nav } = siteContent;

type Props = {
  /** Allineato alla chip menu: scompare/ricompare allo scroll. */
  away?: boolean;
};

/**
 * Placca wordmark mobile (anche Home): barra spezzata dopo «Tarot Italia».
 * Il menu resta la chip fluttuante verticale a destra.
 */
export function MobileAppBar({ away = false }: Props) {
  return (
    <div
      className={`mobile-app-bar xl:hidden${away ? " is-away" : ""}`}
      data-mobile-app-bar
    >
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
