"use client";

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { CreatePitchDTO, CreatePitchDTOSchema } from '@/types';
import { updatePitch, updatePitchSchedules } from '@/actions/pitches.actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DAYS = [
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' },
  { id: 6, label: 'Sábado' },
  { id: 0, label: 'Domingo' }
];

interface EditPitchDialogProps {
  pitch: {
    id: string;
    name: string;
    type: string;
    price: number;
    status: string;
    schedules?: {
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
    }[];
  };
}

export default function EditPitchDialog({ pitch }: EditPitchDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const formatPrice = (valStr: string) => {
    const numericStr = valStr.replace(/\D/g, '');
    if (!numericStr) return '';
    return `$ ${Number(numericStr).toLocaleString('es-AR')}`;
  };

  const [displayPrice, setDisplayPrice] = useState(
    pitch.price ? formatPrice(pitch.price.toString()) : ''
  );

  // Cargar disponibilidad inicial
  const [schedules, setSchedules] = useState<{ dayOfWeek: number; openTime: string; closeTime: string }[]>(
    pitch.schedules || []
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreatePitchDTO>({
    resolver: zodResolver(CreatePitchDTOSchema),
    defaultValues: {
      name: pitch.name,
      type: pitch.type,
      price: pitch.price,
      status: pitch.status as 'available' | 'maintenance',
    }
  });

  useEffect(() => {
    register('price');
  }, [register]);

  const handleDayToggle = (dayId: number) => {
    const exists = schedules.some(s => s.dayOfWeek === dayId);
    if (exists) {
      setSchedules(schedules.filter(s => s.dayOfWeek !== dayId));
    } else {
      setSchedules([...schedules, { dayOfWeek: dayId, openTime: '08:00', closeTime: '22:00' }]);
    }
  };

  const handleTimeChange = (dayId: number, field: 'openTime' | 'closeTime', value: string) => {
    setSchedules(schedules.map(s => {
      if (s.dayOfWeek === dayId) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const onSubmit = async (data: CreatePitchDTO) => {
    setServerError(null);
    startTransition(async () => {
      try {
        const res1 = await updatePitch(pitch.id, data);
        if (!res1.success) {
          setServerError(res1.message || 'Error al actualizar los datos de la cancha.');
          return;
        }

        const res2 = await updatePitchSchedules(pitch.id, schedules);
        if (!res2.success) {
          setServerError(res2.message || 'Error al actualizar el horario de la cancha.');
          return;
        }

        setOpen(false);
        router.refresh();
      } catch (error) {
        setServerError('Ocurrió un error inesperado al guardar los cambios.');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) { setServerError(null); } }}>
      <DialogTrigger asChild>
        <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg bg-surface border border-white/10 text-on-background max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline-lg text-headline-lg text-primary text-left">
            EDITAR CANCHA Y DISPONIBILIDAD
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
          {/* Nombre */}
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-label-caps text-on-surface">Nombre / Identificador</label>
            <input
              type="text"
              {...register('name')}
              className="w-full bg-surface-container border border-white/10 rounded px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md text-body-md"
              placeholder="Cancha 1 - Césped Pro"
            />
            {errors.name && <span className="text-error text-sm">{errors.name.message}</span>}
          </div>

          {/* Tipo */}
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-label-caps text-on-surface">Tipo de Cancha</label>
            <select
              {...register('type')}
              className="w-full bg-surface-container border border-white/10 rounded px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md text-body-md"
            >
              <option value="">Selecciona un tipo...</option>
              <option value="F5">Fútbol 5 (Sintético)</option>
              <option value="F7">Fútbol 7 (Natural)</option>
              <option value="F11">Fútbol 11 (Profesional)</option>
            </select>
            {errors.type && <span className="text-error text-sm">{errors.type.message}</span>}
          </div>

          {/* Precio */}
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-label-caps text-on-surface">Precio de Alquiler (por Hora)</label>
            <input
              type="text"
              value={displayPrice}
              onChange={(e) => {
                const numericStr = e.target.value.replace(/\D/g, '');
                const numericVal = numericStr ? Number(numericStr) : 0;
                setDisplayPrice(numericStr ? `$ ${Number(numericStr).toLocaleString('es-AR')}` : '');
                setValue('price', numericVal, { shouldValidate: true });
              }}
              className="w-full bg-surface-container border border-white/10 rounded px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md text-body-md"
              placeholder="$ 10.000"
            />
            {errors.price && <span className="text-error text-sm">{errors.price.message}</span>}
          </div>

          {/* Estado */}
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-label-caps text-on-surface">Estado</label>
            <select
              {...register('status')}
              className="w-full bg-surface-container border border-white/10 rounded px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md text-body-md"
            >
              <option value="available">Disponible (Activa)</option>
              <option value="maintenance">Mantenimiento (Bloqueada)</option>
            </select>
            {errors.status && <span className="text-error text-sm">{errors.status.message}</span>}
          </div>

          {/* Matriz Semanal de Disponibilidad */}
          <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
            <label className="font-label-caps text-label-caps text-on-surface">Horarios de Disponibilidad semanal</label>
            
            <div className="flex flex-col gap-2">
              {DAYS.map((day) => {
                const schedule = schedules.find(s => s.dayOfWeek === day.id);
                const isActive = !!schedule;

                return (
                  <div key={day.id} className="flex items-center justify-between gap-4 p-2 bg-surface-container/50 border border-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => handleDayToggle(day.id)}
                        className="w-4 h-4 rounded border-white/10 text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container"
                      />
                      <span className="font-body-md text-body-md text-on-surface w-24">{day.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={schedule?.openTime || '08:00'}
                        disabled={!isActive}
                        onChange={(e) => handleTimeChange(day.id, 'openTime', e.target.value)}
                        className="bg-surface-container border border-white/10 rounded px-2 py-1 text-on-surface focus:outline-none text-sm disabled:opacity-50"
                      />
                      <span className="text-xs text-on-surface-variant font-label-caps">a</span>
                      <input
                        type="time"
                        value={schedule?.closeTime || '22:00'}
                        disabled={!isActive}
                        onChange={(e) => handleTimeChange(day.id, 'closeTime', e.target.value)}
                        className="bg-surface-container border border-white/10 rounded px-2 py-1 text-on-surface focus:outline-none text-sm disabled:opacity-50"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {serverError && (
            <div className="p-3 bg-error/10 border border-error/50 rounded text-error text-sm text-center">
              {serverError}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-5 py-2.5 rounded font-label-caps text-label-caps border border-white/10 hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary px-6 py-2.5 rounded font-headline-md text-headline-md disabled:opacity-50 transition-opacity"
            >
              {isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
