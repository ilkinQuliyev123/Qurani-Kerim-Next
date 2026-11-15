import type { Metadata, Viewport } from "next";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Qurani-Kərim", description: "Qurani-Kərim — oxu, düşün, yadda saxla" };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

const THEME_INIT = "document.documentElement.dataset.theme=localStorage.getItem('theme')||'dark'";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  return (
    <html lang="az" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="/css/modal.css" />
      </head>
      <body data-auth={s ? "1" : ""} data-admin={s?.admin ? "1" : ""} suppressHydrationWarning>
        <header className="header">
          <div className="header__in">
            <a href="/" className="logo"><b>ق</b> Qurani-Kərim</a>

            <nav className="nav">
              <button id="surahBtn" data-i18n="surahs">Surələr</button>
              <a href="/wishlist" data-i18n="wishlist">Bəyəndiklərim</a>
              <a href="/notes" data-i18n="notes">Qeydlərim</a>
              {s?.admin && <a href="/admin">Admin</a>}
            </nav>

            <form className="search" role="search" action="/search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <input type="search" id="q" name="q" data-i18n-ph="search" placeholder="Axtar: 3:2 və ya söz" aria-label="Search" />
            </form>

            <div className="tools">
              <select id="lang" className="select" aria-label="Language" defaultValue="az">
                <option value="az">AZ</option><option value="en">EN</option><option value="ru">RU</option><option value="tr">TR</option>
              </select>
              <button id="themeBtn" className="icon-btn" aria-label="Theme">
                <svg className="i-sun" width="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
                <svg className="i-moon" width="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
              </button>
              {s ? (
                <>
                  <span className="uname">{s.name}</span>
                  <form method="post" action="/api/auth/logout" style={{ display: "inline" }}>
                    <button className="btn" data-i18n="logout">Çıxış</button>
                  </form>
                </>
              ) : (
                <>
                  <a href="/login" className="btn" data-i18n="login">Daxil ol</a>
                  <a href="/register" className="btn btn--solid" data-i18n="register">Qeydiyyat</a>
                </>
              )}
            </div>
          </div>
        </header>

        {children}

        <footer className="footer">
          <span className="ar" lang="ar">بِسْمِ اللَّهِ</span>
          <span data-i18n="footer">Qurani-Kərim — oxu, düşün, yadda saxla</span>
        </footer>

        <dialog id="surahModal" className="modal" aria-labelledby="surahTitle">
          <div className="modal__box">
            <header className="modal__head">
              <h2 id="surahTitle" data-i18n="surahs">Surələr</h2>
              <button className="icon-btn" id="surahClose" aria-label="Close">✕</button>
            </header>
            <input type="search" id="surahFilter" className="modal__filter" data-i18n-ph="filter" placeholder="Surə axtar" />
            <ol id="surahList" className="surahs"></ol>
            <p id="surahEmpty" className="modal__empty" data-i18n="noSurah" hidden>Belə surə tapılmadı</p>
          </div>
        </dialog>
      </body>
    </html>
  );
}
