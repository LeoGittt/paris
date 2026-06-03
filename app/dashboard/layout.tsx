import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/nav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: participant } = await supabase
    .from("participants")
    .select("first_name, last_name, total_points, ranking_position, is_blocked")
    .eq("user_id", user.id)
    .single() as { data: { first_name: string; last_name: string; total_points: number; ranking_position: number | null; is_blocked: boolean } | null }

  if (!participant) redirect("/")
  if (participant.is_blocked) redirect("/?blocked=1")

  return (
    <div className="min-h-screen bg-[#06192c] flex flex-col md:flex-row" style={{ fontFamily: "'ChevySans', sans-serif" }}>
      <DashboardNav participant={participant} />
      <main className="flex-1 md:ml-64 pt-16 md:pt-0">
        <div className="max-w-5xl mx-auto px-5 md:px-10 py-8 md:py-12">
          {children}
        </div>
      </main>
    </div>
  )
}
