import { about } from "@/lib/quran";
import { intParam, json, route } from "@/lib/http";

export const GET = route<{ n: string }>(async (_r, { params }) => {
  const a = await about(intParam((await params).n, 0));
  return a ? json(a) : json({ err: "notFound" }, 404);
});
