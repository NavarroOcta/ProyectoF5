"use client";

import { useTransition } from 'react';
import { cancelReservation } from '@/lib/actions/user.actions';

export default function CancelReservationButton({ reservationId }: { reservationId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (confirm('¿Estás seguro de que deseas cancelar este turno?')) {
      startTransition(async () => {
        const res = await cancelReservation(reservationId);
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
      className="bg-transparent border border-error text-error hover:bg-error hover:text-on-error px-4 py-2 rounded font-label-caps text-label-caps disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
    >
      {isPending ? (
        <>
          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>refresh</span>
          <span>CANCELANDO...</span>
        </>
      ) : (
        <span>CANCELAR TURNO</span>
      )}
    </button>
  );
}
