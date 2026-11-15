import { create, list } from "@/lib/admin";
import type { AdminReq } from "@/lib/admin";
import { body, intParam, json, route } from "@/lib/http";

export const GET = route(async (req) => {
  const u = new URL(req.url).searchParams;
  return json(await list(intParam(u.get("surah"), 1), u.get("q"), intParam(u.get("page"), 1)));
}, { admin: true });

export const POST = route(async (req) => {
  const r = await create((await body<AdminReq>(req)) as AdminReq);
  return r.dto ? json(r.dto) : json({ err: r.err }, 400);
}, { admin: true });
