# ⚽ F5 - Plataforma de Gestión de Canchas

Plataforma web para la reserva y gestión de canchas de fútbol con flujo público de alquileres y panel administrativo privado.

## 🚀 Tecnologías

- **Frontend:** Next.js (App Router), Tailwind CSS, Zod.
- **Backend & DB:** TypeScript, PostgreSQL, Drizzle ORM.
- **Seguridad:** Edge Middleware (JWT, RBAC).

## ⚙️ Arquitectura e Implementación

- **Prevención de colisiones:** Validación de disponibilidad de turnos a nivel lógico en capa de repositorio.
- **Gestión horaria:** Estandarización UTC nativa (`timestamp with time zone`) para consistencia en reservas.
- **Seguridad perimetral:** Rutas administrativas protegidas mediante Next.js Edge Middleware interceptando peticiones y verificando asimétricamente los JWT.

## 🛠️ Instalación y Ejecución Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/NavarroOcta/ProyectoF5.git
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno (`.env`).
4. Ejecutar migraciones de base de datos:
   ```bash
   npm run db:migrate
   ```
5. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```
