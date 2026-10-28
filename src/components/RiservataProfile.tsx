import { useEffect, useState } from "react";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import { canManageCredentials, providerFromUser } from "../lib/authProfile";
import { getSupabaseClient } from "../lib/supabase";
import type { AuthProviderKind } from "../lib/storage";
import { Button, Kicker } from "./Button";

const { auth } = siteContent;

export function RiservataProfile() {
  const { session, updateProfile, updatePassword } = useAuth();
  const [provider, setProvider] = useState<AuthProviderKind>(session?.provider ?? "email");
  const [managePassword, setManagePassword] = useState(session?.provider !== "google");
  const [accessReady, setAccessReady] = useState(() => !getSupabaseClient());
  const [name, setName] = useState(session?.name ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    setName(session?.name ?? "");
    setProvider(session?.provider ?? "email");
  }, [session?.name, session?.provider]);

  useEffect(() => {
    const sb = getSupabaseClient();
    if (!sb) {
      setAccessReady(true);
      setManagePassword(session?.provider !== "google");
      return;
    }
    let cancelled = false;
    void sb.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      if (data.user) {
        setProvider(providerFromUser(data.user));
        setManagePassword(canManageCredentials(data.user, session?.provider ?? "email"));
      } else {
        setManagePassword(session?.provider !== "google");
      }
      setAccessReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [session?.id, session?.provider]);

  if (!session) return null;

  async function onSaveProfile() {
    setBusy(true);
    setError(null);
    setNote(null);
    const err = await updateProfile(name);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setNote(auth.profiloAggiornato);
  }

  async function onSavePassword() {
    setBusy(true);
    setError(null);
    setNote(null);
    const err = await updatePassword(password, confirm);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setPassword("");
    setConfirm("");
    setNote(auth.passwordAggiornata);
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Kicker>{auth.profilo}</Kicker>
        <h2 className="font-display text-xl italic">{auth.profilo}</h2>
      </div>

      <article className="bg-paper p-8">
        <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
          {provider === "google" ? auth.accessoGoogle : auth.accessoEmail}
        </p>
        <dl className="mt-6 flex flex-col gap-5">
          <div>
            <dt className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{auth.nome}</dt>
            <dd className="mt-1 font-display text-lg text-ink">{session.name}</dd>
          </div>
          <div>
            <dt className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{auth.email}</dt>
            <dd className="mt-1 text-sm text-ink">{session.email}</dd>
          </div>
        </dl>
      </article>

      {!accessReady ? (
        <p className="text-sm text-ink/70">{auth.caricamento}</p>
      ) : managePassword ? (
        <>
          <article className="bg-paper p-8">
            <Kicker>{auth.nome}</Kicker>
            <label className="mt-6 flex flex-col gap-1.5">
              <span className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{auth.nome}</span>
              <input
                type="text"
                value={name}
                autoComplete="name"
                onChange={(e) => setName(e.target.value)}
                className="w-full border-0 border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-ink"
              />
            </label>
            <Button type="button" className="mt-8" disabled={busy} onClick={() => void onSaveProfile()}>
              {auth.salvaProfilo}
            </Button>
          </article>

          <article className="bg-paper p-8">
            <Kicker>{auth.password}</Kicker>
            <label className="mt-6 flex flex-col gap-1.5">
              <span className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{auth.nuovaPassword}</span>
              <input
                type="password"
                value={password}
                autoComplete="new-password"
                minLength={6}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-0 border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="mt-6 flex flex-col gap-1.5">
              <span className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{auth.confermaPassword}</span>
              <input
                type="password"
                value={confirm}
                autoComplete="new-password"
                minLength={6}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full border-0 border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-ink"
              />
            </label>
            <Button type="button" className="mt-8" disabled={busy} onClick={() => void onSavePassword()}>
              {auth.salvaProfilo}
            </Button>
          </article>
        </>
      ) : (
        <p className="bg-mist p-5 text-sm leading-[1.9] text-ink/70">{auth.accountGoogle}</p>
      )}

      {error ? <p className="text-sm text-ink">{error}</p> : null}
      {note ? <p className="text-sm text-ink/70">{note}</p> : null}
    </div>
  );
}
