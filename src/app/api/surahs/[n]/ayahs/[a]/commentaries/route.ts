import { ayahCommentaries } from "@/lib/quran";
import { intParam, json, route } from "@/lib/http";

export const GET = route<{ n: string; a: string }>(async (_r, { params }) => {
  const { n, a } = await params;
  const c = await ayahCommentaries(intParam(n, 0), intParam(a, 0));
  return c ? json(c) : json({ err: "notFound" }, 404);
});
