import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export type Session = { uid: number; name: string; email: string; admin: boolean };

const COOKIE = "session";
const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET təyin olunmayıb və ya 32 simvoldan qısadır.");
  return new TextEncoder().encode(s);
};

export const hashPassword = (pw: string) => bcrypt.hash(pw, 11);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

/** Giriş cookie-si: HttpOnly, SameSite=Lax, prod-da Secure. remember=false → brauzer bağlananda silinir. */
export async function signIn(s: Session, remember: boolean) {
  const days = 30;
  const token = await new SignJWT({ ...s })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/",
    ...(remember ? { maxAge: days * 86400 } : {}),
  });
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { uid: Number(payload.uid), name: String(payload.name), email: String(payload.email), admin: payload.admin === true };
  } catch {
    return null;
  }
}

export async function getLang() {
  const { toLang } = await import("./quran");
  return toLang((await cookies()).get("lang")?.value);
}
