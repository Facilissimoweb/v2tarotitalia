import { useEffect, useId, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import {
  MAIN_NAV,
  NAV_LEADING,
  NAV_TRAILING,
  isNavBranch,
  isTarocchiPath,
  type NavBranch,
  type NavItem,
} from "../data/navigation";
import { useAuth } from "../context/AuthContext";
import { LanguageWidget } from "./LanguageWidget";
import { BrandLogo } from "./BrandLogo";
import { WidgetBrandMark } from "./WidgetFrame";

const { brand, nav } = siteContent;

const linkClass = (active: boolean) =>
  `whitespace-nowrap text-[11px] uppercase tracking-[0.16em] transition-colors ${
    active ? "text-ink" : "text-ink/40 hover:text-ink"
  }`;

export function Header() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/5 bg-ivory/95 backdrop-blur-xl">
        <nav
          className="mx-auto hidden h-[8.5rem] max-w-[90rem] grid-cols-[1fr_auto_1fr] items-center gap-x-8 px-8 xl:grid"
          aria-label="Principale"
        >
          <div className="flex items-center justify-end gap-6 2xl:gap-8">
            {NAV_LEADING.map((item) => (
              <NavEntry key={isNavBranch(item) ? item.label : item.to} item={item} />
            ))}
          </div>

          <NavLink to="/" className="flex flex-col items-center px-8" aria-label={brand.wordmark} translate="no">
            <BrandLogo className="h-16 w-16" />
            <span className="mt-2 font-display text-[13px] leading-none tracking-[0.42em] text-ink">
              {brand.wordmark.toUpperCase()}
            </span>
            <span className="mt-1.5 text-[9px] uppercase leading-none tracking-[0.28em] text-sage">
              {brand.name}
            </span>
          </NavLink>

          <div className="flex items-center justify-start gap-6 2xl:gap-8">
            <div className="flex items-center gap-6 2xl:gap-8">
              {NAV_TRAILING.map((item) => (
                <NavEntry key={isNavBranch(item) ? item.label : item.to} item={item} />
              ))}
            </div>
            <div className="flex items-center">
              <LanguageWidget placement="nav" />
              <AccountLink />
              <CartLink />
            </div>
          </div>
        </nav>

        <div className="grid h-20 grid-cols-3 items-center px-3 xl:hidden">
          <div className="flex items-center justify-start">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center text-ink"
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? nav.chiudi : nav.menu}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
            <LanguageWidget placement="nav" />
          </div>
          <NavLink to="/" className="justify-self-center" aria-label={brand.wordmark}>
            <BrandLogo className="h-12 w-12" />
          </NavLink>
          <div className="flex items-center justify-end">
            <AccountLink />
            <CartLink />
          </div>
        </div>
      </header>

      {open ? <MobileDrawer onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function NavEntry({ item }: { item: NavItem }) {
  if (isNavBranch(item)) return <TarocchiMenu item={item} />;
  return (
    <NavLink to={item.to} end={item.end} className={({ isActive }) => linkClass(isActive)}>
      {item.label}
    </NavLink>
  );
}

function TarocchiMenu({ item }: { item: NavBranch }) {
  const { pathname } = useLocation();
  const wrap = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [pinned, setPinned] = useState(false);
  const active = isTarocchiPath(pathname);

  useEffect(() => {
    setPinned(false);
  }, [pathname]);

  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setPinned(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPinned(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={wrap} className="group relative">
      <button
        type="button"
        className={`${linkClass(active)} inline-flex items-center gap-2`}
        aria-expanded={pinned}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setPinned((v) => !v)}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {item.label}
        <span aria-hidden className="text-sage">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M1.5 2.5 L4 5.5 L6.5 2.5" />
          </svg>
        </span>
      </button>
      <div
        id={menuId}
        role="menu"
        className={`absolute right-0 top-full z-50 w-64 pt-3 ${
          pinned
            ? "visible pointer-events-auto"
            : "invisible pointer-events-none group-hover:visible group-hover:pointer-events-auto group-focus-within:visible group-focus-within:pointer-events-auto"
        }`}
      >
        <div className="border border-ink/10 bg-ivory px-7 py-8 shadow-[0_18px_40px_rgba(43,37,35,0.06)]">
          <WidgetBrandMark size="sm" />
          <p className="mt-5 mb-6 text-[9px] uppercase tracking-[0.2em] text-sage">{item.label}</p>
          <ul className="flex flex-col gap-5">
            {item.children.map((child) => (
              <li key={child.to} role="none">
                <NavLink
                  role="menuitem"
                  to={child.to}
                  className={({ isActive }) =>
                    `block font-display text-base leading-snug ${
                      isActive ? "text-ink" : "text-ink/55 hover:text-ink"
                    }`
                  }
                >
                  {child.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MobileDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div
      id="menu-mobile"
      className="fixed inset-0 z-[60] flex flex-col bg-ivory xl:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={nav.menu}
    >
      <div className="relative border-b border-ink/10 px-5 pb-6 pt-8">
        <div className="absolute right-5 top-5 flex items-center gap-1">
          <AccountLink />
          <CartLink />
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center text-ink ring-1 ring-ink/15"
            aria-label={nav.chiudi}
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
        <WidgetBrandMark />
        <p className="mt-5 text-center font-display text-xl font-light text-ink">{nav.menu}</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-6 py-8" aria-label="Principale">
        <div className="flex flex-col gap-3.5">
          {MAIN_NAV.map((item) =>
            isNavBranch(item) ? (
              <div key={item.label}>
                <p className="text-lg leading-snug text-ink">{item.label}</p>
                <ul className="mt-2 flex flex-col gap-1.5 pl-5">
                  {item.children.map((child) => (
                    <li key={child.to}>
                      <NavLink
                        to={child.to}
                        className={({ isActive }) =>
                          `block text-base leading-snug ${isActive ? "text-ink" : "text-ink/50"}`
                        }
                      >
                        {child.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `text-lg leading-snug ${isActive ? "text-ink" : "text-ink/55"}`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
          <div className="mt-6">
            <LanguageWidget placement="footer" />
          </div>
        </div>
      </nav>
    </div>
  );
}

function AccountLink() {
  const { session } = useAuth();
  return (
    <NavLink
      to={session ? "/riservata" : "/login"}
      className="flex h-10 w-10 items-center justify-center text-ink/70 transition-colors hover:text-ink"
      aria-label={session ? nav.riservata : nav.accedi}
    >
      <ProfileIcon />
    </NavLink>
  );
}

function CartLink() {
  return (
    <NavLink
      to="/carrello"
      className="flex h-10 w-10 items-center justify-center text-ink/70 transition-colors hover:text-ink"
      aria-label={nav.carrello}
    >
      <BagIcon />
    </NavLink>
  );
}

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="8.25" />
      <circle cx="12" cy="10" r="2.4" />
      <path d="M7.2 17.6 C8 15.4 9.7 14.3 12 14.3 C14.3 14.3 16 15.4 16.8 17.6" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M6 8 H18 L19.2 20 H4.8 Z" />
      <path d="M9 8 V7.2 C9 5.1 10.4 3.8 12 3.8 C13.6 3.8 15 5.1 15 7.2 V8" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 7 H20 M4 12 H20 M4 17 H20" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 6 L18 18 M18 6 L6 18" />
    </svg>
  );
}
