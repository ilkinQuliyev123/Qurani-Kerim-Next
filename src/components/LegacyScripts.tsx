"use client";
import { useEffect } from "react";

const BASE = ["/js/main.js", "/js/surahs.js"];

/** Köhnə (vanilla) JS fayllarını hidrasiyadan SONRA, ardıcıl yükləyir (əvvəl main.js, surahs.js, sonra səhifənin faylları).
 *  Fayllar bir-birinin qlobal dəyişənlərindən ($, I18N, authed...) istifadə edir, ona görə sıra vacibdir.
 *  Hər fayl yalnız bir dəfə yüklənir (StrictMode-da effekt iki dəfə işləyə bilər). */
export default function LegacyScripts({ srcs = [] }: { srcs?: string[] }) {
  const key = srcs.join("|");
  useEffect(() => {
    const list = [...BASE, ...key.split("|").filter(Boolean)];
    (async () => {
      for (const src of list) {
        if (document.querySelector(`script[data-legacy="${src}"]`)) continue;
        await new Promise<void>((resolve) => {
          const s = document.createElement("script");
          s.src = src;
          s.dataset.legacy = src;
          s.onload = () => resolve();
          s.onerror = () => resolve();
          document.body.appendChild(s);
        });
      }
    })();
  }, [key]);
  return null;
}
