import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
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
import { cartItemCount, draftMatchesSettled, isCartPurchase, readBookingDraft, sameBookingSlot } from "../lib/storage";
import { loginHref, rememberAuthReturn } from "../lib/authReturn";
import { isCartDigital, isPaidDigital, readDigitalDrafts } from "../lib/digitalOrders";
import { formatBookingDay } from "../lib/whatsapp";
import { LanguageChoices, LanguageWidget } from "./LanguageWidget";
import { NavSlideOver } from "./NavSlideOver";
import { AccessibilityControls, AccessibilityTrigger } from "./AccessibilityWidget";
import { Button } from "./Button";
import { PageSpeechTrigger } from "./PageSpeech";
import { BrandLogo } from "./BrandLogo";
import { conPeso } from "./Prosa";
import { ShopIcon } from "./ShopIcon";
import { WidgetCloseButton } from "./WidgetCloseButton";

const { auth, brand, consulti, nav, pages } = siteContent;

const MENU_EASE = [0.22, 1, 0.36, 1] as const;

const menuPanel: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.38, ease: MENU_EASE } },
  exit: { opacity: 0, transition: { duration: 0.22, ease: MENU_EASE } },
};

const menuList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
};

const menuItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.48, ease: MENU_EASE } },
};

const DRAWER_ICON =
  "ti-btn ti-btn-icon flex h-12 w-12 shrink-0 items-center justify-center text-ink transition-colors hover:text-ink/60 [&_svg]:h-[1.5rem] [&_svg]:w-[1.5rem] [&_svg]:stroke-[2.25]";

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
const NAV_ICON_BTN = `ti-btn ti-btn-icon ${NAV_ICON_CORE} w-12`;
const NAV_ICON_BTN_MOBILE =
  "ti-btn ti-btn-icon flex h-10 w-10 shrink-0 items-center justify-center text-black transition-colors hover:text-black/55 [&_svg]:h-[1.35rem] [&_svg]:w-[1.35rem] [&_svg]:stroke-[2.25]";
const SLIDE_CTA =
  "ti-btn mt-8 inline-flex w-full items-center justify-center bg-ink px-6 py-4 text-center text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-on-ink";

type HoverPanel = "lingua" | "account" | "carrello" | "facilitazione";

