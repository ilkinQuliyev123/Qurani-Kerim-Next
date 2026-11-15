"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DICT, type Lang } from "./dict";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string };
const I18nCtx = createContext<Ctx | null>(null);

/** Dil: server cookie-dən başlayır (hidrasiya uyğunluğu üçün), dəyişəndə cookie + localStorage yenilənir. */
export function I18nProvider({ initialLang, children }: { initialLang: Lang; children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l;
    document.cookie = `lang=${l};path=/;max-age=31536000;samesite=lax`;
    try { localStorage.setItem("lang", l); } catch {}
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const t = useCallback((key: string) => DICT[lang][key] ?? DICT.az[key] ?? key, [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const c = useContext(I18nCtx);
  if (!c) throw new Error("useI18n yalnız I18nProvider daxilində işləyir");
  return c;
}
