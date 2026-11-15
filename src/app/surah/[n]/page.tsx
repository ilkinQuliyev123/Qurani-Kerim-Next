import { notFound } from "next/navigation";
import { getSurah } from "@/lib/quran";
import LegacyScripts from "@/components/LegacyScripts";

type Props = { params: Promise<{ n: string }> };

export async function generateMetadata({ params }: Props) {
  const s = /^\d+$/.test((await params).n) ? await getSurah(+(await params).n) : null;
  return { title: s ? `${s.name} — Qurani-Kərim` : "Qurani-Kərim" };
}

export default async function SurahPage({ params }: Props) {
  const raw = (await params).n;
  if (!/^\d{1,3}$/.test(raw)) notFound();
  const s = await getSurah(+raw);
  if (!s) notFound();
  return (
    <>
      <link rel="stylesheet" href="/css/surah.css" />
      <main id="surahPage" data-n={s.id} data-count={s.ayahCount}>
        <section className="sh">
          <div className="sh__no" id="sNo">{s.id}</div>
          <h1 id="sName">{s.name}</h1>
          <p><span id="sCount">{s.ayahCount}</span> <span data-i18n="ayahs"></span></p>
          <p className="sh__bism" id="bism" lang="ar" hidden={s.id === 1 || s.id === 9}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ<small data-i18n="bismillah"></small>
          </p>
        </section>

        <section id="ayahList"></section>
        <div id="sentinel"><button id="moreBtn" className="btn more" data-i18n="more"></button></div>

        <nav className="snav">
          {s.id > 1 && <a id="prevS" className="btn" href={`/surah/${s.id - 1}`} data-i18n="prev"></a>}
          {s.id < 114 && <a id="nextS" className="btn" href={`/surah/${s.id + 1}`} data-i18n="next"></a>}
        </nav>
      </main>
      <LegacyScripts srcs={["/js/ayah.js", "/js/surah.js"]} />
    </>
  );
}
