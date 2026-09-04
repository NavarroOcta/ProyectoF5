-- Permitir lectura pública de la tabla users para validar roles
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura publica de usuarios" ON "users";
CREATE POLICY "Permitir lectura publica de usuarios" 
ON "users" 
FOR SELECT 
USING (true);
