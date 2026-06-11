-- Agrega año del vehículo. Nullable para no romper registros existentes.
ALTER TABLE participants ADD COLUMN IF NOT EXISTS car_year smallint;
