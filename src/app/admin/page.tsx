import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminPanel from "@/components/AdminPanel";

export const metadata = { title: "Admin — Qurani-Kərim" };

export default async function AdminPage() {
  const s = await getSession();
  if (!s || !s.admin) redirect("/login");
  return (
    <main className="mx-auto my-10 w-[min(1100px,100%-2rem)]">
      <AdminPanel />
    </main>
  );
}
