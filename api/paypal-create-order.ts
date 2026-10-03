import { readBearer, readJsonBody, sendJson, type NodeLikeReq, type NodeLikeRes } from "../src/lib/itha/http.ts";
import { handlePaypalCreateOrder } from "../src/lib/itha/serverPaypal.ts";

export default async function handler(req: NodeLikeReq, res: NodeLikeRes) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method" });
    return;
  }
  try {
    const body = await readJsonBody<{ planId?: string }>(req);
    const result = await handlePaypalCreateOrder(readBearer(req), body.planId ?? "");
    sendJson(res, result.status, result.body);
  } catch {
    sendJson(res, 400, { error: "body" });
  }
}