export function Header() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const hover = useNavHover(pathname);

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
          <div className="flex min-w-0 items-center gap-x-3 min-[1440px]:gap-x-7 2xl:gap-x-9">
            <NavLink to="/" end className="nav-title shrink-0" translate="no">
              {brand.wordmark}
            </NavLink>
            <div className="ml-auto flex items-center justify-end gap-x-3 min-[1440px]:gap-x-7 2xl:gap-x-9">
              {NAV_LEADING.map((item) => (
                <DesktopNavEntry key={isNavBranch(item) ? item.label : item.to} item={item} />
              ))}
            </div>
          </div>

          <NavLink
            to="/"
            end
            className="flex items-center justify-center px-3"
            aria-label={nav.home}
          >
            <BrandLogo tone="nav" className="nav-mark" />
          </NavLink>

          <div className="flex min-w-0 items-center justify-between gap-8 2xl:gap-10">
            <div className="flex items-center justify-start gap-x-7 2xl:gap-x-9">
              {NAV_TRAILING.map((item) => (
                <DesktopNavEntry key={isNavBranch(item) ? item.label : item.to} item={item} />
              ))}
            </div>
            <div className="flex shrink-0 items-center">
              <div onMouseEnter={() => hover.show("lingua")} onMouseLeave={hover.scheduleClose}>
                <LanguageWidget
                  placement="nav"
                  onActivate={() => hover.togglePin("lingua")}
                  expanded={hover.panel === "lingua"}
                  controls="nav-slide"
                />
              </div>
              <PageSpeechTrigger className={NAV_ICON_BTN} />
              <div onMouseEnter={() => hover.show("facilitazione")} onMouseLeave={hover.scheduleClose}>
                <AccessibilityTrigger
                  className={NAV_ICON_BTN}
                  onActivate={() => hover.togglePin("facilitazione")}
                  expanded={hover.panel === "facilitazione"}
                  controls="nav-slide"
                />
              </div>
              <div onMouseEnter={() => hover.show("account")} onMouseLeave={hover.scheduleClose}>
                <AccountLink className={NAV_ICON_BTN} expanded={hover.panel === "account"} controls="nav-slide" />
              </div>
              <div onMouseEnter={() => hover.show("carrello")} onMouseLeave={hover.scheduleClose}>
                <CartLink
                  className={NAV_ICON_BTN}
                  preview
                  expanded={hover.panel === "carrello"}
                  controls="nav-slide"
                  onActivate={() => hover.togglePin("carrello")}
                />
              </div>
            </div>
          </div>
        </nav>

        <div className="relative flex h-[4.25rem] w-full items-center justify-between gap-3 px-3.5 sm:px-5 xl:hidden">
          <NavLink
            to="/"
            end
            className="flex min-w-0 items-center gap-2.5"
            aria-label={nav.home}
            translate="no"
          >
            <BrandLogo tone="nav" className="nav-mark-mobile shrink-0" />
            <span className="nav-title nav-title-mobile min-w-0 truncate">{brand.wordmark}</span>
          </NavLink>
          <div className="nav-actions-glass relative z-10 flex shrink-0 items-center gap-0.5 p-1">
            <LanguageWidget
              placement="nav"
              className="h-10 w-10"
              flagClassName="h-3 w-[1.05rem]"
            />
            <CartLink className={NAV_ICON_BTN_MOBILE} />
            <button
              type="button"
              className={`${NAV_ICON_BTN_MOBILE} nav-menu-trigger`}
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

      <NavSlideOver
        id="nav-slide"
        open={hover.panel !== null}
        pinned={hover.pinned}
        title={slideTitle(hover.panel)}
        onClose={hover.close}
        onMouseEnter={() => {
          if (hover.panel) hover.show(hover.panel);
        }}
        onMouseLeave={hover.scheduleClose}
      >
        {hover.panel === "lingua" ? <LanguageChoices autoFocus={hover.pinned} onSelect={hover.close} /> : null}
        {hover.panel === "account" ? <AccountPreview onNavigate={hover.close} /> : null}
        {hover.panel === "carrello" ? <CartPreview onNavigate={hover.close} /> : null}
        {hover.panel === "facilitazione" ? <AccessibilityControls /> : null}
      </NavSlideOver>
    </>
  );
}

