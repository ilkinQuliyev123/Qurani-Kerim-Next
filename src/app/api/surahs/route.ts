import { surahList } from "@/lib/quran";
import { json, route } from "@/lib/http";

export const GET = route(async () => json(await surahList()));
