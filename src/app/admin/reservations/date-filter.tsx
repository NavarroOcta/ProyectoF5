"use client";

import { useSearchParams } from 'next/navigation';

export default function DateFilter({ defaultDate }: { defaultDate: string }) {
  const searchParams = useSearchParams();
  const currentDate = searchParams.get('date') || defaultDate;

  return (
    <form method="GET" className="flex items-center gap-2">
      <label htmlFor="date-input" className="font-label-caps text-label-caps text-on-surface-variant">
        Filtrar Fecha:
      </label>
      <input
        id="date-input"
        type="date"
        name="date"
        defaultValue={currentDate}
        onChange={(e) => e.currentTarget.form?.submit()}
        className="bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer font-body-md text-body-md"
      />
    </form>
  );
}
