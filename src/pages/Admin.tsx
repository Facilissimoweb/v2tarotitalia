import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { siteContent } from "../data/siteContent";
import { STUDIO_ADMIN_EMAIL } from "../lib/admin";
import { AdminAgenda } from "../components/AdminAgenda";
import { Button } from "../components/Button";
import { WidgetBrandMark } from "../components/WidgetFrame";

const { admin, auth, brand } = siteContent;

export function Admin() {
  const { session, ready, isAdmin, loginAdmin, logout } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const result = await loginAdmin(password);
    setBusy(false);
    if (result) setError(result);
  }

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 py-24">
        <p className="text-sm text-ink/70">{auth.caricamento}</p>
      </div>
    );
  }

  if (session && !isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <WidgetBrandMark />
        <p className="mt-8 text-sm leading-relaxed text-ink/75">{admin.nonAutorizzata}</p>
        <div className="mt-8">
          <Button variant="ghost" onClick={() => void logout()}>
            {admin.esci}
          </Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24">
        <WidgetBrandMark />
        <h1 className="mt-8 text-center font-display text-3xl text-ink">{admin.accesso}</h1>
        <form className="mt-10 space-y-6" onSubmit={(event) => void onSubmit(event)}>
          <label className="block">
            <span className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{auth.email}</span>
            <input
              className="mt-2 w-full border-0 border-b border-ink/20 bg-transparent py-2 text-ink outline-none"
              type="email"
              value={STUDIO_ADMIN_EMAIL}
              readOnly
              autoComplete="username"
            />
          </label>
          <label className="block">
            <span className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{auth.password}</span>
            <input
              className="mt-2 w-full border-0 border-b border-ink/20 bg-transparent py-2 text-ink outline-none"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="text-sm text-ink">{error}</p> : null}
          <Button type="submit" disabled={busy || password.length < 6}>
            {auth.entra}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
      <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{brand.wordmark}</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-ink">{admin.titolo}</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/75">{admin.lead}</p>
        </div>
        <Button variant="ghost" onClick={() => void logout()}>
          {admin.esci}
        </Button>
      </div>
      <div className="mt-14">
        <AdminAgenda />
      </div>
    </div>
  );
}
