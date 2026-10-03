import { siteContent } from "../../data/siteContent.ts";

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’`]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const PATTERNS: RegExp[] = [
  /\b(diagnosi|diagnosticare|prescrizion[ei]|prescrivere|farmac[oi]|psicofarmac|antidepressiv\w*|ansiolitic\w*|chemioterap\w*|radioterap\w*|patolog[iaie]|malattia|tumore|cancro|leucemia|metastasi|ictus|infarto|diabete|epilessia|hiv|aids|vaccin\w*|chirurgic\w*|intervento chirurgico|sintomi clinic|disturbo mental|malattia mental|schizofren\w*|bipolar\w*|psicosi|psicotico|curami|quale cura|dose del farmaco)\b/,
  /\b(porno|pornograf\w*|sesso esplicito|rapporti sessuali espliciti|fellatio|cunnilingus|penetrazion\w*|orgasmo|eiaculaz\w*|masturbaz\w*|parafili\w*|pedofil\w*|incesto|zoofil\w*|necrofil\w*|scatolog\w*)\b/,
  /\b(suicid\w*|uccidermi|ammazzarmi|toglier[mi] la vita|farla finita|non voglio piu vivere|autolesion\w*|tagliarmi le vene|overdose|impiccarmi)\b/,
  /\b(ammazzare|uccidere|stupr\w*|violentare|massacr\w*|torturare|sgozzare|far fuori|omicidio|terrorismo|attentato|costruire una bomba|confezionare un esplosivo|arma da fuoco|hate speech|incitamento all odio|odio razzial\w*|odio etnic\w*|sterminare)\b/,
  /\b(come rubare|come evadere le tasse|riciclaggio di denaro|truffa informatica passo|clonare una carta|hackerare il conto)\b/,
];

export function isIthaQuestionBlocked(question: string) {
  const hay = normalize(question);
  if (!hay) return false;
  return PATTERNS.some((pattern) => pattern.test(hay));
}

export function ithaEthicsMessage() {
  return siteContent.itha.bloccoEtico;
}
