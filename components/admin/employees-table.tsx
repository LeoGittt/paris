"use client"

import { useState } from "react"
import { Trash2, AlertCircle } from "lucide-react"
import { deleteParticipant } from "@/lib/actions/admin/participants"
import type { EmployeeRow } from "@/app/admin/empleados/page"

export function EmployeesTable({ employees }: { employees: EmployeeRow[] }) {
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [error, setError]         = useState("")
  const [confirm, setConfirm]     = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeleting(id)
    setError("")
    const res = await deleteParticipant(id)
    if (!res.ok) {
      setError(res.error)
      setDeleting(null)
    }
    setConfirm(null)
  }

  if (!employees.length) {
    return (
      <div className="bg-[#0b2440] border border-white/8 rounded-2xl px-6 py-16 text-center">
        <p className="text-white/20 text-sm font-medium">No hay empleados registrados todavía.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-red-400 text-xs font-medium">{error}</p>
        </div>
      )}

      <div className="text-white/30 text-[11px] font-medium">
        {employees.length} empleado{employees.length !== 1 ? "s" : ""} registrado{employees.length !== 1 ? "s" : ""}
      </div>

      <div className="bg-[#0b2440] border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6">
                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/25 px-5 py-3.5">Nombre</th>
                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/25 px-5 py-3.5">Email / DNI</th>
                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/25 px-5 py-3.5 hidden md:table-cell">Teléfono</th>
                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/25 px-5 py-3.5 hidden lg:table-cell">Registrado</th>
                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/25 px-5 py-3.5">Pts</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {employees.map(e => (
                <tr key={e.id} className={`hover:bg-white/3 transition-colors ${e.is_blocked ? "opacity-50" : ""}`}>
                  <td className="px-5 py-3.5">
                    <p className="text-white/80 font-bold">{e.first_name} {e.last_name}</p>
                    <p className="text-white/25 text-[11px] mt-0.5">{e.city}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-white/60 text-[12px] font-medium">{e.email}</p>
                    <p className="text-white/25 text-[11px] mt-0.5">DNI {e.dni}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <p className="text-white/40 text-[12px]">{e.phone}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <p className="text-white/30 text-[11px]">
                      {new Date(e.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[#c3871e] font-black text-sm tabular-nums">{e.total_points}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {confirm === e.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-white/40 text-[11px]">¿Eliminar?</span>
                        <button
                          onClick={() => handleDelete(e.id)}
                          disabled={deleting === e.id}
                          className="text-[11px] font-black uppercase px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 transition-all disabled:opacity-50"
                        >
                          {deleting === e.id ? "..." : "Sí"}
                        </button>
                        <button
                          onClick={() => setConfirm(null)}
                          className="text-[11px] font-black uppercase px-3 py-1.5 rounded-lg bg-white/6 hover:bg-white/10 text-white/40 border border-white/8 transition-all"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirm(e.id)}
                        className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Eliminar empleado"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
