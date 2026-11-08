import { useEffect, useId, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
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
import { cartItemCount, readBookingDraft } from "../lib/storage";
import { loginHref, rememberAuthReturn } from "../lib/authReturn";
import { isCartDigital, isPaidDigital, readDigitalDrafts } from "../lib/digitalOrders";
import { LanguageWidget } from "./LanguageWidget";
import { AccessibilityTrigger } from "./AccessibilityWidget";
import { PageSpeechTrigger } from "./PageSpeech";
import { BrandLogo } from "./BrandLogo";
import { ShopIcon } from "./ShopIcon";
import { WidgetCloseButton } from "./WidgetCloseButton";

const { brand, nav } = siteContent;
const [marcaTarot, marcaItalia] = brand.wordmark.split(/\s+/);

const MENU_EASE = [0.22, 1, 0.36, 1] as const;

const menuPanel: Variants = {
  hidden: {},
  show: {},
  exit: { opacity: 0, transition: { duration: 0.18, ease: MENU_EASE } },
};

const menuList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.1 } },
};

const menuItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: MENU_EASE } },
};

const DRAWER_ICON =
  "flex h-12 w-12 shrink-0 items-center justify-center text-on-ink transition-colors hover:text-ember-pale [&_svg]:h-[1.5rem] [&_svg]:w-[1.5rem] [&_svg]:stroke-[2.25]";

/** Visualizzazione estesa: solo grandi schermi, come da navbar definitiva. */
const desktopLinkClass = (active: boolean) =>
  `relative whitespace-nowrap text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-black transition-colors ${
    active
      ? "after:absolute after:inset-x-0 after:-bottom-1.5 after:h-px after:bg-black"
      : "text-black/70 hover:text-black"
  }`;

/** Icone della barra: nero su vetro opalino. */
const NAV_ICON_CORE =
  "flex h-12 shrink-0 items-center justify-center text-black transition-colors hover:text-black/60 [&_svg]:h-[1.625rem] [&_svg]:w-[1.625rem] [&_svg]:stroke-[2.25]";
const NAV_ICON_BTN = `${NAV_ICON_CORE} w-12`;

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
        className="nav-bronze pointer-events-none fixed inset-x-0 top-0 z-[51] h-[env(safe-area-inset-top,0px)] border-0 shadow-none"
        aria-hidden
      />
      <header className="site-chrome nav-bronze fixed inset-x-0 top-0 z-50 border-b">
        <nav
          className="mx-auto hidden h-[108px] w-full grid-cols-[1fr_auto_1fr] items-center gap-x-6 px-6 2xl:gap-x-8 2xl:px-16 xl:grid"
          aria-label="Principale"
        >
          <div className="flex items-center justify-end gap-x-7 2xl:gap-x-9">
            {NAV_LEADING.map((item) => (
              <DesktopNavEntry key={isNavBranch(item) ? item.label : item.to} item={item} />
            ))}
          </div>

          <NavLink
            to="/"
            className="flex items-center justify-center px-4"
            aria-label={brand.wordmark}
            translate="no"
          >
            <NavWordmark />
          </NavLink>

          <div className="flex min-w-0 items-center justify-between gap-8 2xl:gap-10">
            <div className="flex items-center justify-start gap-x-7 2xl:gap-x-9">
              {NAV_TRAILING.map((item) => (
                <DesktopNavEntry key={isNavBranch(item) ? item.label : item.to} item={item} />
              ))}
            </div>
            <div className="flex shrink-0 items-center">
              <LanguageWidget placement="nav" />
              <PageSpeechTrigger className={NAV_ICON_BTN} />
              <AccessibilityTrigger className={NAV_ICON_BTN} />
              <AccountLink className={NAV_ICON_BTN} />
              <CartLink className={NAV_ICON_BTN} />
            </div>
          </div>
        </nav>

        <div className="relative flex h-16 w-full items-center justify-between gap-2 px-3 sm:px-4 xl:hidden">
          <NavLink
            to="/"
            className="relative z-[1] flex min-w-0 items-center"
            aria-label={brand.wordmark}
            translate="no"
          >
            <NavWordmark compact />
          </NavLink>
          <div className="relative z-10 flex shrink-0 items-center">
            <LanguageWidget
              placement="nav"
              className="h-8 w-8"
              flagClassName="h-2.5 w-[0.9rem]"
            />
            <CartLink className={NAV_ICON_BTN} />
            <NavLink
              to="/"
              className={NAV_ICON_BTN}
              aria-label={nav.home}
              title={nav.home}
            >
              <HomeIcon size={20} />
            </NavLink>
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

      <AnimatePresence>
        {open ? <MobileDrawer onClose={() => setOpen(false)} /> : null}
      </AnimatePresence>
    </>
  );
}

function NavWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`nav-wordmark${compact ? " nav-wordmark--compact" : ""}`}>
      <BrandLogo tone="nav" className="nav-wordmark__logo" />
      <span className="nav-wordmark__type">
        <span className="nav-wordmark__tarot">{marcaTarot}</span>
        <span className="nav-wordmark__italia">{marcaItalia}</span>
      </span>
    </span>
  );
}

function DesktopNavEntry({ item }: { item: NavItem }) {
  if (isNavBranch(item)) return <TarocchiMenu item={item} />;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `${desktopLinkClass(isActive)}${item.icon ? " inline-flex items-center gap-1.5" : ""}`
      }
    >
      {item.icon === "home" ? <HomeIcon size={14} /> : null}
      {item.icon === "shop" ? <ShopIcon size={14} /> : null}
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
        <span aria-hidden className="text-black">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M1.5 2.5 L4 5.5 L6.5 2.5" />
          </svg>
        </span>
      </button>
      <div
        id={menuId}
        role="menu"
        className={`absolute left-1/2 top-full z-50 min-w-[13.5rem] -translate-x-1/2 pt-2 ${
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
  const reduce = useReducedMotion();
  let index = 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      id="menu-mobile"
      role="dialog"
      aria-modal="true"
      aria-label={nav.menu}
      className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-graphite text-on-ink xl:hidden"
      variants={reduce ? undefined : menuPanel}
      initial={reduce ? false : "hidden"}
      animate="show"
      exit="exit"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-ivory" aria-hidden />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 bottom-[-0.22em] select-none font-h1 text-[min(78vw,24rem)] uppercase leading-[0.68] tracking-[-0.08em] text-white/[0.06]"
      >
        T
      </span>

      <div className="relative flex items-start justify-between gap-4 pl-7 pr-4 pt-[max(1rem,env(safe-area-inset-top))] sm:pl-10 sm:pr-6">
        <div data-widget-brand className="pt-2">
          <BrandLogo className="h-12 w-12" />
          <p className="mt-3 font-display text-[0.625rem] uppercase tracking-[0.16em] text-on-ink">
            {brand.wordmark}
          </p>
          <p className="mt-6 font-h1 text-[0.7rem] uppercase tracking-[0.22em] text-ember-pale">
            {nav.menu}
          </p>
        </div>
        <WidgetCloseButton placement="inline" onClick={onClose} />
      </div>

      <nav className="relative flex-1 overflow-y-auto overscroll-contain pb-4" aria-label="Principale">
        <motion.ul
          className="flex flex-col"
          variants={reduce ? undefined : menuList}
          initial={reduce ? false : "hidden"}
          animate="show"
        >
          {MAIN_NAV.map((item) => {
            index += 1;
            const n = String(index).padStart(2, "0");
            if (isNavBranch(item)) {
              return (
                <motion.li key={item.label} variants={reduce ? undefined : menuItem} className="pl-7 pr-6 sm:pl-10">
                  <p className="flex items-baseline gap-4 py-2">
                    <span className="w-8 shrink-0 font-h1 text-[1rem] leading-none tracking-[-0.04em] text-ember-pale">
                      {n}
                    </span>
                    <span className="font-h1 text-[clamp(1.55rem,7.2vw,2.4rem)] uppercase leading-[0.92] tracking-[-0.045em] text-on-ink/50">
                      {item.label}
                    </span>
                  </p>
                  <ul className="mb-2 ml-12 border-l border-ember-pale/35">
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <NavLink
                          to={child.to}
                          className={({ isActive }) =>
                            `block py-2 pl-4 font-h1 text-[clamp(1.05rem,4.2vw,1.35rem)] uppercase leading-none tracking-[-0.03em] ${
                              isActive ? "text-ember-pale" : "text-on-ink hover:text-ember-pale"
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </motion.li>
              );
            }
            return (
              <motion.li key={item.to} variants={reduce ? undefined : menuItem}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-baseline gap-4 py-2.5 pl-7 pr-6 sm:pl-10 ${
                      isActive ? "text-ember-pale" : "text-on-ink hover:text-ember-pale"
                    }`
                  }
                >
                  <span className="w-8 shrink-0 font-h1 text-[1rem] leading-none tracking-[-0.04em] text-ember-pale">
                    {n}
                  </span>
                  <span className="inline-flex items-center gap-3 font-h1 text-[clamp(1.55rem,7.2vw,2.4rem)] uppercase leading-[0.92] tracking-[-0.045em]">
                    {item.icon === "home" ? <HomeIcon size={20} /> : null}
                    {item.icon === "shop" ? <ShopIcon size={20} /> : null}
                    {item.label}
                  </span>
                </NavLink>
              </motion.li>
            );
          })}
        </motion.ul>
      </nav>

      <div className="relative shrink-0 border-t border-white/10 pl-7 pr-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pl-10 sm:pr-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <PageSpeechTrigger className={DRAWER_ICON} />
            <AccessibilityTrigger className={DRAWER_ICON} />
            <AccountLink className={DRAWER_ICON} />
            <CartLink className={DRAWER_ICON} />
          </div>
          <LanguageWidget placement="drawer" className="w-auto justify-end py-2 text-on-ink/70 hover:text-on-ink" />
        </div>
      </div>
    </motion.div>
  );
}

function AccountLink({ className = "flex h-[40px] w-[40px] items-center justify-center text-ink/70 transition-colors hover:text-ink" }: { className?: string }) {
  const { session } = useAuth();
  const checkoutIntent = Boolean(readDigitalDrafts().length || readBookingDraft());
  const guestTo = checkoutIntent ? loginHref("/carrello") : "/login";
  return (
    <NavLink
      to={session ? "/riservata" : guestTo}
      state={session ? undefined : { from: checkoutIntent ? "/carrello" : "/riservata" }}
      onClick={() => {
        if (!session && checkoutIntent) rememberAuthReturn("/carrello");
      }}
      className={className}
      aria-label={session ? nav.riservata : nav.accedi}
    >
      <ProfileIcon />
    </NavLink>
  );
}

function CartLink({ className = "relative flex h-[40px] w-[40px] items-center justify-center text-ink/70 transition-colors hover:text-ink" }: { className?: string }) {
  const { purchases, digitalOrders } = useAuth();
  const pendingDigital = digitalOrders.filter(isCartDigital);
  const digitalDrafts = readDigitalDrafts().filter(
    (item) =>
      !pendingDigital.some((order) => order.productId === item.productId) &&
      !digitalOrders.some((order) => order.productId === item.productId && isPaidDigital(order)),
  );
  const extra = pendingDigital.length + digitalDrafts.length;
  const count = cartItemCount(purchases, extra);
  return (
    <NavLink
      to="/carrello"
      className={`relative ${className}`}
      aria-label={nav.carrello}
    >
      <BagIcon />
      {count > 0 ? (
        <span className="absolute right-0.5 top-0.5 min-w-[1rem] bg-ember px-1 text-center text-[0.625rem] leading-4 text-ivory">
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

function HomeIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v12h14V9M9 21v-7h6v7" />
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
