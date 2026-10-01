import { NavLink } from "react-router-dom";
import { STUDIO } from "../data/catalogo";
import { useAuth } from "../context/AuthContext";

export function Footer() {
  const { session } = useAuth();
  return (
    <footer className="mt-auto bg-mist px-6 py-14 text-center">
      <p className="font-display text-lg tracking-[0.2em] text-ink">TAROT ITALIA</p>
      <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-sage">
        Santuario olistico · {STUDIO.city} ({STUDIO.region})
      </p>
      <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-ink/45">{STUDIO.coords}</p>
      <a
        href={`mailto:${STUDIO.email}`}
        className="mt-4 inline-block font-display text-sm italic text-ink underline decoration-sage/40 underline-offset-4"
      >
        {STUDIO.email}
      </a>
      <div className="mx-auto mt-10 flex max-w-md flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.16em] text-ink/50">
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
      <p className="mt-8 text-[9px] uppercase tracking-[0.2em] text-ink/35">
        Nessun consulto su salute o eventi fatali. L'essere umano resta l'unico scultore del proprio destino.
      </p>
    </footer>
  );
}
