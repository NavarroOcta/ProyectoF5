import { pgTable, text, timestamp, uuid, integer, unique, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // ID proveniente de Supabase auth.users
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  role: text('role').notNull().default('user'), // 'user' | 'admin'
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const pitches = pgTable('pitches', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // Ej: 'F5', 'F7', 'F11'
  price: integer('price').notNull().default(0),
  status: text('status').notNull().default('available'), // 'available' | 'maintenance'
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const reservations = pgTable('reservations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  pitchId: uuid('pitch_id').notNull().references(() => pitches.id, { onDelete: 'cascade' }),
  startTime: timestamp('start_time', { withTimezone: true, mode: 'date' }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true, mode: 'date' }).notNull(),
  status: text('status').notNull().default('confirmed'), // 'confirmed' | 'cancelled'
  paymentMethod: text('payment_method').notNull().default('cash'),
  isPaid: boolean('is_paid').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const pitchSchedules = pgTable('pitch_schedules', {
  id: uuid('id').defaultRandom().primaryKey(),
  pitchId: uuid('pitch_id').notNull().references(() => pitches.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Domingo, 1 = Lunes, etc.
  openTime: text('open_time').notNull(), // Formato "HH:mm" (ej. "09:00")
  closeTime: text('close_time').notNull(), // Formato "HH:mm" (ej. "23:00")
}, (t) => ({
  unq: unique().on(t.pitchId, t.dayOfWeek),
}));

export const usersRelations = relations(users, ({ many }) => ({
  reservations: many(reservations),
}));

export const pitchesRelations = relations(pitches, ({ many }) => ({
  reservations: many(reservations),
  schedules: many(pitchSchedules),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),
  pitch: one(pitches, {
    fields: [reservations.pitchId],
    references: [pitches.id],
  }),
}));

export const pitchSchedulesRelations = relations(pitchSchedules, ({ one }) => ({
  pitch: one(pitches, {
    fields: [pitchSchedules.pitchId],
    references: [pitches.id],
  }),
}));
