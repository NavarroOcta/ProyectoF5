"use client";

import { useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // 1. Yield al Event Loop (Espera a que Supabase guarde la cookie)
      setTimeout(() => {
        // 2. Encola la re-renderización del DOM evitando congelamiento
        startTransition(() => {
          router.refresh();
        });
      }, 0);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return <>{children}</>;
}
