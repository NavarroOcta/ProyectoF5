import { db } from '@/lib/db';
import { pitches, pitchSchedules } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export const pitchesRepository = {
  async countActivePitches() {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(pitches)
      .where(eq(pitches.status, 'available'));
    return Number(result[0]?.count || 0);
  },

  async findPitchScheduleByDay(pitchId: string, dayOfWeek: number) {
    return await db.select()
      .from(pitchSchedules)
      .where(
        and(
          eq(pitchSchedules.pitchId, pitchId),
          eq(pitchSchedules.dayOfWeek, dayOfWeek)
        )
      )
      .limit(1);
  },

  async updatePitch(id: string, data: Partial<typeof pitches.$inferInsert>) {
    return await db.update(pitches)
      .set(data)
      .where(eq(pitches.id, id))
      .returning();
  },

  async deletePitch(id: string) {
    return await db.delete(pitches).where(eq(pitches.id, id)).returning();
  },

  async updatePitchSchedulesTransaction(
    pitchId: string, 
    schedules: { dayOfWeek: number; openTime: string; closeTime: string }[]
  ) {
    return await db.transaction(async (tx) => {
      // 1. Wipe: Eliminar horarios previos
      await tx.delete(pitchSchedules).where(eq(pitchSchedules.pitchId, pitchId));

      // 2. Replace: Recrear nuevos horarios si existen
      if (schedules.length > 0) {
        const inserts = schedules.map(s => ({
          pitchId,
          dayOfWeek: s.dayOfWeek,
          openTime: s.openTime,
          closeTime: s.closeTime,
        }));
        await tx.insert(pitchSchedules).values(inserts);
      }
    });
  },

  async createPitchWithSchedulesTransaction(
    pitchData: typeof pitches.$inferInsert,
    schedules: { dayOfWeek: number; openTime: string; closeTime: string }[]
  ) {
    return await db.transaction(async (tx) => {
      // 1. Insertar la cancha
      const [newPitch] = await tx.insert(pitches).values(pitchData).returning();

      // 2. Si hay horarios provistos, hacer inserción masiva
      if (schedules.length > 0) {
        const inserts = schedules.map(s => ({
          pitchId: newPitch.id,
          dayOfWeek: s.dayOfWeek,
          openTime: s.openTime,
          closeTime: s.closeTime,
        }));
        await tx.insert(pitchSchedules).values(inserts);
      }

      return newPitch;
    });
  }
};
