import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LegacyScripts from "@/components/LegacyScripts";

export const metadata = { title: "Admin — Qurani-Kərim" };

export default async function AdminPage() {
  const s = await getSession();
  if (!s || !s.admin) redirect("/login");
  return (
    <>
      <link rel="stylesheet" href="/css/surah.css" />
      <link rel="stylesheet" href="/css/user.css" />
      <link rel="stylesheet" href="/css/admin.css" />
      <div className="amain">
        <div className="ahead"><h1>Admin panel</h1><small>Ayələrin redaktəsi</small></div>

        <div className="tools2">
          <select id="surahSel" aria-label="Surə"></select>
          <input id="aq" type="search" placeholder="Bu surədə axtar: 3:2, ərəbcə və ya tərcümədən söz" autoComplete="off" />
          <button className="btn btn--solid" id="addAyah" type="button">+ Yeni ayə</button>
        </div>

        <table className="tbl">
          <thead><tr><th>Ayə</th><th>Ərəbcə</th><th>Azərbaycanca</th><th>Türkcə (Ali Bulaç)</th><th></th></tr></thead>
          <tbody id="tbody"></tbody>
        </table>
        <p id="none" className="none" hidden>Heç nə tapılmadı</p>
        <div className="pager"><button className="btn" id="prev">‹</button><span id="pinfo"></span><button className="btn" id="next">›</button></div>
      </div>

      <dialog id="editor" className="editor">
        <form method="dialog">
          <header><h2 id="eTitle"></h2><button type="button" className="icon-btn" id="eCancel" aria-label="Bağla">✕</button></header>
          <div className="body">
            <div id="numRow" hidden><label className="l" htmlFor="fNum">Ayə nömrəsi</label><input id="fNum" type="number" min="1" className="field" /></div>
            <div><label className="l" htmlFor="fAr">1. Ərəbcə orijinal mətn</label><textarea id="fAr" className="field"></textarea></div>

            <div className="tabs" id="tabs"><button type="button" data-l="az">AZ</button><button type="button" data-l="en">EN</button><button type="button" data-l="ru">RU</button><button type="button" data-l="tr">TR</button></div>

            <div>
              <label className="l">2. Söz-söz cədvəl (seçilmiş dil üçün mənalar)</label>
              <table className="wt"><thead><tr><th>Ərəbcə</th><th>Latınca oxunuş</th><th>Mənası</th><th></th></tr></thead><tbody id="fWords"></tbody></table>
              <button type="button" className="btn" id="addWord">+ Söz əlavə et</button>
            </div>

            <div><label className="l" htmlFor="fTr">3. Tərcümə (seçilmiş dil)</label><textarea id="fTr" className="field"></textarea></div>
          </div>
          <footer><span id="eErr" className="err" role="alert" style={{ marginRight: "auto" }}></span>
            <button type="button" className="btn" id="eDel">Sil</button>
            <button type="button" className="btn" id="eCancel2">Ləğv et</button>
            <button type="button" className="btn btn--solid" id="eSave">Yadda saxla</button></footer>
        </form>
      </dialog>
      <div id="toast" className="toast" role="status"></div>

      <LegacyScripts srcs={["/js/admin.js"]} />
    </>
  );
}
