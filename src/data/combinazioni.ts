export type Combinazione = {
  carte: [string, string];
  titolo: string;
  sintesi: string;
};

/** Chiave doppia non ordinata: A+B e B+A coincidono. */
export function coppiaKey(a: string, b: string) {
  return a < b ? `${a}_${b}` : `${b}_${a}`;
}

function voce(a: string, b: string, titolo: string, sintesi: string): [string, Combinazione] {
  const carte: [string, string] = a < b ? [a, b] : [b, a];
  return [coppiaKey(a, b), { carte, titolo, sintesi }];
}

export const COMBINAZIONI: Record<string, Combinazione> = Object.fromEntries([
  voce(
    "il-bagatto",
    "la-papessa",
    "Il potenziale e il silenzio",
    "L'energia di avvio e le prime intuizioni trovano una fase di decantazione interiore, studio e preparazione silenziosa prima dell'azione visibile.",
  ),
  voce(
    "il-bagatto",
    "l-imperatrice",
    "Creazione e fioritura",
    "L'intenzione creativa del Bagatto si traduce immediatamente in un progetto fecondo, comunicazione brillante e realizzazione concreta.",
  ),
  voce(
    "il-bagatto",
    "l-imperatore",
    "Inizio e struttura",
    "La spinta iniziale del singolo trova stabilità, ordine formale e una guida solida capace di istituzionalizzarla.",
  ),
  voce(
    "il-bagatto",
    "il-papa",
    "Iniziazione e trasmissione",
    "L'abilità pratica e l'estro del Bagatto incontrano una guida autorevole, un insegnamento etico o una consulenza saggia che dà direzione.",
  ),
  voce(
    "il-bagatto",
    "gli-amanti",
    "La scelta creativa",
    "L'avvio di un percorso richiede un bivio importante, una decisione d'amore o una biforcazione in cui il libero arbitrio è centrale.",
  ),
  voce(
    "il-bagatto",
    "il-carro",
    "Azione e trionfo immediato",
    "La spinta iniziale si mette in movimento con grande energia, portando a un successo rapido, visibile e inarrestabile.",
  ),
  voce(
    "il-bagatto",
    "la-giustizia",
    "Inizio e Regola",
    "L'avvio di un'azione o di un'impresa che trova immediata regolarità, accordi chiari o un riscontro legale e formale.",
  ),
  voce(
    "il-bagatto",
    "l-eremita",
    "La ricerca consapevole",
    "L'intraprendenza giovanile si ferma a riflettere, cercando profondità, studio solitario e saggezza prima di agire.",
  ),
  voce(
    "il-bagatto",
    "la-ruota",
    "L'occasione propizia",
    "Il talento e l'azione si agganciano a un ciclo favorevole del destino, sbloccando opportunità inaspettate.",
  ),
  voce(
    "il-bagatto",
    "la-forza",
    "Maestria e dominio dell'energia",
    "L'abilità tecnica sposa la forza interiore e il coraggio magnetico, domando qualsiasi resistenza con naturalezza.",
  ),
  voce(
    "il-bagatto",
    "l-appeso",
    "Stasi creativa",
    "L'azione subisce un blocco o una sospensione volontaria; il punto di vista si ribalta per trovare una prospettiva inedita.",
  ),
  voce(
    "il-bagatto",
    "la-morte",
    "Trasformazione radicale",
    "La fine netta di un ciclo e l'inizio di una nuova identità; un taglio profondo che rigenera le basi.",
  ),
  voce(
    "il-bagatto",
    "la-temperanza",
    "Alchimia e misura",
    "Il talento trova la sua fluidità ideale nella moderazione, nel dialogo calmo e nella guarigione progressiva.",
  ),
  voce(
    "il-bagatto",
    "il-diavolo",
    "Furbizia e magnetismo materiale",
    "Intelligenza acuta ma mossa da interessi personali, seduzione magnetica o abilità nel gestire affari complessi.",
  ),
  voce(
    "il-bagatto",
    "la-torre",
    "Rottura improvvisa",
    "Un progetto che subisce un crollo inaspettato a causa di un'energia troppo impulsiva o di basi non veritiere.",
  ),
  voce(
    "il-bagatto",
    "la-stella",
    "Ispirazione e speranza",
    "Il talento creativo si unisce alla visione pura e alla protezione fiduciosa nel futuro.",
  ),
  voce(
    "il-bagatto",
    "la-luna",
    "Illusioni e mondo inconscio",
    "L'abilità pratica si muove in un terreno di nebbia, intuizioni profonde, sogni o piccoli inganni latenti.",
  ),
  voce(
    "il-bagatto",
    "il-sole",
    "Successo radioso",
    "Piena realizzazione, visibilità luminosa, gioia contagiosa e chiarezza assoluta in ogni impresa.",
  ),
  voce(
    "il-bagatto",
    "il-giudizio",
    "La chiamata risvegliata",
    "Un'intuizione folgorante o una notizia improvvisa che risveglia nuove potenzialità e vocazioni profonde.",
  ),
  voce(
    "il-bagatto",
    "il-mondo",
    "Compimento totale",
    "Il successo coronato, la sintesi perfetta tra l'inizio e la realizzazione universale dell'opera.",
  ),
  voce(
    "il-bagatto",
    "il-matto",
    "Partenza senza rete",
    "L'impulso creativo si lancia nell'ignoto con libertà assoluta, incurante delle convenzioni e pronto all'avventura.",
  ),
  voce(
    "la-papessa",
    "l-imperatrice",
    "Sapienza e fioritura",
    "Il sapere custodito trova una voce chiara, una comunicazione feconda e una splendida espressione esteriore.",
  ),
  voce(
    "la-papessa",
    "l-imperatore",
    "Legge interiore e struttura",
    "La riflessione e la norma morale si consolidano in un'autorità solida, saggia e rispettosa dei ruoli.",
  ),
  voce(
    "la-papessa",
    "il-papa",
    "La tradizione illuminata",
    "Incontro perfetto tra la conoscenza occulta o interiore e la grande guida spirituale formale.",
  ),
  voce(
    "la-papessa",
    "gli-amanti",
    "La scelta meditata",
    "Una decisione importante presa non d'impulso, ma ponderando ogni sfumatura emotiva e valoriale.",
  ),
  voce(
    "la-papessa",
    "il-carro",
    "Direzione saggia",
    "L'energia in movimento è guidata da una lucida strategia e da una profonda consapevolezza di fondo.",
  ),
  voce(
    "la-papessa",
    "la-giustizia",
    "Equilibrio e rigore",
    "Giudizi formulati con assoluta obiettività, equità illuminata e rispetto rigoroso della verità.",
  ),
  voce(
    "la-papessa",
    "l-eremita",
    "Il ritiro sapiente",
    "Isolamento fecondo, studio rigoroso, ricerca spirituale profonda e totale distacco dalle distrazioni.",
  ),
  voce(
    "la-papessa",
    "la-ruota",
    "Il ciclo svelato",
    "La comprensione delle leggi sottili che muovono i cambiamenti e le opportunità del destino.",
  ),
  voce(
    "la-papessa",
    "la-forza",
    "Controllo saggio",
    "La forza d'animo domina gli istinti attraverso la calma, il silenzio e la padronanza mentale.",
  ),
  voce(
    "la-papessa",
    "l-appeso",
    "Attesa rivelatrice",
    "Sospensione prolungata dedita alla comprensione profonda, allo studio e al ribaltamento dei punti di vista.",
  ),
  voce(
    "la-papessa",
    "la-morte",
    "Metamorfosi silenziosa",
    "Una trasformazione interiore radicale che avviene senza clamore, ripartendo da radici profonde.",
  ),
  voce(
    "la-papessa",
    "la-temperanza",
    "Fluire sapiente",
    "La guarigione e il dialogo pacato guidati da una profonda sintonia e misura interiore.",
  ),
  voce(
    "la-papessa",
    "il-diavolo",
    "Segreti e fascinazione",
    "Conoscenze nascoste o manipolazioni sottili; legami invisibili ma potenti che trattengono la mente.",
  ),
  voce(
    "la-papessa",
    "la-torre",
    "La verità che emerge",
    "Il crollo di dogmi o segreti ben custoditi; una rivelazione improvvisa che frantuma le illusioni.",
  ),
  voce(
    "la-papessa",
    "la-stella",
    "Ispirazione protetta",
    "Intuizioni purissime, protezione spirituale e speranza nutrita dalla conoscenza interiore.",
  ),
  voce(
    "la-papessa",
    "la-luna",
    "I misteri dell'inconscio",
    "Profonda connessione con i mondi invisibili, i sogni, i segreti taciuti e le nebbie della psiche.",
  ),
  voce(
    "la-papessa",
    "il-sole",
    "La luce sul segreto",
    "Ciò che era nascosto o studiato in privato viene alla luce con chiarezza sfolgorante e gioiosa.",
  ),
  voce(
    "la-papessa",
    "il-giudizio",
    "La rivelazione",
    "Una presa di coscienza definitiva, una chiamata interiore che svela la verità di un percorso.",
  ),
  voce(
    "la-papessa",
    "il-mondo",
    "Compimento sapiente",
    "La realizzazione di un'opera o di un percorso di studi coronato da una perfetta integrazione.",
  ),
  voce(
    "la-papessa",
    "il-matto",
    "Il salto nel silenzio",
    "La quiete della riflessione che improvvisamente si apre a un viaggio libero e imprevedibile.",
  ),
  voce(
    "l-imperatrice",
    "l-imperatore",
    "Il matrimonio alchemico",
    "L'unione perfetta tra il progetto creativo/fecondo (Imperatrice) e la struttura stabile e ordinatrice (Imperatore).",
  ),
  voce(
    "l-imperatrice",
    "il-papa",
    "Consenso e riconoscimento",
    "Un'idea o una relazione feconda che ottiene legittimazione, approvazione ufficiale o una saggia guida morale.",
  ),
  voce(
    "l-imperatrice",
    "gli-amanti",
    "La scelta del cuore",
    "Passione viva, armonia sentimentale profonda e decisioni prese guidate dal desiderio e dall'affetto.",
  ),
  voce(
    "l-imperatrice",
    "il-carro",
    "Successo in movimento",
    "Un progetto creativo o commerciale che parte a pieno ritmo, riscuotendo consensi rapidi e visibilità.",
  ),
  voce(
    "l-imperatrice",
    "la-giustizia",
    "Armonia e contratto",
    "Accordi chiari, regolarità formale, unioni legalizzate o successi professionali basati sul merito.",
  ),
  voce(
    "l-imperatrice",
    "l-eremita",
    "Maturazione riflessiva",
    "La passione e l'estro esteriore si stemperano nella ricerca della profondità, del tempo lento e della saggezza.",
  ),
  voce(
    "l-imperatrice",
    "la-ruota",
    "Opportunità feconda",
    "Il fiorire di circostanze fortunate, colpi di scena positivi e aperture inattese nel lavoro o nei sentimenti.",
  ),
  voce(
    "l-imperatrice",
    "la-forza",
    "Energia magnetica",
    "Vitalità straripante, fascino magnetico e capacità di governare le situazioni con autorevolezza naturale.",
  ),
  voce(
    "l-imperatrice",
    "l-appeso",
    "Rallentamento creativo",
    "Un progetto fecondo che subisce una pausa o un'inversione di rotta per essere ripensato da un'altra prospettiva.",
  ),
  voce(
    "l-imperatrice",
    "la-morte",
    "Rinnovamento vitale",
    "La fine di una fase di abbondanza per far spazio a una metamorfosi profonda e a una rinascita rigenerata.",
  ),
  voce(
    "l-imperatrice",
    "la-temperanza",
    "Grazia e fluidità",
    "Dialogo armonioso, scambi sereni, guarigione e una bellezza espressiva misurata ed elegante.",
  ),
  voce(
    "l-imperatrice",
    "il-diavolo",
    "Fascino e seduzione",
    "Magnetismo travolgente ma venato di possessività, interessi materiali spinti o passioni molto intense.",
  ),
  voce(
    "l-imperatrice",
    "la-torre",
    "Scossa improvvisa",
    "Un'illusione di perfezione che si incrina; rottura di schemi rigidi o liberazione da situazioni soffocanti.",
  ),
  voce(
    "l-imperatrice",
    "la-stella",
    "Ispirazione radiosa",
    "Arte, bellezza e armonia protette da una stella favorevole; speranze che si realizzano con grazia.",
  ),
  voce(
    "l-imperatrice",
    "la-luna",
    "Fantasie e sensibilità",
    "Immaginazione artistica profonda, sogni fecondi ma anche fluttuazioni emotive o piccole insicurezze.",
  ),
  voce(
    "l-imperatrice",
    "il-sole",
    "Splendore assoluto",
    "Gioia piena, successo pubblico sfolgorante, intesa perfetta, calore umano e massima realizzazione.",
  ),
  voce(
    "l-imperatrice",
    "il-giudizio",
    "Rinascita e risonanza",
    "Una chiamata inaspettata che ridà vita a un progetto o a un sentimento, portandolo alla luce.",
  ),
  voce(
    "l-imperatrice",
    "il-mondo",
    "Il trionfo della bellezza",
    "Realizzazione universale, compimento felice di un'opera d'arte, di un'impresa o di un grande amore.",
  ),
  voce(
    "l-imperatrice",
    "il-matto",
    "Slancio libero",
    "L'entusiasmo vitale si lancia in un'avventura nuova senza freni, seguendo l'istinto puro.",
  ),
]);

export function getCombinazione(a: string, b: string): Combinazione | undefined {
  if (!a || !b || a === b) return undefined;
  return COMBINAZIONI[coppiaKey(a, b)];
}
