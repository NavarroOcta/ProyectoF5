# Auditoría de Impacto: Migración a Supabase Auth

Este reporte consolida las dependencias y la deuda técnica actual del ecosistema de autenticación personalizado (Custom Auth), detallando los vectores exactos que serán impactados al migrar hacia Supabase Auth.

### 1. Esquema de Base de Datos y Repositorios
*   **Archivos Afectados:** `src/lib/db/schema.ts`, `src/lib/repositories/users.repository.ts`.
*   **Campos Obsoletos (A Eliminar):**
    *   `password`: Supabase Auth gestiona el almacenamiento seguro y el hasheo de credenciales en su esquema interno (`auth.users`). Es un riesgo de seguridad mantener esta columna.
*   **Campos a Mantener (Metadatos):**
    *   `id`: Deberá refactorizarse de `text` a `uuid` para enlazarse referencialmente 1:1 con el `id` generado por Supabase (`auth.users.id`).
    *   `role`, `name`, `phone`: Deben mantenerse en el esquema público de Drizzle para la lógica de la aplicación (RBAC y perfil), o bien ser migrados al campo `raw_user_meta_data` de Supabase, dependiendo del patrón arquitectónico elegido.
*   **Repositorio (`users.repository.ts`):** La función `createUser` dejará de invocarse manualmente desde el frontend. Se recomienda reemplazarla por un *Database Webhook* o *Trigger* de Postgres que inserte el usuario en la tabla pública automáticamente tras el evento `auth.users.insert` de Supabase.

### 2. Lógica de JWT y Middleware
*   **Archivos Afectados:** `src/middleware.ts`, `src/lib/auth/jwt.ts`.
*   **Lógica Obsoleta (A Eliminar):**
    *   El archivo íntegro `src/lib/auth/jwt.ts` debe ser **eliminado**. Supabase gestiona nativamente la emisión, rotación y firma de tokens JWT.
*   **Refactorización del Middleware:** 
    *   El `src/middleware.ts` actual lee una cookie rústica (`session_token`) e invoca `verifyJwt`. Esto será reemplazado íntegramente por el cliente `@supabase/ssr` (`createServerClient`), el cual verificará la sesión y refrescará el token automáticamente.
    *   **RBAC (Control de Acceso):** Actualmente, el middleware lee `payload.role`. Con Supabase, el rol deberá inyectarse en los JWT Claims (mediante un Hook de Supabase) o consultarse a la tabla pública `users` en el middleware.

### 3. Lógica de Servidor (Server Actions)
*   **Archivos Afectados:** `src/lib/actions/auth.actions.ts`, `src/lib/actions/public.actions.ts`.
*   **Lógica Obsoleta (A Eliminar):**
    *   La acción `login(data)` que compara el hash de la contraseña usando `bcrypt.compare`.
    *   La acción `registerUser(payload)` que invoca `bcrypt.hash` e inserta al usuario manualmente.
    Ambas operaciones delegarán su responsabilidad al SDK cliente de Supabase.

### 4. Dependencias (package.json)
*   **Librerías Obsoletas (A Desinstalar):**
    *   `bcryptjs`
    *   `@types/bcryptjs`
*   **Librerías Nuevas (A Instalar):**
    *   `@supabase/supabase-js`
    *   `@supabase/ssr`

### 5. Formularios (Frontend)
*   **Archivos Afectados:** `src/components/auth/login-form.tsx`, `src/components/auth/register-form.tsx`.
*   **Impacto de Integración:** 
    *   Actualmente importan `import { login } from '@/lib/actions/auth.actions';`.
    *   Este acoplamiento con la acción de servidor desaparecerá. El componente cliente pasará a importar el cliente de Supabase (`createBrowserClient`) e invocará asíncronamente `supabase.auth.signInWithPassword()` y `supabase.auth.signUp()`.
    *   El estado de error y ruteo (ej. `router.push('/admin')`) se mantendrá intacto, reaccionando a la respuesta directa del SDK de Supabase.
