import { signIn } from "@/lib/auth";
import { register } from "@/lib/user";
import { body, json, route } from "@/lib/http";

export const POST = route(async (req) => {
  const r = await register((await body(req)) ?? {});
  if ("err" in r) return json({ ok: false, err: r.err });
  await signIn({ uid: r.user.id, name: r.user.name, email: r.user.email, admin: false }, false);
  return json({ ok: true, name: r.user.name });
});
