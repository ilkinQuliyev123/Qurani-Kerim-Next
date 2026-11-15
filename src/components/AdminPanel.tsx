"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminAyah, AdminReq, AdminWord } from "@/lib/admin";
import { ApiError, http } from "@/lib/client/http";

type SurahItem = { n: number; name: string; count: number };
type Draft = { id: number | null; ref: string; surah: number; num: string; arabic: string; tr: Record<string, string>; words: AdminWord[] };

const PAGE = 20;
const LANGS = ["az", "en", "ru", "tr"] as const;
const LANG_LABEL: Record<string, string> = { az: "Azərbaycanca", en: "English", ru: "Русский", tr: "Türkçe" };

const field = "w-full min-h-11 rounded-lg border border-line bg-surface-2 px-3 py-2 text-base text-text outline-none focus:border-gold";
const btn = "min-h-11 min-w-11 rounded-lg border border-line bg-surface px-4 text-base text-text transition-colors hover:border-gold disabled:opacity-40 disabled:hover:border-line cursor-pointer disabled:cursor-default";
const btnSolid = "min-h-11 min-w-11 rounded-lg border border-gold bg-gold px-4 text-base font-semibold text-on-gold transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer";
const lbl = "mb-1 block text-sm text-muted";

const emptyWord = (): AdminWord => ({ ar: "", lat: "", mean: { az: "", en: "", ru: "", tr: "" } });
const snip = (s: string | undefined, n = 120) => { const t = s ?? ""; return t.length > n ? t.slice(0, n) + "…" : t; };
const errMsg = (e: unknown) => (e instanceof ApiError ? e.data?.err ?? "Xəta" : "Xəta");

