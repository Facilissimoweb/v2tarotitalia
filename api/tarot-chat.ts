import { handleTarotChat } from "../src/lib/tarotChat/serverChat.ts";
import { readJsonBody, sendJson, type NodeLikeReq, type NodeLikeRes } from "../src/lib/http.ts";
import { siteContent } from "../src/data/siteContent.ts";

export default async function handler(req: NodeLikeReq, res: NodeLikeRes) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method" });
    return;
  }
  try {
    const body = await readJsonBody(req);
    const result = await handleTarotChat(body);
    sendJson(res, result.status, result.body);
  } catch {
    sendJson(res, 503, { error: siteContent.tarotChat.erroreRete });
  }
}
