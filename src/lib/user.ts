import { and, desc, eq, count, inArray } from "drizzle-orm";
import { db, schema } from "./db";
import { hashPassword, verifyPassword } from "./auth";
import { PAGE_SIZE, REF_RX, findAyahId, project, type Lang, type PageDto, type AyahDto } from "./quran";

const { users, favorites, notes, comments, ayahs } = schema;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

// ---------- Auth ----------
export async function register(r: { name?: string; email?: string; password?: string }) {
  const name = (r.name ?? "").trim();
  const email = (r.email ?? "").trim().toLowerCase();
  const pw = r.password ?? "";
  if (name.length < 3 || name.length > 50) return { err: "errName" as const };
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 150) return { err: "errEmail" as const };
  if (pw.length < 8 || pw.length > 200) return { err: "errPw" as const };
  const exists = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (exists.length) return { err: "emailTaken" as const };
  const [u] = await db.insert(users).values({ name, email, passwordHash: await hashPassword(pw) }).returning();
  return { user: u };
}

export async function login(email: string, pw: string) {
  email = (email ?? "").trim().toLowerCase();
  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  // zamanlama fərqi ilə istifadəçi mövcudluğunu açmamaq üçün həmişə hash müqayisə et
  const hash = u?.passwordHash ?? "$2b$11$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvali";
  const ok = await verifyPassword(pw ?? "", hash).catch(() => false);
  return u && ok ? u : null;
}

// ---------- Wishlist ----------
export async function wishlist(uid: number, offset: number, limit: number, lang: Lang): Promise<PageDto<AyahDto>> {
  limit = clamp(limit, 1, PAGE_SIZE);
  offset = Math.max(0, offset);
  const [{ n }] = await db.select({ n: count() }).from(favorites).where(eq(favorites.userId, uid));
  const favs = await db.select({ ayahId: favorites.ayahId }).from(favorites)
    .where(eq(favorites.userId, uid)).orderBy(desc(favorites.createdAt)).limit(limit).offset(offset);
  const ids = favs.map((f) => f.ayahId);
  if (!ids.length) return { items: [], total: Number(n) };
  const rows = await db.select().from(ayahs).where(inArray(ayahs.id, ids));
  const items = await project(rows, lang, uid);
  return { items: items.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)), total: Number(n) };
}

/** Bəyən / geri al. Yeni vəziyyəti qaytarır; ayə yoxdursa null. */
export async function toggleFavorite(uid: number, ayahId: number) {
  const a = await db.select({ id: ayahs.id }).from(ayahs).where(eq(ayahs.id, ayahId)).limit(1);
  if (!a.length) return null;
  const removed = await db.delete(favorites).where(and(eq(favorites.userId, uid), eq(favorites.ayahId, ayahId))).returning();
  if (removed.length) return false;
  await db.insert(favorites).values({ userId: uid, ayahId }).onConflictDoNothing();
  return true;
}

// ---------- Notes (şəxsi) ----------
export async function listNotes(uid: number, offset: number, limit: number) {
  limit = clamp(limit, 1, PAGE_SIZE);
  const [{ n }] = await db.select({ n: count() }).from(notes).where(eq(notes.userId, uid));
  const rows = await db.select({ id: notes.id, text: notes.text, date: notes.createdAt, surah: ayahs.surahId, num: ayahs.number, arabic: ayahs.arabic })
    .from(notes).innerJoin(ayahs, eq(ayahs.id, notes.ayahId)).where(eq(notes.userId, uid))
    .orderBy(desc(notes.createdAt)).limit(limit).offset(Math.max(0, offset));
  return { items: rows.map((r) => ({ id: r.id, ref: `${r.surah}:${r.num}`, arabic: r.arabic, text: r.text, date: r.date })), total: Number(n) };
}

export async function addNote(uid: number, ref: string, text: string) {
  text = (text ?? "").trim();
  if (!text || text.length > 2000) return "emptyNote";
  const m = REF_RX.exec((ref ?? "").replace(/\s/g, ""));
  const id = m ? await findAyahId(+m[1], +m[2]) : null;
  if (id === null) return "badRef";
  await db.insert(notes).values({ userId: uid, ayahId: id, text });
  return null;
}

export async function updateNote(uid: number, id: number, text: string) {
  text = (text ?? "").trim();
  if (!text || text.length > 2000) return false;
  const r = await db.update(notes).set({ text }).where(and(eq(notes.id, id), eq(notes.userId, uid))).returning({ id: notes.id });
  return r.length > 0;
}

export async function deleteNote(uid: number, id: number) {
  return (await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, uid))).returning({ id: notes.id })).length > 0;
}

// ---------- Comments (hamıya açıq) ----------
export async function listComments(ayahId: number, uid: number | null) {
  const rows = await db.select({ id: comments.id, user: users.name, text: comments.text, date: comments.createdAt, userId: comments.userId })
    .from(comments).innerJoin(users, eq(users.id, comments.userId)).where(eq(comments.ayahId, ayahId))
    .orderBy(desc(comments.createdAt)).limit(100);
  return rows.map((c) => ({ id: c.id, user: c.user, text: c.text, date: c.date, mine: uid !== null && c.userId === uid }));
}

export async function addComment(uid: number, name: string, ayahId: number, text: string) {
  text = (text ?? "").trim();
  if (!text || text.length > 1000) return null;
  const a = await db.select({ id: ayahs.id }).from(ayahs).where(eq(ayahs.id, ayahId)).limit(1);
  if (!a.length) return null;
  const [c] = await db.insert(comments).values({ userId: uid, ayahId, text }).returning();
  return { id: c.id, user: name, text: c.text, date: c.createdAt, mine: true };
}

/** Şərhi yalnız sahibi və ya admin silə bilər. */
export async function deleteComment(uid: number, isAdmin: boolean, id: number) {
  const where = isAdmin ? eq(comments.id, id) : and(eq(comments.id, id), eq(comments.userId, uid));
  return (await db.delete(comments).where(where).returning({ id: comments.id })).length > 0;
}
