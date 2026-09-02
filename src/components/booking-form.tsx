"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BaseBookingSchema, type CreateBookingDTO } from "@/types";
import { createBooking } from "@/lib/actions/public.actions";

const ClientFormSchema = BaseBookingSchema.extend({
  startTime: z.string().min(1, "La fecha de inicio es requerida"),
  endTime: z.string().min(1, "La fecha de fin es requerida")
});
type ClientFormInput = z.infer<typeof ClientFormSchema>;

export default function BookingForm() {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, reset } = useForm<ClientFormInput>({
    resolver: zodResolver(ClientFormSchema),
  });

  const onSubmit = async (data: ClientFormInput) => {
    setFeedback(null);
    
    // Transformación estricta a UTC ISO 8601
    const payload: CreateBookingDTO = {
      userId: data.userId,
      pitchId: data.pitchId,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
      paymentMethod: (data.paymentMethod as "cash" | "card" | "transfer") || 'cash',
    };

    const response = await createBooking(payload);

    if (response.success) {
      setFeedback({ type: 'success', text: 'Reserva confirmada exitosamente.' });
      reset();
      return;
    }

    switch (response.error) {
      case 'VALIDATION_ERROR':
        if (response.details) {
          Object.entries(response.details).forEach(([key, msg]) => {
            setError(key as keyof ClientFormInput, { message: (msg as string[])?.[0] || 'Error de validación' });
          });
        }
        break;
      case 'DOUBLE_BOOKING_COLLISION':
        setFeedback({ type: 'error', text: 'El turno seleccionado ya fue reservado por otro usuario en este preciso momento.' });
        break;
      case 'DATABASE_ERROR':
        setFeedback({ type: 'error', text: 'Error interno del servidor. Inténtalo de nuevo.' });
        break;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-6 bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-slate-800">Nueva Reserva</h2>
      
      {feedback && (
        <div className={`p-3 rounded-xl text-sm font-medium ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {feedback.text}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-600">ID de Usuario</label>
        <input {...register('userId')} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
        {errors.userId && <span className="text-red-500 text-xs">{errors.userId.message}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-600">ID de Cancha</label>
        <input {...register('pitchId')} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
        {errors.pitchId && <span className="text-red-500 text-xs">{errors.pitchId.message}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-600">Inicio (Hora Local)</label>
        <input type="datetime-local" {...register('startTime')} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
        {errors.startTime && <span className="text-red-500 text-xs">{errors.startTime.message}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-600">Fin (Hora Local)</label>
        <input type="datetime-local" {...register('endTime')} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
        {errors.endTime && <span className="text-red-500 text-xs">{errors.endTime.message}</span>}
      </div>

      <button disabled={isSubmitting} type="submit" className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 active:scale-[0.98]">
        {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
      </button>
    </form>
  );
}
