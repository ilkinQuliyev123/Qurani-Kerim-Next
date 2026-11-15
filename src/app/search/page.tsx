import { search } from "@/lib/quran";
import { getLang, getSession } from "@/lib/auth";
import { SearchAyahList, T } from "@/components/AyahList";

export const metadata = { title: "Axtarış — Qurani-Kərim" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim();
  const [session, lang] = await Promise.all([getSession(), getLang()]);
  const first = await search(q, lang, 0, 20, session?.uid);
  return (
    <main className="mx-auto my-10 w-[min(920px,100%-2rem)]">
      <h1 className="mb-6 break-words font-head text-2xl text-gold">
        <T k="results" />: {q} <small className="text-muted">{first.total > 0 ? first.total : ""}</small>
      </h1>
      {/* key: yeni axtarışda siyahı sıfırlansın */}
      <SearchAyahList key={q} q={q} initial={first.items} total={first.total} authed={!!session} isAdmin={session?.admin} />
    </main>
  );
}
