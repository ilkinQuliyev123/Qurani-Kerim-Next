"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AyahDto } from "@/lib/quran";
import { useI18n } from "@/lib/i18n/provider";
import type { Lang } from "@/lib/i18n/dict";
import AyahCard from "./AyahCard";
import { http } from "@/lib/client/http";

type Page = { items: AyahDto[]; total: number };

export default function AyahList({
  initial, total, authed, isAdmin, fetchPage, emptyKey, removeOnUnfav,
}: {
  initial: AyahDto[]; total: number; authed: boolean; isAdmin?: boolean;
  fetchPage: (offset: number, lang: Lang) => Promise<Page>;
  emptyKey?: string; pageSize?: number; removeOnUnfav?: boolean;
}) {
  const { lang, t } = useI18n();
  const [items, setItems] = useState(initial);
  const [tot, setTot] = useState(total);
  const itemsRef = useRef(initial);
  const totRef = useRef(total);
  const busy = useRef(false);
  const langRef = useRef(lang);
  const sentinel = useRef<HTMLDivElement>(null);
  const fetchRef = useRef(fetchPage);
  useEffect(() => { fetchRef.current = fetchPage; });

  const commit = (list: AyahDto[], n: number) => {
    itemsRef.current = list; totRef.current = n; setItems(list); setTot(n);
  };
  const hasMore = () => itemsRef.current.length < totRef.current;

  const loadMore = useCallback(async (until?: (l: AyahDto[]) => boolean) => {
    if (busy.current) return;
    busy.current = true;
    try {
      do {
        if (!hasMore()) break;
        const r = await fetchRef.current(itemsRef.current.length, langRef.current);
        if (!r.items.length) { commit(itemsRef.current, itemsRef.current.length); break; }
        commit([...itemsRef.current, ...r.items], r.total);
      } while (until && !until(itemsRef.current));
    } catch {} finally { busy.current = false; }
  }, []);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) loadMore(); }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, items.length === 0]);

  useEffect(() => {
    const m = location.hash.match(/^#a(\d+)$/);
    if (!m) return;
    const target = +m[1];
    (async () => {
      await loadMore((l) => l.some((a) => a.num === target));
      requestAnimationFrame(() => document.getElementById(`a${target}`)?.scrollIntoView({ block: "center" }));
    })();
  }, [loadMore]);

  useEffect(() => {
    if (langRef.current === lang) return;
    langRef.current = lang;
    (async () => {
      while (busy.current) await new Promise((r) => setTimeout(r, 50));
      busy.current = true;
      try {
        const want = itemsRef.current.length;
        const out: AyahDto[] = [];
        let n = totRef.current;
        while (out.length < want) {
          const r = await fetchRef.current(out.length, lang);
          if (!r.items.length) break;
          out.push(...r.items);
          n = r.total;
        }
        commit(out.slice(0, want), n);
      } catch {} finally { busy.current = false; }
    })();
  }, [lang]);

  const onUnfav = (id: number) => {
    if (!removeOnUnfav) return;
    commit(itemsRef.current.filter((a) => a.id !== id), totRef.current - 1);
  };

  if (items.length === 0 && tot <= 0) {
    return emptyKey ? <p className="my-10 text-center text-muted">{t(emptyKey)}</p> : null;
  }
  return (
    <>
      <section>
        {items.map((a) => (
          <AyahCard key={a.id} ayah={a} authed={authed} isAdmin={isAdmin} onUnfav={onUnfav} />
        ))}
      </section>
      <div ref={sentinel} className="my-6 text-center" hidden={items.length >= tot}>
        <button onClick={() => loadMore()} className="min-h-11 rounded-lg border border-gold px-6 text-gold hover:bg-gold hover:text-on-gold">{t("more")}</button>
      </div>
    </>
  );
}

/** Server səhifələrdə tərcümə olunan mətn. */
export function T({ k }: { k: string }) {
  const { t } = useI18n();
  return <>{t(k)}</>;
}

/** "Surələrə bax" düyməsi: başlıqdakı surə siyahısını açır. */
export function BrowseButton() {
  const { t } = useI18n();
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("open-surahs"))}
      className="min-h-11 rounded-lg bg-gold px-6 font-semibold text-on-gold"
    >
      {t("browse")}
    </button>
  );
}

type Common = { initial: AyahDto[]; total: number; authed: boolean; isAdmin?: boolean };

/** Surə səhifəsi üçün: /api/surahs/{n}/ayahs?from&to&lang */
export function SurahAyahList({ surah, ...rest }: Common & { surah: number }) {
  const fetchPage = useCallback(async (offset: number, l: Lang): Promise<Page> => {
    const items = await http<AyahDto[]>(`/api/surahs/${surah}/ayahs?from=${offset + 1}&to=${offset + 20}&lang=${l}`);
    return { items, total: rest.total };
  }, [surah, rest.total]);
  return <AyahList {...rest} fetchPage={fetchPage} />;
}

export function SearchAyahList({ q, ...rest }: Common & { q: string }) {
  const fetchPage = useCallback(
    (offset: number, l: Lang) => http<Page>(`/api/search?q=${encodeURIComponent(q)}&lang=${l}&offset=${offset}&limit=20`),
    [q],
  );
  return <AyahList {...rest} fetchPage={fetchPage} emptyKey="none" />;
}

export function WishlistAyahList(props: Common) {
  const fetchPage = useCallback(
    (offset: number, l: Lang) => http<Page>(`/api/wishlist?offset=${offset}&limit=20&lang=${l}`),
    [],
  );
  return <AyahList {...props} fetchPage={fetchPage} emptyKey="noWish" removeOnUnfav />;
}
