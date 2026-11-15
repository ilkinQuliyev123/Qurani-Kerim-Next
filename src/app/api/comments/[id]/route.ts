import { deleteComment } from "@/lib/user";
import { intParam, json, noContent, route } from "@/lib/http";

export const DELETE = route<{ id: string }>(async (_r, { params }, s) =>
  (await deleteComment(s!.uid, s!.admin, intParam((await params).id, 0))) ? noContent() : json({ err: "notFound" }, 404), { auth: true });
