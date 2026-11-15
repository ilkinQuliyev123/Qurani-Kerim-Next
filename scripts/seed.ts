/* Bazanı doldurur: surələr, ayələr, tərcümələr, təfsirlər, nümunə sözlər və admin hesabı.
   İşlətmə: npm run db:push && npm run db:seed   (.env.local-da DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD olmalıdır)
   Təkrar işlədəndə artıq dolu cədvəllərə toxunmur. */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { count } from "drizzle-orm";
import bcrypt from "bcryptjs";

config({ path: ".env.local" });

type SeedAyah = { ar: string; az: string; en: string; ru: string; tr: string };
type SeedSurah = { n: number; name: string; ayahs: SeedAyah[] };
type CSurah = { s: number; about: string | null; ayahs: { n: number; c: { t: string; x: string }[] }[] };

const arabicPlain = (s: string) =>
  (s ?? "").replace(/[ً-ٰٟـۖ-ۭ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").trim();

/** Sətirləri təxminən maxBytes ölçülü partiyalara bölür (HTTP sorğu limiti üçün). */
function* batches<T>(rows: T[], maxBytes = 900_000, maxRows = 1000) {
  let cur: T[] = [], size = 0;
  for (const r of rows) {
    const sz = JSON.stringify(r).length;
    if (cur.length && (size + sz > maxBytes || cur.length >= maxRows)) { yield cur; cur = []; size = 0; }
    cur.push(r); size += sz;
  }
  if (cur.length) yield cur;
}

// Nümunə söz-söz cədvəl (Fatihə 2-4) — köhnə layihədən
const SAMPLE_WORDS: Record<number, string[][]> = {
  2: [["الْحَمْدُ","al-ḥamdu","həmd, tərif","praise","хвала","hamd"],["لِلَّهِ","lillāhi","Allaha məxsusdur","belongs to God","принадлежит Аллаху","Allah’a aittir"],["رَبِّ","rabbi","Rəbbi","Lord of","Господь","Rabbi"],["الْعَالَمِينَ","al-ʿālamīn","aləmlərin","the worlds","миров","âlemlerin"]],
  3: [["الرَّحْمَٰنِ","ar-raḥmāni","Rəhman","the Gracious","Милостивый","Rahman"],["الرَّحِيمِ","ar-raḥīmi","Rəhim","the Merciful","Милосердный","Rahîm"]],
  4: [["مَالِكِ","māliki","sahibi","Master","Властелин","sahibi"],["يَوْمِ","yawmi","günün","of the day","дня","günün"],["الدِّينِ","ad-dīni","haqq-hesabın","judgment","воздаяния","dinin"]],
};

async function main() {
  const { db, schema } = await import("../src/lib/db");
  const { surahs, ayahs, translations, words, commentaries, users } = schema;

  const [{ n: surahCount }] = await db.select({ n: count() }).from(surahs);
  if (!Number(surahCount)) {
    const data: SeedSurah[] = JSON.parse(readFileSync("data/quran.json", "utf8"));
    await db.insert(surahs).values(data.map((s) => ({ id: s.n, name: s.name, ayahCount: s.ayahs.length })));
    const ayahRows = data.flatMap((s) => s.ayahs.map((a, i) => ({ surahId: s.n, number: i + 1, arabic: a.ar, arabicPlain: arabicPlain(a.ar) })));
    const idMap = new Map<string, number>();
    for (const b of batches(ayahRows)) {
      const ret = await db.insert(ayahs).values(b).returning({ id: ayahs.id, s: ayahs.surahId, n: ayahs.number });
      ret.forEach((r) => idMap.set(`${r.s}:${r.n}`, r.id));
      process.stdout.write(`\rayələr: ${idMap.size}/${ayahRows.length}`);
    }
    const trRows = data.flatMap((s) => s.ayahs.flatMap((a, i) => {
      const id = idMap.get(`${s.n}:${i + 1}`)!;
      return (["az", "en", "ru", "tr"] as const).filter((l) => a[l]?.trim()).map((l) => ({ ayahId: id, lang: l, text: a[l] }));
    }));
    let done = 0;
    for (const b of batches(trRows)) { await db.insert(translations).values(b); done += b.length; process.stdout.write(`\rtərcümələr: ${done}/${trRows.length}`); }
    const wRows = Object.entries(SAMPLE_WORDS).flatMap(([num, ws]) => ws.map((w, k) => ({
      ayahId: idMap.get(`1:${num}`)!, order: k, arabic: w[0], latin: w[1], meanAz: w[2], meanEn: w[3], meanRu: w[4], meanTr: w[5],
    })));
    await db.insert(words).values(wRows);
    console.log("\nsurələr/ayələr/tərcümələr hazırdır");
  }

  const [{ n: cCount }] = await db.select({ n: count() }).from(commentaries);
  if (!Number(cCount)) {
    const idRows = await db.select({ id: ayahs.id, s: ayahs.surahId, n: ayahs.number }).from(ayahs);
    const idMap = new Map(idRows.map((r) => [`${r.s}:${r.n}`, r.id]));
    const data: CSurah[] = JSON.parse(gunzipSync(readFileSync("data/commentary.json.gz")).toString("utf8"));
    for (const s of data) if (s.about?.trim()) await db.update(surahs).set({ about: s.about }).where((await import("drizzle-orm")).eq(surahs.id, s.s));
    const rows = data.flatMap((s) => s.ayahs.flatMap((a) => {
      const id = idMap.get(`${s.s}:${a.n}`);
      return id ? a.c.map((c, i) => ({ ayahId: id, order: i, title: c.t.slice(0, 300), text: c.x })) : [];
    }));
    let done = 0;
    for (const b of batches(rows, 800_000, 300)) { await db.insert(commentaries).values(b); done += b.length; process.stdout.write(`\rtəfsirlər: ${done}/${rows.length}`); }
    console.log("\ntəfsirlər hazırdır");
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const pw = process.env.ADMIN_PASSWORD;
  if (email && pw && pw.length >= 12) {
    const [{ n: uCount }] = await db.select({ n: count() }).from(users);
    const exists = (await db.select().from(users)).some((u) => u.email === email);
    if (!exists) {
      await db.insert(users).values({ name: "Admin", email, passwordHash: await bcrypt.hash(pw, 11), isAdmin: true });
      console.log("admin hesabı yaradıldı:", email, `(istifadəçi sayı: ${Number(uCount) + 1})`);
    }
  } else console.log("ADMIN_EMAIL/ADMIN_PASSWORD (≥12 simvol) verilməyib — admin yaradılmadı");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
