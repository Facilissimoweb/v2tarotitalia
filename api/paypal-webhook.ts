import { siteContent } from "../src/data/siteContent.ts";
import { readJsonBody, sendJson, type NodeLikeReq, type NodeLikeRes } from "../src/lib/itha/http.ts";
import { handlePaypalWebhook } from "../src/lib/itha/serverPaypalWebhook.ts";

export default async function handler(req: NodeLikeReq, res: NodeLikeRes) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: siteContent.itha.paypalOrdine, code: "method" });
    return;
  }
  try {
    const event = await readJsonBody<{
      id?: string;
      event_type?: string;
      resource?: Record<string, unknown>;
    }>(req);
    const result = await handlePaypalWebhook(req, event);
    sendJson(res, result.status, result.body);
  } catch {
    sendJson(res, 400, { error: siteContent.itha.paypalOrdine, code: "body" });
  }
}
