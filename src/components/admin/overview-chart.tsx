"use client";

import { useTheme } from 'next-themes';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

interface ChartData {
  date: string;
  revenue: number;
  reservations: number;
}

export default function OverviewChart({ data, type = 'bar' }: { data: ChartData[], type?: 'bar' | 'line' }) {
  const { theme } = useTheme();

  // Cálculo dinámico de colores por estado global
  const currentTheme = theme || 'dark';
  const tickColor = currentTheme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const gridColor = currentTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)';
  const cursorColor = currentTheme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.05)';

  // Tooltip para Reservas
  const CustomTooltipReservations = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-on-surface/10 rounded-lg p-3 shadow-xl">
          <p className="font-label-md text-on-surface mb-2">{label}</p>
          <span className="text-sm font-semibold" style={{ color: payload[0].color }}>
            Reservas: {payload[0].value}
          </span>
        </div>
      );
    }
    return null;
  };

  // Tooltip para Ingresos
  const CustomTooltipRevenue = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-on-surface/10 rounded-lg p-3 shadow-xl">
          <p className="font-label-md text-on-surface mb-2">{label}</p>
          <span className="text-sm font-semibold" style={{ color: payload[0].color }}>
            Ingresos: ${payload[0].value.toLocaleString('es-AR')}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full h-full">
      {/* Gráfico 1: Evolución de Reservas */}
      <div className="overflow-x-auto w-full">
        <div className="min-w-[600px] h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: tickColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: tickColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltipReservations />} cursor={{ fill: cursorColor }} />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
                <Bar 
                  dataKey="reservations" 
                  name="Reservas Confirmadas" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: tickColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: tickColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltipReservations />} cursor={{ stroke: cursorColor }} />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
                <Line 
                  type="monotone"
                  dataKey="reservations" 
                  name="Reservas Confirmadas" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 2: Evolución de Ingresos */}
      <div className="overflow-x-auto w-full">
        <div className="min-w-[600px] h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: tickColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: tickColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltipRevenue />} cursor={{ fill: cursorColor }} />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
                <Bar 
                  dataKey="revenue" 
                  name="Ingresos (ARS)" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: tickColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: tickColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltipRevenue />} cursor={{ stroke: cursorColor }} />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
                <Line 
                  type="monotone"
                  dataKey="revenue" 
                  name="Ingresos (ARS)" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
