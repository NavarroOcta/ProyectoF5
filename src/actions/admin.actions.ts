"use server";

import { revalidatePath } from 'next/cache';
import { reservationsRepository } from '@/lib/repositories/reservations.repository';
import { usersRepository } from '@/lib/repositories/users.repository';
import { pitchesRepository } from '@/lib/repositories/pitches.repository';

export async function getTodaysReservationsCount(dateFilter?: string): Promise<number> {
  let startOfDay: Date;
  let endOfDay: Date;

  if (dateFilter) {
    const [year, month, day] = dateFilter.split('-').map(Number);
    startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
  } else {
    startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
  }

  return await reservationsRepository.countReservationsByDateRange(startOfDay, endOfDay, 'confirmed');
}

export async function getActivePitchesCount(): Promise<number> {
  return await pitchesRepository.countActivePitches();
}

export async function getClientsCount(): Promise<number> {
  return await usersRepository.countUsersByRole('user');
}

export async function getRevenueMetrics(dateFilter?: string): Promise<number> {
  let startOfDay: Date;
  let endOfDay: Date;

  if (dateFilter) {
    const [year, month, day] = dateFilter.split('-').map(Number);
    startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
  } else {
    startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
  }

  return await reservationsRepository.getRevenueByDateRange(startOfDay, endOfDay);
}

export async function getReservationsList(dateFilter?: string) {
  if (dateFilter) {
    const [year, month, day] = dateFilter.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    
    return await reservationsRepository.findReservationsByDateRange(startOfDay, endOfDay);
  }

  return await reservationsRepository.findAllReservations();
}

export async function getUsersList() {
  return await usersRepository.findUsersByRole('user');
}

export async function toggleReservationPayment(reservationId: string, nextStatus?: boolean) {
  try {
    let targetStatus = nextStatus;
    if (targetStatus === undefined) {
      const reservation = await reservationsRepository.findReservationById(reservationId);
      if (reservation.length === 0) {
        return { success: false, message: 'Reserva no encontrada.' };
      }
      targetStatus = !reservation[0].isPaid;
    }
    
    const updated = await reservationsRepository.updateReservationStatus(reservationId, { isPaid: targetStatus });
      
    revalidatePath('/admin/reservations');
    
    return { success: true, isPaid: updated[0].isPaid };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function cancelReservationByAdmin(reservationId: string) {
  try {
    const reservation = await reservationsRepository.findReservationById(reservationId);
    if (reservation.length === 0) {
      return { success: false, message: 'Reserva no encontrada.' };
    }

    if (reservation[0].status === 'cancelled') {
      return { success: false, message: 'La reserva ya está cancelada.' };
    }

    await reservationsRepository.updateReservationStatus(reservationId, { status: 'cancelled' });
      
    revalidatePath('/admin/reservations');
    revalidatePath('/booking');
    
    return { success: true };
  } catch (error: any) {
    return { success: false, message: 'Ocurrió un error al cancelar la reserva.' };
  }
}

/**
 * Obtiene las métricas agrupadas por día para alimentar gráficos estadísticos de Recharts.
 *
 * @param daysCount Cantidad de días hacia atrás a graficar (por defecto 7)
 */
export async function getChartMetrics(daysCount: number = 7) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Período de inicio: hoy - daysCount + 1 días
  const startOfPeriod = new Date(today);
  startOfPeriod.setDate(today.getDate() - daysCount + 1);

  // 1. Consultar reservas confirmadas en el período indicado
  const data = await reservationsRepository.findConfirmedReservationsByPeriod(startOfPeriod);

  // 2. Inicializar el mapa para todas las fechas en el rango (evitando huecos en la gráfica)
  const metricsMap = new Map<string, { date: string; revenue: number; reservations: number }>();
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(startOfPeriod);
    d.setDate(startOfPeriod.getDate() + i);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${day}/${month}`;
    metricsMap.set(key, { date: key, revenue: 0, reservations: 0 });
  }

  // 3. Rellenar con la sumatoria real
  for (const row of data) {
    const dateObj = new Date(row.startTime);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const key = `${day}/${month}`;

    const metric = metricsMap.get(key);
    if (metric) {
      metric.reservations += 1;
      if (row.isPaid) {
        metric.revenue += row.price;
      }
    }
  }

  // 4. Retornar como arreglo ordenado cronológicamente
  return Array.from(metricsMap.values());
}

export const getMockRevenue = getRevenueMetrics;
