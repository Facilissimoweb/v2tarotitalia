import { useEffect, useId, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import {
  MAIN_NAV,
  isNavBranch,
  isTarocchiPath,
  type NavBranch,
} from "../data/navigation";

const { brand, nav } = siteContent;

const linkClass = (active: boolean) =>
  `text-[11px] uppercase tracking-[0.16em] transition-colors ${
    active ? "text-ink" : "text-ink/40 hover:text-ink"
  }`;

const SCROLL_DELTA = 8;

function heroEndY() {
  const hero = document.querySelector<HTMLElement>("[data-page-hero]");
  if (!hero) return Math.round(window.innerHeight * 0.4);
  const rect = hero.getBoundingClientRect();
  return rect.bottom + window.scrollY;
}

export function Header() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    setOpen(false);
    setVisible(false);
    lastY.current = 0;
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const apply = () => {
      ticking.current = false;
      if (open) {
        setVisible(true);
        return;
      }

      const y = Math.max(0, window.scrollY);
      const prev = lastY.current;
      const delta = y - prev;
      lastY.current = y;

      if (y < heroEndY() - 12) {
        setVisible(false);
        return;
      }

      if (delta > SCROLL_DELTA) setVisible(false);
      else if (delta < -SCROLL_DELTA) setVisible(true);
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(apply);
    };

    lastY.current = Math.max(0, window.scrollY);
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", apply);
    };
  }, [pathname, open]);

  const show = visible || open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-ink/5 bg-ivory/95 backdrop-blur-xl transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
          show ? "pointer-events-auto" : "pointer-events-none overflow-hidden"
        }`}
        style={{
          transform: show ? "translate3d(0, 0, 0)" : "translate3d(0, -100%, 0)",
        }}
        aria-hidden={!show}
        inert={!show || undefined}
      >
        <div className="hidden lg:block">
          <NavLink
            to="/"
            className="mx-auto flex max-w-3xl flex-col items-center px-8 pt-10 pb-8"
          >
            <img src="/logo.svg" alt="" className="h-11 w-11" />
            <span className="mt-5 font-display text-[15px] tracking-[0.42em] text-ink">
              {brand.wordmark.toUpperCase()}
            </span>
            <span className="mt-2.5 text-[10px] uppercase tracking-[0.32em] text-sage">
              {brand.name}
            </span>
          </NavLink>

          <div className="relative border-t border-ink/5">
            <nav
              className="mx-auto flex max-w-5xl items-center justify-center gap-8 px-20 py-5 xl:gap-10"
              aria-label="Principale"
            >
              {MAIN_NAV.map((item) =>
                isNavBranch(item) ? (
                  <TarocchiMenu key={item.label} item={item} />
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => linkClass(isActive)}
                  >
                    {item.label}
                  </NavLink>
                ),
              )}
            </nav>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-8 xl:pr-12">
              <div className="pointer-events-auto">
                <CartLink />
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[4.25rem] items-center justify-between px-5 lg:hidden">
          <NavLink to="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="h-8 w-8" />
            <span className="font-display text-[11px] tracking-[0.28em] text-ink">
              {brand.wordmark.toUpperCase()}
            </span>
          </NavLink>
          <div className="flex items-center gap-4">
            <CartLink />
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
          </div>
        </div>
      </header>

      {open ? <MobileDrawer onClose={() => setOpen(false)} /> : null}
    </>
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
        className={`absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-3 ${
          pinned
            ? "visible pointer-events-auto"
            : "invisible pointer-events-none group-hover:visible group-hover:pointer-events-auto group-focus-within:visible group-focus-within:pointer-events-auto"
        }`}
      >
        <div className="border border-ink/10 bg-ivory px-7 py-8 shadow-[0_18px_40px_rgba(43,37,35,0.06)]">
          <p className="mb-6 text-[9px] uppercase tracking-[0.2em] text-sage">{item.label}</p>
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
      className="fixed inset-0 z-[60] flex flex-col bg-ivory lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={nav.menu}
    >
      <div className="flex h-[4.25rem] items-center justify-between border-b border-ink/10 px-5">
        <NavLink to="/" className="flex items-center gap-3" onClick={onClose}>
          <img src="/logo.svg" alt="" className="h-8 w-8" />
          <span className="font-display text-[11px] tracking-[0.28em] text-ink">
            {brand.wordmark.toUpperCase()}
          </span>
        </NavLink>
        <div className="flex items-center gap-2">
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
        </div>
      </nav>
    </div>
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
