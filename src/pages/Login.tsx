import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DEMO_ACCOUNT } from "../lib/storage";
import { siteContent } from "../data/siteContent";
import { Button } from "../components/Button";
import { PageHero } from "../components/PageHero";

export function Login() {
  const { session, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/riservata";
  const [email, setEmail] = useState(DEMO_ACCOUNT.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (session) return <Navigate to={from} replace />;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const err = login(email, password);
    if (err) {
      setError(err);
      return;
    }
    navigate(from, { replace: true });
  }

  return (
    <div>
      <PageHero
        kicker="Soglia riservata"
        title="Accedi"
        lead="Area membri per consulti prenotati, dispense e materiali alchemici. Oppure prenota una sessione vocale WhatsApp senza attendere."
        cta={{ to: "/consulti", label: siteContent.cta.consultoWhatsapp }}
        secondary={{ href: "#login", label: "Entra nell'area riservata" }}
      />

      <form
        id="login"
        onSubmit={onSubmit}
        className="mx-auto flex max-w-md scroll-mt-28 flex-col gap-8 px-6 pb-24 md:px-10 md:pb-32"
      >
        <p className="text-sm leading-relaxed text-ink/55">
          Demo: <span className="text-ink">{DEMO_ACCOUNT.email}</span> /{" "}
          <span className="text-ink">{DEMO_ACCOUNT.password}</span>. In alternativa, qualsiasi
          email e una password di almeno 6 caratteri.
        </p>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-[0.16em] text-sage">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-0 border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-ink"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-[0.16em] text-sage">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-0 border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-ink"
          />
        </label>
        {error && <p className="text-sm text-ink">{error}</p>}
        <Button type="submit" className="mt-4 w-full">
          Entra nell’area riservata
        </Button>
      </form>
    </div>
  );
}
