import { signIn } from "@/lib/auth";
import { login } from "@/lib/user";
import { body, json, route } from "@/lib/http";

export const POST = route(async (req) => {
  const b = await body<{ email?: string; password?: string; remember?: boolean }>(req);
  const u = await login(b?.email ?? "", b?.password ?? "");
  if (!u) return json({ ok: false, err: "wrongCred" });
  await signIn({ uid: u.id, name: u.name, email: u.email, admin: u.isAdmin }, !!b?.remember);
  return json({ ok: true, name: u.name });
});
