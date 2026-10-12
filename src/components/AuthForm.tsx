import { useState, type FormEvent } from "react";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import { emptyConsents, hasRequiredConsents, type Consents } from "../lib/storage";
import { isSupabaseConfigured } from "../lib/supabase";
import { Button } from "./Button";
import { ConsentFields } from "./ConsentFields";

const { auth } = siteContent;

type Mode = "login" | "register" | "magic";

type Props = {
  mode?: Mode;
  onMode?: (mode: Mode) => void;
  onPrivacy?: () => void;
  onVendita?: () => void;
  onSuccess?: () => void;
  redirectTo?: string;
};

export function AuthForm({ mode: modeProp, onMode, onPrivacy, onVendita, onSuccess, redirectTo }: Props) {
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
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`px-4 py-2 text-[10px] uppercase tracking-[0.16em] ${
            mode === "login" ? "bg-ink text-on-ink" : "bg-mist text-ink/55"
          }`}
        >
          {auth.login}
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`px-4 py-2 text-[10px] uppercase tracking-[0.16em] ${
            mode === "register" ? "bg-ink text-on-ink" : "bg-mist text-ink/55"
          }`}
        >
          {auth.registrazione}
        </button>
        <button
          type="button"
          onClick={() => setMode("magic")}
          className={`px-4 py-2 text-[10px] uppercase tracking-[0.16em] ${
            mode === "magic" ? "bg-ink text-on-ink" : "bg-mist text-ink/55"
          }`}
        >
          {auth.magicLink}
        </button>
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

      {error ? <p className="text-sm text-ink">{error}</p> : null}
      {info ? <p className="text-sm text-ink/70">{info}</p> : null}

      {googleReady ? (
        <Button type="button" variant="ghost" className="w-full" disabled={!ready || busy} onClick={() => void onGoogle()}>
          {auth.google}
        </Button>
      ) : null}

      <Button type="submit" className="w-full" disabled={!ready || busy}>
        {mode === "login" ? auth.entra : mode === "magic" ? auth.inviaMagicLink : auth.creaAccount}
      </Button>
    </form>
  );
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
      <span className="text-[10px] uppercase tracking-[0.16em] text-sage">{label}</span>
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
