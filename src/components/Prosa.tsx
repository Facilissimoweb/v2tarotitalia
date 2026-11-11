import type { ReactNode } from "react";

/**
 * Frasi già scritte nei testi del sito. Il peso le marca, senza aggiungere parole.
 * Le più lunghe vengono prima, così non si spezzano su un frammento più corto.
 */
const PARTI_SALIENTI = [
  "Nessuna consulenza costituisce parere medico, sanitario o legale.",
  "non sostituisce pareri o trattamenti medici, psicologici, sanitari, legali o finanziari",
  "non sono pareri né trattamenti medici, psicologici, sanitari, legali o finanziari",
  "non descrive un futuro fatalmente già scritto",
  "non sostituisce pareri medici, sanitari o legali",
  "senza giudizio né risposte imposte",
  "le decisioni restano di chi consulta",
  "rispetto e sulla verità dei sentimenti",
  "introspettiva e di crescita personale",
  "senza affidarmi a significati automatici",
  "non formula risposte deterministiche",
  "questioni concrete e quotidiane",
  "Tecniche della Comunicazione Visiva",
  "Accademia di Belle Arti di Macerata",
  "composizione, colore e simboli",
  "trama simbolica",
  "Tecnica Grafica",
  "Mariangela Aggio",
  "Dorian Bones",
  "Mikao Usui",
  "Mindfulness Educators",
  "Future Academy",
  "Emiliano Amici",
  "volumi ufficiali",
  "acquisti confermati",
  "22 chiavi",
  "Venticinque spread",
  "solo la sua risposta conferma la prenotazione",
  "risposta esplicita su WhatsApp",
  "chiamata vocale WhatsApp",
  "senza aspettative rigide",
  "Arcani Maggiori e Minori",
  "sistema di immagini e simboli",
  "senza trasformarle in verità assolute",
  "tarologa, cartomante e ricercatrice esoterica",
  "Maria Teresa Rogani (Teresa)",
  "Percorsi di Armonizzazione",
  "non per oracolo automatico",
  "I cookie necessari",
  "due livelli di lettura",
  "significati tradizionali",
  "la direzione resta tua",
  "le scelte restano tue",
  "senza imporre risposte",
  "linguaggio simbolico",
  "senza videochiamata",
  "la trama quotidiana",
  "separa il vero dal falso",
  "accoglie la relazione",
  "fuoco della volontà",
  "cicli di tensione",
  "stallo emotivo",
  "senza forzature",
  "privo di giudizio",
  "senza giudizio",
  "Dalle ore 19:00",
  "Dopo le 19:00",
  "accedere o registrarsi",
  "Area riservata",
  "area riservata",
  "area privata",
  "Arcani Maggiori",
  "realtà tangibile",
  "Maria Teresa Rogani",
  "elementi essenziali",
  "temi ricorrenti",
  "possibili direzioni",
  "domanda specifica",
  "Via Crispi 37",
  "Macerata",
  "Legge 14 gennaio 2013, n. 4",
] as const;

const PATTERN = new RegExp(
  `(${PARTI_SALIENTI.slice()
    .sort((a, b) => b.length - a.length)
    .map((parte) => parte.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})`,
  "g",
);

const SALIENTI = new Set<string>(PARTI_SALIENTI);

/** Più peso sulle parti salienti. Il resto del testo resta com’è. */
export function conPeso(testo: string): ReactNode[] {
  if (!testo) return [testo];
  PATTERN.lastIndex = 0;
  if (!PATTERN.test(testo)) return [testo];
  PATTERN.lastIndex = 0;
  return testo.split(PATTERN).map((pezzo, i) =>
    SALIENTI.has(pezzo) ? (
      <strong key={`${i}-${pezzo.slice(0, 24)}`} className="font-bold">
        {pezzo}
      </strong>
    ) : (
      pezzo
    ),
  );
}

/**
 * Nella lettura di una carta, la prima frase porta il senso.
 * Il seguito resta leggibile, con le stesse parti salienti.
 */
export function primaFrase(testo: string): ReactNode[] {
  const stacco = testo.match(/^(.+?[.!?])\s+(\S[\s\S]*)$/);
  if (!stacco) return conPeso(testo);
  return [
    <strong key="tesi" className="font-bold">
      {stacco[1]}
    </strong>,
    " ",
    ...conPeso(stacco[2]),
  ];
}

/** Prima frase, oppure il primo inciso se il testo è un solo respiro. */
export function apertura(testo: string): ReactNode[] {
  const frase = primaFrase(testo);
  if (frase.length > 1) return frase;
  const taglio = testo.indexOf(",");
  if (taglio < 18 || taglio > 120) return frase;
  return [
    <strong key="apertura" className="font-bold">
      {testo.slice(0, taglio)}
    </strong>,
    ...conPeso(testo.slice(taglio)),
  ];
}
