"use client";

import { useTransition } from 'react';
import { cancelReservationByAdmin } from '@/actions/admin.actions';

export default function AdminCancelButton({ reservationId }: { reservationId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (confirm('¿Estás seguro de cancelar esta reserva desde el panel de administración?')) {
      startTransition(async () => {
        const res = await cancelReservationByAdmin(reservationId);
        if (!res.success) {
          alert(res.message);
        }
      });
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="bg-transparent border border-error text-error hover:bg-error hover:text-on-error px-3 py-1 rounded text-xs font-bold disabled:opacity-50 transition-colors ml-2"
    >
      {isPending ? 'CANCELANDO...' : 'CANCELAR'}
    </button>
  );
}
