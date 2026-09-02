"use client";

import { useTransition } from 'react';
import { logout } from '@/lib/actions/auth.actions';

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="font-label-caps text-label-caps text-on-surface hover:text-error transition-colors px-4 py-2 disabled:opacity-50"
    >
      {isPending ? 'Saliendo...' : 'Cerrar Sesión'}
    </button>
  );
}
