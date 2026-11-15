import { about, toLang } from "@/lib/quran";
import { intParam, json, route } from "@/lib/http";

export const GET = route<{ n: string }>(async (r, { params }) => {
  const lang = toLang(new URL(r.url).searchParams.get("lang"));
  const a = await about(intParam((await params).n, 0), lang);
  return a ? json(a) : json({ err: "notFound" }, 404);
});
