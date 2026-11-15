import { notFound } from "next/navigation";
import { getSurah, range } from "@/lib/quran";
import { getLang, getSession } from "@/lib/auth";
import { SurahAyahList, T } from "@/components/AyahList";

type Props = { params: Promise<{ n: string }> };

export async function generateMetadata({ params }: Props) {
  const raw = (await params).n;
  const s = /^\d{1,3}$/.test(raw) ? await getSurah(+raw) : null;
  return { title: s ? `${s.name} — Qurani-Kərim` : "Qurani-Kərim" };
}

const ABOUT: Record<string, string> = { az: "Haqqında", en: "About", ru: "О суре", tr: "Hakkında" };
const navBtn = "inline-flex min-h-11 items-center rounded-lg border border-gold px-5 text-gold hover:bg-gold hover:text-on-gold";

export default async function SurahPage({ params }: Props) {
  const raw = (await params).n;
  if (!/^\d{1,3}$/.test(raw)) notFound();
  const s = await getSurah(+raw);
  if (!s) notFound();
  const [session, lang] = await Promise.all([getSession(), getLang()]);
  const first = await range(s.id, 1, 20, lang, session?.uid);

  return (
    <main className="mx-auto my-10 w-[min(920px,100%-2rem)]">
      <section className="mb-8 text-center">
        <div className="mx-auto mb-3 grid size-20 place-items-center rounded-full border-2 border-gold bg-surface font-head text-3xl font-bold text-gold">{s.id}</div>
        <h1 className="font-head text-3xl">{s.name}</h1>
        <p className="text-muted">{s.ayahCount} <T k="ayahs" /></p>
        {s.id !== 1 && s.id !== 9 && (
          <p lang="ar" dir="rtl" className="mt-4 font-ar text-[clamp(1.6rem,4.5vw,2.4rem)] text-gold">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            <small dir="ltr" className="block font-ui text-sm text-muted"><T k="bismillah" /></small>
          </p>
        )}
        {s.about && (
          <details className="mt-4 rounded-card border border-line bg-surface p-3 text-start">
            <summary className="min-h-11 cursor-pointer py-2 font-semibold text-gold">{ABOUT[lang] ?? ABOUT.az}</summary>
            <p className="whitespace-pre-line leading-relaxed">{s.about}</p>
          </details>
        )}
      </section>

      <SurahAyahList surah={s.id} initial={first} total={s.ayahCount} authed={!!session} isAdmin={session?.admin} />

      <nav className="mt-8 flex flex-wrap justify-between gap-3">
        {s.id > 1 ? <a className={navBtn} href={`/surah/${s.id - 1}`}>← <T k="prev" /></a> : <span />}
        {s.id < 114 && <a className={navBtn} href={`/surah/${s.id + 1}`}><T k="next" /> →</a>}
      </nav>
    </main>
  );
}
