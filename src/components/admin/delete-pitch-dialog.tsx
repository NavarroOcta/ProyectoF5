"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deletePitch } from '@/actions/pitches.actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeletePitchDialogProps {
  pitchId: string;
  pitchName: string;
}

export default function DeletePitchDialog({ pitchId, pitchName }: DeletePitchDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleDelete = () => {
    setServerError(null);
    startTransition(async () => {
      try {
        const response = await deletePitch(pitchId);
        if (response.success) {
          setOpen(false);
          router.refresh();
        } else {
          setServerError(response.message || 'Error al eliminar la cancha.');
        }
      } catch (error) {
        setServerError('Ocurrió un error inesperado al conectar con el servidor.');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) { setServerError(null); } }}>
      <DialogTrigger asChild>
        <button className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors flex items-center justify-center cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-surface border border-white/10 text-on-background">
        <DialogHeader>
          <DialogTitle className="font-headline-lg text-headline-lg text-error text-left">
            ELIMINAR CANCHA
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <p className="font-body-md text-body-md text-on-surface-variant">
            ¿Estás seguro de que deseas eliminar la cancha <strong className="text-on-surface">{pitchName}</strong>? Esta acción borrará todas sus reservas y configuraciones de disponibilidad de forma permanente.
          </p>

          {serverError && (
            <div className="p-3 bg-error/10 border border-error/50 rounded text-error text-sm text-center">
              {serverError}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4 border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-5 py-2.5 rounded font-label-caps text-label-caps border border-white/10 hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="px-6 py-2.5 bg-error hover:bg-error-hover text-white rounded font-headline-md text-headline-md disabled:opacity-50 transition-opacity"
            >
              {isPending ? 'Eliminando...' : 'Eliminar Cancha'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
