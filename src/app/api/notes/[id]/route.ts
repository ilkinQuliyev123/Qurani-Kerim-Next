import { deleteNote, updateNote } from "@/lib/user";
import { body, intParam, json, noContent, route } from "@/lib/http";

export const PUT = route<{ id: string }>(async (req, { params }, s) => {
  const b = await body<{ text?: string }>(req);
  return (await updateNote(s!.uid, intParam((await params).id, 0), b?.text ?? "")) ? json({}) : json({ err: "bad" }, 400);
}, { auth: true });

export const DELETE = route<{ id: string }>(async (_r, { params }, s) =>
  (await deleteNote(s!.uid, intParam((await params).id, 0))) ? noContent() : json({ err: "notFound" }, 404), { auth: true });
