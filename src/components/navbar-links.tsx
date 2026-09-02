"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NavbarLinks({ role }: { role?: 'user' | 'admin' }) {
  const pathname = usePathname();
  // 1. Estado local para rastrear el ID de la sección visible
  const [activeSection, setActiveSection] = useState<string>('inicio');

  // 2. Lógica de Intersección (Scroll Spy)
  useEffect(() => {
    // Si no estamos en la landing page, el spy se inactiva
    if (pathname !== '/') return;

    const sections = ['inicio', 'pitches', 'contacto'];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Cuando una sección cruza el 50% de la pantalla, se marca como activa
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 } // Umbral del 50% de visibilidad
    );

    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect(); // Cleanup
  }, [pathname]);

  // 3. Evaluador de clases dinámicas
  const getLinkClass = (href: string, sectionId?: string) => {
    let isActive = false;
    
    if (pathname === '/') {
      // Estamos en la Landing: evaluamos por el estado del Scroll Spy
      isActive = activeSection === sectionId;
    } else {
      // Estamos en otra ruta (ej. /booking o /admin): evaluamos por Pathname
      if (href === '/' || href === '/#inicio') {
        isActive = pathname === '/';
      } else {
        isActive = pathname.startsWith(href);
      }
    }

    return isActive
      ? "text-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md transition-all"
      : "text-on-surface-variant font-medium hover:text-primary border-b-2 border-transparent pb-1 transition-all duration-200 font-body-md text-body-md";
  };

  return (
    <div className="hidden md:flex gap-6 items-center">
      <Link prefetch={false} className={getLinkClass('/', 'inicio')} href="/#inicio">Inicio</Link>
      <Link prefetch={false} className={getLinkClass('/#pitches', 'pitches')} href="/#pitches">Canchas</Link>
      <Link prefetch={false} className={getLinkClass('/#contacto', 'contacto')} href="/#contacto">Ubicación</Link>
      
      {/* Las rutas absolutas se mantienen intactas en su evaluación */}
      <Link prefetch={false} className={getLinkClass('/booking')} href="/booking">Horarios</Link>
      
      {role === 'admin' && (
        <Link prefetch={false} className={getLinkClass('/admin')} href="/admin">Panel Admin</Link>
      )}
    </div>
  );
}
