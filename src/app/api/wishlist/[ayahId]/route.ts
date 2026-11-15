import { toggleFavorite } from "@/lib/user";
import { intParam, json, route } from "@/lib/http";

export const POST = route<{ ayahId: string }>(async (_r, { params }, s) => {
  const on = await toggleFavorite(s!.uid, intParam((await params).ayahId, 0));
  return on === null ? json({ err: "notFound" }, 404) : json({ on });
}, { auth: true });
