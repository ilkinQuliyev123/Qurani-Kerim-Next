import { addNote, listNotes } from "@/lib/user";
import { body, intParam, json, route } from "@/lib/http";

export const GET = route(async (req, _c, s) => {
  const u = new URL(req.url).searchParams;
  return json(await listNotes(s!.uid, intParam(u.get("offset"), 0), intParam(u.get("limit"), 20)));
}, { auth: true });

export const POST = route(async (req, _c, s) => {
  const b = await body<{ ref?: string; text?: string }>(req);
  const err = await addNote(s!.uid, b?.ref ?? "", b?.text ?? "");
  return err ? json({ err }, 400) : json({});
}, { auth: true });
