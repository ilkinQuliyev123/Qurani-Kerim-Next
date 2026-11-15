import { nextNumber } from "@/lib/admin";
import { intParam, json, route } from "@/lib/http";

export const GET = route<{ surah: string }>(async (_r, { params }) => json(await nextNumber(intParam((await params).surah, 1))), { admin: true });
