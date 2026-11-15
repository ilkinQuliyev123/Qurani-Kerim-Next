import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import NotesPanel from "@/components/NotesPanel";

export const metadata = { title: "Qeydlərim — Qurani-Kərim" };

export default async function NotesPage({ searchParams }: { searchParams: Promise<{ ref?: string | string[] }> }) {
  if (!(await getSession())) redirect("/login");
  const { ref } = await searchParams;
  return <NotesPanel initialRef={typeof ref === "string" ? ref : ""} />;
}
