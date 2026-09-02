-- Habilitar extensión para usar tipos básicos (como UUID) en restricciones de exclusión GiST
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Agregar restricción de exclusión para evitar solapamiento de horarios en la misma cancha
ALTER TABLE "reservations" 
ADD CONSTRAINT prevent_double_booking EXCLUDE USING gist (
  pitch_id WITH =,
  tstzrange(start_time, end_time) WITH &&
);
