import { get, remove, update } from "@/lib/admin";
import type { AdminReq } from "@/lib/admin";
import { body, intParam, json, noContent, route } from "@/lib/http";

export const GET = route<{ id: string }>(async (_r, { params }) => {
  const a = await get(intParam((await params).id, 0));
  return a ? json(a) : json({ err: "notFound" }, 404);
}, { admin: true });

export const PUT = route<{ id: string }>(async (req, { params }) => {
  const r = await update(intParam((await params).id, 0), (await body<AdminReq>(req)) as AdminReq);
  return r.dto ? json(r.dto) : json({ err: r.err }, 400);
}, { admin: true });

export const DELETE = route<{ id: string }>(async (_r, { params }) =>
  (await remove(intParam((await params).id, 0))) ? noContent() : json({ err: "notFound" }, 404), { admin: true });
