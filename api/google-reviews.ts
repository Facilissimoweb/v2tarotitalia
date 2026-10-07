import { sendJson, type NodeLikeReq, type NodeLikeRes } from "../src/lib/itha/http.ts";
import { emptyGoogleReviews } from "../src/lib/googleReviews.ts";
import { handleGoogleReviews } from "../src/lib/googleReviews.server.ts";

export default async function handler(req: NodeLikeReq, res: NodeLikeRes) {
  if (req.method !== "GET") {
    sendJson(res, 405, emptyGoogleReviews());
    return;
  }
  try {
    const result = await handleGoogleReviews();
    sendJson(res, result.status, result.body);
  } catch {
    sendJson(res, 200, emptyGoogleReviews());
  }
}
