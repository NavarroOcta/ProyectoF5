import {
  getTodaysReservationsCount,
  getActivePitchesCount,
  getClientsCount,
  getRevenueMetrics,
  getChartMetrics
} from '@/actions/admin.actions';
import DateFilter from './reservations/date-filter';
import OverviewChart from '@/components/admin/overview-chart';

interface PageProps {
  searchParams: {
    date?: string;
  };
}

export default async function AdminPage({ searchParams }: PageProps) {
  // Calculamos la fecha local de hoy en YYYY-MM-DD
  const today = new Date().toLocaleDateString('en-CA');
  const dateFilter = searchParams.date || today;

  const [todaysReservations, activePitches, totalClients, revenue, chartData] = await Promise.all([
    getTodaysReservationsCount(dateFilter),
    getActivePitchesCount(),
    getClientsCount(),
    getRevenueMetrics(dateFilter),
    getChartMetrics(7) // Traemos 7 días
  ]);

  const formattedRevenue = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(revenue);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-headline-lg text-headline-lg text-primary">ESTADÍSTICAS Y MÉTRICAS</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Estado general del complejo y estadísticas principales.</p>
        </div>
        
        {/* Filtro de Fecha Dinámico */}
        <DateFilter defaultDate={dateFilter} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-surface border border-white/5 rounded-xl flex flex-col gap-2 shadow-lg">
          <span className="text-xs text-on-surface-variant font-label-caps tracking-wider">RESERVAS DEL DÍA</span>
          <span className="text-3xl font-headline-lg text-primary">{todaysReservations}</span>
        </div>
        <div className="p-6 bg-surface border border-white/5 rounded-xl flex flex-col gap-2 shadow-lg">
          <span className="text-xs text-on-surface-variant font-label-caps tracking-wider">CANCHAS ACTIVAS</span>
          <span className="text-3xl font-headline-lg text-primary">{activePitches}</span>
        </div>
        <div className="p-6 bg-surface border border-white/5 rounded-xl flex flex-col gap-2 shadow-lg">
          <span className="text-xs text-on-surface-variant font-label-caps tracking-wider">TOTAL DE CLIENTES</span>
          <span className="text-3xl font-headline-lg text-primary">{totalClients}</span>
        </div>
        <div className="p-6 bg-surface border border-white/5 rounded-xl flex flex-col gap-2 shadow-lg">
          <span className="text-xs text-on-surface-variant font-label-caps tracking-wider">INGRESOS DEL DÍA</span>
          <span className="text-3xl font-headline-lg text-primary">{formattedRevenue}</span>
        </div>
      </div>

      {/* Gráfico Estadístico Interactivo */}
      <div className="bg-surface border border-white/5 rounded-xl p-6 shadow-lg flex flex-col gap-4">
        <h3 className="font-headline-sm text-on-surface">Evolución de los Últimos 7 Días</h3>
        <div className="w-full min-h-[650px] md:min-h-0 md:h-96">
          <OverviewChart data={chartData} />
        </div>
      </div>
    </div>
  );
}
