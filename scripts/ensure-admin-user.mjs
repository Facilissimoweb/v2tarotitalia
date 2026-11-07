/**
 * Crea o aggiorna l’utente operatrice su Supabase Auth.
 * Non stampa la password. Legge SUPABASE_URL / VITE_SUPABASE_URL e
 * SUPABASE_SERVICE_ROLE_KEY. Password: ADMIN_BOOTSTRAP_PASSWORD.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      if (process.env[key]) continue;
      process.env[key] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
}

loadEnv();

const email = (process.env.ADMIN_EMAIL || "mariateresarogani@gmail.com").trim().toLowerCase();
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!password || !url || !key) {
  console.error("Mancano ADMIN_BOOTSTRAP_PASSWORD, SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${key}`,
  apikey: key,
  "Content-Type": "application/json",
};

const list = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=200`, { headers });
if (!list.ok) {
  console.error("Lettura utenti non riuscita", list.status);
  process.exit(1);
}
const payload = await list.json();
const users = payload.users ?? payload;
const existing = Array.isArray(users) ? users.find((user) => user.email?.toLowerCase() === email) : null;

const body = { email, password, email_confirm: true };
const res = existing
  ? await fetch(`${url}/auth/v1/admin/users/${existing.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    })
  : await fetch(`${url}/auth/v1/admin/users`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

if (!res.ok) {
  console.error("Aggiornamento utente non riuscito", res.status, await res.text());
  process.exit(1);
}

console.log(existing ? "Password operatrice aggiornata." : "Utente operatrice creato.");
