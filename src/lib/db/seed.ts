import { loadEnvConfig } from '@next/env';
// Cargar variables de entorno antes de importar cualquier cliente de base de datos
loadEnvConfig(process.cwd());

async function main() {
  // Importaciones dinámicas para resolver ES Module hoisting y carga de env vars
  const { db } = await import('./index');
  const { users, pitches, reservations, pitchSchedules } = await import('./schema');
  const { eq, like } = await import('drizzle-orm');
  const bcrypt = await import('bcryptjs');

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Error: Las variables de entorno ADMIN_EMAIL y ADMIN_PASSWORD deben estar definidas en el archivo .env.');
    process.exit(1);
  }

  try {
    console.log('--- INICIANDO SEEDING DE BASE DE DATOS ---');

    // ==========================================
    // 1. Inicialización/Seeding del Usuario Admin
    // ==========================================
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const existingAdmin = await db.select().from(users).where(eq(users.email, email)).limit(1);

    let adminId = '';
    if (existingAdmin.length > 0) {
      adminId = existingAdmin[0].id;
      await db.update(users)
        .set({ password: hashedPassword, name: 'Administrador F5', phone: '0000000000', role: 'admin' })
        .where(eq(users.email, email));
      console.log('✔ Usuario administrador actualizado.');
    } else {
      adminId = `admin_${Math.random().toString(36).substring(2, 11)}`;
      await db.insert(users).values({
        id: adminId,
        email,
        password: hashedPassword,
        name: 'Administrador F5',
        phone: '0000000000',
        role: 'admin',
      });
      console.log('✔ Nuevo usuario administrador creado.');
    }

    // ==========================================
    // 2. Seeding Idempotente de Canchas (Pitches)
    // ==========================================
    const currentPitches = await db.select().from(pitches);
    let pitchIds: string[] = currentPitches.map(p => p.id);

    if (currentPitches.length < 5) {
      console.log('Generando canchas fijas...');
      const pitchesToInsert = [
        { name: 'Cancha 1 (F5)', type: 'F5', price: 15000, status: 'available' },
        { name: 'Cancha 2 (F5)', type: 'F5', price: 15000, status: 'available' },
        { name: 'Cancha 3 (F7)', type: 'F7', price: 20000, status: 'available' },
        { name: 'Cancha 4 (F7)', type: 'F7', price: 25000, status: 'available' },
        { name: 'Cancha 5 (F11)', type: 'F11', price: 40000, status: 'available' },
      ];

      for (const p of pitchesToInsert) {
        const [insertedPitch] = await db.insert(pitches).values({
          name: p.name,
          type: p.type,
          price: p.price,
          status: p.status,
        }).returning();

        pitchIds.push(insertedPitch.id);

        // Generar horario semanal operativo de 08:00 a 22:00 para cada nueva cancha
        const schedules = [0, 1, 2, 3, 4, 5, 6].map(day => ({
          pitchId: insertedPitch.id,
          dayOfWeek: day,
          openTime: '08:00',
          closeTime: '22:00',
        }));
        await db.insert(pitchSchedules).values(schedules);
      }
      console.log(`✔ Canchas inicializadas. Total canchas activas: ${pitchIds.length}`);
    } else {
      console.log(`✔ Canchas ya presentes en base de datos. Total: ${pitchIds.length}`);
    }

    // ==========================================
    // 3. Seeding Idempotente de Clientes (Users)
    // ==========================================
    const mockUsersInDb = await db.select().from(users).where(like(users.email, '%@mock.com'));
    let userIds: string[] = mockUsersInDb.map(u => u.id);

    if (userIds.length === 0) {
      console.log('Generando 15 clientes ficticios...');
      const genericPasswordHash = await bcrypt.hash('password123', 10);
      const mockUsers = [];

      for (let i = 1; i <= 15; i++) {
        mockUsers.push({
          id: `user_mock_${Math.random().toString(36).substring(2, 11)}`,
          email: `client${i}@mock.com`,
          password: genericPasswordHash,
          name: `Cliente Mock ${i}`,
          phone: `+54911${Math.floor(10000000 + Math.random() * 90000000)}`,
          role: 'user' as const,
        });
      }

      const insertedUsers = await db.insert(users).values(mockUsers).returning();
      userIds = insertedUsers.map(u => u.id);
      console.log(`✔ Inyectados ${userIds.length} usuarios clientes ficticios.`);
    } else {
      console.log(`✔ Clientes ficticios ya presentes en base de datos. Total: ${userIds.length}`);
    }

    // ==========================================
    // 4. Seeding de Historial de Reservas
    // ==========================================
    console.log('Reseteando reservas existentes para inyección limpia...');
    await db.delete(reservations);

    console.log('Generando historial masivo de reservas (250 registros)...');
    const mockReservationsArray = [];
    const occupiedSlots = new Set<string>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attempts = 0;
    const targetReservationsCount = 250;

    while (mockReservationsArray.length < targetReservationsCount && attempts < 2000) {
      attempts++;
      
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const pitchId = pitchIds[Math.floor(Math.random() * pitchIds.length)];

      // Máquina del tiempo: rango aleatorio de -30 a +30 días respecto a hoy
      const dateOffset = Math.floor(Math.random() * 60) - 30;
      const startTime = new Date(today);
      startTime.setDate(today.getDate() + dateOffset);

      // Limitar a bloques de una hora dentro del rango operativo (08:00 a 21:00)
      const randomHour = Math.floor(Math.random() * (22 - 8)) + 8;
      startTime.setHours(randomHour, 0, 0, 0);

      // Evitar colisiones de concurrencia usando un identificador único de franja
      const slotKey = `${pitchId}_${startTime.getTime()}`;
      if (occupiedSlots.has(slotKey)) {
        continue;
      }
      occupiedSlots.add(slotKey);

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      // Aleatoriedad Analítica
      const status = Math.random() < 0.85 ? 'confirmed' : 'cancelled';
      const paymentMethod = ['cash', 'card', 'transfer'][Math.floor(Math.random() * 3)];

      // Determinación lógica del estado de pago
      let isPaid = false;
      if (status === 'confirmed') {
        if (startTime < today) {
          isPaid = true; // Pasadas confirmadas -> Pagadas
        } else {
          isPaid = Math.random() < 0.5; // Futuras confirmadas -> 50% pagadas
        }
      }

      mockReservationsArray.push({
        userId,
        pitchId,
        startTime,
        endTime,
        status,
        paymentMethod,
        isPaid,
      });
    }

    if (mockReservationsArray.length > 0) {
      await db.insert(reservations).values(mockReservationsArray);
      console.log(`✔ Inyectadas ${mockReservationsArray.length} reservas en el historial (intentos requeridos: ${attempts}).`);
    } else {
      console.log('⚠ No se generaron reservas mock para inyectar.');
    }

    console.log('--- SEEDING COMPLETADO CON ÉXITO ---');
    process.exit(0);
  } catch (error) {
    console.error('Error catastrófico en el seeding:', error);
    process.exit(1);
  }
}

main();
