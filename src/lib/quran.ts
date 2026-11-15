import { and, asc, eq, gte, ilike, inArray, lte, or, sql, count } from "drizzle-orm";
import { db, schema } from "./db";
import { createHash } from "node:crypto";
import aboutData from "../../data/about.json";
import i18nData from "../../data/commentary-i18n.json";

const { surahs, ayahs, translations, words, commentaries, favorites, comments } = schema;

export const PAGE_SIZE = 20;
export const LANGS = ["az", "en", "ru", "tr"] as const;
export type Lang = (typeof LANGS)[number];
export const toLang = (l?: string | null): Lang => ((LANGS as readonly string[]).includes(l ?? "") ? (l as Lang) : "az");

/** Ərəbcə hərəkələri silir, əlif/yə variantlarını birləşdirir (axtarış üçün). */
export const arabicPlain = (s: string) =>
  (s ?? "")
    .replace(/[ً-ٰٟـۖ-ۭ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .trim();

export const REF_RX = /^(\d{1,3})\s*[:.]\s*(\d{1,3})$/;
const likeEsc = (s: string) => s.replace(/[\\%_]/g, (c) => "\\" + c);

export type AyahDto = {
  id: number; surah: number; num: number; ref: string; arabic: string; translation: string;
  words: { ar: string; lat: string; mean: string }[]; fav: boolean; comments: number;
};
export type PageDto<T> = { items: T[]; total: number };

type AyahRow = typeof ayahs.$inferSelect;

/** Ayə sətirlərini DTO-ya çevirir (yalnız lazım olan dil). */
export async function project(rows: AyahRow[], lang: Lang, uid?: number | null): Promise<AyahDto[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const [tr, ws, cm, fv] = await Promise.all([
    db.select().from(translations).where(and(inArray(translations.ayahId, ids), inArray(translations.lang, [lang, "az"]))),
    db.select().from(words).where(inArray(words.ayahId, ids)).orderBy(asc(words.order)),
    db.select({ ayahId: comments.ayahId, n: count() }).from(comments).where(inArray(comments.ayahId, ids)).groupBy(comments.ayahId),
    uid ? db.select({ ayahId: favorites.ayahId }).from(favorites).where(and(eq(favorites.userId, uid), inArray(favorites.ayahId, ids))) : Promise.resolve([]),
  ]);
  const favSet = new Set(fv.map((f) => f.ayahId));
  const cmMap = new Map(cm.map((c) => [c.ayahId, Number(c.n)]));
  return rows.map((a) => {
    const mine = tr.filter((t) => t.ayahId === a.id);
    const text = mine.find((t) => t.lang === lang)?.text ?? mine.find((t) => t.lang === "az")?.text ?? "";
    return {
      id: a.id, surah: a.surahId, num: a.number, ref: `${a.surahId}:${a.number}`, arabic: a.arabic, translation: text,
      words: ws.filter((w) => w.ayahId === a.id).map((w) => ({
        ar: w.arabic, lat: w.latin,
        mean: (lang === "en" ? w.meanEn : lang === "ru" ? w.meanRu : lang === "tr" ? w.meanTr : w.meanAz) ?? w.meanAz ?? "",
      })),
      fav: favSet.has(a.id), comments: cmMap.get(a.id) ?? 0,
    };
  });
}

export async function surahList() {
  const rows = await db.select().from(surahs).orderBy(asc(surahs.id));
  return rows.map((s) => ({ n: s.id, name: s.name, count: s.ayahCount }));
}

export async function getSurah(n: number) {
  return (await db.select().from(surahs).where(eq(surahs.id, n)).limit(1))[0] ?? null;
}

/** Surədən from..to aralığı (ən çox 20 ayə). */
export async function range(surah: number, from: number, to: number, lang: Lang, uid?: number | null) {
  from = Math.max(1, from);
  to = Math.min(to, from + PAGE_SIZE - 1);
  const rows = await db.select().from(ayahs)
    .where(and(eq(ayahs.surahId, surah), gte(ayahs.number, from), lte(ayahs.number, to))).orderBy(asc(ayahs.number));
  return project(rows, lang, uid);
}

/** "Günün ayəsi" — gün ərzində eyni qalır. */
export async function dailyAyah(lang: Lang, uid?: number | null) {
  const [{ n }] = await db.select({ n: count() }).from(ayahs);
  if (!Number(n)) return null;
  const now = new Date();
  const dayOfYear = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - Date.UTC(now.getUTCFullYear(), 0, 0)) / 864e5);
  const skip = (dayOfYear * 37) % Number(n);
  const rows = await db.select().from(ayahs).orderBy(asc(ayahs.id)).limit(1).offset(skip);
  return (await project(rows, lang, uid))[0] ?? null;
}

/** "3:2" formatı və ya söz (ərəbcə / seçilmiş dilin tərcüməsi). */
export async function search(q: string, lang: Lang, offset: number, limit: number, uid?: number | null): Promise<PageDto<AyahDto>> {
  q = (q ?? "").trim();
  limit = Math.min(Math.max(limit, 1), PAGE_SIZE);
  offset = Math.max(0, offset);
  if (!q) return { items: [], total: 0 };
  const m = REF_RX.exec(q);
  let where;
  if (m) {
    where = and(eq(ayahs.surahId, +m[1]), eq(ayahs.number, +m[2]));
  } else {
    const ar = arabicPlain(q);
    const pat = `%${likeEsc(q)}%`;
    where = or(
      ar ? ilike(ayahs.arabicPlain, `%${likeEsc(ar)}%`) : undefined,
      sql`exists (select 1 from ${translations} t where t.ayah_id = ${ayahs.id} and t.lang = ${lang} and t.text ilike ${pat})`,
    );
  }
  const [{ n }] = await db.select({ n: count() }).from(ayahs).where(where);
  const rows = await db.select().from(ayahs).where(where).orderBy(asc(ayahs.surahId), asc(ayahs.number)).limit(limit).offset(offset);
  return { items: await project(rows, lang, uid), total: Number(n) };
}

export async function findAyahId(surah: number, num: number) {
  const r = await db.select({ id: ayahs.id }).from(ayahs).where(and(eq(ayahs.surahId, surah), eq(ayahs.number, num))).limit(1);
  return r[0]?.id ?? null;
}

const ABOUT = aboutData as Record<string, Record<Lang, string>>;

/** Surə haqqında mətn seçilmiş dildə (maşın tərcüməsi); tərcümə yoxdursa orijinal. */
export const aboutText = (n: number, lang: Lang, fallback: string | null) => ABOUT[String(n)]?.[lang] ?? fallback;

export async function about(n: number, lang: Lang = "az") {
  const s = await getSurah(n);
  return s ? { n: s.id, name: s.name, about: aboutText(s.id, lang, s.about) } : null;
}

/** Ayə tapılmasa null (404), şərh yoxdursa boş siyahı. */
const CI18N = i18nData as Record<string, Partial<Record<Lang, string>>>;
const textId = (x: string) => createHash("sha1").update(x, "utf8").digest("hex").slice(0, 10);

/** Tərcümə varsa seçilmiş dildə (maşın tərcüməsi), yoxdursa orijinal mətn. */
export async function ayahCommentaries(surah: number, num: number, lang: Lang = "tr") {
  const id = await findAyahId(surah, num);
  if (id === null) return null;
  const rows = await db.select({ title: commentaries.title, text: commentaries.text })
    .from(commentaries).where(eq(commentaries.ayahId, id)).orderBy(asc(commentaries.order));
  return rows.map((r) => ({ title: r.title, text: CI18N[textId(r.text)]?.[lang] ?? r.text }));
}
