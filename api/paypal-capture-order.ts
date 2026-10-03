import { readBearer, readJsonBody, sendJson, type NodeLikeReq, type NodeLikeRes } from "../src/lib/itha/http.ts";
import { handlePaypalCaptureOrder } from "../src/lib/itha/serverPaypal.ts";

export default async function handler(req: NodeLikeReq, res: NodeLikeRes) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method" });
    return;
  }
  try {
    const body = await readJsonBody<{ orderId?: string }>(req);
    const result = await handlePaypalCaptureOrder(readBearer(req), body.orderId ?? "");
    sendJson(res, result.status, result.body);
  } catch {
    sendJson(res, 400, { error: "body" });
  }
}
