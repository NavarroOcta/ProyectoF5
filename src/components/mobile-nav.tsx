"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './auth/logout-button';
import ThemeToggle from './theme-toggle';

interface MobileNavProps {
  role?: 'user' | 'admin';
  sessionName?: string;
}

export default function MobileNav({ role, sessionName }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('inicio');

  // Cerrar el menú al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Scroll Spy en la Landing Page
  useEffect(() => {
    if (pathname !== '/' || !isOpen) return;

    const sections = ['inicio', 'pitches', 'contacto'];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [pathname, isOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#') && pathname === '/') {
      e.preventDefault();
      const targetId = href.split('#')[1];
      const el = document.getElementById(targetId);
      if (el) {
        window.scrollTo({
          top: el.offsetTop - 80,
          behavior: 'smooth',
        });
        setActiveSection(targetId);
        setIsOpen(false);
      }
    }
  };

  const getLinkClass = (href: string, sectionId?: string) => {
    let isActive = false;
    if (pathname === '/') {
      isActive = activeSection === sectionId;
    } else {
      if (href === '/' || href === '/#inicio') {
        isActive = pathname === '/';
      } else {
        isActive = pathname.startsWith(href);
      }
    }
    return isActive
      ? "text-primary font-bold text-lg py-2 border-b border-primary/20"
      : "text-on-surface-variant font-medium text-lg py-2 border-b border-white/5 hover:text-primary transition-colors";
  };

  return (
    <div className="md:hidden flex items-center">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-on-surface hover:text-primary p-2 focus:outline-none cursor-pointer flex items-center justify-center"
        aria-label="Alternar menú móvil"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
          {isOpen ? 'close' : 'menu'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-surface-container border-b border-white/10 shadow-xl z-50 flex flex-col p-6 animate-fade-in gap-6">
          <nav className="flex flex-col gap-2">
            <Link prefetch={false} className={getLinkClass('/', 'inicio')} href="/#inicio" onClick={(e) => handleLinkClick(e, '/#inicio')}>
              Inicio
            </Link>
            <Link prefetch={false} className={getLinkClass('/#pitches', 'pitches')} href="/#pitches" onClick={(e) => handleLinkClick(e, '/#pitches')}>
              Canchas
            </Link>
            <Link prefetch={false} className={getLinkClass('/#contacto', 'contacto')} href="/#contacto" onClick={(e) => handleLinkClick(e, '/#contacto')}>
              Ubicación
            </Link>
            <Link prefetch={false} className={getLinkClass('/booking')} href="/booking">
              Horarios
            </Link>
            {role === 'admin' && (
              <Link prefetch={false} className={getLinkClass('/admin')} href="/admin">
                Panel Admin
              </Link>
            )}
            <div className="flex items-center justify-between py-2 border-b border-white/5 text-on-surface-variant font-medium text-lg">
              <span>Tema</span>
              <ThemeToggle />
            </div>
          </nav>

          <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
            {sessionName ? (
              <div className="flex flex-col gap-3">
                <span className="text-sm text-on-surface-variant font-medium">
                  Hola, {sessionName}
                </span>
                {role === 'user' && (
                  <Link 
                    href="/dashboard/reservations" 
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                    className="font-label-caps text-label-caps text-on-surface hover:text-primary transition-colors py-2"
                  >
                    Mis Reservas
                  </Link>
                )}
                <LogoutButton />
              </div>
            ) : (
              <div className="flex gap-4">
                <Link 
                  href="/login" 
                  prefetch={false}
                  className="flex-1 font-label-caps text-label-caps text-on-surface hover:text-primary border border-white/10 rounded py-3 text-center transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  href="/register" 
                  prefetch={false}
                  className="flex-1 font-label-caps text-label-caps btn-primary rounded py-3 text-center transition-transform active:scale-95"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
