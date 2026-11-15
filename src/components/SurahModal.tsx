"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { http } from "@/lib/client/http";

type SurahItem = { n: number; name: string; count: number };

export default function SurahModal() {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<SurahItem[] | null>(null);
  const loading = useRef(false);
  const [q, setQ] = useState("");

  const open = useCallback(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    if (!loading.current) {
      loading.current = true;
      http<SurahItem[]>("/api/surahs")
        .then(setItems)
        .catch(() => { loading.current = false; });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("open-surahs", open);
    return () => window.removeEventListener("open-surahs", open);
  }, [open]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!items) return [];
    return s ? items.filter((x) => x.name.toLowerCase().includes(s) || String(x.n).includes(s)) : items;
  }, [items, q]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="surah-modal-title"
      onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
      className="m-0 mt-auto max-h-[90dvh] w-full max-w-none overflow-hidden rounded-t-2xl border border-line bg-surface p-0 text-text backdrop:bg-black/50 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-3xl sm:rounded-2xl"
    >
      <div className="flex max-h-[90dvh] flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line p-4">
          <h2 id="surah-modal-title" className="font-head text-xl text-gold">{t("surahs")}</h2>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close"
            className="grid size-11 place-items-center rounded-lg text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-gold"
          >✕</button>
        </div>
        <div className="border-b border-line p-4">
          <label htmlFor="surah-filter" className="sr-only">{t("filter")}</label>
          <input
            id="surah-filter"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("filter")}
            autoComplete="off"
            className="min-h-11 w-full rounded-lg border border-line bg-bg px-3 text-text placeholder:text-muted focus-visible:outline-2 focus-visible:outline-gold"
          />
        </div>
        {list.length === 0 && items ? (
          <p className="p-6 text-center text-muted">{t("noSurah")}</p>
        ) : (
          <ol className="m-0 grid list-none gap-1 overflow-y-auto p-3 sm:grid-cols-2">
            {list.map((s) => (
              <li key={s.n}>
                <a
                  href={`/surah/${s.n}`}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-gold"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-sm font-bold text-gold">{s.n}</span>
                  <span className="flex-1 truncate">{s.name}</span>
                  <span className="shrink-0 text-xs text-muted">{s.count} {t("ayahs")}</span>
                </a>
              </li>
            ))}
          </ol>
        )}
      </div>
    </dialog>
  );
}
