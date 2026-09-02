"use client";

import { useEffect, useState } from 'react';
import { getAvailableTimeSlots } from '@/lib/actions/public.actions';

interface TimeSlotGridProps {
  pitchId: string;
  selectedDate: Date;
  onSelectSlot: (slot: { start: string; end: string }) => void;
}

export default function TimeSlotGrid({ pitchId, selectedDate, onSelectSlot }: TimeSlotGridProps) {
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSlots() {
      setLoading(true);
      setError(null);
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await getAvailableTimeSlots(pitchId, dateStr);
        // getAvailableTimeSlots devuelve directamente el array de slots en la firma actual
        setSlots(response || []);
      } catch (err) {
        setError('Error al cargar horarios disponibles.');
      } finally {
        setLoading(false);
      }
    }

    if (pitchId) {
      loadSlots();
    }
  }, [pitchId, selectedDate]);

  const formatSlotLabel = (startIso: string, endIso: string) => {
    const start = new Date(startIso);
    const end = new Date(endIso);
    const startStr = String(start.getHours()).padStart(2, '0') + ':00';
    const endStr = String(end.getHours()).padStart(2, '0') + ':00';
    return `${startStr} - ${endStr}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <label className="font-label-caps text-label-caps text-on-surface-variant">Buscando Turnos...</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="h-14 rounded-xl bg-surface-container animate-pulse border border-white/5"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error/10 border border-error/50 rounded-xl text-error text-center font-body-md">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <label className="font-label-caps text-label-caps text-on-surface-variant">Turnos Disponibles</label>
      {slots.length === 0 ? (
        <div className="p-8 text-center bg-surface-container/50 border border-white/5 rounded-xl">
          <p className="text-on-surface-variant font-body-md">No hay turnos disponibles para este día.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {slots.map((slot, idx) => (
            <button
              key={idx}
              onClick={() => onSelectSlot(slot)}
              className="flex items-center justify-center p-4 rounded-xl border border-white/5 bg-surface-container hover:bg-surface-container-high hover:border-primary/50 hover:text-primary transition-all text-on-surface font-headline-md text-headline-md text-center cursor-pointer active:scale-95"
            >
              {formatSlotLabel(slot.start, slot.end)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
