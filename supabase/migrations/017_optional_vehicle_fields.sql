-- Migración 017: Campos de vehículo opcionales
--
-- Los empleados pueden no tener auto, por lo que license_plate,
-- car_brand y car_model pasan a ser nullable.

alter table participants
  alter column license_plate drop not null;

alter table participants
  alter column car_brand drop not null;

alter table participants
  alter column car_model drop not null;
