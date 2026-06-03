-- Migración 010: Rate limiting usando Supabase como store
-- EJECUTAR en Supabase SQL Editor
--
-- Protege contra:
--   - Enumeración de DNIs (findEmailByDni)
--   - Registro masivo de cuentas
--
-- Diseño: función PL/pgSQL atómica (INSERT ON CONFLICT) para evitar
-- race conditions sin necesitar Redis ni servicios externos.

-- ─── Tabla de contadores ─────────────────────────────────────────
create table if not exists rate_limits (
  key          text        not null primary key,  -- "ip:accion"
  count        integer     not null default 0,
  window_start timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_rate_limits_updated on rate_limits(updated_at);

-- Sin RLS — solo accesible vía service_role (función SECURITY DEFINER)
-- Los clientes NO tienen acceso directo a esta tabla.

-- ─── Función atómica ─────────────────────────────────────────────
-- Retorna TRUE si la request está permitida, FALSE si está bloqueada.
-- Maneja el reset de ventana y el incremento en una sola operación.
create or replace function check_rate_limit(
  p_key            text,
  p_max_requests   integer,
  p_window_minutes integer
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_count        integer;
  v_window_start timestamptz;
begin
  v_window_start := now() - (p_window_minutes || ' minutes')::interval;

  insert into rate_limits (key, count, window_start, updated_at)
  values (p_key, 1, now(), now())
  on conflict (key) do update
    set
      count        = case
                       when rate_limits.window_start < v_window_start
                       then 1                          -- ventana expiró → resetear
                       else rate_limits.count + 1      -- misma ventana → incrementar
                     end,
      window_start = case
                       when rate_limits.window_start < v_window_start
                       then now()
                       else rate_limits.window_start
                     end,
      updated_at   = now()
  returning count into v_count;

  return v_count <= p_max_requests;
end;
$$;

grant execute on function check_rate_limit(text, integer, integer) to service_role;

-- ─── Función de limpieza (registros viejos de más de 24h) ─────────
create or replace function cleanup_old_rate_limits()
returns void
language sql
security definer
as $$
  delete from rate_limits
  where updated_at < now() - interval '24 hours';
$$;

grant execute on function cleanup_old_rate_limits() to service_role;
