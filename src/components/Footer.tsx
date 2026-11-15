"use client";
import { useI18n } from "@/lib/i18n/provider";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-line px-4 py-8 text-center text-sm text-muted">
      <div lang="ar" dir="rtl" className="mb-1 font-ar text-2xl text-gold">بِسْمِ اللَّهِ</div>
      <p>{t("footer")}</p>
    </footer>
  );
}
