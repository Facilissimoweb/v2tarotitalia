/**
 * Scelta della voce di sistema più naturale, senza servizi esterni.
 * Privilegia le varianti neurali già installate (Windows Natural, Apple Premium,
 * Google di rete, Android network) e scarta le compatte quando ce n’è una migliore.
 */

export type SpeechVoiceInfo = {
  name: string;
  lang: string;
  voiceURI?: string;
  localService?: boolean;
  default?: boolean;
};

const NATURAL =
  /natural|neural|wavenet|premium|enhanced|online|network|google|elsa|isabella|diego|emma|federica|luca/;

function identity(voice: SpeechVoiceInfo) {
  return `${voice.name} ${voice.voiceURI ?? ""}`.toLowerCase();
}

function localeScore(voiceLang: string, wanted: string) {
  const lang = voiceLang.replace(/_/g, "-").toLowerCase();
  const target = wanted.replace(/_/g, "-").toLowerCase();
  const prefix = target.slice(0, 2);
  if (!prefix || !lang.startsWith(prefix)) return -1;
  if (lang === target) return 40;
  if (target.startsWith(`${prefix}-`) && lang === prefix) return 16;
  if (lang.startsWith(`${prefix}-`)) return 28;
  return 12;
}

export function scoreSpeechVoice(voice: SpeechVoiceInfo, lang: string) {
  const locale = localeScore(voice.lang, lang);
  if (locale < 0) return Number.NEGATIVE_INFINITY;

  const id = identity(voice);
  let score = locale;

  if (/natural|neural|wavenet/.test(id)) score += 80;
  if (/premium|enhanced/.test(id)) score += 55;
  if (/online/.test(id)) score += 35;
  if (/network/.test(id)) score += 30;
  if (/google/.test(id)) score += 28;
  if (/elsa|isabella|emma|federica/.test(id)) score += 16;
  if (/diego|luca/.test(id)) score += 10;
  if (/\balice\b/.test(id) && !/premium|enhanced|natural|neural/.test(id)) score -= 8;

  if (/compact|espeak|festival|zarvox|bad news|whisper|trinoids|boing/.test(id)) score -= 60;
  if (/-local\b/.test(id)) score -= 22;
  if (voice.localService === false && /google|natural|neural|online|network/.test(id)) score += 18;
  if (voice.default) score += 1;

  return score;
}

export function selectSpeechVoice<T extends SpeechVoiceInfo>(voices: readonly T[], lang: string): T | undefined {
  let best: T | undefined;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const voice of voices) {
    const score = scoreSpeechVoice(voice, lang);
    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }
  return best;
}

export function isNaturalSpeechVoice(voice: SpeechVoiceInfo | undefined) {
  if (!voice) return false;
  return NATURAL.test(identity(voice));
}
