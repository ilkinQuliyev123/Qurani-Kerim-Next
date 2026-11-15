import { NextResponse } from "next/server";
import { getSession, type Session } from "./auth";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const noContent = () => new NextResponse(null, { status: 204 });
export const intParam = (v: string | null, d: number) => (v !== null && /^-?\d+$/.test(v) ? parseInt(v, 10) : d);

/** CSRF: dəyişdirici sorğuların Origin-i saytın öz domeni olmalıdır (cookie SameSite=Lax ilə birlikdə). */
export function sameOrigin(req: Request) {
  if (req.method === "GET" || req.method === "HEAD") return true;
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host")); } catch { return false; }
}

type Ctx<P> = { params: Promise<P> };
type Handler<P> = (req: Request, ctx: Ctx<P>, session: Session | null) => Promise<Response> | Response;

/** Marşrut sarğısı: origin yoxlaması + giriş/admin tələbi + gözlənilməz xətaları 500-ə çevirmə. */
export function route<P = Record<string, never>>(h: Handler<P>, opts: { auth?: boolean; admin?: boolean } = {}) {
  return async (req: Request, ctx: Ctx<P>) => {
    try {
      if (!sameOrigin(req)) return json({ err: "forbidden" }, 403);
      const s = await getSession();
      if ((opts.auth || opts.admin) && !s) return json({ err: "unauthorized" }, 401);
      if (opts.admin && !s?.admin) return json({ err: "forbidden" }, 403);
      return await h(req, ctx, s);
    } catch (e) {
      console.error(e);
      return json({ err: "server" }, 500);
    }
  };
}

export async function body<T>(req: Request): Promise<T | null> {
  try { return (await req.json()) as T; } catch { return null; }
}