function useNavHover(pathname: string) {
  const [panel, setPanel] = useState<HoverPanel | null>(null);
  const [pinned, setPinned] = useState(false);
  const pinnedRef = useRef(false);
  const panelRef = useRef<HoverPanel | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    pinnedRef.current = pinned;
    panelRef.current = panel;
  }, [pinned, panel]);

  useEffect(() => {
    setPanel(null);
    setPinned(false);
  }, [pathname]);

  useEffect(() => {
    if (!pinned) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [pinned]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPinned(false);
        setPanel(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  function clearTimer() {
    if (timer.current) window.clearTimeout(timer.current);
  }

  function show(id: HoverPanel) {
    clearTimer();
    if (pinnedRef.current && panelRef.current && panelRef.current !== id) setPinned(false);
    setPanel(id);
  }

  function scheduleClose() {
    clearTimer();
    timer.current = window.setTimeout(() => {
      if (!pinnedRef.current) setPanel(null);
    }, 180);
  }

  function togglePin(id: HoverPanel) {
    clearTimer();
    if (pinnedRef.current && panelRef.current === id) {
      setPinned(false);
      setPanel(null);
      return;
    }
    setPinned(true);
    setPanel(id);
  }

  function close() {
    clearTimer();
    setPinned(false);
    setPanel(null);
  }

  return { panel, pinned, show, scheduleClose, togglePin, close };
}

function slideTitle(panel: HoverPanel | null) {
  if (panel === "lingua") return siteContent.lingua.titolo;
  if (panel === "account") return nav.riservata;
  if (panel === "carrello") return nav.carrello;
  if (panel === "facilitazione") return siteContent.accessibilita.titolo;
  return nav.menu;
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
      className="menu-mobile fixed inset-0 z-[70] flex flex-col overflow-hidden xl:hidden"
      variants={reduce ? undefined : menuPanel}
      initial={reduce ? false : "hidden"}
      animate="show"
      exit="exit"
    >
      <div className="mx-auto flex w-full max-w-xl items-start justify-between gap-6 px-7 pt-[max(1.35rem,env(safe-area-inset-top))] sm:px-10 md:px-2 md:pt-10">
        <div data-widget-brand className="pt-1">
          <BrandLogo className="h-[6.25rem] w-[6.25rem] md:h-[7rem] md:w-[7rem]" />
          <p className="menu-brand mt-3">{brand.wordmark}</p>
          <p className="menu-kicker mt-6">{nav.menu}</p>
        </div>
        <WidgetCloseButton placement="inline" onClick={onClose} />
      </div>

      <nav
        className="relative mx-auto w-full max-w-xl flex-1 overflow-y-auto overscroll-contain px-7 pb-8 pt-8 sm:px-10 md:px-2 md:pb-12 md:pt-12"
        aria-label="Principale"
      >
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
                <motion.li key={item.label} variants={reduce ? undefined : menuItem} className="menu-row">
                  <p className="menu-link">
                    <span className="menu-index">{n}</span>
                    <span className="menu-voice">{item.label}</span>
                  </p>
                  <ul className="menu-sub">
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <NavLink
                          to={child.to}
                          className={({ isActive }) => `menu-link menu-link--sub${isActive ? " is-active" : ""}`}
                        >
                          <span className="menu-voice menu-voice--sub">{child.label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </motion.li>
              );
            }
            return (
              <motion.li key={item.to} variants={reduce ? undefined : menuItem} className="menu-row">
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `menu-link${isActive ? " is-active" : ""}`}
                >
                  <span className="menu-index">{n}</span>
                  <span className="menu-voice">
                    {item.icon === "home" ? <HomeIcon size={18} /> : null}
                    {item.icon === "shop" ? <ShopIcon size={18} /> : null}
                    {item.label}
                  </span>
                </NavLink>
              </motion.li>
            );
          })}
        </motion.ul>
      </nav>

      <div className="mx-auto w-full max-w-xl shrink-0 border-t border-ink/10 px-5 pt-1 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8 md:px-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <PageSpeechTrigger className={DRAWER_ICON} />
            <AccessibilityTrigger className={DRAWER_ICON} />
            <AccountLink className={DRAWER_ICON} />
            <CartLink className={DRAWER_ICON} />
          </div>
          <LanguageWidget placement="drawer" className="w-auto justify-end py-2 text-ink/70 hover:text-ink" />
        </div>
      </div>
    </motion.div>
  );
}

function AccountLink({
  className = "flex h-[40px] w-[40px] items-center justify-center text-ink/70 transition-colors hover:text-ink",
  expanded,
  controls,
}: {
  className?: string;
  expanded?: boolean;
  controls?: string;
}) {
  const { session } = useAuth();
  const dest = accountDest();
  return (
    <NavLink
      to={session ? "/riservata" : dest.to}
      state={session ? undefined : dest.state}
      onClick={() => dest.remember()}
      className={className}
      aria-label={session ? nav.riservata : nav.accedi}
      aria-expanded={expanded}
      aria-controls={controls}
      aria-haspopup="dialog"
    >
      <ProfileIcon />
    </NavLink>
  );
}

function accountDest() {
  const checkoutIntent = Boolean(readDigitalDrafts().length || readBookingDraft());
  return {
    to: checkoutIntent ? loginHref("/carrello") : "/login",
    state: { from: checkoutIntent ? "/carrello" : "/riservata" },
    remember() {
      if (checkoutIntent) rememberAuthReturn("/carrello");
    },
  };
}

function AccountPreview({ onNavigate }: { onNavigate: () => void }) {
  const { session } = useAuth();
  const dest = accountDest();
  return (
    <div className="flex flex-col items-start gap-6">
      <p className="text-sm leading-[1.8] text-ink/70">{conPeso(auth.sogliaLead)}</p>
      {session ? (
        <Link to="/riservata" className={SLIDE_CTA} onClick={onNavigate}>
          {nav.riservata}
        </Link>
      ) : (
        <Link
          to={dest.to}
          state={dest.state}
          className={SLIDE_CTA}
          onClick={() => {
            dest.remember();
            onNavigate();
          }}
        >
          {auth.login}
        </Link>
      )}
    </div>
  );
}

