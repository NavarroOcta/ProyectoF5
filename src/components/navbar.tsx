import Link from 'next/link';
import { cookies } from 'next/headers';
import dynamic from 'next/dynamic';
import LogoutButton from './auth/logout-button';
import NavbarLinks from './navbar-links';
import ThemeToggle from './theme-toggle';

const MobileNav = dynamic(() => import('./mobile-nav'), { ssr: false });

function getSession() {
  const token = cookies().get('session_token')?.value;
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Decodificar Base64Url
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
    return payload as { id: string; email: string; name: string; role: 'user' | 'admin'; exp: number };
  } catch (error) {
    return null; // Resiliencia: si la cookie está corrupta, ignorar
  }
}

export default async function Navbar() {
  const session = getSession();
  const sessionName = session ? (session.role === 'admin' ? 'Administrador' : (session.name || 'Usuario')) : undefined;

  return (
    <nav className="fixed top-0 w-full flex justify-between items-center px-4 md:px-8 py-4 bg-surface/80 backdrop-blur-xl border-b border-white/10 shadow-md docked full-width z-50">
      <Link href="/" prefetch={false} className="font-headline-lg text-headline-lg italic tracking-tighter text-primary">
        {process.env.NEXT_PUBLIC_COMPLEX_NAME || 'PROYECTO F5'}
      </Link>
      
      {/* Desktop Nav */}
      <NavbarLinks role={session?.role} />

      <div className="hidden md:flex items-center gap-4">
        <ThemeToggle />
        {session ? (
          <>
            {session.role === 'user' && (
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
      <MobileNav role={session?.role} sessionName={sessionName} />
    </nav>
  );
}
