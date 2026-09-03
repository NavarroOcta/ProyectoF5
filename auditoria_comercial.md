# Auditoría Comercial (Seguridad y Legalidad)

Este reporte consolida el análisis de la base de código actual enfocado en vulnerabilidades, madurez de despliegue y requerimientos legales.

### 1. Inputs y Sanitización
**Estado:** `[x] Implementado`
*   **Hallazgo:** Los *Server Actions* principales (`createBooking`, `registerUser`) utilizan exitosamente la librería `Zod` (`CreateBookingDTOSchema.safeParse()`) para validar y parsear el payload de entrada antes de interactuar con el ORM (Drizzle). Esto protege la base de datos contra inyecciones y tipos de datos mutados desde el cliente.

### 2. Autenticación y Credenciales
**Estado:** `[/] Parcial`
*   **Hallazgo:** La plataforma depende de un esquema de autenticación propio (*Custom Auth*). Utiliza `bcryptjs` para almacenar contraseñas seguras y una implementación nativa de JWT.
*   **Riesgo Comercial:** Al no delegar la identidad a proveedores consolidados (Clerk, Auth0, Supabase Auth), el sistema acarrea responsabilidades de seguridad complejas (ej. revocación de tokens JWT en tiempo real, protección contra secuestro de sesiones, rotación de secretos).

### 3. Límite de Intentos y Rate Limit
**Estado:** `[ ] Faltante`
*   **Hallazgo:** Al inspeccionar `src/middleware.ts` y las rutas de API, no se observó ninguna librería ni algoritmo de estrangulamiento (Rate Limiting).
*   **Riesgo Comercial:** Las rutas de autenticación y reserva están expuestas a ataques de fuerza bruta o saturación (DDoS a nivel de aplicación), lo que podría colapsar la base de datos o comprometer cuentas.

### 4. Manejo de Errores
**Estado:** `[/] Parcial`
*   **Hallazgo:** Aunque las acciones públicas como `createBooking` envuelven amigablemente los errores de colisión (ej. interceptando el código de Postgres `23P01` para turnos ocupados), existen acciones administrativas (como `toggleReservationPayment`) que utilizan una cláusula `catch (error: any)` devolviendo `error.message` crudo.
*   **Riesgo Comercial:** Retornar mensajes directos del driver SQL hacia el frontend expone información sensible sobre la topología de la base de datos a atacantes.

### 5. RLS (Row Level Security)
**Estado:** `[ ] Faltante`
*   **Hallazgo:** La arquitectura utiliza un enfoque tradicional de backend donde Drizzle ORM se conecta a Postgres con permisos elevados (Superuser/Owner). No hay evidencia en el código de que se estén utilizando políticas RLS a nivel de base de datos.
*   **Riesgo Comercial:** Todo el control de acceso depende un 100% de la lógica del código de Node.js (RBAC en Middleware y chequeos manuales). Un error humano en una Server Action puede exponer datos de todos los usuarios.

### 6. CORS (Cross-Origin Resource Sharing)
**Estado:** `[ ] Faltante`
*   **Hallazgo:** No se encontraron archivos de configuración `next.config.js` ni cabeceras manuales en `src/middleware.ts` definiendo las directivas CORS o protecciones adicionales (CSP).
*   **Riesgo Comercial:** Ausencia de bloqueos formales contra peticiones cruzadas desde dominios no autorizados (aunque los Server Actions de Next.js poseen mecanismos de protección propios (CSRF), la falta de cabeceras estrictas de seguridad (Security Headers) disminuye la calificación de auditorías).

### 7. Legalidad
**Estado:** `[ ] Faltante`
*   **Hallazgo:** El directorio público `src/app/` carece completamente de rutas destinadas al cumplimiento legal (ej. `/terms` o `/privacy`).
*   **Riesgo Comercial:** Para que la plataforma opere comercialmente y pueda integrarse con pasarelas de pago (MercadoPago, Stripe) o iniciar campañas publicitarias, es un requisito legal insoslayable disponer públicamente de los **Términos y Condiciones** de contratación de canchas y la **Política de Privacidad** de datos personales.
