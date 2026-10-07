import { useEffect, useState } from "react";
import { emptyGoogleReviews, type GoogleReviewsPayload } from "./googleReviews";

export function useGoogleReviews() {
  const [payload, setPayload] = useState<GoogleReviewsPayload | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/google-reviews")
      .then((response) => (response.ok ? response.json() : emptyGoogleReviews()))
      .then((data: GoogleReviewsPayload) => {
        if (active) setPayload(data);
      })
      .catch(() => {
        if (active) setPayload(emptyGoogleReviews());
      });
    return () => {
      active = false;
    };
  }, []);

  return payload;
}
