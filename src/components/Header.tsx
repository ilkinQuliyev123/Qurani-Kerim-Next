"use client";
import { useI18n } from "@/lib/i18n/provider";
import LangSelect from "./LangSelect";
import ThemeToggle from "./ThemeToggle";
import SurahModal from "./SurahModal";

const link = "inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-text hover:text-gold focus-visible:outline-2 focus-visible:outline-gold sm:min-h-9";

export default function Header({ user }: { user: { name: string; admin: boolean } | null }) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2">
        <a href="/" className="inline-flex min-h-11 items-center gap-2 font-head text-lg text-gold focus-visible:outline-2 focus-visible:outline-gold">
          <span className="font-ar text-2xl" aria-hidden="true">ق</span>Qurani-Kərim
        </a>
        <nav aria-label="Main" className="order-3 flex w-full flex-wrap items-center gap-1 md:order-none md:w-auto">
          <button type="button" className={link} onClick={() => window.dispatchEvent(new Event("open-surahs"))}>{t("surahs")}</button>
          <a href="/wishlist" className={link}>{t("wishlist")}</a>
          <a href="/notes" className={link}>{t("notes")}</a>
          {user?.admin && <a href="/admin" className={link}>Admin</a>}
        </nav>
        <form action="/search" method="get" role="search" className="order-4 flex w-full items-center md:order-none md:ml-auto md:w-64">
          <label htmlFor="hdr-q" className="sr-only">{t("search")}</label>
          <div className="relative w-full">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="hdr-q"
              name="q"
              type="search"
              placeholder={t("search")}
              className="min-h-11 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-text placeholder:text-muted focus-visible:outline-2 focus-visible:outline-gold sm:min-h-9"
            />
          </div>
        </form>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <LangSelect />
          <ThemeToggle />
          {user ? (
            <>
              <span className="hidden max-w-32 truncate text-sm text-muted sm:inline">{user.name}</span>
              <form method="post" action="/api/auth/logout">
                <button type="submit" className={`${link} border border-line`}>{t("logout")}</button>
              </form>
            </>
          ) : (
            <>
              <a href="/login" className={link}>{t("login")}</a>
              <a href="/register" className={`${link} bg-gold font-bold text-on-gold hover:text-on-gold`}>{t("register")}</a>
            </>
          )}
        </div>
      </div>
      <SurahModal />
    </header>
  );
}
