export const CONSENT_KEY = "tarot-italia-cookie-consent";
export const CONSENT_TTL_MS = 24 * 60 * 60 * 1000;

export type CookiePrefs = {
  necessary: true;
  stats: boolean;
  prefs: boolean;
};

export type ConsentRecord = CookiePrefs & {
  firstSeenAt: number;
  decided: boolean;
  decidedAt: number | null;
};

function emptyRecord(now = Date.now()): ConsentRecord {
  return {
    necessary: true,
    stats: false,
    prefs: false,
    firstSeenAt: now,
    decided: false,
    decidedAt: null,
  };
}

export function readConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (typeof parsed.firstSeenAt !== "number") return null;
    return {
      necessary: true,
      stats: Boolean(parsed.stats),
      prefs: Boolean(parsed.prefs),
      firstSeenAt: parsed.firstSeenAt,
      decided: Boolean(parsed.decided),
      decidedAt: typeof parsed.decidedAt === "number" ? parsed.decidedAt : null,
    };
  } catch {
    return null;
  }
}

export function writeConsent(record: ConsentRecord) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
}

export function ensureFirstSeen(): ConsentRecord {
  const existing = readConsent();
  if (existing) return existing;
  const created = emptyRecord();
  writeConsent(created);
  return created;
}

export function shouldPromptConsent(record: ConsentRecord, now = Date.now()): boolean {
  if (!record.decided) return true;
  const from = record.decidedAt ?? record.firstSeenAt;
  return now - from >= CONSENT_TTL_MS;
}

export function saveConsentDecision(prefs: Pick<CookiePrefs, "stats" | "prefs">): ConsentRecord {
  const prev = readConsent() ?? emptyRecord();
  const now = Date.now();
  const next: ConsentRecord = {
    necessary: true,
    stats: prefs.stats,
    prefs: prefs.prefs,
    firstSeenAt: prev.firstSeenAt,
    decided: true,
    decidedAt: now,
  };
  writeConsent(next);
  return next;
}
