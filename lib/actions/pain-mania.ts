"use server"

import { createClient } from "@/lib/supabase/server"

export async function getPainManiaCounts(): Promise<{ si: number; no: number }> {
  const supabase = await createClient()
  const [{ count: si }, { count: no }] = await Promise.all([
    supabase.from("pain_mania_votes").select("*", { count: "exact", head: true }).eq("vote", "si"),
    supabase.from("pain_mania_votes").select("*", { count: "exact", head: true }).eq("vote", "no"),
  ])
  return { si: si ?? 0, no: no ?? 0 }
}

export async function castPainManiaVote(vote: "si" | "no"): Promise<{ si: number; no: number }> {
  const supabase = await createClient()
  await supabase.from("pain_mania_votes").insert({ vote })
  return getPainManiaCounts()
}
