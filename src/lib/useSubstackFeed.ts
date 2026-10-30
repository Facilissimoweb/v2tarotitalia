import { useEffect, useState } from "react";
import { emptySubstackFeed, type SubstackFeedPayload } from "./substack";

const EMPTY_RETRY_MS = [8000, 12000];

export function useSubstackFeed() {
  const [payload, setPayload] = useState<SubstackFeedPayload | null>(null);

  useEffect(() => {
    let active = true;
    let attempt = 0;
    let timer = 0;

    const load = (bustCache: boolean) =>
      fetch("/api/substack-feed", {
        headers: { Accept: "application/json" },
        cache: bustCache ? "no-store" : "default",
      })
        .then((response) => (response.ok ? response.json() : emptySubstackFeed()))
        .then((data: SubstackFeedPayload) => {
          if (!active) return;
          setPayload(data);
          if (data.available && data.posts.length === 0 && attempt < EMPTY_RETRY_MS.length) {
            const wait = EMPTY_RETRY_MS[attempt];
            attempt += 1;
            timer = window.setTimeout(() => load(true), wait);
          }
        })
        .catch(() => {
          if (active) setPayload(emptySubstackFeed());
        });

    load(true);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  return payload;
}
