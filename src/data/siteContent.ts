export const siteContent = {
  brand: {
    name: "Studio Olistico",
    wordmark: "Tarot Italia",
    slogan: "Tarot Italia • Ritualistica & Tradizione Popolare",
    studioDiTeresa:
      "Via Crispi 37, 62100 Macerata (MC), Marche, Italia — Riceve esclusivamente su appuntamento",
    deontologia:
      "Attività disciplinata ai sensi della Legge 14 gennaio 2013, n. 4. Nessuna consulenza costituisce parere medico, sanitario o legale.",
    city: "Macerata",
    region: "Marche, Italia",
    coords: "43° 18′ 01″ N / 13° 27′ 12″ E",
    email: "sanctuary@tarotitalia.it",
  },

  nav: {
    home: "Home",
    chiSiamo: "Chi Siamo",
    arcani: "22 Arcani",
    arcaniShort: "Arcani",
    consulti: "Consulti",
    corsi: "Corsi",
    estrazione: "3 Carte",
    accedi: "Accedi",
    riservata: "Area riservata",
    riservataShort: "Riservata",
  },

  cta: {
    consultoWhatsapp: "Prenota un consulto WhatsApp",
    esploraArcani: "Esplora i 22 Arcani",
    leggiChiSiamo: "Leggi Chi Siamo",
  },

  chiSiamo: {
    kicker: "Chi Siamo",
    titolo: "Teresa & il Linguaggio dei Simboli",
    presentazione:
      "Benvenuti in Tarot Italia. Sono Teresa, operatrice olistica, ricercatrice simbolica e tarologa. Il mio approccio unisce l’analisi visiva e semiotica dell’immagine artistica con una decennale indagine negli archetipi della psiche e della tradizione esoterica. Ogni consulto è uno spazio protetto d’ascolto autentico, concepito per disvelare nodi interiori e restituire sovranità decisionale a chi siede al tavolo degli Arcani.",
    formazioneAccademica:
      "Accademia di Belle Arti di Macerata. Laureata in Tecniche della Comunicazione Visiva. Questa solida base permette di decodificare la grammatica visiva, cromatica e compositiva delle carte storiche non come mera superstizione, ma come linguaggio visivo archetipico che dialoga direttamente con la mente profonda.",
    citazione:
      "I tarocchi non impongono un destino ineluttabile: sono uno specchio limpido dove l’intuito ritrova la propria bussola, trasformando le incertezze in consapevolezza e presenza.",
    percorsoKicker: "Percorso disciplinare",
    formazioneKicker: "Formazione accademica",
    percorsoDisciplinare: [
      {
        titolo: "Tarocchi Rider Waite Smith",
        dettaglio: "Mariangela Aggio, Percorso 2025",
      },
      {
        titolo: "Accademia Nazionale del Tarocco Esoterico",
        dettaglio: "Dorian Bones, Annuale 2023/2024",
      },
      {
        titolo: "Operatore Reiki II Livello",
        dettaglio: "Lignaggio Mikao Usui®, M. F. Tartuferi, IPHM",
      },
      {
        titolo: "Facilitatore Mindfulness",
        dettaglio: "Mindfulness Educators®, IPHM",
      },
      {
        titolo: "Operatore Naturopata",
        dettaglio: "Future Academy®, IPHM",
      },
      {
        titolo: "Radiestesia & Pendolo PTAH",
        dettaglio: "Emiliano Amici",
      },
    ],
    immagini: {
      teresa: {
        src: "/chi-siamo/teresa-ritratto.svg?v=3",
        alt: "Ritratto evocativo di Teresa, operatrice olistica e tarologa",
        caption: "Teresa · Studio Olistico",
      },
      studio: {
        src: "/chi-siamo/studio-macerata.svg?v=2",
        alt: "Studio di Teresa in Via Crispi 37 a Macerata",
        caption: "Via Crispi 37 · Macerata",
      },
      simboli: {
        src: "/chi-siamo/tavolo-arcani.svg?v=2",
        alt: "Tavolo degli Arcani e linguaggio visivo dei simboli",
        caption: "Il tavolo degli Arcani",
      },
    },
  },

  collaboratori: {
    maura: {
      nome: "Maura • Ritualista Esoterica",
      sezione: "Folklore Tradizionale Marchigiano",
      descrizione:
        "Nelle Marche, il ritualismo esoterico assume alcune peculiarità legate al folklore locale e a pratiche tradizionali tramandate da generazione in generazione.",
      ritualiKicker: "Rituali",
      rituali: [
        "Rituali d'Amore e Attrazione",
        "Legamenti d'Amore",
        "Riti di Riconciliazione",
        "Rafforzamento della Coppia",
      ],
      citazione:
        "Questa ritualità di coppia agisce come mediatore tra il mondo spirituale e quello umano.",
      immagine: {
        src: "/chi-siamo/folklore-marche.svg?v=2",
        alt: "Folklore tradizionale marchigiano — ritualità di coppia",
        caption: "Folklore tradizionale marchigiano",
      },
    },
  },
} as const;

export type SiteContent = typeof siteContent;
