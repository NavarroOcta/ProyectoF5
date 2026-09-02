import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export const usersRepository = {
  async countUsersByRole(role: string) {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, role));
    return Number(result[0]?.count || 0);
  },

  async findUsersByRole(role: string) {
    return await db.query.users.findMany({
      where: eq(users.role, role),
      orderBy: [desc(users.createdAt)],
    });
  },

  async findUserByEmail(email: string) {
    return await db.select().from(users).where(eq(users.email, email)).limit(1);
  },

  async createUser(data: typeof users.$inferInsert) {
    return await db.insert(users).values(data).returning();
  }
};
