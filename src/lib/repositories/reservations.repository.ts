import { db } from '@/lib/db';
import { reservations, pitches } from '@/lib/db/schema';
import { eq, gte, lte, and, sql, asc } from 'drizzle-orm';

export const reservationsRepository = {
  async countReservationsByDateRange(start: Date, end: Date, status?: string) {
    let whereClause = and(
      gte(reservations.startTime, start),
      lte(reservations.startTime, end)
    );

    if (status) {
      whereClause = and(whereClause, eq(reservations.status, status));
    }

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(reservations)
      .where(whereClause);
      
    return Number(result[0]?.count || 0);
  },

  async getRevenueByDateRange(start: Date, end: Date) {
    const result = await db
      .select({ revenue: sql<number>`coalesce(sum(${pitches.price}), 0)` })
      .from(reservations)
      .innerJoin(pitches, eq(reservations.pitchId, pitches.id))
      .where(
        and(
          eq(reservations.isPaid, true),
          gte(reservations.startTime, start),
          lte(reservations.startTime, end)
        )
      );
      
    return Number(result[0]?.revenue || 0);
  },

  async findReservationsByDateRange(start: Date, end: Date) {
    return await db.query.reservations.findMany({
      where: and(
        gte(reservations.startTime, start),
        lte(reservations.startTime, end)
      ),
      with: {
        user: true,
        pitch: true,
      },
      orderBy: [asc(reservations.startTime)],
    });
  },

  async findAllReservations() {
    return await db.query.reservations.findMany({
      with: {
        user: true,
        pitch: true,
      },
      orderBy: [asc(reservations.startTime)],
    });
  },

  async findReservationById(id: string) {
    return await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
  },

  async updateReservationStatus(id: string, updates: Partial<typeof reservations.$inferInsert>) {
    return await db.update(reservations)
      .set(updates)
      .where(eq(reservations.id, id))
      .returning();
  },

  async findConfirmedReservationsByPeriod(start: Date) {
    return await db.select({
      startTime: reservations.startTime,
      isPaid: reservations.isPaid,
      price: pitches.price,
    })
    .from(reservations)
    .innerJoin(pitches, eq(reservations.pitchId, pitches.id))
    .where(
      and(
        eq(reservations.status, 'confirmed'),
        gte(reservations.startTime, start)
      )
    );
  },

  async findActiveReservationsByPitchAndDate(pitchId: string, start: Date, end: Date) {
    return await db.select()
      .from(reservations)
      .where(
        and(
          eq(reservations.pitchId, pitchId),
          eq(reservations.status, 'confirmed'),
          gte(reservations.startTime, start),
          lte(reservations.startTime, end)
        )
      );
  },

  async createReservation(data: typeof reservations.$inferInsert) {
    return await db.insert(reservations).values(data).returning();
  }
};
