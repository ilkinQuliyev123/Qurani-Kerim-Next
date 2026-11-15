import type { Metadata, Viewport } from "next";
import { Amiri, Lora, Manrope } from "next/font/google";
import { getLang, getSession } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n/provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const amiri = Amiri({ subsets: ["arabic", "latin"], weight: ["400", "700"], variable: "--font-amiri", display: "swap" });
const lora = Lora({ subsets: ["latin", "latin-ext"], weight: ["500", "600"], variable: "--font-lora", display: "swap" });
const manrope = Manrope({ subsets: ["latin", "latin-ext", "cyrillic"], weight: ["400", "500", "700"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = { title: "Qurani-Kərim", description: "Qurani-Kərim — oxu, düşün, yadda saxla" };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// Tema: ilk boyamadan əvvəl təyin olunur (yanıb-sönmə olmasın)
const THEME_INIT =
  "try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, lang] = await Promise.all([getSession(), getLang()]);
  return (
    <html lang={lang} data-theme="dark" className={`${amiri.variable} ${lora.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="flex min-h-dvh flex-col font-ui">
        <I18nProvider initialLang={lang}>
          <Header user={session ? { name: session.name, admin: session.admin } : null} />
          <div className="flex-1">{children}</div>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
