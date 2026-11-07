import { readBearer, sendJson, type NodeLikeReq, type NodeLikeRes } from "../src/lib/http.ts";
import { runOpsSentinel, sentinelAuthorized, sentinelConfigured } from "../src/lib/opsSentinel/run.ts";

/** Piano Hobby: tetto 10s. Le sonde sono in parallelo e scartano i body. */
export const config = { runtime: "nodejs", maxDuration: 10 };

export default async function handler(req: NodeLikeReq, res: NodeLikeRes) {
  if (req.method !== "GET" && req.method !== "POST") {
    sendJson(res, 405, { error: "method" });
    return;
  }
  if (!sentinelConfigured()) {
    sendJson(res, 503, { error: "sentinel-unconfigured" });
    return;
  }
  if (!sentinelAuthorized(readBearer(req))) {
    sendJson(res, 401, { error: "unauthorized" });
    return;
  }
  try {
    const report = await runOpsSentinel();
    sendJson(res, report.overall === "down" ? 503 : 200, report);
  } catch {
    sendJson(res, 503, { error: "sentinel-failed" });
  }
}
