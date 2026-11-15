import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ err: "forbidden" }, 403);
  await signOut();
  return NextResponse.redirect(new URL("/", req.url), 303);
}
