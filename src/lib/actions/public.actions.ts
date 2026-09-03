"use server";

import { revalidatePath } from 'next/cache';
import { CreateBookingDTOSchema, RegisterUserDTOSchema } from '../../types';
import { cookies } from 'next/headers';
import { usersRepository } from '../repositories/users.repository';
import { pitchesRepository } from '../repositories/pitches.repository';
import { reservationsRepository } from '../repositories/reservations.repository';
import { createServerClient } from '@supabase/ssr';

/**
 * Server Action para registrar una reserva de cancha.
 * Valida el payload de entrada contra el DTO de reserva y maneja el control de concurrencia.
 *
 * @param payload Datos de la reserva a crear
 * @returns DTO de respuesta con estado success y el objeto insertado o el error controlado
 */
export async function createBooking(payload: unknown) {
  // 1. Validar el payload con el esquema Zod
  const validationResult = CreateBookingDTOSchema.safeParse(payload);
  
  if (!validationResult.success) {
    return {
      success: false as const,
      error: 'VALIDATION_ERROR' as const,
      details: validationResult.error.flatten().fieldErrors,
    };
  }

  const { userId, pitchId, startTime, endTime } = validationResult.data;

  try {
    // Validación de horarios operativos de la cancha
    const requestedDate = new Date(startTime);
    const dayOfWeek = requestedDate.getDay(); 

    // Formatear hora de inicio y fin a "HH:mm" (ej. "09:00", "10:30")
    const reqStartTimeStr = requestedDate.toTimeString().substring(0, 5); 
    const reqEndTimeStr = new Date(endTime).toTimeString().substring(0, 5);

    // Consultar el horario operativo usando el repositorio
    const schedule = await pitchesRepository.findPitchScheduleByDay(pitchId, dayOfWeek);

    if (schedule.length === 0) {
      throw new Error('PITCH_CLOSED_ON_DAY');
    }

    // Validación léxica/matemática
    if (reqStartTimeStr < schedule[0].openTime || reqEndTimeStr > schedule[0].closeTime) {
      throw new Error('OUTSIDE_OPERATING_HOURS');
    }

    // 2. Intentar la inserción en base de datos usando el repositorio
    const [booking] = await reservationsRepository.createReservation({
      userId,
      pitchId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'confirmed',
    });

    // 3. Revalidar el path de visualización pública
    revalidatePath('/booking');

    return {
      success: true as const,
      data: booking,
    };
  } catch (error: any) {
    if (error.message === 'PITCH_CLOSED_ON_DAY') {
      return {
        success: false as const,
        error: 'VALIDATION_ERROR' as const,
        details: { startTime: ['La cancha seleccionada no opera en el día solicitado.'] },
      };
    }
    if (error.message === 'OUTSIDE_OPERATING_HOURS') {
      return {
        success: false as const,
        error: 'VALIDATION_ERROR' as const,
        details: { 
          startTime: ['El inicio seleccionado está fuera de los límites de apertura de la cancha.'],
          endTime: ['El fin seleccionado está fuera de los límites de cierre de la cancha.']
        },
      };
    }

    const isDoubleBooking = 
      error.code === '23P01' || 
      error.constraint === 'prevent_double_booking' || 
      String(error.message).includes('prevent_double_booking');

    if (isDoubleBooking) {
      return {
        success: false as const,
        error: 'DOUBLE_BOOKING_COLLISION' as const,
        message: 'El turno seleccionado ya fue reservado por otro usuario en este preciso momento.',
      };
    }

    return {
      success: false as const,
      error: 'DATABASE_ERROR' as const,
      message: 'Ocurrió un error inesperado al procesar la reserva en la base de datos.',
    };
  }
}

/**
 * Server Action para registrar un usuario común en la plataforma.
 * (Nota: Supabase maneja el auth, esto puede ser obsoleto si el auth se maneja 100% en cliente,
 * pero se mantiene la lógica si es llamada por algún hook de Supabase o API de cliente).
 */
export async function registerUser(payload: unknown) {
  // 1. Validar los datos de entrada con Zod
  const validationResult = RegisterUserDTOSchema.safeParse(payload);

  if (!validationResult.success) {
    return {
      success: false as const,
      error: 'VALIDATION_ERROR' as const,
      details: validationResult.error.flatten().fieldErrors,
    };
  }

  const { email, name, phone } = validationResult.data;

  try {
    // 2. Comprobar si el correo ya existe
    const existing = await usersRepository.findUserByEmail(email);
    if (existing.length > 0) {
      return {
        success: false as const,
        error: 'EMAIL_ALREADY_EXISTS' as const,
        message: 'El correo electrónico ya se encuentra registrado.',
      };
    }

    const userId = `user_${Math.random().toString(36).substring(2, 11)}`;

    // 4. Registrar en base de datos (rol 'user' por defecto)
    const [newUser] = await usersRepository.createUser({
      id: userId,
      email,
      name,
      phone,
      role: 'user',
    });

    return {
      success: true as const,
      data: newUser,
    };
  } catch (error: any) {
    return {
      success: false as const,
      error: 'DATABASE_ERROR' as const,
      message: 'Ocurrió un error inesperado al registrar el usuario en la base de datos.',
    };
  }
}

