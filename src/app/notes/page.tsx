import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LegacyScripts from "@/components/LegacyScripts";

export const metadata = { title: "Qeydlərim — Qurani-Kərim" };

export default async function NotesPage() {
  const s = await getSession();
  if (!s) redirect("/login");
  return (
    <>
      <link rel="stylesheet" href="/css/surah.css" />
      <link rel="stylesheet" href="/css/user.css" />
      <main>
        <h1 className="ptitle" data-i18n="nTitle"></h1>

        <form id="noteForm" className="nform" noValidate>
          <input name="ref" className="field" data-i18n-ph="refPh" placeholder="Ayə: 3:2" autoComplete="off" />
          <textarea name="text" className="field" data-i18n-ph="notePh" placeholder="Bu ayə sənə nə hiss etdirdi?" maxLength={2000}></textarea>
          <div className="nform__row">
            <button className="btn btn--solid" type="submit" data-i18n="save"></button>
            <span id="formErr" className="err" role="alert"></span>
          </div>
        </form>

        <section id="noteList"></section>
        <div id="sentinel"><button id="moreBtn" className="btn more" data-i18n="more"></button></div>
        <p id="noNotes" className="none" data-i18n="noNotes" hidden></p>
      </main>

      <dialog id="confirm" className="modal confirm">
        <div className="modal__box">
          <h2 data-i18n="delQ"></h2><p data-i18n="delHint"></p>
          <div className="row"><button id="no" className="btn" data-i18n="cancel"></button><button id="yes" className="btn btn--solid" data-i18n="del"></button></div>
        </div>
      </dialog>
      <LegacyScripts srcs={["/js/ayah.js", "/js/user.js", "/js/notes.js"]} />
    </>
  );
}
