import { db } from '@/lib/db';
import { pitches } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import BookingFlow from '@/components/booking/booking-flow';
import { cookies } from 'next/headers';
import LoginForm from '@/components/auth/login-form';

export const metadata = {
  title: 'Reservar Turno | Proyecto F5',
  description: 'Reserva tu cancha de fútbol 5, 7 o 11 rápido y sin intermediarios.',
};

export const revalidate = 0;

interface BookingPageProps {
  searchParams: {
    pitchId?: string;
  };
}

import { createServerClient } from '@supabase/ssr';

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {}
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 md:px-8 bg-background relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-md bg-surface-container/50 glass-surface p-8 rounded-xl shadow-xl flex flex-col items-center">
          <span className="material-symbols-outlined text-primary mb-4" style={{ fontSize: '48px' }}>lock</span>
          <h2 className="font-headline-md text-headline-md text-primary tracking-tighter mb-2 text-center">ACCESO RESTRINGIDO</h2>
          <p className="text-on-surface-variant text-center mb-8">Debés iniciar sesión o crear una cuenta para visualizar y reservar turnos.</p>
          <div className="w-full">
            <LoginForm />
          </div>
        </div>
      </div>
    );
  }

  // 2. Aislamiento Perimetral: Bloquear físicamente consultas a la base de datos si la sesión es nula
  const allPitches = await db.select().from(pitches).where(eq(pitches.status, 'available'));

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 md:px-8 bg-background relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-4xl">
        {/* Se delega la respuesta visual al frontend */}
        <BookingFlow pitches={allPitches} initialPitchId={searchParams.pitchId} />
      </div>
    </div>
  );
}
