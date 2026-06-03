-- ============================================================
-- Migración 001: Unicidad de patente
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Constraint unique en license_plate
alter table participants
  add constraint participants_license_plate_unique unique (license_plate);

-- Índice para búsquedas rápidas por patente (call center, admin)
create index if not exists idx_participants_license_plate
  on participants(license_plate);
