"use client";
import { useCallback, useEffect, useState } from "react";
import { http } from "@/lib/client/http";
import { useI18n } from "@/lib/i18n/provider";

type Cm = { id: number; user: string; text: string; date: string; mine: boolean };

export default function CommentsPanel({
  ayahId, authed, isAdmin, onCount,
}: { ayahId: number; authed: boolean; isAdmin?: boolean; onCount: (n: number) => void }) {
  const { t, lang } = useI18n();
  const [list, setList] = useState<Cm[] | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await http<Cm[]>(`/api/ayahs/${ayahId}/comments`);
    setList(r);
    onCount(r.length);
  }, [ayahId, onCount]);

  useEffect(() => { load().catch(() => setList([])); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = text.trim();
    if (!v || busy) return;
    setBusy(true);
    try {
      await http(`/api/ayahs/${ayahId}/comments`, { method: "POST", body: { text: v } });
      setText("");
      await load();
    } catch {} finally { setBusy(false); }
  }
  async function del(id: number) {
    try { await http(`/api/comments/${id}`, { method: "DELETE" }); await load(); } catch {}
  }

  return (
    <div className="mt-4 border-t border-line pt-3">
      <h4 className="mb-2 font-head text-gold">{t("comments")}</h4>
      {authed ? (
        <form onSubmit={submit} className="mb-3 flex flex-col gap-2">
          <textarea
            value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} rows={2}
            placeholder={t("cmPh")} aria-label={t("cmPh")}
            className="w-full rounded-lg border border-line bg-surface-2 p-3 text-text"
          />
          <button disabled={busy} className="min-h-11 self-start rounded-lg bg-gold px-5 font-semibold text-on-gold disabled:opacity-60">{t("send")}</button>
        </form>
      ) : (
        <p className="mb-3"><a href="/login" className="inline-flex min-h-11 items-center text-gold underline">{t("loginToCm")}</a></p>
      )}
      {list && list.length === 0 && <p className="text-muted">{t("noCm")}</p>}
      {list?.map((c) => (
        <div key={c.id} className="mb-2 rounded-lg bg-surface-2 p-3">
          <div className="flex items-center justify-between gap-2">
            <span><b>{c.user}</b> <time className="text-sm text-muted">{new Date(c.date).toLocaleString(lang)}</time></span>
            {(c.mine || isAdmin) && (
              <button onClick={() => del(c.id)} aria-label="Delete" className="min-h-11 min-w-11 text-muted hover:text-gold">✕</button>
            )}
          </div>
          <p className="whitespace-pre-line break-words">{c.text}</p>
        </div>
      ))}
    </div>
  );
}
