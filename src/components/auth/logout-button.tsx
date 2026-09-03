"use client";

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.refresh();
      router.push('/');
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
