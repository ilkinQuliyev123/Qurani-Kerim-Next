import { and, asc, count, eq, ilike, inArray, or, sql, max } from "drizzle-orm";
import { db, schema } from "./db";
import { LANGS, PAGE_SIZE, REF_RX, arabicPlain } from "./quran";

const { ayahs, translations, words, surahs, commentaries, favorites, notes, comments } = schema;
const likeEsc = (s: string) => s.replace(/[\\%_]/g, (c) => "\\" + c);

export type AdminWord = { ar: string; lat: string; mean: Record<string, string> };
export type AdminAyah = { id: number; surah: number; num: number; ref: string; arabic: string; tr: Record<string, string>; words: AdminWord[] };
export type AdminReq = { surah: number; num: number; arabic: string; tr: Record<string, string>; words: AdminWord[] };

async function load(rows: (typeof ayahs.$inferSelect)[]): Promise<AdminAyah[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const [tr, ws] = await Promise.all([
    db.select().from(translations).where(inArray(translations.ayahId, ids)),
    db.select().from(words).where(inArray(words.ayahId, ids)).orderBy(asc(words.order)),
  ]);
  return rows.map((a) => ({
    id: a.id, surah: a.surahId, num: a.number, ref: `${a.surahId}:${a.number}`, arabic: a.arabic,
    tr: Object.fromEntries(tr.filter((t) => t.ayahId === a.id).map((t) => [t.lang, t.text])),
    words: ws.filter((w) => w.ayahId === a.id).map((w) => ({
      ar: w.arabic, lat: w.latin, mean: { az: w.meanAz ?? "", en: w.meanEn ?? "", ru: w.meanRu ?? "", tr: w.meanTr ?? "" },
    })),
  }));
}

export async function list(surah: number, q: string | null, page: number) {
  q = q?.trim() ?? null;
  let where = eq(ayahs.surahId, surah);
  if (q) {
    const m = REF_RX.exec(q);
    if (m) where = and(eq(ayahs.surahId, +m[1]), eq(ayahs.number, +m[2]))!;
    else {
      const ar = arabicPlain(q), pat = `%${likeEsc(q)}%`;
      where = and(eq(ayahs.surahId, surah), or(
        ar ? ilike(ayahs.arabicPlain, `%${likeEsc(ar)}%`) : undefined,
        sql`exists (select 1 from ${translations} t where t.ayah_id = ${ayahs.id} and t.text ilike ${pat})`,
        sql`exists (select 1 from ${words} w where w.ayah_id = ${ayahs.id} and w.latin ilike ${pat})`,
      ))!;
    }
  }
  const [{ n }] = await db.select({ n: count() }).from(ayahs).where(where);
  const rows = await db.select().from(ayahs).where(where).orderBy(asc(ayahs.surahId), asc(ayahs.number))
    .limit(PAGE_SIZE).offset((Math.max(1, page) - 1) * PAGE_SIZE);
  return { items: await load(rows), total: Number(n) };
}

export async function get(id: number) {
  return (await load(await db.select().from(ayahs).where(eq(ayahs.id, id)).limit(1)))[0] ?? null;
}

function validate(r: AdminReq): string | null {
  if (!r || typeof r !== "object") return "Sorğu səhvdir";
  if (!r.arabic?.trim()) return "Ərəbcə mətn boş ola bilməz";
  if (!r.tr?.az?.trim()) return "Azərbaycanca tərcümə məcburidir";
  if ((r.words ?? []).some((w) => !w.ar?.trim() || !w.lat?.trim())) return "Hər sözün ərəbcəsi və oxunuşu dolu olmalıdır";
  if (!Number.isInteger(r.surah) || r.surah < 1 || r.surah > 114 || !Number.isInteger(r.num) || r.num < 1) return "Surə və ya ayə nömrəsi səhvdir";
  return null;
}

async function applyDetails(ayahId: number, r: AdminReq) {
  await db.delete(translations).where(eq(translations.ayahId, ayahId));
  await db.delete(words).where(eq(words.ayahId, ayahId));
  const trRows = LANGS.map((l) => ({ ayahId, lang: l, text: r.tr?.[l]?.trim() ?? "" })).filter((t) => t.text);
  if (trRows.length) await db.insert(translations).values(trRows);
  const wRows = (r.words ?? []).map((w, i) => ({
    ayahId, order: i, arabic: w.ar.trim(), latin: w.lat.trim(),
    meanAz: w.mean?.az ?? null, meanEn: w.mean?.en ?? null, meanRu: w.mean?.ru ?? null, meanTr: w.mean?.tr ?? null,
  }));
  if (wRows.length) await db.insert(words).values(wRows);
}

async function recount(surah: number) {
  const [{ n }] = await db.select({ n: count() }).from(ayahs).where(eq(ayahs.surahId, surah));
  await db.update(surahs).set({ ayahCount: Number(n) }).where(eq(surahs.id, surah));
}

export async function create(r: AdminReq) {
  const e = validate(r);
  if (e) return { err: e };
  const dup = await db.select({ id: ayahs.id }).from(ayahs).where(and(eq(ayahs.surahId, r.surah), eq(ayahs.number, r.num))).limit(1);
  if (dup.length) return { err: `${r.surah}:${r.num} artıq mövcuddur` };
  const [a] = await db.insert(ayahs).values({ surahId: r.surah, number: r.num, arabic: r.arabic.trim(), arabicPlain: arabicPlain(r.arabic) }).returning();
  await applyDetails(a.id, r);
  await recount(r.surah);
  return { dto: await get(a.id) };
}

export async function update(id: number, r: AdminReq) {
  const [a] = await db.select().from(ayahs).where(eq(ayahs.id, id)).limit(1);
  if (!a) return { err: "Ayə tapılmadı" };
  const e = validate({ ...r, surah: a.surahId, num: a.number });
  if (e) return { err: e };
  await db.update(ayahs).set({ arabic: r.arabic.trim(), arabicPlain: arabicPlain(r.arabic) }).where(eq(ayahs.id, id));
  await applyDetails(id, r);
  return { dto: await get(id) };
}

export async function remove(id: number) {
  const [a] = await db.select().from(ayahs).where(eq(ayahs.id, id)).limit(1);
  if (!a) return false;
  // əlaqəli məlumatlar da silinir
  for (const t of [translations, words, commentaries, favorites, notes, comments]) await db.delete(t).where(eq(t.ayahId, id));
  await db.delete(ayahs).where(eq(ayahs.id, id));
  await recount(a.surahId);
  return true;
}

export async function nextNumber(surah: number) {
  const [{ m }] = await db.select({ m: max(ayahs.number) }).from(ayahs).where(eq(ayahs.surahId, surah));
  return (m ?? 0) + 1;
}
