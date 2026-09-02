"use client";

import { useEffect, useState } from 'react';

interface BookingCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function BookingCalendar({ selectedDate, onSelectDate }: BookingCalendarProps) {
  const [days, setDays] = useState<{ date: Date; label: string; num: string; month: string }[]>([]);

  useEffect(() => {
    const list = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      
      const label = d.toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase().replace('.', '');
      const num = d.toLocaleDateString('es-AR', { day: 'numeric' });
      const month = d.toLocaleDateString('es-AR', { month: 'short' }).toUpperCase().replace('.', '');
      
      list.push({ date: d, label, num, month });
    }
    setDays(list);
  }, []);

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onSelectDate(new Date(e.target.value + 'T00:00:00'));
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center">
        <label className="font-label-caps text-label-caps text-on-surface-variant">Selecciona un Día</label>
        
        {/* Custom date input with calendar icon style */}
        <div className="relative flex items-center">
          <input
            type="date"
            onChange={handleCustomDateChange}
            min={new Date().toISOString().split('T')[0]}
            className="bg-surface-container border border-white/10 rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer outline-none"
          />
        </div>
      </div>

      {/* Horizontal Day List */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {days.map((day, idx) => {
          const active = isSameDay(day.date, selectedDate);
          return (
            <button
              key={idx}
              onClick={() => onSelectDate(day.date)}
              className={`flex-1 min-w-[70px] flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                active
                  ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20 scale-105'
                  : 'bg-surface-container border-white/5 text-on-surface-variant hover:border-white/20'
              }`}
            >
              <span className={`text-[10px] font-bold ${active ? 'text-black/70' : 'text-on-surface-variant'}`}>{day.label}</span>
              <span className="text-xl font-headline-lg mt-1">{day.num}</span>
              <span className={`text-[9px] font-bold mt-0.5 ${active ? 'text-black/60' : 'text-on-surface-variant/60'}`}>{day.month}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
