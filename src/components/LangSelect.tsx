"use client";
import { LANGS, type Lang } from "@/lib/i18n/dict";
import { useI18n } from "@/lib/i18n/provider";

export default function LangSelect() {
  const { lang, setLang } = useI18n();
  return (
    <select
      aria-label="Language"
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      className="min-h-11 cursor-pointer rounded-lg border border-line bg-surface px-2 text-sm text-text focus-visible:outline-2 focus-visible:outline-gold sm:min-h-9"
    >
      {LANGS.map((l) => (
        <option key={l} value={l}>{l.toUpperCase()}</option>
      ))}
    </select>
  );
}
