import { range, toLang } from "@/lib/quran";
import { getLang } from "@/lib/auth";
import { intParam, json, route } from "@/lib/http";

export const GET = route<{ n: string }>(async (req, { params }, s) => {
  const { n } = await params;
  const u = new URL(req.url).searchParams;
  const lang = u.get("lang") ? toLang(u.get("lang")) : await getLang();
  return json(await range(intParam(n, 1), intParam(u.get("from"), 1), intParam(u.get("to"), 20), lang, s?.uid));
});
