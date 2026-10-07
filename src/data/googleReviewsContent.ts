import reviewsSource from "./recensioni/reviews-tarot-italia.json" with { type: "json" };

const STAR_VALUES = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
} as const;

const MONTHS_IT = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
] as const;

type StarLabel = keyof typeof STAR_VALUES;

type GoogleExportReview = {
  reviewer?: { displayName?: string };
  starRating?: StarLabel;
  comment?: string;
  createTime?: string;
};

type GoogleExport = {
  reviews?: GoogleExportReview[];
};

export type GoogleReviewEntry = {
  author: string;
  rating: number;
  text: string;
  date: string;
};

function italianComment(comment: string) {
  const marker = "\n\n(Translated by Google)";
  const index = comment.indexOf(marker);
  return (index >= 0 ? comment.slice(0, index) : comment).trim();
}

function dateIt(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return "";
  return `${day} ${MONTHS_IT[month - 1]} ${year}`;
}

function fromExport(item: GoogleExportReview): GoogleReviewEntry | null {
  const author = item.reviewer?.displayName?.trim() ?? "";
  const text = italianComment(item.comment ?? "");
  const date = item.createTime ? dateIt(item.createTime) : "";
  const rating = item.starRating ? STAR_VALUES[item.starRating] : 0;
  if (!author || !text) return null;
  return { author, rating, text, date };
}

const source = reviewsSource as GoogleExport;

export const googleReviewsContent: GoogleReviewEntry[] = (source.reviews ?? [])
  .map(fromExport)
  .filter((item): item is GoogleReviewEntry => item !== null);
