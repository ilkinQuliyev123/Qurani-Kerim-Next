import { search, toLang } from "@/lib/quran";
import { getLang } from "@/lib/auth";
import { intParam, json, route } from "@/lib/http";

export const GET = route(async (req, _c, s) => {
  const u = new URL(req.url).searchParams;
  const lang = u.get("lang") ? toLang(u.get("lang")) : await getLang();
  return json(await search(u.get("q") ?? "", lang, intParam(u.get("offset"), 0), intParam(u.get("limit"), 20), s?.uid));
});
