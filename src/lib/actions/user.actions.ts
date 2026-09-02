"use server";

import { db } from '../db';
import { reservations, pitches } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifyJwt } from '../auth/jwt';
import { revalidatePath } from 'next/cache';

export async function getUserReservations() {
  const token = cookies().get('session_token')?.value;
  if (!token) return [];
  const decoded = await verifyJwt(token);
  if (!decoded || !decoded.id) return [];

  try {
    const data = await db.select({
      id: reservations.id,
      startTime: reservations.startTime,
      endTime: reservations.endTime,
      status: reservations.status,
      isPaid: reservations.isPaid,
      pitchName: pitches.name,
      pitchPrice: pitches.price,
    })
    .from(reservations)
    .innerJoin(pitches, eq(reservations.pitchId, pitches.id))
    .where(eq(reservations.userId, decoded.id))
    .orderBy(desc(reservations.startTime));

    return data;
  } catch (error) {
    console.error('Error fetching user reservations', error);
    return [];
  }
}

export async function cancelReservation(reservationId: string) {
  const token = cookies().get('session_token')?.value;
  if (!token) return { success: false, message: 'No autenticado' };
  const decoded = await verifyJwt(token);
  if (!decoded || !decoded.id) return { success: false, message: 'No autenticado' };

  try {
    const [existing] = await db.select().from(reservations).where(eq(reservations.id, reservationId)).limit(1);
    if (!existing) return { success: false, message: 'Reserva no encontrada' };
    if (existing.userId !== decoded.id) return { success: false, message: 'Acceso denegado' };
    if (existing.status !== 'confirmed') return { success: false, message: 'Estado inválido para cancelación' };

    await db.update(reservations)
      .set({ status: 'cancelled' })
      .where(eq(reservations.id, reservationId));

    revalidatePath('/dashboard/reservations');
    revalidatePath('/booking'); // Also revalidate booking catalog to free up the slot
    return { success: true };
  } catch (error) {
    console.error('Error cancelling reservation', error);
    return { success: false, message: 'Ocurrió un error inesperado al cancelar.' };
  }
}
