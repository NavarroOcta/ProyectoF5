"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarNav({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  const getLinkClass = (href: string) => {
    // Para /admin queremos coincidencia exacta, para el resto queremos prefijo
    const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
    return isActive
      ? "flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-container border-l-4 border-l-primary pl-3 text-primary font-bold font-body-md text-body-md transition-all"
      : "flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface hover:bg-surface-container border-l-4 border-l-transparent transition-all font-body-md text-body-md";
  };

  return (
    <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
      <Link href="/admin" prefetch={false} className={getLinkClass('/admin')} onClick={onLinkClick}>
        <span className="material-symbols-outlined">dashboard</span>
        Estadisticas y Métricas
      </Link>
      <Link href="/admin/pitches" prefetch={false} className={getLinkClass('/admin/pitches')} onClick={onLinkClick}>
        <span className="material-symbols-outlined">sports_soccer</span>
        Gestión de Canchas
      </Link>
      <Link href="/admin/reservations" prefetch={false} className={getLinkClass('/admin/reservations')} onClick={onLinkClick}>
        <span className="material-symbols-outlined">calendar_month</span>
        Gestión de Reservas
      </Link>
      <Link href="/admin/users" prefetch={false} className={getLinkClass('/admin/users')} onClick={onLinkClick}>
        <span className="material-symbols-outlined">groups</span>
        Auditoría de Clientes
      </Link>
    </nav>
  );
}
