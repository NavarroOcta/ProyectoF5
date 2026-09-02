"use client";

import { useState, useTransition } from 'react';
import BookingCalendar from './booking-calendar';
import TimeSlotGrid from './time-slot-grid';
import CheckoutDialog from './checkout-dialog';
import { createReservation } from '@/lib/actions/public.actions';

interface Pitch {
  id: string;
  name: string;
  type: string;
  price: number;
  status: string;
}

interface BookingFlowProps {
  pitches: Pitch[];
  initialPitchId?: string;
}

export default function BookingFlow({ pitches, initialPitchId }: BookingFlowProps) {
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(
    initialPitchId ? pitches.find(p => p.id === initialPitchId) || null : null
  );
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Paso Cero: Interceptor de selección de cancha si no hay ninguna activa
  if (!selectedPitch) {
    return (
      <div className="w-full flex flex-col gap-6 p-6 glass-elevated rounded-2xl">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h3 className="font-headline-lg text-headline-lg text-primary">SELECCIONA UNA CANCHA</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Elige una de nuestras canchas activas para iniciar tu reserva.</p>
        </div>
        
        {pitches.length === 0 ? (
          <div className="p-8 text-center bg-surface-container/50 border border-white/5 rounded-xl">
            <span className="material-symbols-outlined text-on-surface-variant/40 mb-2" style={{ fontSize: '48px' }}>sports_soccer</span>
            <p className="text-on-surface-variant font-body-md">No hay canchas disponibles para reservar en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pitches.map((pitch) => (
              <button
                key={pitch.id}
                onClick={() => setSelectedPitch(pitch)}
                className="glass-surface p-6 rounded-xl border border-white/5 hover:border-primary/50 text-left transition-all hover:scale-[1.02] cursor-pointer flex flex-col gap-2"
              >
                <div className="flex justify-between items-center w-full">
                  <h4 className="font-headline-md text-headline-md text-on-surface">{pitch.name}</h4>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    {pitch.type}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">Césped profesional con iluminación LED nocturna. Ideal para partidos competitivos.</p>
                <span className="text-xs text-primary font-bold mt-2 flex items-center gap-1">
                  Ver Horarios Disponibles <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const handleSelectSlot = (slot: { start: string; end: string }) => {
    setSelectedSlot(slot);
    setFeedback(null);
    setIsCheckoutOpen(true);
  };

  const handleConfirmBooking = (paymentMethod: 'transfer' | 'cash') => {
    if (!selectedSlot || !selectedPitch) return;

    startTransition(async () => {
      // payload conforma a CreateBookingDTO requiriendo userId
      const payload = {
        userId: 'session_user_placeholder', // Requerido por el Zod DTO, el servidor lo pisará con el JWT real
        pitchId: selectedPitch.id,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        paymentMethod,
      };

      try {
        const response = await createReservation(payload);
        
        if (response.success) {
          setFeedback({
            type: 'success',
            text: `¡Reserva confirmada con éxito! Modalidad de pago: ${paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}.`,
          });
          setIsCheckoutOpen(false);
          setSelectedSlot(null);
        } else {
          setFeedback({
            type: 'error',
            text: response.message || 'Error al procesar tu reserva.',
          });
          setIsCheckoutOpen(false);
        }
      } catch (err) {
        setFeedback({
          type: 'error',
          text: 'Error de red inesperado al procesar la reserva.',
        });
        setIsCheckoutOpen(false);
      }
    });
  };

  return (
    <div className="w-full flex flex-col gap-8 p-6 glass-elevated rounded-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-col gap-2">
          <h3 className="font-headline-lg text-headline-lg text-primary">{selectedPitch.name}</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Selecciona la fecha y hora de tu preferencia para reservar.</p>
        </div>
        <button
          onClick={() => { setSelectedPitch(null); setSelectedSlot(null); setFeedback(null); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-surface-container transition-colors text-xs font-label-caps cursor-pointer self-start md:self-center"
        >
          <span className="material-symbols-outlined text-xs">arrow_back</span>
          Cambiar Cancha
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-2 animate-fade-in ${
          feedback.type === 'success'
            ? 'bg-primary/10 border-primary/20 text-primary'
            : 'bg-error/10 border-error/20 text-error'
        }`}>
          <span className="material-symbols-outlined">
            {feedback.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {feedback.text}
        </div>
      )}

      {/* Date Picker */}
      <BookingCalendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Time Slot Grid */}
      <TimeSlotGrid
        pitchId={selectedPitch.id}
        selectedDate={selectedDate}
        onSelectSlot={handleSelectSlot}
      />

      {/* Checkout Modal */}
      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        pitchName={selectedPitch.name}
        pitchPrice={selectedPitch.price}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        isSubmitting={isPending}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
}
