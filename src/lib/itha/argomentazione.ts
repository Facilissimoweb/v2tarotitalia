import { getIthaLama, type IthaLama } from "../../data/ithaLame.ts";
import type { IthaDecode, IthaDecodeRequest } from "./types.ts";

type Theme = "casa" | "lavoro" | "progetto" | "soldi" | "famiglia" | "coppia" | "scelta" | "altro";

type Scene = {
  question: string;
  category: string;
  theme: Theme;
  names: string[];
  who: string;
  whoPrep: string;
  place: string;
  knot: string;
  motion: string;
  detail: string;
  autonomy: boolean;
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

function readTheme(low: string, category: string): Theme {
  if (/conviven|coabit|stesso tetto|stessa casa|casa|spazi|stanze|affitto/.test(low)) return "casa";
  if (/progett/.test(low)) return "progetto";
  if (/lavor|impieg|ufficio|contratto|carriera|capo|colleg/.test(low) || category.toLowerCase().includes("profession")) {
    return "lavoro";
  }
  if (/soldi|debit|stipend|denar|risparm|valore/.test(low)) return "soldi";
  if (/madre|padre|genitor|figl|fratell|sorell|famigl/.test(low)) return "famiglia";
  if (/\bex\b|partner|fidanz|marito|moglie|compagn|coppia|amor/.test(low)) return "coppia";
  if (/scelta|decis|bivio/.test(low)) return "scelta";
  return "altro";
}

export function readScene(question: string, category: string): Scene {
  const q = question.trim();
  const low = q.toLowerCase();
  const theme = readTheme(low, category);
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
            ? "la pressione materiale"
            : theme === "famiglia"
              ? "la dinamica familiare"
              : theme === "coppia"
                ? "la dinamica di coppia"
                : theme === "scelta"
                  ? "la scelta in sospeso"
                  : "questa situazione";
  const extra =
    after(q, /riguardo\s+a\s+([^?]+)/i) ||
    after(q, /nella\s+stessa\s+([^?]+)/i) ||
    after(q, /circa\s+([^?]+)/i);
  const whoPrep = who ? ` con ${who}` : "";
  const knot = extra && extra.length < 70 ? `${place}${whoPrep}` : `${place}${whoPrep}`;
  const motion = /svincol|liber|uscire|tagli|separ|distacc/.test(low)
    ? "il distacco"
    : /gestisc|convive|sopport/.test(low)
      ? "il modo in cui tieni il confine"
      : /evolver|divent|andr/.test(low)
        ? "la direzione di questa dinamica"
        : /scel|decid/.test(low)
          ? "la decisione tenuta in sospeso"
          : "il passaggio che stai chiedendo";
  return {
    question: q,
    category,
    theme,
    names,
    who,
    whoPrep,
    place,
    knot,
    motion,
    detail: extra && extra.length > 12 ? extra : place,
    autonomy: /svincol|liber|uscire|tagli|separ|distacc|autonom|emancip/.test(low),
  };
}

function cardSense(lama: IthaLama | undefined) {
  return {
    luce: humanize(lama?.significato, 2) || "un meccanismo ancora accettato",
    ombra: humanize(lama?.problematica, 2) || "un’abitudine che si finge inevitabile",
    manovra: humanize(lama?.ritualita, 2) || "nominare il confine senza addolcirlo",
  };
}

function joinReading(first: string[], second: string[]) {
  return `${first.join(" ")}\n\n${second.join(" ")}`;
}

function vincoloByTheme(name: string, scene: Scene, luce: string, ombra: string, manovra: string) {
  const other = scene.who || scene.place;
  switch (scene.theme) {
    case "casa":
      return joinReading(
        [
          `${su(scene.knot)}, ${name} non parla di mura in astratto: parla di ${luce}.`,
          `Il tetto in comune resta un campo di forza perché accetti ancora di abitare un equilibrio già chiuso, come se il tempo potesse farlo maturare da solo.`,
          `Dietro ${scene.motion} sta ${ombra}: conti i giorni, i silenzi, i passaggi in cucina, e chiami pazienza ciò che è attaccamento alla fatica già spesa.`,
          `Finché ${scene.detail} viene trattato come una fase agricola e non come un nodo, la catena si allunga.`,
        ],
        [
          `${name} sbatte in faccia la radice: non è ${other} a tenerti ferma, è il patto invisibile con cui giustifichi di restare.`,
          `Ogni abitudine domestica che difendi come «inevitabile» alimenta il meccanismo e ruba misura alla tua libertà.`,
          `La sveglia: nominare con chiarezza dove la casa ha smesso di essere riparo, e ${manovra}. La scelta resta unicamente tua.`,
        ],
      );
    case "progetto":
      return joinReading(
        [
          `${su(scene.knot)}, ${name} inchioda la radice: ${luce}.`,
          `Il lavoro condiviso non è bloccato per sfortuna: resta incastrato perché la direzione viene ancora negoziata al ribasso, in attesa di un via libera che non arriva.`,
          `Dietro ${scene.motion} sta ${ombra}. Continui a investire tempo e credibilità come se il raccolto fosse dovuto, mentre il perimetro del progetto resta opaco.`,
          `Finché ${other} decide il ritmo e tu misuri i frutti, alimenti un patto di dipendenza mascherato da collaborazione.`,
        ],
        [
          `${name} mostra il meccanismo: chiami lealtà al progetto ciò che è paura di perdere il posto al tavolo.`,
          `Il simbolo parla di come stai usando scadenze, mail e riunioni per tenere in vita un equilibrio già stretto.`,
          `La sveglia: vedere chi tiene davvero il timone, e ${manovra}. La scelta resta unicamente tua.`,
        ],
      );
    case "lavoro":
      return joinReading(
        [
          `Nel ${scene.place}${scene.whoPrep}, ${name} sbatte in faccia la radice: ${luce}.`,
          `La tensione professionale non è un destino dell’ufficio: è un meccanismo che continui ad accettare per convenienza, paura o abitudine al ruolo.`,
          `Dietro ${scene.motion} sta ${ombra}. Restare «ragionevole» diventa il modo per non nominare il confine.`,
          `Ogni volta che giustifichi turni, silenzi o incarichi come il prezzo normale, alimenti la catena.`,
        ],
        [
          `Finché ${other} resta la misura della tua legittimità, il presente non si muove.`,
          `${name} parla di come stai spendendo competenza e tempo per tenere in vita un equilibrio già stretto.`,
          `La sveglia: distinguere il lavoro vero dal patto che lo soffoca, e ${manovra}. La scelta resta unicamente tua.`,
        ],
      );
    case "soldi":
      return joinReading(
        [
          `${su(scene.knot)}, ${name} mostra la radice materiale: ${luce}.`,
          `Non è solo una cifra: è il modo in cui il valore viene usato per tenerti ferma, in attesa di una sicurezza che non arriva da sola.`,
          `Dietro ${scene.motion} sta ${ombra}. Continui a contare, a rinviare, a trattare la scarsità come prova di responsabilità.`,
          `Finché ${scene.detail} resta il giudice unico delle tue mosse, il patto invisibile è quello: niente passo senza garanzia.`,
        ],
        [
          `${name} sbatte in faccia il meccanismo: la paura di perdere tiene più del desiderio di disporre.`,
          `Il simbolo parla di come stai usando debiti, risparmi o promesse per non decidere.`,
          `La sveglia: vedere dove il denaro è diventato alibi, e ${manovra}. La scelta resta unicamente tua.`,
        ],
      );
    case "famiglia":
      return joinReading(
        [
          `${su(scene.knot)}, ${name} inchioda il patto familiare: ${luce}.`,
          `Il nodo non è «il carattere di qualcuno»: è un ruolo che continui a recitare per tenere insieme un equilibrio già stretto.`,
          `Dietro ${scene.motion} sta ${ombra}. Le lealtà vecchie pesano più della tua misura presente.`,
          `Ogni volta che giustifichi il silenzio o il sacrificio come dovere, alimenti la catena.`,
        ],
        [
          `${name} mostra che ${other} occupa il centro della tua decisione più di quanto tu ammetta.`,
          `Il simbolo parla di abitudini, sensi di colpa e tempi che non ti appartengono più.`,
          `La sveglia: nominare il ruolo che non vuoi più coprire, e ${manovra}. La scelta resta unicamente tua.`,
        ],
      );
    case "coppia":
      return joinReading(
        [
          `${su(scene.knot)}, ${name} parla della radice affettiva: ${luce}.`,
          `La dinamica resta incastrata perché il legame viene ancora trattato come un terreno da salvare, anche quando il presente è già un compromesso.`,
          `Dietro ${scene.motion} sta ${ombra}. Continui a interpretare segnali, silenzi, ritorni.`,
          `Finché ${other} resta il perno della tua stabilità, alimenti un patto di paura e convenienza.`,
        ],
        [
          `${name} sbatte in faccia il meccanismo: chiami amore ciò che è attesa, e attesa ciò che è rinuncia a te.`,
          `Il simbolo non predice: fotografa come stai usando il cuore per non tagliare.`,
          `La sveglia: vedere il patto per quello che è, e ${manovra}. La scelta resta unicamente tua.`,
        ],
      );
    case "scelta":
      return joinReading(
        [
          `${su(scene.knot)}, ${name} inchioda il bivio: ${luce}.`,
          `Lo stallo non è mancanza di dati: è il rifiuto di pagare il prezzo di una direzione.`,
          `Dietro ${scene.motion} sta ${ombra}. Tieni aperte due strade per non deludere e non perdere.`,
          `Ogni rinvio alimenta la catena e chiama prudenza ciò che è paura della propria misura.`,
        ],
        [
          `${name} mostra che la non-scelta è già una scelta, e sta costando.`,
          `Il simbolo parla di criteri nascosti — convenienza, lealtà, immagine — che tengono fermo il presente.`,
          `La sveglia: portare alla luce un solo criterio e ${manovra}. La scelta resta unicamente tua.`,
        ],
      );
    default:
      return joinReading(
        [
          `${su(scene.knot)}, ${name} mostra la radice: ${luce}.`,
          `La situazione resta incastrata perché quella dinamica è ancora accettata e difesa come fase obbligata.`,
          `Dietro ${scene.motion} sta ${ombra}: non un colpo del caso, un patto che continui a firmare.`,
          `Ogni volta che giustifichi ${scene.detail} come «così è», alimenti la catena.`,
        ],
        [
          `${name} sbatte in faccia il meccanismo: finché ${other} resta il centro della tua misura, il presente non si muove.`,
          `Il simbolo parla di come stai usando tempo, parole e attese per tenere in vita un equilibrio già stretto.`,
          `La sveglia: vedere dove sta il patto invisibile e ${manovra}. La scelta resta unicamente tua.`,
        ],
      );
  }
}

function specchioByTheme(name: string, scene: Scene, luce: string, ombra: string, manovra: string) {
  const other = scene.who || scene.place;
  switch (scene.theme) {
    case "casa":
      return joinReading(
        [
          `Nello specchio del presente, ${name} riflette il tuo modo di abitare ${scene.knot}: ${luce}.`,
          `Non è un giudizio: è la fotografia di come ti muovi tra stanze, orari e silenzi, in attesa che sia ${other} o le circostanze a sbloccare la soglia.`,
          `Il riflesso dice che stai spendendo energie a sopportare la vicinanza, non a disporre ${scene.motion}.`,
          `Si vede ${ombra}: un limbo domestico che si maschera da rispetto, da «non fare scene», da tempo concesso.`,
        ],
        [
          `La stasi non è protezione. È tempo regalato a un passato che continua a lasciare le chiavi sul tavolo.`,
          `Finché il presente serve a far convivere ciò che è già chiuso, lo specchio resterà lo stesso.`,
          `La sveglia: riconoscere che questa attesa è già una scelta, e ${manovra}. La responsabilità resta tua.`,
        ],
      );
    case "progetto":
      return joinReading(
        [
          `Nello specchio del presente, ${name} mostra come stai tenendo ${scene.knot}: ${luce}.`,
          `Ti muovi da chi aspetta il via, ricalcola, adatta il proprio passo a ${other}, e chiama professionalità ciò che è tentennamento.`,
          `Il riflesso è chiaro: le energie vanno a tenere in piedi la collaborazione, non a chiarire ${scene.motion}.`,
          `Si vede ${ombra}: riunioni che ripetono lo stesso nodo, parole caute, scadenze che slittano senza un taglio.`,
        ],
        [
          `La stasi del progetto non è strategia. È un tempo che stai regalando a un equilibrio già opaco.`,
          `Finché aspetti che ${other} definisca il campo, lo specchio resta fermo.`,
          `La sveglia: vedere il tentennamento senza giustificarlo, e ${manovra}. La responsabilità resta tua.`,
        ],
      );
    case "lavoro":
      return joinReading(
        [
          `Nello specchio del presente, ${name} riflette il tuo atteggiamento ${su(scene.knot)}: ${luce}.`,
          `Reggi carichi, silenzi, ruoli che non hai scelto fino in fondo, e aspetti che il sistema si corregga da solo.`,
          `Il riflesso dice che stai investendo competenza a sopportare, non a disporre ${scene.motion}.`,
          `Si vede ${ombra}: prudenza che copre la paura di perdere faccia, posto, stima.`,
        ],
        [
          `La stasi professionale non è protezione. È un tempo regalato a una gerarchia che non si muove.`,
          `Finché il presente serve a «non scontentare», lo specchio resta lo stesso.`,
          `La sveglia: nominare il tentennamento di adesso, e ${manovra}. La responsabilità resta tua.`,
        ],
      );
    case "soldi":
      return joinReading(
        [
          `Nello specchio del presente, ${name} mostra come stai reggendo ${scene.knot}: ${luce}.`,
          `Conti, rinvii, tieni due conti in testa, e aspetti una svolta materiale che dovrebbe arrivare da fuori.`,
          `Il riflesso dice che l’energia va a contenere l’ansia, non a disporre ${scene.motion}.`,
          `Si vede ${ombra}: controllo stretto che si finge saggezza.`,
        ],
        [
          `La stasi economica non è prudenza pura. È un tempo in cui il valore decide al posto tuo.`,
          `Finché aspetti la cifra giusta per muoverti, lo specchio resta fermo.`,
          `La sveglia: vedere dove il rinvio è già una scelta, e ${manovra}. La responsabilità resta tua.`,
        ],
      );
    case "famiglia":
      return joinReading(
        [
          `Nello specchio del presente, ${name} riflette il ruolo che stai recitando in ${scene.knot}: ${luce}.`,
          `Media, taci, assorbi, e aspetti che ${other} cambi tono o direzione.`,
          `Il riflesso dice che spendi energie a tenere insieme il quadro, non a disporre ${scene.motion}.`,
          `Si vede ${ombra}: lealtà che copre la rinuncia a una misura propria.`,
        ],
        [
          `La stasi familiare non è pace. È un tempo regalato a un copione già scritto.`,
          `Finché il presente serve a non deludere, lo specchio resta lo stesso.`,
          `La sveglia: vedere il tentennamento senza colpevolizzarti, e ${manovra}. La responsabilità resta tua.`,
        ],
      );
    case "coppia":
      return joinReading(
        [
          `Nello specchio del presente, ${name} mostra l’atteggiamento in atto ${su(scene.knot)}: ${luce}.`,
          `Interpreti, aspetti, addolcisci, e lasci che sia ${other} a dare il tempo della svolta.`,
          `Il riflesso dice che le energie vanno a tenere il legame in vita, non a disporre ${scene.motion}.`,
          `Si vede ${ombra}: un limbo affettivo che si maschera da pazienza.`,
        ],
        [
          `La stasi non è cura. È un tempo regalato a un passato che continua a occupare il letto e il linguaggio.`,
          `Finché aspetti un segnale esterno, lo specchio resta fermo.`,
          `La sveglia: riconoscere che questa attesa è già una scelta, e ${manovra}. La responsabilità resta tua.`,
        ],
      );
    default:
      return joinReading(
        [
          `Nello specchio del presente, ${name} riflette l’atteggiamento in atto ${su(scene.knot)}: ${luce}.`,
          `Non è un giudizio morale: è la fotografia di resistenze e tentennamenti di adesso.`,
          `Il riflesso dice che stai spendendo energie a reggere ${other}, più che a disporre ${scene.motion}.`,
          `Si vede ${ombra}: uno stallo che si maschera da prudenza.`,
        ],
        [
          `La stasi non è protezione. È tempo regalato a un equilibrio già chiuso.`,
          `Finché aspetti che le circostanze sblocchino ${scene.detail}, lo specchio resta lo stesso.`,
          `La sveglia: riconoscere che questa attesa è già una scelta, e ${manovra}. La responsabilità resta tua.`,
        ],
      );
  }
}

function sogliaByTheme(name: string, scene: Scene, luce: string, ombra: string, manovra: string) {
  const other = scene.who ? ` con ${scene.who}` : "";
  const noSoft = scene.autonomy
    ? `La soglia, ${su(scene.knot)}, indica la via d’uscita e non prevede cooperazioni o compromessi${other} che smontano la tua misura.`
    : `La soglia, ${su(scene.knot)}, indica la via d’uscita: non un accomodamento che lascia intatto il vecchio patto.`;
  switch (scene.theme) {
    case "casa":
      return joinReading(
        [
          noSoft,
          `${name} è il segno: ${luce}.`,
          `La direzione è riprendere il controllo logico e pratico degli spazi — chiavi, tempi, stanze, indirizzo — senza cercare un modo morbido di «far convivere» ciò che è già chiuso.`,
          `Ciò che teneva in vita lo stallo, ${ombra}, non può fare da bussola al passaggio.`,
        ],
        [
          `Resta da mettere nero su bianco i confini materiali e le parole, e ${manovra}.`,
          `${scene.motion.charAt(0).toUpperCase()}${scene.motion.slice(1)} non arriva da un accordo gentile sul divano.`,
          `La scelta e la forza di tagliare appartengono unicamente a te.`,
        ],
      );
    case "progetto":
      return joinReading(
        [
          noSoft,
          `${name} è il segno: ${luce}.`,
          `La direzione è chiarire perimetro, responsabilità e ritmo di ${scene.place}${other}, senza inseguire un compromesso che lascia a ${scene.who || "l’altro"} il timone.`,
          `Ciò che teneva lo stallo, ${ombra}, non può restare il criterio delle prossime mosse.`,
        ],
        [
          `Resta da mettere nero su bianco chi decide cosa, e ${manovra}.`,
          `${scene.motion.charAt(0).toUpperCase()}${scene.motion.slice(1)} passa da una parola secca sul campo, non da un’altra riunione diluita.`,
          `La scelta e la forza di tagliare appartengono unicamente a te.`,
        ],
      );
    case "lavoro":
      return joinReading(
        [
          noSoft,
          `${name} è il segno: ${luce}.`,
          `La direzione è riprendere la misura del proprio ruolo: cosa tieni, cosa non negozi più, quali parole vanno dette senza appello.`,
          `Ciò che teneva lo stallo, ${ombra}, non è una strategia sostenibile.`,
        ],
        [
          `Resta da fissare un confine professionale concreto, e ${manovra}.`,
          `${scene.motion.charAt(0).toUpperCase()}${scene.motion.slice(1)} non arriverà da una promozione improvvisa né da un capo improvvisamente lucido.`,
          `La scelta e la forza di tagliare appartengono unicamente a te.`,
        ],
      );
    case "soldi":
      return joinReading(
        [
          noSoft,
          `${name} è il segno: ${luce}.`,
          `La direzione è riprendere il controllo lucido delle cifre e dei tempi, senza aspettare che la paura scenda da sola.`,
          `Ciò che teneva lo stallo, ${ombra}, non può restare il giudice.`,
        ],
        [
          `Resta da mettere nero su bianco uscite, debiti, soglie, e ${manovra}.`,
          `${scene.motion.charAt(0).toUpperCase()}${scene.motion.slice(1)} passa da una decisione materiale, non da un’altra attesa.`,
          `La scelta e la forza di tagliare appartengono unicamente a te.`,
        ],
      );
    case "famiglia":
      return joinReading(
        [
          noSoft,
          `${name} è il segno: ${luce}.`,
          `La direzione è uscire dal ruolo che ti tiene inchiodata, senza cercare un compromesso che salva il copione e sacrifica te.`,
          `Ciò che teneva lo stallo, ${ombra}, non è lealtà: è un patto vecchio.`,
        ],
        [
          `Resta da nominare il confine a voce alta, e ${manovra}.`,
          `${scene.motion.charAt(0).toUpperCase()}${scene.motion.slice(1)} non chiede il permesso del tavolo di famiglia.`,
          `La scelta e la forza di tagliare appartengono unicamente a te.`,
        ],
      );
    case "coppia":
      return joinReading(
        [
          noSoft,
          `${name} è il segno: ${luce}.`,
          `La direzione è una chiarezza affettiva secca: parole, tempi, corpo, casa — senza «provare ancora un po’» per non fare del male.`,
          `Ciò che teneva lo stallo, ${ombra}, non può fare da bussola.`,
        ],
        [
          `Resta da comunicare senza appello, e ${manovra}.`,
          `${scene.motion.charAt(0).toUpperCase()}${scene.motion.slice(1)} non si negozia al ribasso per tenere in vita un passato.`,
          `La scelta e la forza di tagliare appartengono unicamente a te.`,
        ],
      );
    default:
      return joinReading(
        [
          noSoft,
          `${name} è il segno: ${luce}.`,
          `La direzione è riprendere in mano il controllo lucido e pratico di ${scene.detail}, senza soluzioni morbide.`,
          `Ciò che teneva lo stallo, ${ombra}, non può essere la bussola.`,
        ],
        [
          `Resta da mettere nero su bianco i confini, e ${manovra}.`,
          `${scene.motion.charAt(0).toUpperCase()}${scene.motion.slice(1)} non arriva da fuori.`,
          `La scelta e la forza di tagliare appartengono unicamente a te.`,
        ],
      );
  }
}

function lamaOf(input: IthaDecodeRequest, position: IthaDecodeRequest["cards"][number]["position"]) {
  const card = input.cards.find((item) => item.position === position);
  return {
    name: card?.name ?? "una carta del mazzo",
    lama: card ? getIthaLama(card.id) : undefined,
  };
}

export function buildIthaArgomentazione(input: IthaDecodeRequest): IthaDecode {
  const scene = readScene(input.question, input.category);
  const vincolo = lamaOf(input, "vincolo");
  const specchio = lamaOf(input, "specchio");
  const soglia = lamaOf(input, "soglia");
  const a = cardSense(vincolo.lama);
  const b = cardSense(specchio.lama);
  const c = cardSense(soglia.lama);
  return {
    analisi: vincoloByTheme(vincolo.name, scene, a.luce, a.ombra, a.manovra),
    coerenza: specchioByTheme(specchio.name, scene, b.luce, b.ombra, b.manovra),
    spunto: sogliaByTheme(soglia.name, scene, c.luce, c.ombra, c.manovra),
  };
}
