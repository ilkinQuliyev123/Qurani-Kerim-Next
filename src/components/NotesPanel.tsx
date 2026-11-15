"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { ApiError, http } from "@/lib/client/http";

type Note = { id: number; ref: string; arabic: string; text: string; date: string };
type Page = { items: Note[]; total: number };
const LIMIT = 20;

const field =
  "w-full rounded-xl border border-line bg-bg px-[.9rem] py-3 text-base text-text outline-none transition focus:border-gold focus:shadow-[0_0_0_4px_rgba(var(--glow),.15)]";
const btn =
  "min-h-11 cursor-pointer rounded-full border border-line px-4 py-2 text-[.9rem] font-bold text-text transition hover:border-gold disabled:cursor-wait disabled:opacity-50";
const btnSolid = `${btn} border-gold bg-gold text-on-gold`;

export default function NotesPanel({ initialRef }: { initialRef: string }) {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<Note[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [ref, setRef] = useState(initialRef);
  const [text, setText] = useState("");
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [delId, setDelId] = useState<number | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const busy = useRef(false);

  const load = useCallback(async (offset: number, replace: boolean) => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    try {
      const r = await http<Page>(`/api/notes?offset=${offset}&limit=${LIMIT}`);
      setItems((p) => (replace ? r.items : [...p, ...r.items]));
      setTotal(r.total);
    } catch { /* 401 http-də yönləndirilir */ }
    busy.current = false;
    setLoading(false);
  }, []);

  useEffect(() => { void load(0, true); }, [load]);
  useEffect(() => { if (initialRef) textRef.current?.focus(); }, [initialRef]);

  const msg = (k: string) => { const v = t(k); return v === k ? "Xəta baş verdi" : v; };

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const r = ref.trim().replace(/\s/g, ""), tx = text.trim();
    if (!/^\d{1,3}:\d{1,3}$/.test(r)) return setFormErr(msg("badRef"));
    if (!tx) return setFormErr(msg("emptyNote"));
    setFormErr(""); setSaving(true);
    try {
      await http("/api/notes", { body: { ref: r, text: tx } });
      setText("");
      await load(0, true);
    } catch (x) {
      setFormErr(msg(x instanceof ApiError && x.data?.err ? x.data.err : "badRef"));
    }
    setSaving(false);
  }

  async function saveEdit(id: number) {
    const tx = editText.trim();
    if (!tx) return;
    try {
      await http(`/api/notes/${id}`, { method: "PUT", body: { text: tx } });
      setEditId(null);
      await load(0, true);
    } catch { /* ignore */ }
  }

  async function confirmDel() {
    if (delId === null) return;
    try { await http(`/api/notes/${delId}`, { method: "DELETE" }); } catch { /* ignore */ }
    dlg.current?.close();
    setDelId(null);
    await load(0, true);
  }

  return (
    <main className="mx-auto my-10 w-[min(920px,100%-2rem)]">
      <h1 className="mb-6 font-head text-[clamp(1.6rem,8vw,2.6rem)] font-semibold text-gold">{t("nTitle")}</h1>

      <form onSubmit={add} noValidate className="mb-10 grid gap-3 rounded-card border border-line bg-surface p-4 sm:p-5">
        <input name="ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder={t("refPh")} autoComplete="off"
          aria-label={t("refPh")} className={`${field} min-h-11 max-w-[180px] font-ui`} />
        <div>
          <textarea ref={textRef} name="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("notePh")}
            aria-label={t("notePh")} maxLength={2000} className={`${field} min-h-[110px] resize-y font-head leading-[1.7]`} />
          <div className="mt-1 text-right text-xs text-muted" aria-hidden="true">{text.length}/2000</div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={saving} className={btnSolid}>{t("save")}</button>
          <span role="alert" className="text-sm text-[#ff8a6b]">{formErr}</span>
        </div>
      </form>

      <section className="grid gap-5">
        {items.map((n) => {
          const [s, v] = n.ref.split(":");
          const editing = editId === n.id;
          return (
            <article key={n.id} className="ayah-card rounded-card border border-line bg-surface p-4 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <a href={`/surah/${s}#a${v}`} className="inline-flex min-h-11 items-center font-bold text-gold-soft hover:underline">{n.ref}</a>
                <time dateTime={n.date} className="text-[.85rem] text-muted">{new Date(n.date).toLocaleString(lang)}</time>
              </div>
              <p lang="ar" dir="rtl" className="mb-3 text-right font-ar text-[1.4rem] leading-loose text-gold-soft opacity-85">{n.arabic}</p>
              {editing ? (
                <textarea value={editText} onChange={(e) => setEditText(e.target.value)} maxLength={2000} autoFocus
                  aria-label={t("edit")} className={`${field} min-h-[110px] resize-y font-head leading-[1.7]`} />
              ) : (
                <p className="whitespace-pre-wrap break-words border-l-[3px] border-gold pl-3 font-head text-base font-medium leading-[1.8] sm:text-[1.1rem]">{n.text}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2.5">
                {editing ? (
                  <>
                    <button type="button" className={btnSolid} onClick={() => void saveEdit(n.id)}>{t("save")}</button>
                    <button type="button" className={btn} onClick={() => setEditId(null)}>{t("cancel")}</button>
                  </>
                ) : (
                  <>
                    <button type="button" className={btn} onClick={() => { setEditId(n.id); setEditText(n.text); }}>{t("edit")}</button>
                    <button type="button" className={btn} onClick={() => { setDelId(n.id); dlg.current?.showModal(); }}>{t("del")}</button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {total !== null && items.length < total && (
        <div className="mt-6 text-center">
          <button type="button" disabled={loading} onClick={() => void load(items.length, false)} className={btn}>{t("more")}</button>
        </div>
      )}
      {total === 0 && <p className="mt-6 text-center text-muted">{t("noNotes")}</p>}

      <dialog ref={dlg} onClick={(e) => { if (e.target === dlg.current) dlg.current?.close(); }}
        className="m-auto w-[min(420px,100%-2rem)] rounded-card border border-line bg-surface p-5 text-center text-text backdrop:bg-black/60">
        <h2 className="mb-2 font-head text-[1.4rem] font-semibold text-gold">{t("delQ")}</h2>
        <p className="mb-4 text-muted">{t("delHint")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" className={`${btn} flex-1 basis-[120px]`} onClick={() => dlg.current?.close()}>{t("cancel")}</button>
          <button type="button" className={`${btnSolid} flex-1 basis-[120px]`} onClick={() => void confirmDel()}>{t("del")}</button>
        </div>
      </dialog>
    </main>
  );
}
