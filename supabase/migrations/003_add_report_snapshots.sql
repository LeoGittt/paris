-- ============================================================
-- Migración 003: Snapshots de reportes automáticos
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

create table if not exists report_snapshots (
  id          uuid primary key default uuid_generate_v4(),
  type        text not null check (type in ('daily', 'weekly', 'monthly')),
  period_label text not null,   -- ej: "Semana del 2-8 Jun 2026"
  data        jsonb not null,   -- resumen en JSON
  created_at  timestamptz default now()
);

create index if not exists idx_report_snapshots_type on report_snapshots(type, created_at desc);

alter table report_snapshots enable row level security;

create policy "admin: gestionar reportes"
  on report_snapshots for all
  using (get_my_role() = 'admin');
