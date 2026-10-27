/**
 * Verifica OAuth Calendar: refresh token → access token → evento prova → eliminazione.
 * Legge solo variabili d'ambiente. Non stampare i secret.
 */
const TIMEZONE = "Europe/Rome";

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
const refresh =
  process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim() ||
  process.env.GOOGLE_CALENDAR_REFRESH_TOKEN?.trim();
const calendarId =
  process.env.GOOGLE_CALENDAR_ID?.trim() || "mariateresarogani@gmail.com";

if (!clientId || !clientSecret || !refresh) {
  console.error("Mancano GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET o il refresh token.");
  process.exit(1);
}

const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refresh,
    client_id: clientId,
    client_secret: clientSecret,
  }),
});
const tokenData = await tokenRes.json();
if (!tokenRes.ok || !tokenData.access_token) {
  console.error("Token OAuth non ottenuto", tokenRes.status, tokenData.error || tokenData);
  process.exit(1);
}

console.log("Access token ottenuto.");
console.log(`token_type=${tokenData.token_type || "Bearer"} expires_in=${tokenData.expires_in ?? "?"}`);

const start = new Date(Date.now() + 2 * 60 * 1000);
const end = new Date(start.getTime() + 15 * 60 * 1000);
const pad = (n) => String(n).padStart(2, "0");
const stamp = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

const insertRes = await fetch(
  `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=none`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: "Tarot Italia · prova sincronizzazione calendario",
      description: "Evento di prova automatico. Viene eliminato subito dopo l’inserimento.",
      start: { dateTime: stamp(start), timeZone: TIMEZONE },
      end: { dateTime: stamp(end), timeZone: TIMEZONE },
      transparency: "opaque",
      status: "confirmed",
    }),
  },
);
const event = await insertRes.json();
if (!insertRes.ok || !event.id) {
  console.error("Creazione evento non riuscita", insertRes.status, event.error || event);
  process.exit(1);
}

console.log(`Evento creato: ${event.id}`);
console.log(`Calendario: ${calendarId}`);
console.log(`Quando: ${event.start?.dateTime || stamp(start)} → ${event.end?.dateTime || stamp(end)}`);

const deleteRes = await fetch(
  `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(event.id)}?sendUpdates=none`,
  {
    method: "DELETE",
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  },
);
if (!deleteRes.ok && deleteRes.status !== 204) {
  console.error("Evento creato ma non eliminato", deleteRes.status, await deleteRes.text());
  process.exit(1);
}

console.log("Evento di prova eliminato. Sincronizzazione Google Calendar ok.");
