-- Migración 008: Forzar que point_config sea singleton (máximo 1 fila)
-- EJECUTAR en Supabase SQL Editor
--
-- Problema: la tabla point_config no tiene constraint que limite a 1 fila.
-- La función recalculate_points usa LIMIT 1, que elegiría arbitrariamente
-- si existieran múltiples filas (ej: por error de administrador).

-- Eliminar filas duplicadas si existen (mantener la más reciente)
delete from point_config
where id not in (
  select id from point_config order by updated_at desc limit 1
);

-- Crear constraint que previene INSERT si ya existe una fila
-- (usando una columna booleana fija = true como clave única)
alter table point_config
  add column if not exists singleton boolean not null default true;

alter table point_config
  add constraint point_config_singleton_unique unique (singleton);

-- Política adicional: solo admin puede insertar (y solo si no existe ya una fila)
-- La constraint unique(singleton) ya lo garantiza a nivel de DB.
