import { emptyGoogleReviews, type GoogleReview, type GoogleReviewsPayload } from "./googleReviews.ts";

type PlaceReview = {
  author_name?: string;
  rating?: number;
  text?: string;
  relative_time_description?: string;
  profile_photo_url?: string;
};

type PlaceDetails = {
  status?: string;
  result?: {
    rating?: number;
    user_ratings_total?: number;
    url?: string;
    reviews?: PlaceReview[];
  };
};

export async function handleGoogleReviews(): Promise<{ status: number; body: GoogleReviewsPayload }> {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();
  if (!key || !placeId) {
    return { status: 200, body: emptyGoogleReviews() };
  }

  const endpoint = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  endpoint.searchParams.set("place_id", placeId);
  endpoint.searchParams.set("fields", "rating,user_ratings_total,url,reviews");
  endpoint.searchParams.set("language", "it");
  endpoint.searchParams.set("key", key);

  const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    return { status: 200, body: emptyGoogleReviews() };
  }

  const data = (await response.json()) as PlaceDetails;
  if (data.status !== "OK" || !data.result) {
    return { status: 200, body: emptyGoogleReviews() };
  }

  const reviews: GoogleReview[] = (data.result.reviews ?? [])
    .map((item) => ({
      author: item.author_name?.trim() ?? "",
      rating: typeof item.rating === "number" ? item.rating : 0,
      text: item.text?.trim() ?? "",
      relativeTime: item.relative_time_description?.trim() ?? "",
      photo: item.profile_photo_url,
    }))
    .filter((item) => item.author && item.text);

  return {
    status: 200,
    body: {
      available: reviews.length > 0 || typeof data.result.rating === "number",
      rating: data.result.rating ?? null,
      total: data.result.user_ratings_total ?? null,
      url: data.result.url ?? null,
      reviews,
    },
  };
}
