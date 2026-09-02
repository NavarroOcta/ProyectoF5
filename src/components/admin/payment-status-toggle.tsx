"use client";

import { useTransition } from 'react';
import { toggleReservationPayment } from '@/actions/admin.actions';

export default function PaymentStatusToggle({ reservationId, isPaid }: { reservationId: string, isPaid: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleReservationPayment(reservationId, !isPaid);
    });
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`px-4 py-1.5 rounded text-xs font-bold font-label-caps tracking-wider transition-all cursor-pointer select-none
        ${isPaid 
          ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30 border border-green-500/30' 
          : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-white/10'
        } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
    >
      {isPaid ? 'SÍ' : 'NO'}
    </button>
  );
}