function CartLink({
  className = "relative flex h-[40px] w-[40px] items-center justify-center text-ink/70 transition-colors hover:text-ink",
  preview = false,
  expanded,
  controls,
  onActivate,
}: {
  className?: string;
  preview?: boolean;
  expanded?: boolean;
  controls?: string;
  onActivate?: () => void;
}) {
  const count = useCartSnapshot().count;
  const badge =
    count > 0 ? (
      <span className="absolute right-0.5 top-0.5 min-w-[1rem] bg-ember px-1 text-center text-[0.625rem] leading-4 text-ivory">
        {count}
      </span>
    ) : null;

  if (preview) {
    return (
      <button
        type="button"
        className={`relative ${className}`}
        aria-label={nav.carrello}
        aria-haspopup="dialog"
        aria-expanded={expanded}
        aria-controls={controls}
        onClick={onActivate}
      >
        <BagIcon />
        {badge}
      </button>
    );
  }

  return (
    <NavLink to="/carrello" className={`relative ${className}`} aria-label={nav.carrello}>
      <BagIcon />
      {badge}
    </NavLink>
  );
}

function useCartSnapshot() {
  const { purchases, digitalOrders } = useAuth();
  const pendingDigital = digitalOrders.filter(isCartDigital);
  const digitalDrafts = readDigitalDrafts().filter(
    (item) =>
      !pendingDigital.some((order) => order.productId === item.productId) &&
      !digitalOrders.some((order) => order.productId === item.productId && isPaidDigital(order)),
  );
  const draft = readBookingDraft();
  const showDraft = Boolean(draft && !draftMatchesSettled(purchases));
  const pending = purchases.filter(isCartPurchase).filter((item) => !draft || !showDraft || !sameBookingSlot(item, draft));
  const extra = pendingDigital.length + digitalDrafts.length;
  return { count: cartItemCount(purchases, extra), pending, pendingDigital, digitalDrafts, draft: showDraft ? draft : null };
}

function CartPreview({ onNavigate }: { onNavigate: () => void }) {
  const { pending, pendingDigital, digitalDrafts, draft } = useCartSnapshot();
  const lines: { key: string; title: string; detail: string }[] = [];
  if (draft) {
    const option = consulti.opzioni.find((item) => item.id === draft.type);
    lines.push({
      key: "draft",
      title: option?.titolo ?? draft.type,
      detail: `${formatBookingDay(draft.dateIso)} · ${draft.slot} · € ${draft.total}`,
    });
  }
  for (const item of digitalDrafts) {
    lines.push({ key: item.productId, title: item.title, detail: `${item.format} · € ${item.price}` });
  }
  for (const order of pendingDigital) {
    lines.push({ key: order.id, title: order.title, detail: `${order.format} · € ${order.price}` });
  }
  for (const purchase of pending) {
    const option = consulti.opzioni.find((item) => item.id === purchase.type);
    lines.push({
      key: purchase.id,
      title: option?.titolo ?? purchase.type,
      detail: `${purchase.minutes} min${purchase.slot ? ` · ${purchase.slot}` : ""}`,
    });
  }

  return (
    <div>
      <p className="text-sm leading-[1.8] text-ink/70">{conPeso(pages.carrello.lead)}</p>
      {lines.length === 0 ? <p className="mt-6 text-sm leading-[1.8] text-ink/70">{pages.carrello.vuoto}</p> : null}
      {lines.length > 0 ? (
        <ul className="mt-6">
          {lines.map((line) => (
            <li key={line.key} className="border-t border-ink/10 py-4">
              <p className="font-display text-lg leading-snug text-ink">{line.title}</p>
              <p className="mt-1 text-sm text-ink/60">{line.detail}</p>
            </li>
          ))}
        </ul>
      ) : null}
      <Button to="/carrello" className="mt-8 w-full" onClick={onNavigate}>
        {pages.carrello.titolo}
      </Button>
    </div>
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
