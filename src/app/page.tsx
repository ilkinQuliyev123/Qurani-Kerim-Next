import { dailyAyah } from "@/lib/quran";
import { getLang, getSession } from "@/lib/auth";
import LegacyScripts from "@/components/LegacyScripts";

export const metadata = { title: "Qurani-Kərim" };

export default async function Home() {
  const s = await getSession();
  const a = await dailyAyah(await getLang(), s?.uid);
  return (
    <>
      <link rel="stylesheet" href="/css/surah.css" />
      <main>
        <h1 className="ptitle" data-i18n="daily">Günün ayəsi</h1>
        {!a ? (
          <p className="none">Baza boşdur.</p>
        ) : (
          <article className="ayah" id={`a${a.num}`} data-id={a.id} data-surah={a.surah} data-num={a.num}>
            <div className="ayah__bar">
              <a className="ayah__no" href={`/surah/${a.surah}#a${a.num}`}>{a.ref}</a>
              <div className="ayah__acts">
                <button className="icon-btn tf" aria-label="Commentary" title="Təfsir">📖</button>
                <button className="icon-btn cm" aria-label="Comments">💬 <small>{a.comments}</small></button>
                <button className={`icon-btn fav${a.fav ? " on" : ""}`} aria-label="Wishlist">♥</button>
                <button className="icon-btn" aria-label="Note">✎</button>
              </div>
            </div>
            <p className="ayah__ar" lang="ar">{a.arabic}</p>
            {a.words.length > 0 && (
              <table className="words">
                <thead><tr><th data-i18n="word"></th><th data-i18n="latin"></th><th data-i18n="meaning"></th></tr></thead>
                <tbody>{a.words.map((w, i) => <tr key={i}><td lang="ar">{w.ar}</td><td>{w.lat}</td><td>{w.mean}</td></tr>)}</tbody>
              </table>
            )}
            <p className="ayah__tr">{a.translation}</p>
          </article>
        )}
        <p style={{ textAlign: "center", marginTop: 24 }}><button className="btn btn--solid" id="browseBtn" data-i18n="browse">Surələrə bax</button></p>
      </main>
      <LegacyScripts srcs={["/js/ayah.js", "/js/home.js"]} />
    </>
  );
}
