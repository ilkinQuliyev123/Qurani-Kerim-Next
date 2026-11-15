import { dailyAyah } from "@/lib/quran";
import { getLang, getSession } from "@/lib/auth";
import AyahCard from "@/components/AyahCard";
import { BrowseButton, T } from "@/components/AyahList";

export const metadata = { title: "Qurani-Kərim" };

export default async function Home() {
  const s = await getSession();
  const a = await dailyAyah(await getLang(), s?.uid);
  return (
    <main className="mx-auto my-10 w-[min(920px,100%-2rem)]">
      <h1 className="mb-6 text-center font-head text-3xl text-gold"><T k="daily" /></h1>
      {a ? <AyahCard ayah={a} authed={!!s} isAdmin={s?.admin} /> : <p className="text-center text-muted">—</p>}
      <p className="mt-6 text-center"><BrowseButton /></p>
    </main>
  );
}
