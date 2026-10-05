import { useEffect, useState } from "react";
import { consumeSiteAccessQuery, isSiteUnlocked, siteGateEnabled } from "../lib/siteAccess";

export function useSiteAccess() {
  const [unlocked, setUnlocked] = useState(() => isSiteUnlocked());

  useEffect(() => {
    if (!siteGateEnabled()) {
      setUnlocked(true);
      return;
    }
    consumeSiteAccessQuery();
    setUnlocked(isSiteUnlocked());
  }, []);

  return unlocked;
}
