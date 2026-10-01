export type Arcano = {
  id: number;
  roman: string;
  slug: string;
  name: string;
  french: string;
  subtitle: string;
  essence: string;
  upright: string;
  reversed: string;
  keywords: string[];
};

export const ARCANI: Arcano[] = [
  {
    id: 0,
    roman: "0",
    slug: "il-matto",
    name: "Il Matto",
    french: "Le Mat",
    subtitle: "L'inizio puro",
    essence: "Soglia aperta, fiducia nel passo senza mappa.",
    upright:
      "Un ciclo nuovo chiede di essere attraversato senza il peso delle identità precedenti. Il viaggio è già iniziato: la saggezza sta nel camminare leggeri.",
    reversed:
      "Esitazione mascherata da prudenza, o slancio cieco senza ascolto. Serve distinguere il coraggio dal fuggire.",
    keywords: ["soglia", "innocenza", "viaggio", "abbandono"],
  },
  {
    id: 1,
    roman: "I",
    slug: "il-bagatto",
    name: "Il Bagatto",
    french: "Le Bateleur",
    subtitle: "La potenza creativa",
    essence: "Gli strumenti sono già sul tavolo: manca solo l'intenzione.",
    upright:
      "Concentrazione e maestria pratica. Aria, terra, acqua e fuoco rispondono a una volontà lucida. È tempo di iniziare, non di prepararsi ancora.",
    reversed:
      "Talento disperso, prestidigitazione al posto della sostanza. Raccogliere gli strumenti e scegliere un solo gesto.",
    keywords: ["volontà", "mestiere", "inizio", "focus"],
  },
  {
    id: 2,
    roman: "II",
    slug: "la-papessa",
    name: "La Papessa",
    french: "La Papesse",
    subtitle: "La conoscenza segreta",
    essence: "Il libro è aperto, ma si legge in silenzio.",
    upright:
      "Sapienza interiore, attesa fertile, ascolto di ciò che non è ancora detto. La risposta arriva dalla soglia velata, non dal rumore esterno.",
    reversed:
      "Intuito ignorato o segreti che pesano. Togliere il velo con rispetto, senza forzare la rivelazione.",
    keywords: ["intuito", "soglia", "studio", "silenzio"],
  },
  {
    id: 3,
    roman: "III",
    slug: "l-imperatrice",
    name: "L'Imperatrice",
    french: "L'Impératrice",
    subtitle: "La fecondità materica",
    essence: "La forma cresce dove c'è nutrimento e misura.",
    upright:
      "Generatività, cura del corpo e dei progetti. Ciò che è stato seminato chiede terra, tempo e bellezza concreta.",
    reversed:
      "Sovraccarico di cura o aridità creativa. Restituire ritmo al nutrire, senza esaurire il suolo.",
    keywords: ["natura", "abbondanza", "cura", "forma"],
  },
  {
    id: 4,
    roman: "IV",
    slug: "l-imperatore",
    name: "L'Imperatore",
    french: "L'Empereur",
    subtitle: "L'ordine fondato",
    essence: "Struttura come protezione, non come gabbia.",
    upright:
      "Autorità serena, confini chiari, responsabilità. Costruire un recinto perché ciò che vive dentro possa durare.",
    reversed:
      "Rigidità o abdicare al proprio posto. Rivedere le regole: servono ancora, o sono diventate abitudine?",
    keywords: ["struttura", "padre", "legge", "stabilità"],
  },
  {
    id: 5,
    roman: "V",
    slug: "il-papa",
    name: "Il Papa",
    french: "Le Pape",
    subtitle: "La trasmissione",
    essence: "La tradizione è un ponte, non un dogma chiuso.",
    upright:
      "Insegnamento, benedizione, appartenenza a una linea. Cercare una guida o diventare voce per chi viene dopo.",
    reversed:
      "Conformismo o rifiuto sterile del maestro. Distinguere il rito vivo dalla ripetizione vuota.",
    keywords: ["maestro", "rito", "fede", "comunità"],
  },
  {
    id: 6,
    roman: "VI",
    slug: "gli-amanti",
    name: "Gli Amanti",
    french: "L'Amoureux",
    subtitle: "La scelta del cuore",
    essence: "Il bivio non è tra due persone: è tra due fedeltà.",
    upright:
      "Unione consapevole, allineamento di valori, decisione presa dal centro. Amare è scegliere, non subire l'attrazione.",
    reversed:
      "Indecisione, doppia vita interiore, patto tradito con se stessi. Tornare alla domanda: che cosa è vero?",
    keywords: ["scelta", "unione", "valori", "desiderio"],
  },
  {
    id: 7,
    roman: "VII",
    slug: "il-carro",
    name: "Il Carro",
    french: "Le Chariot",
    subtitle: "La direzione conquistata",
    essence: "Due forze opposte, una sola mano sul timone.",
    upright:
      "Vittoria per disciplina, movimento deciso, superamento di un ostacolo. La meta è visibile: avanzare senza disperdere le redini.",
    reversed:
      "Foga senza governo o stallo mascherato da attesa. Riallineare volontà e direzione prima di spingere.",
    keywords: ["volontà", "vittoria", "viaggio", "controllo"],
  },
  {
    id: 8,
    roman: "VIII",
    slug: "la-giustizia",
    name: "La Giustizia",
    french: "La Justice",
    subtitle: "La misura esatta",
    essence: "Ogni gesto torna, con il suo peso.",
    upright:
      "Equilibrio, verità detta senza ornamenti, conseguenze accettate. Tagliare ciò che è in eccesso, restituire ciò che è dovuto.",
    reversed:
      "Parzialità, autoinganno, conti in sospeso. Riportare la spada al centro, non al servizio dell'orgoglio.",
    keywords: ["verità", "karma", "equilibrio", "legge"],
  },
  {
    id: 9,
    roman: "IX",
    slug: "l-eremita",
    name: "L'Eremita",
    french: "L'Hermite",
    subtitle: "La lanterna interiore",
    essence: "La luce che cerchi è già nella tua mano.",
    upright:
      "Ritiro fecondo, studio, discernimento lento. Allontanarsi dal coro per udire la propria voce.",
    reversed:
      "Isolamento sterile o rifiuto della solitudine necessaria. Distinguere il silenzio che guarisce da quello che nasconde.",
    keywords: ["ricerca", "saggezza", "solitudine", "guida"],
  },
  {
    id: 10,
    roman: "X",
    slug: "la-ruota",
    name: "La Ruota della Fortuna",
    french: "La Roue de Fortune",
    subtitle: "Il mutamento in atto",
    essence: "Ciò che ruota non chiede consenso: chiede presenza.",
    upright:
      "Sincronicità, svolta, ciclo che si chiude e se ne apre un altro. Accogliere il tempismo senza aggrapparsi al punto fermo.",
    reversed:
      "Resistenza al cambiamento, ripetizione del medesimo giro. Lasciare che la ruota giri, invece di trattenerla.",
    keywords: ["ciclo", "destino", "svolta", "tempo"],
  },
  {
    id: 11,
    roman: "XI",
    slug: "la-forza",
    name: "La Forza",
    french: "La Force",
    subtitle: "Il dominio gentile",
    essence: "La belva si placa se le si parla, non se la si colpisce.",
    upright:
      "Coraggio morbido, padronanza degli impulsi, compassione attiva. La vera potenza non alza la voce.",
    reversed:
      "Forza bruta o timore dell'istinto. Riconciliare il leone interno invece di incatenarlo.",
    keywords: ["coraggio", "istinto", "mitezza", "padronanza"],
  },
  {
    id: 12,
    roman: "XII",
    slug: "l-appeso",
    name: "L'Appeso",
    french: "Le Pendu",
    subtitle: "La resa fertile",
    essence: "Rovesciare lo sguardo è già un atto magico.",
    upright:
      "Sospensione voluta, sacrificio di una prospettiva logora. Il blocco è un invito a vedere dal basso ciò che dall'alto sfuggiva.",
    reversed:
      "Martirio inutile o rifiuto di fermarsi. Chiedere: sto aspettando, o sto fuggendo l'azione?",
    keywords: ["pausa", "prospettiva", "offerta", "attesa"],
  },
  {
    id: 13,
    roman: "XIII",
    slug: "la-morte",
    name: "La Morte",
    french: "L'Arcane sans nom",
    subtitle: "La soglia irrevocabile",
    essence: "Ciò che finisce fa spazio a ciò che non poteva nascere prima.",
    upright:
      "Trasformazione netta, chiusura di un'identità, compostaggio del vecchio. Non è presagio fatale: è metamorfosi.",
    reversed:
      "Attaccamento a un corpo morto di abitudini. Completare il lutto, invece di rianimare ciò che ha già dato.",
    keywords: ["fine", "mutazione", "letargo", "rinascita"],
  },
  {
    id: 14,
    roman: "XIV",
    slug: "la-temperanza",
    name: "La Temperanza",
    french: "Tempérance",
    subtitle: "L'alchimia dei vasi",
    essence: "Due acque, un solo flusso.",
    upright:
      "Integrazione, pazienza artigianale, guarigione per mescolanza. Niente di estremo: tutto dosato, tutto vivo.",
    reversed:
      "Eccesso, impazienza, elementi che non si parlano. Ritrovare il ritmo del versare, goccia dopo goccia.",
    keywords: ["misura", "guarigione", "fusione", "pazienza"],
  },
  {
    id: 15,
    roman: "XV",
    slug: "il-diavolo",
    name: "Il Diavolo",
    french: "Le Diable",
    subtitle: "Il nodo del desiderio",
    essence: "La catena è allacciata, non saldata.",
    upright:
      "Dipendenza resa visibile, materia che tenta, ombra che chiede nome. Guardare il patto: chi lo ha firmato, e a quale prezzo?",
    reversed:
      "Liberazione da un vincolo, o negazione dell'ombra che torna più forte. Sciogliere con onestà, non con fuga.",
    keywords: ["ombra", "legame", "materia", "potere"],
  },
  {
    id: 16,
    roman: "XVI",
    slug: "la-torre",
    name: "La Torre",
    french: "La Maison Dieu",
    subtitle: "Il crollo necessario",
    essence: "Il fulmine è misericordia verso ciò che era falso.",
    upright:
      "Rottura di una struttura non più vera. Shock, lucidità improvvisa, fondamenti da ricostruire sulla roccia e non sull'orgoglio.",
    reversed:
      "Crisi rimandata, crepe ignorate. Meglio un crollo consapevole che una rovina lenta.",
    keywords: ["rottura", "verità", "fulmine", "fondamenti"],
  },
  {
    id: 17,
    roman: "XVII",
    slug: "la-stella",
    name: "La Stella",
    french: "L'Étoile",
    subtitle: "La luce dopo la tempesta",
    essence: "Versare acqua sulla terra è già una preghiera.",
    upright:
      "Speranza concreta, ispirazione, guarigione nuda. Dopo la Torre, il cielo si riapre: fidarsi della direzione stellare.",
    reversed:
      "Sfiducia nel futuro, ispirazione offuscata. Riaprire il canale, anche con un gesto piccolo e vero.",
    keywords: ["speranza", "ispirazione", "grazia", "rinnovo"],
  },
  {
    id: 18,
    roman: "XVIII",
    slug: "la-luna",
    name: "La Luna",
    french: "La Lune",
    subtitle: "Il cammino tra i cani",
    essence: "Non tutto ciò che si muove nell'acqua è mostro.",
    upright:
      "Sogno, inconscio, percezione sottile. Procedere tra illusioni senza farsi divorare dalle paure: la strada c'è, anche se ondulata.",
    reversed:
      "Confusione, proiezione, paura che inventa nemici. Attendere la luce più ferma prima di nominare ciò che si è visto.",
    keywords: ["sogno", "inconscio", "illusione", "intuito"],
  },
  {
    id: 19,
    roman: "XIX",
    slug: "il-sole",
    name: "Il Sole",
    french: "Le Soleil",
    subtitle: "La chiarezza piena",
    essence: "Niente da nascondere: tutto è visibile e caldo.",
    upright:
      "Vitalità, successo semplice, gioia senza doppio fondo. Un tempo di evidenza: ciò che è vero splende da solo.",
    reversed:
      "Trionfo opaco, orgoglio, luce che abbaglia invece di rivelare. Ritrovare la gioia nuda, non lo sfarzo.",
    keywords: ["gioia", "verità", "vitalità", "evidenza"],
  },
  {
    id: 20,
    roman: "XX",
    slug: "il-giudizio",
    name: "Il Giudizio",
    french: "Le Jugement",
    subtitle: "La chiamata",
    essence: "Qualcosa di sepolto sente il suono e si alza.",
    upright:
      "Risveglio, vocazione, bilancio che libera. Rispondere a un richiamo più ampio della biografia personale.",
    reversed:
      "Sordità alla chiamata, autoaccusa sterile. Distinguere il giudizio che risveglia da quello che condanna.",
    keywords: ["risveglio", "vocazione", "perdono", "annuncio"],
  },
  {
    id: 21,
    roman: "XXI",
    slug: "il-mondo",
    name: "Il Mondo",
    french: "Le Monde",
    subtitle: "Il compimento",
    essence: "Il cerchio si chiude e, nello stesso gesto, si riapre.",
    upright:
      "Integrazione, opera compiuta, danza tra i quattro elementi. Un ciclo è intero: si può celebrare e ricominciare da un altro livello.",
    reversed:
      "Quasi-completamento, pezzo mancante, festa rimandata. Chiudere con cura l'ultimo nodo invece di aprire un altro cantiere.",
    keywords: ["completamento", "danza", "interezza", "soglia"],
  },
];

export function getArcanoBySlug(slug: string) {
  return ARCANI.find((a) => a.slug === slug);
}

export function romanOf(id: number) {
  return ARCANI.find((a) => a.id === id)?.roman ?? String(id);
}
