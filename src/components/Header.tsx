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
import { cartItemCount } from "../lib/storage";
import { LanguageWidget } from "./LanguageWidget";
import { AccessibilityTrigger } from "./AccessibilityWidget";
import { BrandLogo } from "./BrandLogo";
import { WidgetCloseButton } from "./WidgetCloseButton";
import { WidgetBrandMark } from "./WidgetFrame";

const { brand, nav } = siteContent;
const [marcaTarot, marcaItalia] = brand.wordmark.split(/\s+/);

/** Tipografia menu hamburger (mobile / tablet): nero pieno, peso e tracking editoriali. */
const NAV_ITEM =
  "font-body text-[0.9375rem] font-bold uppercase not-italic leading-none tracking-[0.2em] text-black";
const NAV_CHILD =
  "font-body text-[0.8125rem] font-bold uppercase not-italic leading-none tracking-[0.18em] text-black";
const NAV_ACTIVE = "bg-[#d7f713] text-black";

/** Visualizzazione estesa: solo grandi schermi, come da navbar definitiva. */
const desktopLinkClass = (active: boolean) =>
  `whitespace-nowrap text-[0.6875rem] font-bold uppercase tracking-[0.16em] transition-colors ${
    active ? "text-[#111111]" : "text-[#111111] hover:text-[#111111]/70"
  }`;

/** Icone della barra: nero su vetro bianco. */
const NAV_ICON_CORE =
  "flex h-12 shrink-0 items-center justify-center text-[#111111] transition-colors hover:text-[#111111]/70 [&_svg]:h-[1.625rem] [&_svg]:w-[1.625rem] [&_svg]:stroke-[2.25]";
const NAV_ICON_BTN = `${NAV_ICON_CORE} w-12`;
const NAV_ICON_LEFT = `${NAV_ICON_CORE} w-9`;

