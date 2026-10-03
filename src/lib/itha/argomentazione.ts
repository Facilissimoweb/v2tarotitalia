import { getIthaLama, type IthaLama } from "../../data/ithaLame.ts";
import { siteContent } from "../../data/siteContent.ts";
import type { IthaDecode, IthaDecodeRequest } from "./types.ts";

type Theme = "casa" | "lavoro" | "progetto" | "soldi" | "famiglia" | "coppia" | "scelta" | "ostili" | "altro";

type Scene = {
  question: string;
  category: string;
  categoryId: string;
  theme: Theme;
  names: string[];
  who: string;
  whoPrep: string;
  place: string;
  knot: string;
  motion: string;
  detail: string;
};

const NAME_STOP = new Set([
  "Come",
  "Cosa",
  "Perché",
  "Perche",
  "Quale",
  "Quando",
  "Dove",
  "Chi",
  "Il",
  "La",
  "Lo",
  "Gli",
  "Le",
  "Un",
  "Una",
  "Uno",
  "Mi",
  "Che",
  "Con",
  "Nella",
  "Nello",
  "Nel",
  "Questa",
  "Questo",
  "Queste",
  "Questi",
  "Vorrei",
  "Posso",
  "Devo",
  "Per",
  "Tra",
  "Fra",
  "Dal",
  "Dalla",
  "Sulla",
  "Sul",
  "Mia",
  "Mio",
  "Miei",
  "Mie",
  "Sua",
  "Suo",
  "Itha",
  "Crocicchio",
]);

function humanize(text: string | undefined, clauses = 2) {
  if (!text) return "";
  const stripped = text
    .replace(/\([^)]*\)/g, " ")
    .replace(
      /\b(Fuoco|Aria|Acqua|Terra|Venere|Marte|Saturno|Plutone|Nettuno|Mercurio|Giove|Urano|Sole|Luna|Ariete|Toro|Gemelli|Leone)(\/\w+)?\b/gi,
      " ",
    )
    .replace(/\s{2,}/g, " ")
    .trim();
  const sentence = stripped.split(/[.!?]/)[0]?.trim() ?? stripped;
  const piece = sentence.split(",").slice(0, clauses).join(", ").replace(/\s{2,}/g, " ").trim();
  if (!piece) return "";
  return piece.charAt(0).toLowerCase() + piece.slice(1);
}

