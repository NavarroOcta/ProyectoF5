import { db } from '@/lib/db';
import { pitches } from '@/lib/db/schema';
import CreatePitchDialog from '@/components/admin/create-pitch-dialog';
import EditPitchDialog from '@/components/admin/edit-pitch-dialog';
import DeletePitchDialog from '@/components/admin/delete-pitch-dialog';
import { desc } from 'drizzle-orm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const revalidate = 0; // Evitar almacenamiento estático de caché

const DAYS_MAP: { [key: number]: string } = {
  1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 0: 'Dom'
};

export default async function AdminPitchesPage() {
  const pitchList = await db.query.pitches.findMany({
    with: {
      schedules: true,
    },
    orderBy: [desc(pitches.createdAt)],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h2 className="font-headline-lg text-headline-lg text-primary animate-fade-in">GESTIÓN DE CANCHAS</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Administra el inventario de canchas, tipo y disponibilidad de turnos.</p>
        </div>
        
        {/* Módulo de Alta (Componente Botón + Dialog) */}
        <CreatePitchDialog />
      </div>

      <div className="bg-surface border border-white/5 rounded-xl shadow-lg overflow-hidden">
        {pitchList.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
            <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontSize: '48px' }}>sports_soccer</span>
            <span className="text-on-surface-variant font-body-md">No hay canchas registradas en el sistema. ¡Crea la primera!</span>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-surface-container/30">
              <TableRow className="border-b border-white/5">
                <TableHead className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6">Identificador / Nombre</TableHead>
                <TableHead className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6">Tipo</TableHead>
                <TableHead className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6">Disponibilidad</TableHead>
                <TableHead className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6">Precio</TableHead>
                <TableHead className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6">Estado</TableHead>
                <TableHead className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6">Fecha Registro</TableHead>
                <TableHead className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pitchList.map((pitch) => {
                // Ordenar horarios de lunes (1) a domingo (0)
                const sortedSchedules = pitch.schedules
                  ? [...pitch.schedules].sort((a, b) => {
                      const valA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
                      const valB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
                      return valA - valB;
                    })
                  : [];

                return (
                  <TableRow key={pitch.id} className="border-b border-white/5 hover:bg-surface-container/10 transition-colors">
                    <TableCell className="font-body-md text-body-md text-on-surface font-semibold py-4 px-6">
                      {pitch.name}
                    </TableCell>
                    <TableCell className="font-body-md text-body-md text-on-surface-variant py-4 px-6">
                      {pitch.type === 'F5' ? 'Fútbol 5 (Sintético)' : pitch.type === 'F7' ? 'Fútbol 7 (Natural)' : pitch.type === 'F11' ? 'Fútbol 11 (Profesional)' : pitch.type}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      {sortedSchedules.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                          {sortedSchedules.map((s) => (
                            <span key={s.id} className="inline-flex items-center px-2 py-0.5 rounded bg-white/[0.04] border border-white/5 text-[11px] font-mono text-on-surface-variant">
                              {DAYS_MAP[s.dayOfWeek]}: {s.openTime}-{s.closeTime}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-on-surface-variant/40 italic">Sin horarios de atención</span>
                      )}
                    </TableCell>
                    <TableCell className="font-body-md text-body-md text-on-surface py-4 px-6">
                      ${pitch.price.toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        pitch.status === 'available'
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-error/10 text-error border border-error/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pitch.status === 'available' ? 'bg-primary' : 'bg-error'}`}></span>
                        {pitch.status === 'available' ? 'Disponible' : 'Mantenimiento'}
                      </span>
                    </TableCell>
                    <TableCell className="font-body-md text-body-md text-on-surface-variant py-4 px-6">
                      {new Date(pitch.createdAt).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <EditPitchDialog pitch={pitch} />
                        <DeletePitchDialog pitchId={pitch.id} pitchName={pitch.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
