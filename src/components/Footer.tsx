import { NavLink } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { flattenNav, MAIN_NAV } from "../data/navigation";
import { useAuth } from "../context/AuthContext";

const { brand, nav } = siteContent;

export function Footer() {
  const { session } = useAuth();
  const links = flattenNav(MAIN_NAV);

  return (
    <footer className="mt-auto bg-mist px-6 py-20 text-center md:px-10 md:py-28">
      <img src="/logo.svg" alt="" className="mx-auto h-12 w-12" />
      <p className="mt-8 font-display text-lg tracking-[0.2em] text-ink">{brand.wordmark.toUpperCase()}</p>
      <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-sage">{brand.name}</p>
      <p className="mt-6 text-[11px] leading-relaxed tracking-[0.04em] text-ink/55">{brand.slogan}</p>
      <p className="mx-auto mt-8 max-w-md text-[10px] uppercase leading-relaxed tracking-[0.16em] text-ink/45">
        {brand.titolare} — {brand.studioDiTeresa}
      </p>
      <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-ink/45">{brand.coords}</p>
      <a
        href={`mailto:${brand.email}`}
        className="mt-6 inline-block font-display text-sm italic text-ink underline decoration-sage/40 underline-offset-4"
      >
        {brand.email}
      </a>
      <div className="mx-auto mt-14 flex max-w-xl flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] uppercase tracking-[0.16em] text-ink/50">
        {links.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className="hover:text-ink">
            {item.label}
          </NavLink>
        ))}
        <NavLink to={session ? "/riservata" : "/login"} className="hover:text-ink">
          {session ? nav.riservata : nav.accedi}
        </NavLink>
      </div>
      <p className="mx-auto mt-12 max-w-lg text-[9px] uppercase leading-relaxed tracking-[0.16em] text-ink/35">
        {brand.deontologia}
      </p>
    </footer>
  );
}
