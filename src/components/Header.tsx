import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { siteContent } from "../data/siteContent";

const { brand, nav } = siteContent;

const links = [
  { to: "/", label: nav.home },
  { to: "/chi-siamo", label: nav.chiSiamo },
  { to: "/arcani", label: nav.arcani },
  { to: "/consulti", label: nav.consulti },
  { to: "/corsi", label: nav.corsi },
  { to: "/estrazione", label: nav.estrazione },
];

export function Header() {
  const { session } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-ivory/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 md:px-10">
        <NavLink to="/" className="flex items-center gap-3">
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

        <nav className="hidden items-center gap-5 lg:gap-7 md:flex" aria-label="Principale">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-[10px] uppercase tracking-[0.18em] transition-colors ${
                  isActive ? "text-ink" : "text-ink/45 hover:text-ink"
                }`
              }
              end={l.to === "/"}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <NavLink
            to="/chi-siamo"
            className="text-[10px] uppercase tracking-[0.18em] text-ink/45 hover:text-ink md:hidden"
          >
            {nav.chiSiamo}
          </NavLink>
          <NavLink
            to={session ? "/riservata" : "/login"}
            className="text-[10px] uppercase tracking-[0.18em] text-sage hover:text-ink"
          >
            {session ? nav.riservata : nav.accedi}
          </NavLink>
        </div>
      </div>
    </header>
  );
}

const tabs = [
  { to: "/", label: nav.home, icon: HomeIcon },
  { to: "/consulti", label: nav.consulti, icon: CalIcon },
  { to: "/estrazione", label: nav.estrazione, icon: DeckIcon },
  { to: "/arcani", label: nav.arcaniShort, icon: BookIcon },
  { to: "/riservata", label: nav.riservataShort, icon: KeyIcon },
];

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink/5 bg-ivory/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      aria-label="Mobile"
    >
      <div className="flex h-16 items-center justify-around px-1">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === "/"}
            className={({ isActive }) =>
              `flex w-14 flex-col items-center gap-1 ${
                isActive ? "text-ink" : "text-ink/40"
              }`
            }
          >
            <t.icon />
            <span className="text-[8px] uppercase tracking-[0.14em]">{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 10.5 L12 4 L20 10.5 V20 H4 Z" />
    </svg>
  );
}
function CalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="4" y="5" width="16" height="15" />
      <path d="M4 10 H20 M8 3 V7 M16 3 V7" />
    </svg>
  );
}
function DeckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="7" y="4" width="11" height="16" />
      <path d="M5 7 V19 H16" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M5 5 H19 V19 H5 Z M12 5 V19" />
    </svg>
  );
}
function KeyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="9" cy="10" r="3.5" />
      <path d="M12 10 H20 V13 M16 10 V13" />
    </svg>
  );
}
