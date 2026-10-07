export type GoogleReview = {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
  photo?: string;
};

export type GoogleReviewsPayload = {
  available: boolean;
  rating: number | null;
  total: number | null;
  url: string | null;
  reviews: GoogleReview[];
};

export const emptyGoogleReviews = (): GoogleReviewsPayload => ({
  available: false,
  rating: null,
  total: null,
  url: null,
  reviews: [],
});
