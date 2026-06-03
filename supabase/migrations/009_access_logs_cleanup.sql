-- Migración 009: Cleanup automático de access_logs
-- EJECUTAR en Supabase SQL Editor
--
-- Problema: access_logs crece indefinidamente. Cada login inserta una fila.
-- Con 1000 usuarios activos durante 6 meses = ~180.000 filas.
-- La tabla no tiene mecanismo de limpieza.
--
-- Fix: mantener solo los últimos 90 días de logs.
-- Se puede invocar desde el cron daily o manualmente.

create or replace function cleanup_old_access_logs()
returns integer
language plpgsql
security definer
as $$
declare
  deleted_count integer;
begin
  delete from access_logs
  where accessed_at < now() - interval '90 days';

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

grant execute on function cleanup_old_access_logs() to service_role;

-- Ejecutar limpieza inicial de registros viejos
select cleanup_old_access_logs();