export function Header() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => {
      if (mq.matches) setOpen(false);
    };
    closeOnDesktop();
    mq.addEventListener("change", closeOnDesktop);
    return () => mq.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[51] h-[env(safe-area-inset-top,0px)] bg-white/90 backdrop-blur-[56px]"
        aria-hidden
      />
      <header className="site-chrome nav-bronze fixed inset-x-0 top-0 z-50 border-b">
        <nav
          className="mx-auto hidden h-[108px] w-full grid-cols-[1fr_auto_1fr] items-center gap-x-6 px-6 2xl:gap-x-8 2xl:px-16 xl:grid"
          aria-label="Principale"
        >
          <div className="flex items-center justify-evenly gap-6">
            {NAV_LEADING.map((item) => (
              <DesktopNavEntry key={isNavBranch(item) ? item.label : item.to} item={item} />
            ))}
          </div>

          <NavLink
            to="/"
            className="flex flex-col items-center px-8"
            aria-label={brand.wordmark}
            translate="no"
          >
            <span className="nav-logo-glow">
              <BrandLogo tone="nav" finish="metal" className="relative z-[1] h-[52px] w-[52px]" />
            </span>
            <span className="mt-1 font-h1 text-[1.2rem] leading-none text-[#111111] xl:text-[1.3rem]">
              {brand.wordmark}
            </span>
          </NavLink>

          <div className="flex min-w-0 items-center justify-between gap-4 2xl:gap-6">
            <div className="flex flex-1 items-center justify-evenly gap-5 2xl:gap-6">
              {NAV_TRAILING.map((item) => (
                <DesktopNavEntry key={isNavBranch(item) ? item.label : item.to} item={item} />
              ))}
            </div>
            <div className="flex shrink-0 items-center">
              <LanguageWidget placement="nav" />
              <AccessibilityTrigger className={NAV_ICON_BTN} />
              <AccountLink className={NAV_ICON_BTN} />
              <CartLink className={NAV_ICON_BTN} />
            </div>
          </div>
        </nav>

        <div className="relative flex h-[80px] w-full items-center justify-between px-3 xl:hidden">
          <div className="relative z-10 flex items-center">
            <LanguageWidget placement="nav" className="w-9" />
            <CartLink className={NAV_ICON_LEFT} />
            <AccessibilityTrigger className={NAV_ICON_LEFT} />
          </div>
          <NavLink
            to="/"
            className="absolute left-1/2 top-1/2 z-[1] flex -translate-x-1/2 -translate-y-1/2 items-center gap-3"
            aria-label={brand.wordmark}
            translate="no"
          >
            <span className="hidden font-h1 text-[1.05rem] font-extrabold uppercase leading-none tracking-[-0.04em] text-[#111111] md:inline lg:text-[1.15rem]">
              {marcaTarot}
            </span>
            <span className="nav-logo-glow">
              <BrandLogo tone="nav" finish="metal" className="relative z-[1] h-[68px] w-[68px]" />
            </span>
            <span className="hidden font-h1 text-[1.05rem] font-extrabold uppercase leading-none tracking-[-0.04em] text-[#111111] md:inline lg:text-[1.15rem]">
              {marcaItalia}
            </span>
          </NavLink>
          <div className="relative z-10 flex items-center">
            <AccountLink className={NAV_ICON_BTN} />
            <button
              type="button"
              className={NAV_ICON_BTN}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? nav.chiudi : nav.menu}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {open ? <MobileDrawer onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function DesktopNavEntry({ item }: { item: NavItem }) {
  if (isNavBranch(item)) return <TarocchiMenu item={item} />;
  return (
    <NavLink to={item.to} end={item.end} className={({ isActive }) => desktopLinkClass(isActive)}>
      {item.label}
    </NavLink>
  );
}

function TarocchiMenu({ item }: { item: NavBranch }) {
  const { pathname } = useLocation();
  const wrap = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);
  const active = isTarocchiPath(pathname);
  const expanded = pinned || hover;

  useEffect(() => {
    setPinned(false);
    setHover(false);
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
    <div
      ref={wrap}
      className="relative flex h-full items-center"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        className={`${desktopLinkClass(active)} inline-flex items-center gap-1.5`}
        aria-expanded={expanded}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setPinned((v) => !v)}
      >
        {item.label}
        <span aria-hidden className="text-[#111111]">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M1.5 2.5 L4 5.5 L6.5 2.5" />
          </svg>
        </span>
      </button>
      <div
        id={menuId}
        role="menu"
        className={`absolute right-0 top-full z-50 min-w-[13.5rem] pt-2 ${
          expanded ? "visible pointer-events-auto" : "invisible pointer-events-none"
        }`}
      >
        <ul className="flex flex-col gap-4 border border-ink/10 bg-ivory px-6 py-5 shadow-[0_18px_40px_rgba(43,37,35,0.06)]">
          {item.children.map((child) => (
            <li key={child.to} role="none">
              <NavLink
                role="menuitem"
                to={child.to}
                className={({ isActive }) =>
                  `block whitespace-nowrap text-[0.6875rem] uppercase tracking-[0.16em] ${
                    isActive ? "text-ink" : "text-ink/45 hover:text-ink"
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
      <div className="relative px-8 pb-8 pt-10">
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <AccessibilityTrigger />
          <AccountLink />
          <CartLink />
          <WidgetCloseButton placement="inline" onClick={onClose} />
        </div>
        <WidgetBrandMark size="sm" />
      </div>

      <nav className="flex-1 overflow-y-auto pb-6" aria-label="Principale">
        <div className="flex flex-col text-center">
          {MAIN_NAV.map((item) =>
            isNavBranch(item) ? (
              <div key={item.label} className="border-t border-ink/10">
                <p className={`px-8 py-7 ${NAV_ITEM}`}>
                  {item.label}
                </p>
                <ul className="pb-3">
                  {item.children.map((child) => (
                    <li key={child.to}>
                      <NavLink
                        to={child.to}
                        className={({ isActive }) =>
                          `block px-8 py-5 ${NAV_CHILD} ${isActive ? NAV_ACTIVE : ""}`
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
                  `block border-t border-ink/10 px-8 py-7 ${NAV_ITEM} ${
                    isActive ? NAV_ACTIVE : ""
                  }`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </div>
      </nav>

      <div className="shrink-0 bg-ivory border-t border-ink/10 px-8 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <LanguageWidget placement="drawer" />
      </div>
    </div>
  );
}

function AccountLink({ className = "flex h-[40px] w-[40px] items-center justify-center text-ink/70 transition-colors hover:text-ink" }: { className?: string }) {
  const { session } = useAuth();
  return (
    <NavLink
      to={session ? "/riservata" : "/login"}
      state={session ? undefined : { from: "/riservata" }}
      className={className}
      aria-label={session ? nav.riservata : nav.accedi}
    >
      <ProfileIcon />
    </NavLink>
  );
}

function CartLink({ className = "relative flex h-[40px] w-[40px] items-center justify-center text-ink/70 transition-colors hover:text-ink" }: { className?: string }) {
  const { purchases } = useAuth();
  const count = cartItemCount(purchases);
  return (
    <NavLink
      to="/carrello"
      className={`relative ${className}`}
      aria-label={nav.carrello}
    >
      <BagIcon />
      {count > 0 ? (
        <span className="absolute right-0.5 top-0.5 min-w-[1rem] bg-ember px-1 text-center text-[0.625rem] leading-4 text-white">
          {count}
        </span>
      ) : null}
    </NavLink>
  );
}

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.25" />
      <circle cx="12" cy="10" r="2.4" />
      <path d="M7.2 17.6 C8 15.4 9.7 14.3 12 14.3 C14.3 14.3 16 15.4 16.8 17.6" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8 H18 L19.2 20 H4.8 Z" />
      <path d="M9 8 V7.2 C9 5.1 10.4 3.8 12 3.8 C13.6 3.8 15 5.1 15 7.2 V8" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
      <path d="M4 7 H20 M4 12 H20 M4 17 H20" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
      <path d="M6 6 L18 18 M18 6 L6 18" />
    </svg>
  );
}
