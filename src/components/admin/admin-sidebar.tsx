"use client";

import { useState } from 'react';
import Link from 'next/link';
import SidebarNav from './sidebar-nav';

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburguer menu button for mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-3 left-4 z-30 text-on-surface hover:text-primary p-3 focus:outline-none cursor-pointer flex items-center justify-center bg-surface-container/85 backdrop-blur border border-white/5 rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-transform"
        aria-label="Abrir panel lateral"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>menu</span>
      </button>

      {/* Dark overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Aside drawer */}
      <aside
        className={`w-64 bg-surface border-r border-white/5 flex flex-col transition-transform duration-300 ease-out
          fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0 md:z-20
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-surface-container/50">
          <Link href="/" className="font-headline-md text-headline-md text-primary italic tracking-tighter" onClick={() => setIsOpen(false)}>
            PROYECTO F5 <span className="text-xs not-italic text-on-surface-variant font-sans font-semibold ml-2 bg-primary/20 px-2 py-0.5 rounded">ADMIN</span>
          </Link>
          
          {/* Close button inside drawer for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-on-surface hover:text-primary p-1 focus:outline-none cursor-pointer flex items-center justify-center"
            aria-label="Cerrar panel lateral"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
          </button>
        </div>
        
        <SidebarNav onLinkClick={() => setIsOpen(false)} />
      </aside>
    </>
  );
}
