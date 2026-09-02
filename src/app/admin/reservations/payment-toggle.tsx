"use client";

import { useTransition } from 'react';
import { toggleReservationPayment } from '@/actions/admin.actions';

interface PaymentToggleProps {
  reservationId: string;
  isPaid: boolean;
}

export default function PaymentToggle({ reservationId, isPaid }: PaymentToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleReservationPayment(reservationId);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer disabled:opacity-50 select-none ${
        isPaid
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
          : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-400' : 'bg-red-400'} ${isPending ? 'animate-pulse' : ''}`}></span>
      {isPaid ? 'PAGADO' : 'PENDIENTE'}
    </button>
  );
}
