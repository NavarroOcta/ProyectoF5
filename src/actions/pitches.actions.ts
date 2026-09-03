"use server";

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { CreatePitchDTOSchema } from '@/types';
import { pitchesRepository } from '@/lib/repositories/pitches.repository';
import { createServerClient } from '@supabase/ssr';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Middleware RBAC helper
async function checkAdminAuth() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() { /* El middleware ya refresca las cookies */ }
      }
    }
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('UNAUTHORIZED');
  // Verificación de rol en la tabla pública
  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  });
  
  if (!userRecord || userRecord.role !== 'admin') throw new Error('FORBIDDEN');
}

export async function updatePitch(pitchId: string, payload: unknown) {
  try {
    await checkAdminAuth();
  } catch (authError: any) {
    return { success: false as const, error: authError.message as string, message: 'No autorizado' };
  }

  const validation = CreatePitchDTOSchema.safeParse(payload);
  if (!validation.success) {
    return { success: false as const, error: 'VALIDATION_ERROR', details: validation.error.flatten().fieldErrors };
  }

  try {
    await pitchesRepository.updatePitch(pitchId, validation.data);
    
    revalidatePath('/admin/pitches');
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: 'DATABASE_ERROR', message: 'Error al actualizar la cancha.' };
  }
}

export async function deletePitch(pitchId: string) {
  try {
    await checkAdminAuth();
  } catch (authError: any) {
    return { success: false as const, error: authError.message as string, message: 'No autorizado' };
  }

  try {
    await pitchesRepository.deletePitch(pitchId);
    revalidatePath('/admin/pitches');
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: 'DATABASE_ERROR', message: 'Error al eliminar la cancha.' };
  }
}

export async function updatePitchSchedules(
  pitchId: string,
  schedules: { dayOfWeek: number; openTime: string; closeTime: string }[]
) {
  try {
    await checkAdminAuth();
  } catch (authError: any) {
    return { success: false as const, error: authError.message as string, message: 'No autorizado' };
  }

  try {
    await pitchesRepository.updatePitchSchedulesTransaction(pitchId, schedules);

    revalidatePath('/admin/pitches');
    return { success: true as const };
  } catch (error: any) {
    return { success: false as const, error: 'DATABASE_ERROR', message: error.message || 'Error al actualizar la disponibilidad.' };
  }
}

/**
 * Server Action unificada para crear una cancha junto con sus horarios de disponibilidad semanal.
 * Ejecuta una transacción atómica para asegurar la integridad referencial.
 *
 * @param payload Datos básicos de la cancha
 * @param schedules Arreglo de horarios semanales
 */
export async function createPitchWithSchedules(
  payload: unknown,
  schedules: { dayOfWeek: number; openTime: string; closeTime: string }[]
) {
  try {
    await checkAdminAuth();
  } catch (authError: any) {
    return { success: false as const, error: authError.message as string, message: 'No autorizado' };
  }

  const validation = CreatePitchDTOSchema.safeParse(payload);
  if (!validation.success) {
    return { success: false as const, error: 'VALIDATION_ERROR', details: validation.error.flatten().fieldErrors };
  }

  const pitchData = validation.data;

  try {
    const newPitch = await pitchesRepository.createPitchWithSchedulesTransaction(pitchData, schedules);

    revalidatePath('/admin/pitches');
    return { success: true as const, data: newPitch };
  } catch (error: any) {
    return { success: false as const, error: 'DATABASE_ERROR', message: error.message || 'Error al crear la cancha y sus horarios.' };
  }
}
