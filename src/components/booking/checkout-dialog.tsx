"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pitchName: string;
  pitchPrice: number;
  selectedDate: Date;
  selectedSlot: { start: string; end: string } | null;
  onConfirm: (paymentMethod: 'transfer' | 'cash') => void;
  isSubmitting: boolean;
}

export default function CheckoutDialog({
  isOpen,
  onClose,
  pitchName,
  pitchPrice,
  selectedDate,
  selectedSlot,
  onConfirm,
  isSubmitting,
}: CheckoutDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash'>('transfer');

  if (!selectedSlot) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatHours = (startIso: string, endIso: string) => {
    const start = new Date(startIso);
    const end = new Date(endIso);
    const startStr = String(start.getHours()).padStart(2, '0') + ':00';
    const endStr = String(end.getHours()).padStart(2, '0') + ':00';
    return `${startStr} - ${endStr} hs`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="sm:max-w-md bg-surface border border-white/10 text-on-background">
        <DialogHeader>
          <DialogTitle className="font-headline-lg text-headline-lg text-primary text-left">
            CONFIRMAR TU TURNO
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 mt-4">
          {/* Detalles */}
          <div className="p-4 rounded-xl bg-surface-container border border-white/5 flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant font-label-caps text-label-caps">Cancha</span>
              <span className="text-on-surface font-semibold">{pitchName}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant font-label-caps text-label-caps">Fecha</span>
              <span className="text-on-surface font-semibold capitalize">{formatDate(selectedDate)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant font-label-caps text-label-caps">Horario</span>
              <span className="text-on-surface font-semibold">{formatHours(selectedSlot.start, selectedSlot.end)}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-white/5 pt-2 mt-1">
              <span className="text-primary font-label-caps text-label-caps font-bold">Total a Abonar</span>
              <span className="text-primary font-bold text-base">${pitchPrice.toLocaleString('es-AR')}</span>
            </div>
          </div>

          {/* Selector de Método de Pago */}
          <div className="flex flex-col gap-3">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Método de Pago</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'transfer'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-white/5 bg-surface-container text-on-surface-variant hover:border-white/20'
                }`}
              >
                <span className="material-symbols-outlined">account_balance</span>
                <span className="text-xs font-label-caps">Transferencia</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-white/5 bg-surface-container text-on-surface-variant hover:border-white/20'
                }`}
              >
                <span className="material-symbols-outlined">payments</span>
                <span className="text-xs font-label-caps">Efectivo</span>
              </button>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-5 py-3 rounded font-label-caps text-label-caps border border-white/10 hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onConfirm(paymentMethod)}
              className="btn-primary px-6 py-3 rounded font-headline-md text-headline-md disabled:opacity-50 transition-opacity flex items-center gap-2"
            >
              {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
