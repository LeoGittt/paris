import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminNav } from "@/components/admin/nav"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single() as { data: { role: string } | null }

  if (role?.role !== "admin") redirect("/dashboard")

  return (
    <div className="min-h-screen bg-[#040f1c] flex flex-col md:flex-row" style={{ fontFamily: "'ChevySans', sans-serif" }}>
      <AdminNav />
      <main className="flex-1 md:ml-64 pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-12">
          {children}
        </div>
      </main>
    </div>
  )
}
