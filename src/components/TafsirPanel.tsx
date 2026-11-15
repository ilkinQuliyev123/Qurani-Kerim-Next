"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/client/http";

type Item = { title: string; text: string };

export default function TafsirPanel({ surah, num }: { surah: number; num: number }) {
  const [list, setList] = useState<Item[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    http<Item[]>(`/api/surahs/${surah}/ayahs/${num}/commentaries`)
      .then((r) => { if (alive) setList(r); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [surah, num]);

  return (
    <div className="mt-4 border-t border-line pt-3" role="region" aria-live="polite">
      {list === null && !failed && <p className="text-muted">…</p>}
      {(failed || (list && list.length === 0)) && <p className="text-muted">—</p>}
      {list?.map((c, i) => (
        <details key={i} className="mb-2 rounded-lg border border-line bg-surface-2 px-3 py-2">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold text-gold">{c.title || "—"}</summary>
          <p className="whitespace-pre-line pb-2 leading-relaxed">{c.text}</p>
        </details>
      ))}
    </div>
  );
}
