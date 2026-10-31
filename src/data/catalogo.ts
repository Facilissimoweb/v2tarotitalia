import { siteContent } from "./siteContent";

export const REPORT_PDF_PRICE = siteContent.consulti.pdf.prezzo;

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
    price: 60,
    summary:
      "Analisi completa di stasi evolutiva, croce celtica integrata e dialogo archetipico.",
    details:
      "Esplorazione della griglia archetipica, transiti e report PDF esteso su WhatsApp.",
  },
];

export type TariffaId = (typeof TARIFFE)[number]["id"];

export function consultTotal(price: number, pdf: boolean) {
  return pdf ? price + REPORT_PDF_PRICE : price;
}

export type DigitalProductId = "trattato" | "velo" | "taccuino" | "alchemici";

export type DigitalAsset = {
  id: string;
  filename: string;
  title: string;
};

export type DigitalProduct = {
  id: DigitalProductId;
  kicker: string;
  title: string;
  blurb: string;
  price: number;
  format: string;
  audio?: string;
  assets: DigitalAsset[];
};

const ASSETS: Record<DigitalProductId, DigitalAsset[]> = {
  trattato: [
    {
      id: "trattato-arcani-maggiori",
      filename: "Trattato-Arcani-Maggiori-Tarot-Italia.pdf",
      title: "Trattato degli Arcani Maggiori",
    },
  ],
  velo: [
    {
      id: "ermeneutica-luce-ombra",
      filename: "Il-Velo-di-Maya-Tarot-Italia.pdf",
      title: "Il Velo di Maya — teoria",
    },
  ],
  taccuino: [
    {
      id: "taccuino-studio-macerata",
      filename: "Taccuino-di-Studio-Tarot-Italia.pdf",
      title: "Taccuino di studio",
    },
  ],
  alchemici: [
    {
      id: "calendario-lunare",
      filename: "Calendario-Lunare-Tarot-Italia.pdf",
      title: "Calendario lunare",
    },
    {
      id: "griglia-purificazione",
      filename: "Griglia-Purificazione-Mazzo-Tarot-Italia.pdf",
      title: "Griglia di purificazione del mazzo",
    },
    {
      id: "glossario-ermetico",
      filename: "Glossario-Simboli-Ermetici-Tarot-Italia.pdf",
      title: "Glossario dei simboli ermetici",
    },
  ],
};

const VELO_AUDIO = "lezione-01-velo-di-maya";

export const DIGITAL_PRODUCT_IDS: DigitalProductId[] = ["trattato", "velo", "taccuino", "alchemici"];

export function digitalCatalog(): DigitalProduct[] {
  return siteContent.pages.corsi.prodotti.map((item) => {
    const id = item.id as DigitalProductId;
    return {
      id,
      kicker: item.kicker,
      title: item.titolo,
      blurb: item.blurb,
      price: item.prezzo,
      format: item.formato,
      audio: id === "velo" ? VELO_AUDIO : undefined,
      assets: ASSETS[id],
    };
  });
}

export function digitalProductById(id: string): DigitalProduct | undefined {
  return digitalCatalog().find((item) => item.id === id);
}

export function digitalAssetBelongsTo(productId: DigitalProductId, assetId: string) {
  const product = digitalProductById(productId);
  if (!product || !assetId) return false;
  if (product.audio === assetId) return true;
  return product.assets.some((asset) => asset.id === assetId);
}

export const DIGITAL_PRICES: Record<DigitalProductId, number> = Object.fromEntries(
  siteContent.pages.corsi.prodotti.map((item) => [item.id, item.prezzo]),
) as Record<DigitalProductId, number>;

/** Vetrina shop (copy in siteContent; i file restano sul proxy autenticato). */
export const CORSI = digitalCatalog()
  .filter((item) => item.id !== "alchemici")
  .map((item) => ({
    id: item.id,
    kicker: item.kicker,
    title: item.title,
    blurb: item.blurb,
    pages: item.format,
    size: item.format,
    assetId: item.assets[0]?.id ?? "",
    filename: item.assets[0]?.filename ?? "",
    audio: item.audio,
  }));

export const MATERIALI = ASSETS.alchemici.map((asset) => ({
  id: asset.id,
  title: asset.title,
  blurb: "",
  assetId: asset.id,
  filename: asset.filename,
}));

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
