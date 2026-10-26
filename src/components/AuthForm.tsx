import { useState, type FormEvent } from "react";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import { emptyConsents, hasRequiredConsents, type Consents } from "../lib/storage";
import { isSupabaseConfigured } from "../lib/supabase";
import { Button } from "./Button";
import { ConsentFields } from "./ConsentFields";
import { GoogleMark } from "./GoogleMark";
import { LegalCopy } from "./LegalNotice";

const { auth } = siteContent;

type Mode = "login" | "register" | "magic";

type Props = {
  mode?: Mode;
  onMode?: (mode: Mode) => void;
  onPrivacy?: () => void;
  onVendita?: () => void;
  onSuccess?: () => void;
  redirectTo?: string;
  /** Percorsi accoglienza per chi arriva dalla prenotazione: Accedi / Registrati, senza link magico. */
  soglia?: boolean;
};

export function AuthForm({ mode: modeProp, onMode, onPrivacy, onVendita, onSuccess, redirectTo, soglia = false }: Props) {
  const { login, register, requestMagicLink, loginWithGoogle } = useAuth();
  const [modeState, setModeState] = useState<Mode>("login");
  const mode = modeProp ?? modeState;
  const googleReady = isSupabaseConfigured();

  function setMode(next: Mode) {
    onMode?.(next);
    setModeState(next);
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [consents, setConsents] = useState<Consents>(emptyConsents);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const ready = hasRequiredConsents(consents);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!ready) {
      setError(auth.errori.consensi);
      return;
    }
    if (mode === "register" && password !== confirm) {
      setError(auth.errori.password);
      return;
    }
    setBusy(true);
    const result =
      mode === "login"
        ? await login(email, password, consents)
        : mode === "magic"
          ? await requestMagicLink(email, consents, redirectTo)
          : await register(email, password, consents, name, redirectTo);
    setBusy(false);
    if (result === "verify") {
      setInfo(mode === "magic" ? auth.magicInviato : auth.verificaEmail);
      return;
    }
    if (result) {
      setError(result);
      return;
    }
    onSuccess?.();
  }

  async function onGoogle() {
    setError(null);
    setInfo(null);
    if (!ready) {
      setError(auth.errori.consensi);
      return;
    }
    setBusy(true);
    const result = await loginWithGoogle(consents, redirectTo);
    if (result) {
      setBusy(false);
      setError(result);
    }
  }

  return (
    <form className="flex flex-col gap-8 text-left" onSubmit={(e) => void onSubmit(e)}>
      <div className={`flex ${soglia ? "flex-col" : "flex-wrap justify-center"} gap-2`}>
        <button
          type="button"
          onClick={() => setMode("login")}
          className={soglia ? sogliaTab(mode === "login") : compactTab(mode === "login")}
        >
          {soglia ? auth.giaDeiNostri : auth.login}
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={soglia ? sogliaTab(mode === "register") : compactTab(mode === "register")}
        >
          {soglia ? auth.primaVolta : auth.registrazione}
        </button>
        {soglia ? null : (
          <button
            type="button"
            onClick={() => setMode("magic")}
            className={compactTab(mode === "magic")}
          >
            {auth.magicLink}
          </button>
        )}
      </div>

      {mode === "register" ? (
        <Field label={auth.nome} value={name} onChange={setName} autoComplete="name" />
      ) : null}

      <Field
        label={auth.email}
        value={email}
        onChange={setEmail}
        type="email"
        required
        autoComplete="email"
      />
      {mode !== "magic" ? (
      <Field
        label={auth.password}
        value={password}
        onChange={setPassword}
        type="password"
        required
        minLength={6}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
      />
      ) : null}
      {mode === "register" ? (
        <Field
          label={auth.confermaPassword}
          value={confirm}
          onChange={setConfirm}
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      ) : null}

      <ConsentFields
        consents={consents}
        onChange={setConsents}
        onPrivacy={onPrivacy}
        onVendita={onVendita}
      />

      {error ? (
        <p className="text-sm text-ink">
          <LegalCopy>{error}</LegalCopy>
        </p>
      ) : null}
      {info ? (
        <p className="text-sm text-ink/70">
          <LegalCopy>{info}</LegalCopy>
        </p>
      ) : null}

      {googleReady ? (
        <button
          type="button"
          disabled={!ready || busy}
          onClick={() => void onGoogle()}
          className="group flex w-full items-center justify-center gap-3 border-2 border-[#dadce0] bg-white px-6 py-4 text-[0.9375rem] font-medium normal-case tracking-normal text-[#3c4043] shadow-[0_2px_6px_rgba(60,64,67,0.18)] transition duration-200 hover:border-[#c6c6c6] hover:bg-[#f8f9fa] hover:shadow-[0_3px_10px_rgba(60,64,67,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4285F4] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <GoogleMark className="h-6 w-6 shrink-0" />
          <span className="font-sans">{auth.google}</span>
        </button>
      ) : null}

      <Button type="submit" className="w-full" disabled={!ready || busy}>
        {mode === "login" ? auth.entra : mode === "magic" ? auth.inviaMagicLink : auth.creaAccount}
      </Button>
    </form>
  );
}

function compactTab(active: boolean) {
  return `px-4 py-2 text-[0.625rem] uppercase tracking-[0.16em] ${
    active ? "bg-ink text-on-ink" : "bg-mist text-ink/55"
  }`;
}

function sogliaTab(active: boolean) {
  return `w-full px-4 py-3 text-sm leading-snug ${
    active ? "bg-ink text-on-ink" : "bg-mist text-ink/70"
  }`;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  minLength,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.625rem] uppercase tracking-[0.16em] text-sage">{label}</span>
      <input
        type={type}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-0 border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-ink"
      />
    </label>
  );
}
