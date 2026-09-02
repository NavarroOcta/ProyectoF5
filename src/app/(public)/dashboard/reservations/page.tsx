import { getUserReservations } from '@/lib/actions/user.actions';
import CancelReservationButton from '@/components/booking/cancel-reservation-button';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Mis Reservas | Proyecto F5',
  description: 'Panel de administración de tus turnos de fútbol.',
};

export const revalidate = 0;

export default async function UserReservationsPage() {
  const reservations = await getUserReservations();
  if (!reservations) {
    redirect('/login');
  }

  const now = new Date();

  // "Próximos Turnos"
  const upcoming = reservations.filter(
    (res) => res.status === 'confirmed' && res.startTime > now
  );

  // "Historial"
  const history = reservations.filter(
    (res) => res.status === 'cancelled' || res.endTime <= now
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 bg-background relative flex flex-col items-center">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-12">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tighter mb-2">
            MIS RESERVAS
          </h1>
          <p className="text-on-surface-variant font-body-md">Administrá tus próximos turnos y consultá tu historial.</p>
        </div>

        {/* PRÓXIMOS TURNOS */}
        <section>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-white/10 pb-2">PRÓXIMOS TURNOS</h2>
          {upcoming.length === 0 ? (
            <div className="glass-surface p-8 rounded-xl text-center shadow-md">
              <span className="material-symbols-outlined text-on-surface-variant mb-2" style={{ fontSize: '48px' }}>event_busy</span>
              <p className="text-on-surface-variant">No tenés turnos próximos confirmados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((res) => (
                <div key={res.id} className="glass-surface p-6 rounded-xl shadow-lg border border-primary/20 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-headline-md text-primary">{res.pitchName}</h3>
                      <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">CONFIRMADO</span>
                    </div>
                    <div className="flex flex-col gap-2 mb-6">
                      <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_today</span>
                        <span className="capitalize">{res.startTime.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>schedule</span>
                        <span>{res.startTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} - {res.endTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-on-surface-variant text-sm mt-2">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span>
                        <span className="font-bold text-on-surface">${res.pitchPrice.toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                  </div>
                  <CancelReservationButton reservationId={res.id} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* HISTORIAL */}
        <section>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-white/10 pb-2">HISTORIAL</h2>
          {history.length === 0 ? (
            <div className="glass-surface p-8 rounded-xl text-center opacity-75">
              <span className="material-symbols-outlined text-on-surface-variant mb-2" style={{ fontSize: '48px' }}>history</span>
              <p className="text-on-surface-variant">Tu historial de reservas está vacío.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
              {history.map((res) => {
                const isCompleted = res.endTime <= now && res.status !== 'cancelled';
                return (
                  <div key={res.id} className="glass-surface p-6 rounded-xl flex flex-col justify-between grayscale-[20%] border border-white/5">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-headline-md text-on-surface">{res.pitchName}</h3>
                        {isCompleted ? (
                          <span className="bg-secondary/20 text-secondary text-xs font-bold px-2 py-1 rounded">COMPLETADO</span>
                        ) : (
                          <span className="bg-error/20 text-error text-xs font-bold px-2 py-1 rounded">CANCELADO</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 mb-2">
                        <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_today</span>
                          <span>{res.startTime.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>schedule</span>
                          <span>{res.startTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} - {res.endTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