function extractNames(question: string) {
  return [...question.matchAll(/\b([A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ']{2,})\b/g)]
    .map((match) => match[1])
    .filter((name) => !NAME_STOP.has(name));
}

function after(question: string, pattern: RegExp) {
  const match = question.match(pattern);
  return match?.[1]?.replace(/[?.!]+$/g, "").trim() ?? "";
}

function su(phrase: string) {
  if (phrase.startsWith("il ")) return `sul ${phrase.slice(3)}`;
  if (phrase.startsWith("la ")) return `sulla ${phrase.slice(3)}`;
  if (phrase.startsWith("lo ")) return `sullo ${phrase.slice(3)}`;
  if (phrase.startsWith("l’") || phrase.startsWith("l'")) return `sull’${phrase.slice(2)}`;
  if (phrase.startsWith("gli ")) return `sugli ${phrase.slice(4)}`;
  if (phrase.startsWith("i ")) return `sui ${phrase.slice(2)}`;
  if (phrase.startsWith("le ")) return `sulle ${phrase.slice(3)}`;
  return `su ${phrase}`;
}

function resolveCampo(category: string, categoryId?: string) {
  const campi = siteContent.itha.campi;
  return campi.find((item) => item.id === categoryId || item.titolo === category);
}

function readTheme(low: string, category: string, categoryId?: string): Theme {
  const campo = resolveCampo(category, categoryId);
  const id = campo?.id ?? categoryId ?? "";
  const cat = `${category} ${id}`.toLowerCase();

  if (id === "professione" || cat.includes("profession") || cat.includes("progett")) {
    if (/progett/.test(low)) return "progetto";
    return "lavoro";
  }
  if (id === "risorse" || cat.includes("risorse") || cat.includes("valore")) return "soldi";
  if (id === "relazioni" || cat.includes("relazion") || cat.includes("affettiv")) {
    if (/madre|padre|genitor|figl|fratell|sorell|famigl/.test(low)) return "famiglia";
    if (/conviven|coabit|stesso tetto|stessa casa/.test(low)) return "casa";
    return "coppia";
  }
  if (id === "ostili" || cat.includes("ostil") || cat.includes("interferenz")) return "ostili";
  if (id === "transizioni" || cat.includes("transizion") || cat.includes("scelte")) return "scelta";

  if (/conviven|coabit|stesso tetto|stessa casa|casa|spazi|stanze|affitto/.test(low)) return "casa";
  if (/progett/.test(low)) return "progetto";
  if (/lavor|impieg|ufficio|contratto|carriera|capo|colleg/.test(low)) return "lavoro";
  if (/soldi|debit|stipend|denar|risparm|valore/.test(low)) return "soldi";
  if (/madre|padre|genitor|figl|fratell|sorell|famigl/.test(low)) return "famiglia";
  if (/\bex\b|partner|fidanz|marito|moglie|compagn|coppia|amor/.test(low)) return "coppia";
  if (/scelta|decis|bivio/.test(low)) return "scelta";
  if (/ostil|interfer|pressione|mobbing|invid/.test(low)) return "ostili";
  return "altro";
}

export function readScene(question: string, category: string, categoryId?: string): Scene {
  const q = question.trim();
  const low = q.toLowerCase();
  const campo = resolveCampo(category, categoryId);
  const theme = readTheme(low, category, categoryId);
  const names = extractNames(q);
  const who = names[0]
    ? names[0]
    : /\bex\b|ex conviv|ex partner|ex marit|ex moglie/.test(low)
      ? "l’ex"
      : /capo|datore/.test(low)
        ? "il capo"
        : /colleg/.test(low)
          ? "i colleghi"
          : /partner|fidanz|marito|moglie|compagn/.test(low)
            ? "il partner"
            : /madre|padre|genitor|figl|fratell|sorell/.test(low)
              ? "il nucleo familiare"
              : "";
  const place =
    theme === "casa"
      ? /conviven|coabit|stesso tetto/.test(low)
        ? "la convivenza ancora condivisa"
        : "gli spazi della casa"
      : theme === "progetto"
        ? "il progetto in corso"
        : theme === "lavoro"
          ? "il contesto professionale"
          : theme === "soldi"
            ? "il campo del valore"
            : theme === "famiglia"
              ? "la dinamica familiare"
              : theme === "coppia"
                ? "la dinamica di coppia"
                : theme === "scelta"
                  ? "la scelta in sospeso"
                  : theme === "ostili"
                    ? "il campo delle interferenze"
                    : "questa situazione";
  const extra =
    after(q, /riguardo\s+a\s+([^?]+)/i) ||
    after(q, /nella\s+stessa\s+([^?]+)/i) ||
    after(q, /circa\s+([^?]+)/i);
  const whoPrep = who ? ` con ${who}` : "";
  const knot = extra && extra.length < 70 ? `${place}${whoPrep}` : `${place}${whoPrep}`;
  const motion = /svincol|liber|uscire|tagli|separ|distacc/.test(low)
    ? "il passaggio di distacco"
    : /gestisc|convive|sopport/.test(low)
      ? "il movimento del confine"
      : /evolver|divent|andr/.test(low)
        ? "la direzione di questa dinamica"
        : /scel|decid/.test(low)
          ? "la decisione in corso"
          : "il passaggio che si sta chiedendo";
  return {
    question: q,
    category: campo?.titolo ?? category,
    categoryId: campo?.id ?? categoryId ?? "",
    theme,
    names,
    who,
    whoPrep,
    place,
    knot,
    motion,
    detail: extra && extra.length > 12 ? extra : place,
  };
}

function softenArchive(text: string, fallback: string) {
  if (!text) return fallback;
  if (
    /colpa|avidit|pigriz|schiavit|tossic|egoismo|spietat|umiliazione|condanna|patolog|inquisit|moralism/i.test(
      text,
    )
  ) {
    return fallback;
  }
  return text;
}

function cardSense(lama: IthaLama | undefined) {
  return {
    luce: softenArchive(humanize(lama?.significato, 2), "un movimento ancora in corso"),
    ombra: softenArchive(humanize(lama?.problematica, 2), "una sfumatura del simbolo"),
    manovra: softenArchive(humanize(lama?.ritualita, 2), "accogliere la direzione della carta"),
  };
}

function joinReading(first: string[], second: string[]) {
  return `${first.join(" ")}\n\n${second.join(" ")}`;
}

function lens(scene: Scene) {
  return `Nell’ambito «${scene.category}»`;
}

function trustClose() {
  return "Fiducia, misura ed equilibrio restano tuoi. La scelta e la responsabilità appartengono unicamente a te.";
}

function openClose(manovra: string, rest = trustClose()) {
  return `Da qui può aprirsi una direzione più chiara: ${manovra}. ${rest}`;
}

function fieldNote(scene: Scene) {
  switch (scene.theme) {
    case "casa":
      return `${su(scene.knot)}, tra gli spazi e i tempi della casa`;
    case "progetto":
      return `${su(scene.knot)}, sul ritmo e il perimetro del progetto`;
    case "lavoro":
      return `${su(scene.knot)}, nel contesto professionale`;
    case "soldi":
      return `${su(scene.knot)}, sul valore e le risorse`;
    case "famiglia":
      return `${su(scene.knot)}, nella dinamica familiare`;
    case "coppia":
      return `${su(scene.knot)}, nella vicinanza affettiva`;
    case "scelta":
      return `${su(scene.knot)}, sul bivio in corso`;
    case "ostili":
      return `${su(scene.knot)}, nel campo delle interferenze`;
    default:
      return su(scene.knot);
  }
}

function vincoloByTheme(name: string, scene: Scene, luce: string, manovra: string) {
  return joinReading(
    [
      `${lens(scene)}, ${fieldNote(scene)}, ${name} accoglie il presente e lo illumina: ${luce}.`,
      `Non è un destino: è un’apertura al nuovo, fedele al simbolo estratto, senza valori altri.`,
      `La carta guarda ${scene.place}${scene.whoPrep} con serenità e naturalezza.`,
      `Intorno a ${scene.motion} il simbolo offre una sfumatura chiara, non una diagnosi.`,
    ],
    [
      `${name} resta sul fatto concreto e sulla voce della carta, senza interpretare il carattere di chi interroga.`,
      `Si apre uno spazio di riflessione, rispettoso e luminoso.`,
      openClose(manovra),
    ],
  );
}

function specchioByTheme(name: string, scene: Scene, luce: string, manovra: string) {
  return joinReading(
    [
      `${lens(scene)}, nello specchio del presente, ${name} riflette delicatamente ${fieldNote(scene)}: ${luce}.`,
      `Si vedono movimenti, pause e sfumature, in un clima di rispetto e ascolto.`,
      `Il riflesso è chiaro e familiare: ${scene.place}${scene.whoPrep} appare così com’è adesso, senza giudizio.`,
      `Accoglienza, positività e ottimismo tengono il campo, anche dove il passo è lento.`,
    ],
    [
      `${name} non smaschera: accompagna. La carta mostra il presente e lascia intera la tua misura.`,
      `Da questa chiarezza può nascere un respiro più largo.`,
      openClose(manovra, "Hai già la chiarezza per accoglierla."),
    ],
  );
}

function sogliaByTheme(name: string, scene: Scene, luce: string, manovra: string) {
  return joinReading(
    [
      `La Soglia, ${fieldNote(scene)}, apre luminosa a una nuova consapevolezza.`,
      `${name} è il segno: ${luce}.`,
      `La direzione è visibile, senza imposizione: fiducia, misura ed equilibrio sostengono il passaggio.`,
      `Il simbolo non decide al posto tuo: offre un orizzonte più chiaro su ${scene.detail}.`,
    ],
    [
      `Resta da lasciare che questa consapevolezza si posi, e ${manovra}.`,
      `${scene.motion.charAt(0).toUpperCase()}${scene.motion.slice(1)} può aprirsi con naturalezza.`,
      trustClose(),
    ],
  );
}

function lamaOf(input: IthaDecodeRequest, position: IthaDecodeRequest["cards"][number]["position"]) {
  const card = input.cards.find((item) => item.position === position);
  return {
    name: card?.name ?? "una carta del mazzo",
    lama: card ? getIthaLama(card.id) : undefined,
  };
}

export function buildIthaArgomentazione(input: IthaDecodeRequest): IthaDecode {
  const scene = readScene(input.question, input.category, input.categoryId);
  const vincolo = lamaOf(input, "vincolo");
  const specchio = lamaOf(input, "specchio");
  const soglia = lamaOf(input, "soglia");
  const a = cardSense(vincolo.lama);
  const b = cardSense(specchio.lama);
  const c = cardSense(soglia.lama);
  return {
    analisi: vincoloByTheme(vincolo.name, scene, a.luce, a.manovra),
    coerenza: specchioByTheme(specchio.name, scene, b.luce, b.manovra),
    spunto: sogliaByTheme(soglia.name, scene, c.luce, c.manovra),
  };
}