export default function AdminPanel() {
  const [surahs, setSurahs] = useState<SurahItem[]>([]);
  const [surah, setSurah] = useState(1);
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminAyah[]>([]);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const dlg = useRef<HTMLDialogElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const pages = Math.max(1, Math.ceil(total / PAGE));

  const showToast = (m: string) => {
    setToast(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  };

  useEffect(() => {
    http<SurahItem[]>("/api/surahs").then(setSurahs).catch(() => setSurahs([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setQ(qInput); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [qInput]);

  const load = useCallback(async () => {
    try {
      const r = await http<{ items: AdminAyah[]; total: number }>(
        `/api/admin/ayahs?surah=${surah}&q=${encodeURIComponent(q)}&page=${page}`);
      const p = Math.max(1, Math.ceil(r.total / PAGE));
      if (page > p) { setPage(p); return; }
      setItems(r.items); setTotal(r.total); setLoaded(true);
    } catch (e) { showToast(errMsg(e)); }
  }, [surah, q, page]);

  useEffect(() => { void load(); }, [load]);

  const open = (a: AdminAyah | null, num?: number) => {
    setErr("");
    setDraft(a
      ? { id: a.id, ref: a.ref, surah: a.surah, num: String(a.num), arabic: a.arabic, tr: { ...a.tr }, words: a.words.map((w) => ({ ...w, mean: { ...w.mean } })) }
      : { id: null, ref: "", surah, num: String(num ?? ""), arabic: "", tr: {}, words: [] });
    dlg.current?.showModal();
  };

  const addNew = async () => {
    try { open(null, await http<number>(`/api/admin/ayahs/next/${surah}`)); } catch (e) { showToast(errMsg(e)); }
  };
  const edit = async (id: number) => {
    try { open(await http<AdminAyah>(`/api/admin/ayahs/${id}`)); } catch (e) { showToast(errMsg(e)); }
  };

  const patch = (p: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...p } : d));
  const patchWord = (i: number, f: (w: AdminWord) => AdminWord) =>
    setDraft((d) => (d ? { ...d, words: d.words.map((w, j) => (j === i ? f(w) : w)) } : d));

  const save = async () => {
    if (!draft) return;
    if (!draft.arabic.trim()) return setErr("Ərəbcə mətn boş ola bilməz");
    if (!(draft.tr.az ?? "").trim()) return setErr("Azərbaycanca tərcümə məcburidir");
    if (draft.words.some((w) => !w.ar.trim() || !w.lat.trim())) return setErr("Hər sözün ərəbcəsi və oxunuşu dolu olmalıdır");
    const body: AdminReq = { surah: draft.surah, num: Number(draft.num), arabic: draft.arabic, tr: draft.tr, words: draft.words };
    setBusy(true);
    try {
      if (draft.id) await http(`/api/admin/ayahs/${draft.id}`, { method: "PUT", body });
      else await http("/api/admin/ayahs", { method: "POST", body });
    } catch (e) { setBusy(false); return setErr(errMsg(e)); }
    setBusy(false);
    dlg.current?.close();
    showToast("Yadda saxlandı");
    void load();
  };

  const del = async () => {
    if (!draft?.id || !confirm(`${draft.ref} silinsin?`)) return;
    setBusy(true);
    try { await http(`/api/admin/ayahs/${draft.id}`, { method: "DELETE" }); }
    catch (e) { setBusy(false); return setErr(errMsg(e)); }
    setBusy(false);
    dlg.current?.close();
    showToast("Silindi");
    void load();
  };

  const noEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") e.preventDefault();
  };

  return (
    <div className="text-text">
      <div className="mb-6">
        <h1 className="font-head text-3xl text-gold">Admin panel</h1>
        <small className="text-muted">Ayələrin redaktəsi</small>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select aria-label="Surə" className={`${field} sm:w-auto sm:min-w-56`} value={surah}
          onChange={(e) => { setSurah(+e.target.value); setPage(1); }}>
          {surahs.length === 0 && <option value={surah}>{surah}</option>}
          {surahs.map((s) => <option key={s.n} value={s.n}>{s.n}. {s.name} ({s.count})</option>)}
        </select>
        <input type="search" aria-label="Axtar" autoComplete="off" className={`${field} min-w-0 flex-1 basis-60`}
          placeholder="Bu surədə axtar: 3:2, ərəbcə və ya tərcümədən söz"
          value={qInput} onChange={(e) => setQInput(e.target.value)} />
        <button type="button" className={btnSolid} onClick={addNew}>+ Yeni ayə</button>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface" role="table" aria-label="Ayələr">
        <div role="row" className="hidden border-b border-line px-4 py-2 text-sm text-muted sm:grid sm:grid-cols-[4.5rem_1fr_1fr_auto] sm:gap-4">
          <span role="columnheader">Ayə</span><span role="columnheader">Ərəbcə</span><span role="columnheader">Azərbaycanca</span><span role="columnheader"><span className="sr-only">Əməliyyatlar</span></span>
        </div>
        {items.map((a) => (
          <div role="row" key={a.id} className="grid gap-2 border-b border-line px-4 py-3 last:border-b-0 sm:grid-cols-[4.5rem_1fr_1fr_auto] sm:items-start sm:gap-4">
            <b role="cell" className="text-gold">{a.ref}</b>
            <span role="cell" lang="ar" dir="rtl" className="font-ar text-xl leading-loose">{snip(a.arabic, 90)}</span>
            <span role="cell" className="text-sm text-muted">{snip(a.tr.az)}</span>
            <span role="cell" className="flex gap-2">
              <button type="button" className={btn} onClick={() => edit(a.id)}>Redaktə</button>
            </span>
          </div>
        ))}
      </div>
      {loaded && total === 0 && <p className="my-6 text-center text-muted">Heç nə tapılmadı</p>}

      <div className="mt-4 flex items-center justify-center gap-4">
        <button type="button" className={btn} aria-label="Əvvəlki" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
        <span aria-live="polite" className="text-sm text-muted">{page} / {pages}  ({total} ayə)</span>
        <button type="button" className={btn} aria-label="Növbəti" disabled={page >= pages} onClick={() => setPage(page + 1)}>›</button>
      </div>

      <dialog ref={dlg} aria-labelledby="admin-etitle" onClose={() => setErr("")}
        className="m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-surface p-0 text-text backdrop:bg-black/60 sm:m-auto sm:h-auto sm:max-h-[90dvh] sm:w-[min(900px,100%-2rem)] sm:rounded-[var(--radius-card)] sm:border sm:border-line">
        {draft && (
          <div className="flex h-dvh flex-col sm:h-auto sm:max-h-[90dvh]" onKeyDown={noEnter}>
            <header className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 id="admin-etitle" className="font-head text-xl text-gold">{draft.id ? `Ayə ${draft.ref}` : "Yeni ayə"}</h2>
              <button type="button" className={btn} aria-label="Bağla" onClick={() => dlg.current?.close()}>✕</button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl} htmlFor="f-surah">Surə</label>
                  <select id="f-surah" className={field} value={draft.surah} disabled={!!draft.id}
                    onChange={(e) => patch({ surah: +e.target.value })}>
                    {surahs.map((s) => <option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl} htmlFor="f-num">Ayə nömrəsi</label>
                  <input id="f-num" type="number" min={1} className={field} value={draft.num} readOnly={!!draft.id}
                    onChange={(e) => patch({ num: e.target.value })} />
                </div>
              </div>

              <div>
                <label className={lbl} htmlFor="f-ar">Ərəbcə orijinal mətn</label>
                <textarea id="f-ar" dir="rtl" lang="ar" rows={3} className={`${field} font-ar text-2xl leading-loose`}
                  value={draft.arabic} onChange={(e) => patch({ arabic: e.target.value })} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {LANGS.map((l) => (
                  <div key={l}>
                    <label className={lbl} htmlFor={`f-tr-${l}`}>Tərcümə — {LANG_LABEL[l]}{l === "az" ? " (məcburi)" : ""}</label>
                    <textarea id={`f-tr-${l}`} rows={3} className={field} value={draft.tr[l] ?? ""}
                      onChange={(e) => patch({ tr: { ...draft.tr, [l]: e.target.value } })} />
                  </div>
                ))}
              </div>

              <fieldset>
                <legend className={lbl}>Söz-söz cədvəl</legend>
                <div className="space-y-3">
                  {draft.words.map((w, i) => (
                    <div key={i} className="rounded-lg border border-line bg-surface-2 p-3">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                        <input aria-label={`Söz ${i + 1}: ərəbcə`} dir="rtl" lang="ar" className={`${field} font-ar text-xl`} value={w.ar}
                          onChange={(e) => patchWord(i, (x) => ({ ...x, ar: e.target.value }))} />
                        <input aria-label={`Söz ${i + 1}: latınca oxunuş`} className={field} placeholder="Oxunuş" value={w.lat}
                          onChange={(e) => patchWord(i, (x) => ({ ...x, lat: e.target.value }))} />
                        <button type="button" className={`${btn} col-span-2 sm:col-span-1`} aria-label={`Söz ${i + 1} sil`}
                          onClick={() => setDraft((d) => (d ? { ...d, words: d.words.filter((_, j) => j !== i) } : d))}>✕</button>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-4">
                        {LANGS.map((l) => (
                          <input key={l} aria-label={`Söz ${i + 1}: mənası (${l.toUpperCase()})`} placeholder={l.toUpperCase()} className={field}
                            value={w.mean[l] ?? ""} onChange={(e) => patchWord(i, (x) => ({ ...x, mean: { ...x.mean, [l]: e.target.value } }))} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className={`${btn} mt-3`} onClick={() => setDraft((d) => (d ? { ...d, words: [...d.words, emptyWord()] } : d))}>+ Söz əlavə et</button>
              </fieldset>
            </div>

            <footer className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
              <span role="alert" aria-live="assertive" className="mr-auto min-w-0 text-sm text-red-500">{err}</span>
              {draft.id && <button type="button" className={btn} disabled={busy} onClick={del}>Sil</button>}
              <button type="button" className={btn} onClick={() => dlg.current?.close()}>Ləğv et</button>
              <button type="button" className={btnSolid} disabled={busy} onClick={save}>Yadda saxla</button>
            </footer>
          </div>
        )}
      </dialog>

      <div role="status" aria-live="polite"
        className={`pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gold px-5 py-3 text-on-gold shadow-lg transition-opacity ${toast ? "opacity-100" : "opacity-0"}`}>
        {toast}
      </div>
    </div>
  );
}
