import LegacyScripts from "@/components/LegacyScripts";

export const metadata = { title: "Axtarış — Qurani-Kərim" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <>
      <link rel="stylesheet" href="/css/surah.css" />
      <main>
        <h1 className="rh"><span data-i18n="results"></span>: <span id="term">{(await searchParams).q ?? ""}</span> <small id="total"></small></h1>
        <section id="ayahList"></section>
        <div id="sentinel"><button id="moreBtn" className="btn more" data-i18n="more"></button></div>
        <p id="none" className="none" data-i18n="none" hidden></p>
      </main>
      <LegacyScripts srcs={["/js/ayah.js", "/js/search.js"]} />
    </>
  );
}
