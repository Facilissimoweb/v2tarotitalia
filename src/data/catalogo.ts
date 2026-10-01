export const TARIFFE = [
  {
    id: "focus" as const,
    name: "Consulto Diretto",
    kicker: "Focalizzazione",
    minutes: 30,
    price: 40,
    summary:
      "Disamina puntuale di una singola questione nevralgica — relazionale, lavorativa o decisionale.",
    details:
      "Sintesi audio e, su richiesta, report PDF sintetico inviato su WhatsApp al termine della sessione.",
  },
  {
    id: "deep" as const,
    name: "Sessione Madre",
    kicker: "Percorso completo",
    minutes: 60,
    price: 70,
    summary:
      "Analisi completa di stasi evolutiva, croce celtica integrata e dialogo archetipico.",
    details:
      "Esplorazione della griglia archetipica, transiti e report PDF esteso su WhatsApp.",
  },
];

export type TariffaId = (typeof TARIFFE)[number]["id"];

export const CORSI = [
  {
    id: "trattato",
    kicker: "Volume accademico",
    title: "Trattato degli Arcani Maggiori — Volume I",
    pages: "142 pag.",
    size: "PDF · 24 pagine di estratto",
    file: "/corsi/trattato-arcani-maggiori.txt",
    filename: "Trattato_Arcani_Maggiori_I.txt",
    blurb:
      "Edizione annotata: simbologie ermetiche, geometrie auree e le 22 chiavi iconologiche del mazzo marsigliese.",
    kind: "pdf" as const,
  },
  {
    id: "ermeneutica",
    kicker: "Masterclass audio + teoria",
    title: "L'Ermeneutica della Luce & Ombra",
    pages: "6 lezioni",
    size: "Audio + PDF · 18 min anteprima",
    file: "/corsi/ermeneutica-luce-ombra.txt",
    filename: "Masterclass_Luce_Ombra.txt",
    audio: "/corsi/lezione-01-velo-di-maya.wav",
    blurb:
      "Sei lezioni sul chiaroscuro oracolare, registrate in acustica raccolta. Anteprima: Il velo di Maya.",
    kind: "audio" as const,
  },
  {
    id: "taccuino",
    kicker: "Prontuario pratico",
    title: "Taccuino di Studio Macerata",
    pages: "Schemi",
    size: "Tavole grafiche",
    file: "/corsi/taccuino-studio-macerata.txt",
    filename: "Taccuino_Studio_Macerata.txt",
    blurb:
      "Diagrammi per stese a 5 e 7 carte: Croce Celtica e Tridente d'Ermete, da tenere sul tavolo di lettura.",
    kind: "schemi" as const,
  },
];

export const MATERIALI = [
  {
    id: "lunare",
    title: "Calendario Lunare & Transiti",
    blurb: "Fasi e finestre propizie per la lettura.",
    file: "/corsi/calendario-lunare.txt",
    filename: "Calendario_Lunare.txt",
  },
  {
    id: "griglia",
    title: "Griglia di Purificazione del Mazzo",
    blurb: "Schema in geometria sacra, stampabile.",
    file: "/corsi/griglia-purificazione.txt",
    filename: "Griglia_Purificazione.txt",
  },
  {
    id: "glossario",
    title: "Glossario dei Simboli Ermetici",
    blurb: "Oltre 120 elementi iconografici spiegati.",
    file: "/corsi/glossario-ermetico.txt",
    filename: "Glossario_Ermetico.txt",
  },
];

import { siteContent } from "./siteContent";

export const STUDIO = {
  name: siteContent.brand.name,
  slogan: siteContent.brand.slogan,
  city: siteContent.brand.city,
  region: siteContent.brand.region,
  address: siteContent.brand.studioDiTeresa,
  deontologia: siteContent.brand.deontologia,
  coords: siteContent.brand.coords,
  email: siteContent.brand.email,
  whatsappNote:
    "I consulti a distanza si svolgono esclusivamente tramite chiamata vocale telefonica WhatsApp. Nessuna videochiamata, per preservare la concentrazione auricolare.",
};
