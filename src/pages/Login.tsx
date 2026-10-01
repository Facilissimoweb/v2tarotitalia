import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DEMO_ACCOUNT } from "../lib/storage";
import { Button, Kicker } from "../components/Button";

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
    <div className="mx-auto max-w-md px-6 py-16">
      <Kicker>Soglia riservata</Kicker>
      <h1 className="mt-3 font-display text-4xl font-light">Accedi</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink/70">
        Area membri per consulti prenotati, dispense e materiali alchemici. Demo:{" "}
        <span className="text-ink">{DEMO_ACCOUNT.email}</span> /{" "}
        <span className="text-ink">{DEMO_ACCOUNT.password}</span>. In alternativa, qualsiasi
        email e una password di almeno 6 caratteri.
      </p>

      <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.16em] text-sage">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-0 border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.16em] text-sage">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-0 border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        {error && <p className="text-sm text-ink">{error}</p>}
        <Button type="submit" className="w-full">
          Entra nell’area riservata
        </Button>
      </form>
    </div>
  );
}
