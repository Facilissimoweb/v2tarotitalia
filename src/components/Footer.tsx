import { NavLink } from "react-router-dom";
import { STUDIO } from "../data/catalogo";
import { useAuth } from "../context/AuthContext";

export function Footer() {
  const { session } = useAuth();
  return (
    <footer className="mt-auto bg-mist px-6 py-20 text-center md:px-10 md:py-28">
      <p className="font-display text-lg tracking-[0.2em] text-ink">TAROT ITALIA</p>
      <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-sage">
        {STUDIO.name} · {STUDIO.city} ({STUDIO.region})
      </p>
      <p className="mt-8 text-[10px] uppercase tracking-[0.16em] text-ink/45">{STUDIO.coords}</p>
      <a
        href={`mailto:${STUDIO.email}`}
        className="mt-6 inline-block font-display text-sm italic text-ink underline decoration-sage/40 underline-offset-4"
      >
        {STUDIO.email}
      </a>
      <div className="mx-auto mt-14 flex max-w-lg flex-wrap justify-center gap-x-8 gap-y-3 text-[10px] uppercase tracking-[0.16em] text-ink/50">
        <NavLink to="/" className="hover:text-ink">
          Home
        </NavLink>
        <NavLink to="/consulti" className="hover:text-ink">
          Consulti
        </NavLink>
        <NavLink to="/arcani" className="hover:text-ink">
          22 Arcani
        </NavLink>
        <NavLink to="/corsi" className="hover:text-ink">
          Corsi
        </NavLink>
        <NavLink to="/estrazione" className="hover:text-ink">
          Estrazione
        </NavLink>
        <NavLink to={session ? "/riservata" : "/login"} className="hover:text-ink">
          {session ? "Riservata" : "Accedi"}
        </NavLink>
      </div>
      <p className="mt-12 text-[9px] uppercase tracking-[0.2em] text-ink/35">
        Nessun consulto su salute o eventi fatali. L'essere umano resta l'unico scultore del proprio destino.
      </p>
    </footer>
  );
}
