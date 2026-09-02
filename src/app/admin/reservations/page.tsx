import { getReservationsList } from '@/actions/admin.actions';
import DateFilter from './date-filter';
import PaymentStatusToggle from '@/components/admin/payment-status-toggle';
import AdminCancelButton from '@/components/admin/admin-cancel-button';

interface PageProps {
  searchParams: {
    date?: string;
  };
}

const paymentMethodMap: Record<string, string> = {
  'cash': 'Efectivo',
  'transfer': 'Transferencia',
  'Efectivo': 'Efectivo',
  'Transferencia': 'Transferencia',
};

export default async function AdminReservationsPage({ searchParams }: PageProps) {
  // Calculamos la fecha local de hoy en YYYY-MM-DD
  const today = new Date().toLocaleDateString('en-CA');
  const dateFilter = searchParams.date || today;
  
  const reservationsList = await getReservationsList(dateFilter);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-headline-lg text-headline-lg text-primary">GESTIÓN DE RESERVAS</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Visualiza y controla el calendario global de reservas de canchas.</p>
        </div>
        
        {/* Filtro de Fecha */}
        <DateFilter defaultDate={dateFilter} />
      </div>

      {reservationsList.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-white/5 rounded-xl shadow-lg flex flex-col items-center justify-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontSize: '48px' }}>calendar_today</span>
          <span className="text-on-surface-variant font-body-md">No hay reservas registradas para esta fecha.</span>
        </div>
      ) : (
        <div className="overflow-x-auto bg-surface border border-white/5 rounded-xl shadow-lg">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/5 text-on-surface-variant font-label-md bg-surface-container/30">
                <th className="p-4 px-6">Cliente</th>
                <th className="p-4 px-6">Teléfono</th>
                <th className="p-4 px-6">Cancha</th>
                <th className="p-4 px-6">Horario</th>
                <th className="p-4 px-6">Método de Pago</th>
                <th className="p-4 px-6">Pagado</th>
                <th className="p-4 px-6">Estado</th>
                <th className="p-4 px-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-body-md text-on-surface">
              {reservationsList.map((res) => {
                const now = new Date();
                const endTime = new Date(res.endTime);
                
                const isCancelled = res.status === 'cancelled';
                const isCompleted = !isCancelled && now > endTime;
                const isUpcoming = !isCancelled && now <= endTime;

                return (
                  <tr key={res.id} className={`hover:bg-white/[0.02] transition-colors ${isCancelled ? 'bg-error/5 opacity-75 grayscale-[50%]' : ''}`}>
                    <td className="p-4 px-6">
                      <div className="font-semibold">{res.user?.name || 'Usuario desconocido'}</div>
                      <div className="text-xs text-on-surface-variant font-normal">{res.user?.email || ''}</div>
                    </td>
                    <td className="p-4 px-6 font-mono text-xs text-on-surface-variant">
                      {res.user?.phone || 'Sin número'}
                    </td>
                    <td className="p-4 px-6">
                      <div className="font-semibold">{res.pitch?.name || 'Cancha desconocida'}</div>
                      <div className="text-xs text-on-surface-variant font-normal">{res.pitch?.type || ''}</div>
                    </td>
                    <td className="p-4 px-6">
                      <div>{new Date(res.startTime).toLocaleDateString('es-AR')}</div>
                      <div className="text-xs text-on-surface-variant">
                        {new Date(res.startTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <span className="text-sm font-semibold text-on-surface-variant">
                        {paymentMethodMap[res.paymentMethod] || res.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 px-6">
                      <PaymentStatusToggle reservationId={res.id} isPaid={res.isPaid} />
                    </td>
                    <td className="p-4 px-6">
                      {isCancelled && (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-2 py-1 rounded">CANCELADO</span>
                      )}
                      {isCompleted && (
                        <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold px-2 py-1 rounded">COMPLETADO</span>
                      )}
                      {isUpcoming && (
                        <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold px-2 py-1 rounded">PRÓXIMO</span>
                      )}
                    </td>
                    <td className="p-4 px-6">
                      {isUpcoming && <AdminCancelButton reservationId={res.id} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