/**
 * Obtiene las franjas horarias disponibles para una cancha específica en un día determinado.
 * Utiliza segmentación de 60 minutos e intersección matemática en hora local para evitar desfasajes.
 *
 * @param pitchId ID de la cancha
 * @param dateStr Fecha en formato YYYY-MM-DD
 */
export async function getAvailableTimeSlots(pitchId: string, dateStr: string) {
  function formatLocalISO(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  // 1. Obtener las marcas de inicio y fin del día solicitado en el huso horario local de la petición
  const [yearStr, monthStr, dayStr] = dateStr.split('-').map(Number);
  const startOfDay = new Date(yearStr, monthStr - 1, dayStr, 0, 0, 0, 0);
  const endOfDay = new Date(yearStr, monthStr - 1, dayStr, 23, 59, 59, 999);

  // 2. Obtener el día de la semana en hora local para la coincidencia de horarios semanales
  const dayOfWeek = startOfDay.getDay();

  // 3. Consultar el horario operativo de la cancha usando el repositorio
  const schedule = await pitchesRepository.findPitchScheduleByDay(pitchId, dayOfWeek);

  if (schedule.length === 0) {
    return [];
  }

  const { openTime, closeTime } = schedule[0];

  // 4. Consultar las reservas activas usando el repositorio
  const activeReservations = await reservationsRepository.findActiveReservationsByPitchAndDate(pitchId, startOfDay, endOfDay);

  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  const totalStartMinutes = openHour * 60 + openMinute;
  const totalEndMinutes = closeHour * 60 + closeMinute;
  const slots: { start: string; end: string }[] = [];

  // 5. Segmentación iterativa en bloques de 60 minutos
  for (let currentMinutes = totalStartMinutes; currentMinutes + 60 <= totalEndMinutes; currentMinutes += 60) {
    const slotStart = new Date(startOfDay);
    slotStart.setHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0);

    const slotEnd = new Date(startOfDay);
    slotEnd.setHours(Math.floor((currentMinutes + 60) / 60), (currentMinutes + 60) % 60, 0, 0);

    const isBusy = activeReservations.some(res => {
      const resStart = new Date(res.startTime);
      const resEnd = new Date(res.endTime);
      return slotStart < resEnd && slotEnd > resStart;
    });

    if (!isBusy) {
      slots.push({
        start: formatLocalISO(slotStart),
        end: formatLocalISO(slotEnd),
      });
    }
  }

  return slots;
}

/**
 * Server Action para realizar una reserva.
 * Extrae y valida el usuario desde Supabase en lugar de confiar en el DTO del cliente.
 *
 * @param payload Datos de la reserva (pitchId, startTime, endTime, paymentMethod)
 */
export async function createReservation(payload: unknown) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {}
      }
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.id) {
    return {
      success: false as const,
      error: 'UNAUTHORIZED' as const,
      message: 'Inicia sesión para poder realizar una reserva.',
    };
  }

  const userId = user.id;

  // 3. Validar estructuralmente la reserva
  const validationResult = CreateBookingDTOSchema.safeParse(payload);
  if (!validationResult.success) {
    return {
      success: false as const,
      error: 'VALIDATION_ERROR' as const,
      details: validationResult.error.flatten().fieldErrors,
    };
  }

  const { pitchId, startTime, endTime, paymentMethod } = validationResult.data;

  try {
    // 4. Intentar insertar la reserva usando el repositorio
    const [newReservation] = await reservationsRepository.createReservation({
      userId,
      pitchId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      paymentMethod,
      status: 'confirmed',
    });

    // 5. Invalida caché pública para reflejar el estado actual
    revalidatePath('/booking');

    return {
      success: true as const,
      data: newReservation,
    };
  } catch (error: any) {
    const isDoubleBooking = 
      error.code === '23P01' || 
      error.constraint === 'prevent_double_booking' || 
      String(error.message).includes('prevent_double_booking');

    if (isDoubleBooking) {
      return {
        success: false as const,
        error: 'DOUBLE_BOOKING_COLLISION' as const,
        message: 'El turno seleccionado ya fue reservado por otro usuario en este preciso momento.',
      };
    }

    return {
      success: false as const,
      error: 'DATABASE_ERROR' as const,
      message: 'Ocurrió un error inesperado al procesar la reserva en la base de datos.',
    };
  }
}
