import { useEffect, useState } from "react";

/** Quanto sollevare i controlli fissi in basso perché non coprano il footer. */
export function useFooterClearance() {
  const [lift, setLift] = useState(0);

  useEffect(() => {
    const footer = document.querySelector<HTMLElement>("[data-site-footer]");
    if (!footer) {
      setLift(0);
      return;
    }

    const update = () => {
      const top = footer.getBoundingClientRect().top;
      setLift(Math.max(0, window.innerHeight - top));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return lift;
}
