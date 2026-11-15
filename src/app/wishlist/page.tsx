import { redirect } from "next/navigation";
import { getLang, getSession } from "@/lib/auth";
import { wishlist } from "@/lib/user";
import { BrowseButton, T, WishlistAyahList } from "@/components/AyahList";

export const metadata = { title: "Bəyəndiklərim — Qurani-Kərim" };

export default async function WishlistPage() {
  const s = await getSession();
  if (!s) redirect("/login");
  const first = await wishlist(s.uid, 0, 20, await getLang());
  return (
    <main className="mx-auto my-10 w-[min(920px,100%-2rem)]">
      <h1 className="mb-6 font-head text-3xl text-gold"><T k="wTitle" /></h1>
      <WishlistAyahList initial={first.items} total={first.total} authed isAdmin={s.admin} />
      {first.total === 0 && (
        <div className="text-center">
          <p className="mb-4 text-muted"><T k="noWishHint" /></p>
          <BrowseButton />
        </div>
      )}
    </main>
  );
}
