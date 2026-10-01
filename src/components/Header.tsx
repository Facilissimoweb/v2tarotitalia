import { useEffect, useId, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { siteContent } from "../data/siteContent";
import {
  MAIN_NAV,
  MOBILE_TABS,
  isNavBranch,
  isTarocchiPath,
  type NavBranch,
} from "../data/navigation";

const { brand, nav } = siteContent;

const linkClass = (active: boolean) =>
  `text-[11px] uppercase tracking-[0.16em] transition-colors ${
    active ? "text-ink" : "text-ink/45 hover:text-ink"
  }`;

export function Header() {
  const { session } = useAuth();
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
      <header className="sticky top-0 z-40 border-b border-ink/5 bg-ivory/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6 lg:px-10">
          <NavLink to="/" className="flex shrink-0 items-center gap-3">
            <img src="/logo.svg" alt="" className="h-8 w-8" />
            <div className="flex flex-col leading-none">
              <span className="font-display text-[13px] tracking-[0.28em] text-ink">
                {brand.wordmark.toUpperCase()}
              </span>
              <span className="mt-1 text-[9px] uppercase tracking-[0.22em] text-sage">
                {brand.name} · {brand.city}
              </span>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-7 xl:gap-9 lg:flex" aria-label="Principale">
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

          <div className="flex items-center gap-5">
            <NavLink
              to={session ? "/riservata" : "/login"}
              className="text-[11px] uppercase tracking-[0.16em] text-sage hover:text-ink"
            >
              {session ? nav.riservata : nav.accedi}
            </NavLink>
            <button
              type="button"
              className="text-[11px] uppercase tracking-[0.16em] text-ink lg:hidden"
              aria-expanded={open}
              aria-controls="menu-mobile"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? nav.chiudi : nav.menu}
            </button>
          </div>
        </div>
      </header>
      {open ? <MobilePanel /> : null}
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
        className={`absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-4 ${
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

function MobilePanel() {
  return (
    <div
      id="menu-mobile"
      className="fixed inset-x-0 bottom-16 top-20 z-50 overflow-y-auto bg-ivory lg:hidden"
    >
      <nav className="mx-auto flex max-w-lg flex-col gap-10 px-8 py-16" aria-label="Principale">
        {MAIN_NAV.map((item) =>
          isNavBranch(item) ? (
            <div key={item.label}>
              <p className="text-[11px] uppercase tracking-[0.18em] text-sage">{item.label}</p>
              <ul className="mt-5 flex flex-col gap-5">
                {item.children.map((child) => (
                  <li key={child.to}>
                    <NavLink
                      to={child.to}
                      className={({ isActive }) =>
                        `font-display text-2xl ${isActive ? "text-ink" : "text-ink/50"}`
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
                `font-display text-3xl ${isActive ? "text-ink" : "text-ink/45"}`
              }
            >
              {item.label}
            </NavLink>
          ),
        )}
      </nav>
    </div>
  );
}

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink/5 bg-ivory/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      aria-label="Mobile"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {MOBILE_TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `flex min-w-[3.25rem] flex-col items-center gap-1 ${
                isActive ? "text-ink" : "text-ink/40"
              }`
            }
          >
            <span className="text-[9px] uppercase tracking-[0.12em]">{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
