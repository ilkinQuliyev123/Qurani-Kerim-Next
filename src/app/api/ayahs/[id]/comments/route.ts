import { addComment, listComments } from "@/lib/user";
import { body, intParam, json, route } from "@/lib/http";

export const GET = route<{ id: string }>(async (_r, { params }, s) => json(await listComments(intParam((await params).id, 0), s?.uid ?? null)));

export const POST = route<{ id: string }>(async (req, { params }, s) => {
  const b = await body<{ text?: string }>(req);
  const c = await addComment(s!.uid, s!.name, intParam((await params).id, 0), b?.text ?? "");
  return c ? json(c) : json({ err: "emptyComment" }, 400);
}, { auth: true });
