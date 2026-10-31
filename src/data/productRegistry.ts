import { siteContent } from "./siteContent";
import {
  TARIFFE,
  digitalProductById,
  type DigitalProduct,
  type TariffaId,
} from "./catalogo";

export type ShopKind = "digital" | "consult" | "physical";
export type ShopCategory = "dispense" | "masterclass" | "materiali" | "consulto";
export type ShopFilter = "all" | ShopCategory;
export type ShopSort = "newest" | "price-asc" | "price-desc";

export type ShopRegistryRow = {
  id: string;
  kind: ShopKind;
  category: ShopCategory;
  listed: boolean;
  listedAt: string;
  image?: string;
};

/** Un oggetto nuovo qui (più copy in siteContent) entra in vetrina da solo. */
export const PRODUCT_REGISTRY: readonly ShopRegistryRow[] = [
  {
    id: "velo",
    kind: "digital",
    category: "masterclass",
    listed: true,
    listedAt: "2026-10-31",
    image: "/sfondo-card.png",
  },
  {
    id: "trattato",
    kind: "digital",
    category: "dispense",
    listed: true,
    listedAt: "2026-10-20",
    image: "/sfondo-card.png",
  },
  {
    id: "taccuino",
    kind: "digital",
    category: "dispense",
    listed: true,
    listedAt: "2026-10-18",
    image: "/sfondo-card.png",
  },
  {
    id: "alchemici",
    kind: "digital",
    category: "materiali",
    listed: true,
    listedAt: "2026-10-15",
    image: "/sfondo-card.png",
  },
  {
    id: "deep",
    kind: "consult",
    category: "consulto",
    listed: true,
    listedAt: "2026-01-15",
    image: "/forza-consulti.png",
  },
  {
    id: "focus",
    kind: "consult",
    category: "consulto",
    listed: true,
    listedAt: "2026-01-01",
    image: "/forza-consulti.png",
  },
];

export type ShopItem = {
  id: string;
  kind: ShopKind;
  category: ShopCategory;
  listedAt: string;
  image?: string;
  kicker: string;
  title: string;
  blurb: string;
  price: number;
  format: string;
  digital?: DigitalProduct;
  consultId?: TariffaId;
};

function composeRow(row: ShopRegistryRow): ShopItem | null {
  if (!row.listed) return null;

  if (row.kind === "digital") {
    const product = digitalProductById(row.id);
    if (!product) return null;
    return {
      id: product.id,
      kind: "digital",
      category: row.category,
      listedAt: row.listedAt,
      image: row.image,
      kicker: product.kicker,
      title: product.title,
      blurb: product.blurb,
      price: product.price,
      format: product.format,
      digital: product,
    };
  }

  if (row.kind === "consult") {
    const option = siteContent.consulti.opzioni.find((item) => item.id === row.id);
    const tariffa = TARIFFE.find((item) => item.id === row.id);
    if (!option || !tariffa) return null;
    return {
      id: option.id,
      kind: "consult",
      category: row.category,
      listedAt: row.listedAt,
      image: row.image,
      kicker: tariffa.kicker,
      title: option.titolo,
      blurb: tariffa.summary,
      price: option.prezzo,
      format: `${option.minuti} min`,
      consultId: option.id,
    };
  }

  return null;
}

export function composeShopCatalog(): ShopItem[] {
  return PRODUCT_REGISTRY.map(composeRow).filter((item): item is ShopItem => item !== null);
}

export function shopCategoriesInUse(items: ShopItem[] = composeShopCatalog()): ShopCategory[] {
  const present = new Set(items.map((item) => item.category));
  return (["dispense", "masterclass", "materiali", "consulto"] as const).filter((id) => present.has(id));
}

export function filterShopItems(items: ShopItem[], filter: ShopFilter) {
  if (filter === "all") return items;
  return items.filter((item) => item.category === filter);
}

export function sortShopItems(items: ShopItem[], sort: ShopSort) {
  const next = [...items];
  next.sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price || b.listedAt.localeCompare(a.listedAt);
    if (sort === "price-desc") return b.price - a.price || b.listedAt.localeCompare(a.listedAt);
    return b.listedAt.localeCompare(a.listedAt) || b.price - a.price;
  });
  return next;
}

export function overlayDigitalCopy(items: ShopItem[], products: DigitalProduct[]) {
  return items.map((item) => {
    if (item.kind !== "digital" || !item.digital) return item;
    const localized = products.find((product) => product.id === item.digital?.id);
    if (!localized) return item;
    return {
      ...item,
      kicker: localized.kicker,
      title: localized.title,
      blurb: localized.blurb,
      format: localized.format,
      digital: localized,
    };
  });
}
