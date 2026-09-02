"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { CreatePitchDTO, CreatePitchDTOSchema } from '@/types';
import { createPitch } from '@/lib/actions/admin.actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CreatePitchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [displayPrice, setDisplayPrice] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePitchDTO>({
    resolver: zodResolver(CreatePitchDTOSchema),
    defaultValues: {
      status: 'available',
      price: 0,
    }
  });

  useEffect(() => {
    register('price');
  }, [register]);

  const onSubmit = async (data: CreatePitchDTO) => {
    setServerError(null);
    try {
      const response = await createPitch(data);
      if (response.success) {
        setOpen(false);
        reset();
        setDisplayPrice('');
        router.refresh();
      } else {
        setServerError(response.message || 'Error al registrar la cancha.');
      }
    } catch (error) {
      setServerError('Ocurrió un error inesperado al conectar con el servidor.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) { reset(); setDisplayPrice(''); setServerError(null); } }}>
      <DialogTrigger asChild>
        <button className="btn-primary font-headline-md text-headline-md px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer transition-transform scale-95 active:scale-90">
          <span className="material-symbols-outlined">add</span>
          Registrar Nueva Cancha
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-surface border border-white/10 text-on-background">
        <DialogHeader>
          <DialogTitle className="font-headline-lg text-headline-lg text-primary text-left">
            REGISTRAR CANCHA
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
          {/* Nombre */}
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-label-caps text-on-surface">Nombre / Identificador</label>
            <input
              type="text"
              {...register('name')}
              className="w-full bg-surface-container border border-white/10 rounded px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md text-body-md"
              placeholder="Cancha 1 - Césped Pro"
            />
            {errors.name && <span className="text-error text-sm">{errors.name.message}</span>}
          </div>

          {/* Tipo */}
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-label-caps text-on-surface">Tipo de Cancha</label>
            <select
              {...register('type')}
              className="w-full bg-surface-container border border-white/10 rounded px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md text-body-md"
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
              className="w-full bg-surface-container border border-white/10 rounded px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md text-body-md"
              placeholder="$ 10.000"
            />
            {errors.price && <span className="text-error text-sm">{errors.price.message}</span>}
          </div>

          {/* Estado */}
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-label-caps text-on-surface">Estado Inicial</label>
            <select
              {...register('status')}
              className="w-full bg-surface-container border border-white/10 rounded px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors font-body-md text-body-md"
            >
              <option value="available">Disponible (Activa)</option>
              <option value="maintenance">Mantenimiento (Bloqueada)</option>
            </select>
            {errors.status && <span className="text-error text-sm">{errors.status.message}</span>}
          </div>

          {serverError && (
            <div className="p-3 bg-error/10 border border-error/50 rounded text-error text-sm text-center">
              {serverError}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-5 py-3 rounded font-label-caps text-label-caps border border-white/10 hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-6 py-3 rounded font-headline-md text-headline-md disabled:opacity-50 transition-opacity"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
