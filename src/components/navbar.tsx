import Link from 'next/link';
import { cookies } from 'next/headers';
import dynamic from 'next/dynamic';
import LogoutButton from './auth/logout-button';
import NavbarLinks from './navbar-links';
import ThemeToggle from './theme-toggle';

import { createServerClient } from '@supabase/ssr';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const MobileNav = dynamic(() => import('./mobile-nav'), { ssr: false });

export default async function Navbar() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() { /* middleware handles it */ }
      }
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  
  let sessionName = undefined;
  let sessionRole: 'user' | 'admin' | undefined = undefined;
  
  if (user) {
    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, user.id)
    });
    if (userRecord) {
      sessionRole = userRecord.role;
      sessionName = userRecord.role === 'admin' ? 'Administrador' : (userRecord.name || 'Usuario');
    }
  }

  return (
    <nav className="fixed top-0 w-full flex justify-between items-center px-4 md:px-8 py-4 bg-surface/80 backdrop-blur-xl border-b border-white/10 shadow-md docked full-width z-50">
      <Link href="/" prefetch={false} className="font-headline-lg text-headline-lg italic tracking-tighter text-primary">
        {process.env.NEXT_PUBLIC_COMPLEX_NAME || 'PROYECTO F5'}
      </Link>
      
      {/* Desktop Nav */}
      <NavbarLinks role={sessionRole} />

      <div className="hidden md:flex items-center gap-4">
        <ThemeToggle />
        {user ? (
          <>
            {sessionRole === 'user' && (
              <Link href="/dashboard/reservations" prefetch={false} className="font-label-caps text-label-caps text-on-surface hover:text-primary transition-colors px-4 py-2">
                Mis Reservas
              </Link>
            )}
            <span className="text-sm text-on-surface-variant font-medium ml-2">
              Hola, {sessionName}
            </span>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login" prefetch={false} className="font-label-caps text-label-caps text-on-surface hover:text-primary transition-colors px-4 py-2">
              Iniciar Sesión
            </Link>
            <Link href="/register" prefetch={false} className="font-label-caps text-label-caps btn-primary px-6 py-2 rounded">
              Registrarse
            </Link>
          </>
        )}
      </div>

      {/* Mobile Nav Menu */}
      <MobileNav role={sessionRole} sessionName={sessionName} />
    </nav>
  );
}
