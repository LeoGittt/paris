import { createClient } from "@/lib/supabase/server"
import { EmployeesTable } from "@/components/admin/employees-table"

export default async function AdminEmpleadosPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: employees } = await db
    .from("participants")
    .select("id, first_name, last_name, email, dni, phone, city, total_points, is_blocked, created_at")
    .eq("is_employee", true)
    .order("created_at", { ascending: false }) as { data: EmployeeRow[] | null }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-white/35 text-[11px] font-black uppercase tracking-[0.3em] mb-1">Administración</p>
        <h1 className="text-white font-black uppercase text-4xl md:text-5xl leading-none">EMPLEADOS</h1>
      </div>
      <EmployeesTable employees={employees ?? []} />
    </div>
  )
}

export interface EmployeeRow {
  id: string
  first_name: string
  last_name: string
  email: string
  dni: string
  phone: string
  city: string
  total_points: number
  is_blocked: boolean
  created_at: string
}
