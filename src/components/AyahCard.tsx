"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AyahDto } from "@/lib/quran";
import { http } from "@/lib/client/http";
import { useI18n } from "@/lib/i18n/provider";
import TafsirPanel from "./TafsirPanel";
import CommentsPanel from "./CommentsPanel";

/** Köhnə initDust: kart üzərində hover edəndə "sehirli toz" hissəcikləri. */
function useDust(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const card = ref.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      timer = setInterval(() => {
        const p = document.createElement("i");
        p.className = "dust";
        p.style.cssText = `--s:${2 + Math.random() * 4}px;--t:${1.6 + Math.random() * 1.6}s;--dx:${(Math.random() - 0.5) * 50}px;--dy:${60 + Math.random() * 90}px;left:${Math.random() * 100}%;top:${Math.random() * 25}%`;
        card.appendChild(p);
        setTimeout(() => p.remove(), 3500);
      }, 90);
    };
    const stop = () => clearInterval(timer);
    card.addEventListener("mouseenter", start);
    card.addEventListener("mouseleave", stop);
    return () => {
      stop();
      card.removeEventListener("mouseenter", start);
      card.removeEventListener("mouseleave", stop);
    };
  }, [ref]);
}

const btn = "inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg border border-line bg-surface-2 px-3 text-text transition-colors hover:border-gold";

export default function AyahCard({
  ayah, authed, isAdmin, onUnfav,
}: { ayah: AyahDto; authed: boolean; isAdmin?: boolean; onUnfav?: (id: number) => void }) {
  const { t } = useI18n();
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);
  useDust(ref);
  const [fav, setFav] = useState(ayah.fav);
  const [count, setCount] = useState(ayah.comments);
  const [tf, setTf] = useState(false);
  const [cm, setCm] = useState(false);
  const onCount = useCallback((n: number) => setCount(n), []);

  async function toggleFav() {
    if (!authed) { router.push("/login"); return; }
    try {
      const r = await http<{ on: boolean }>(`/api/wishlist/${ayah.id}`, { method: "POST" });
      setFav(r.on);
      if (!r.on) onUnfav?.(ayah.id);
    } catch {}
  }

  return (
    <article ref={ref} id={`a${ayah.num}`} className="ayah-card relative mb-5 scroll-mt-20 rounded-card border border-line bg-surface p-4 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <a href={`/surah/${ayah.surah}#a${ayah.num}`} className="inline-flex min-h-11 items-center rounded-full border border-line px-4 font-head font-semibold text-gold hover:border-gold">{ayah.ref}</a>
        <div className="flex flex-wrap gap-2">
          <button className={btn} onClick={() => setTf((v) => !v)} aria-expanded={tf} aria-label="Commentary" title="Təfsir">📖</button>
          <button className={btn} onClick={() => setCm((v) => !v)} aria-expanded={cm} aria-label="Comments">💬 <small>{count}</small></button>
          <button className={`${btn} ${fav ? "!border-gold text-gold" : ""}`} onClick={toggleFav} aria-pressed={fav} aria-label="Wishlist">{fav ? "♥" : "♡"}</button>
          <button className={btn} aria-label="Note" onClick={() => router.push(authed ? `/notes?ref=${ayah.ref}` : "/login")}>✎</button>
        </div>
      </div>
      <p lang="ar" dir="rtl" className="font-ar text-[clamp(1.8rem,5vw,2.8rem)] leading-[2.1] text-text">{ayah.arabic}</p>
      {ayah.words.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-muted">
                <th className="border-b border-line p-2 text-start font-normal">{t("word")}</th>
                <th className="border-b border-line p-2 text-start font-normal">{t("latin")}</th>
                <th className="border-b border-line p-2 text-start font-normal">{t("meaning")}</th>
              </tr>
            </thead>
            <tbody>
              {ayah.words.map((w, i) => (
                <tr key={i}>
                  <td lang="ar" dir="rtl" className="border-b border-line p-2 text-start font-ar text-xl">{w.ar}</td>
                  <td className="border-b border-line p-2">{w.lat}</td>
                  <td className="border-b border-line p-2">{w.mean}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 border-l-4 border-gold pl-3 leading-relaxed">{ayah.translation}</p>
      {tf && <TafsirPanel surah={ayah.surah} num={ayah.num} />}
      {cm && <CommentsPanel ayahId={ayah.id} authed={authed} isAdmin={isAdmin} onCount={onCount} />}
    </article>
  );
}
