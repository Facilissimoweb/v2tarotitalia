import { handleLocalize } from "../src/lib/itha/serverLocalize.ts";
import { readJsonBody, sendJson, type NodeLikeReq, type NodeLikeRes } from "../src/lib/itha/http.ts";
import { siteContent } from "../src/data/siteContent.ts";

export default async function handler(req: NodeLikeReq, res: NodeLikeRes) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method" });
    return;
  }
  try {
    const body = await readJsonBody<{ language?: string; texts?: Record<string, string> }>(req);
    const result = await handleLocalize(body);
    sendJson(res, result.status, result.body);
  } catch {
    sendJson(res, 200, {
      texts: {},
      available: false,
      error: siteContent.itha.groqManca,
    });
  }
}
