import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LegacyScripts from "@/components/LegacyScripts";

export const metadata = { title: "Bəyəndiklərim — Qurani-Kərim" };

export default async function WishlistPage() {
  const s = await getSession();
  if (!s) redirect("/login");
  return (
    <>
      <link rel="stylesheet" href="/css/surah.css" />
      <link rel="stylesheet" href="/css/user.css" />
      <main>
        <h1 className="ptitle" data-i18n="wTitle"></h1>
        <section id="ayahList"></section>
        <div id="sentinel"><button id="moreBtn" className="btn more" data-i18n="more"></button></div>
        <div id="empty" className="empty" hidden>
          <h2 data-i18n="noWish"></h2>
          <p data-i18n="noWishHint"></p>
          <button className="btn btn--solid" id="browseBtn" data-i18n="browse"></button>
        </div>
      </main>
      <LegacyScripts srcs={["/js/ayah.js", "/js/user.js", "/js/wishlist.js"]} />
    </>
  );
}
