"use server";

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { db } from '../db';
import { pitches, reservations, users } from '../db/schema';
import { CreatePitchDTOSchema } from '../../types';
import { eq } from 'drizzle-orm';
import { createServerClient } from '@supabase/ssr';

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

/**
 * Server Action para dar de alta una nueva cancha (Backoffice).
 * Autentica al administrador mediante JWT, valida los datos de entrada e inserta el registro.
 *
 * @param payload Datos de la cancha a crear (nombre, tipo y estado)
 */
export async function createPitch(payload: unknown) {
  try {
    await checkAdminAuth();
  } catch (error: any) {
    return {
      success: false as const,
      error: error.message as 'UNAUTHORIZED' | 'FORBIDDEN',
      message: error.message === 'FORBIDDEN' 
        ? 'No tienes los permisos administrativos necesarios para realizar esta acción.'
        : 'No se encontró una sesión activa.',
    };
  }

  // 3. Validar estructuralmente los datos de la cancha con Zod
  const validationResult = CreatePitchDTOSchema.safeParse(payload);
  if (!validationResult.success) {
    return {
      success: false as const,
      error: 'VALIDATION_ERROR' as const,
      details: validationResult.error.flatten().fieldErrors,
    };
  }

  const { name, type, status } = validationResult.data;

  try {
    // 4. Registrar la cancha en la base de datos
    const [newPitch] = await db.insert(pitches).values({
      name,
      type,
      status,
    }).returning();

    // 5. Invalida la caché del cliente en la sección administrativa
    revalidatePath('/admin/pitches');

    return {
      success: true as const,
      data: newPitch,
    };
  } catch (error: any) {
    return {
      success: false as const,
      error: 'DATABASE_ERROR' as const,
      message: 'Ocurrió un error inesperado al registrar la cancha en la base de datos.',
    };
  }
}

/**
 * Server Action para alternar el estado de pago de una reserva (Backoffice).
 * Autentica al administrador, actualiza la propiedad isPaid e invalida la caché de la vista.
 *
 * @param reservationId ID de la reserva a modificar
 * @param isPaid Nuevo estado de pago
 */
export async function toggleReservationPayment(reservationId: string, isPaid: boolean) {
  try {
    await checkAdminAuth();
  } catch (error: any) {
    return {
      success: false as const,
      error: error.message as 'UNAUTHORIZED' | 'FORBIDDEN',
      message: error.message === 'FORBIDDEN' 
        ? 'No tienes los permisos administrativos necesarios para realizar esta acción.'
        : 'No se encontró una sesión activa.',
    };
  }

  try {
    // 3. Ejecutar actualización en la base de datos
    const [updated] = await db.update(reservations)
      .set({ isPaid })
      .where(eq(reservations.id, reservationId))
      .returning();

    // 4. Invalida la caché del panel de control
    revalidatePath('/admin/reservations');

    return {
      success: true as const,
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false as const,
      error: 'DATABASE_ERROR' as const,
      message: 'Ocurrió un error inesperado al actualizar el estado de pago.',
    };
  }
}
