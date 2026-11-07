/**
 * Ping orario del Guardiano (piano Vercel Hobby: niente cron nativi).
 * Uso: OPS_SENTINEL_SECRET=... node scripts/ops-sentinel-ping.mjs
 */
const url = (process.env.OPS_SENTINEL_URL || "https://www.tarotitalia.com/api/ops-sentinel").trim();
const secret = process.env.OPS_SENTINEL_SECRET?.trim();

if (!secret) {
  console.error("Manca OPS_SENTINEL_SECRET.");
  process.exit(1);
}

const res = await fetch(url, {
  method: "GET",
  headers: { Authorization: `Bearer ${secret}`, Accept: "application/json" },
  signal: AbortSignal.timeout(20_000),
});

const body = await res.text();
if (res.status === 401 || res.status === 404 || (res.status >= 500 && res.status !== 503)) {
  console.error(`Guardiano irraggiungibile HTTP ${res.status}`);
  console.error(body.slice(0, 400));
  process.exit(1);
}

console.log(body);
process.exit(0);
