import Link from 'next/link';
import { db } from '@/lib/db';
import { pitches } from '@/lib/db/schema';

export default async function Home() {
  const pitchesList = await db.select().from(pitches);
  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center justify-center pt-32" id="inicio">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-cover bg-center" data-alt="A wide angle photograph of a state-of-the-art synthetic soccer pitch at night, illuminated by intense, high-contrast stadium floodlights cutting through a subtle atmospheric mist." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBkFXpdLd0hlqET6j15XL6bjsQNEdnoTjTHgw2jH56Tjg6dXC_kyoYg4RijMiuHiDdZ6EV1twjUoQuwjrlHamPvOZGOM80f_ZJ9vwu1iwR6ZW72xKn8jXKP6oqfkkUTjw6WaBXBJ4QIb5KBkRppD4pHDgO-9zVcgc2272DkYwuAzr2b_z9naQx59A0ym3eOiXhb8MAsMzOe51iVu_1nWHr1yjnkt61pKLWnTQq9b3_3_kJwKLQiSZaA')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90"></div>
        </div>
        <div className="relative z-10 w-full max-w-7xl px-6 md:px-12 flex flex-col items-center md:items-start text-center md:text-left gap-6">
          <div className="flex items-center gap-2 bg-surface-container/50 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full mb-4">
            <div className="w-2 h-2 rounded-full bg-secondary-fixed pulse-dot"></div>
            <span className="font-label-caps text-label-caps text-secondary-fixed">SISTEMA ONLINE ACTIVO</span>
          </div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background w-full max-w-3xl leading-[0.9]">
            TU PARTIDO EMPIEZA ACÁ. <span className="text-primary block">RESERVÁ TU CANCHA EN SEGUNDOS.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant w-full max-w-xl">
            Instalaciones profesionales, césped de última generación e iluminación LED. Experimentá el fútbol como los verdaderos pros.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/booking" className="btn-primary font-headline-md text-headline-md px-8 py-4 rounded-lg flex items-center justify-center gap-2 scale-95 active:scale-90 transition-transform">
              RESERVAR TURNO
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Pitch Gallery */}
      <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto relative" id="pitches">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">NUESTRAS CANCHAS</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Infraestructura de nivel competitivo para tu equipo.</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {pitchesList.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-surface/50 border border-white/5 rounded-xl">
              <span className="material-symbols-outlined text-on-surface-variant/40 mb-2" style={{ fontSize: '48px' }}>sports_soccer</span>
              <p className="text-on-surface-variant font-body-md">No hay canchas registradas</p>
            </div>
          ) : (
            pitchesList.map((pitch) => (
              <div key={pitch.id} className="glass-elevated rounded-xl overflow-hidden group w-full md:w-[340px] flex-shrink-0">
                <div className="h-48 relative">
                  <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" data-alt={pitch.name} style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBgW9VO4Aod3b-pcj89eloQoy3QhMtcOTYDNlkSrEM3gdKp0IIdpd9d7bTiNrn7J7TA7O5GFAcHxC1TzSL14S7CGob2tv_BSfzutDYd7G3jkAuaOuiIAak6KmBARBFPNkf9auXmLXLyPoepNbIrohzJ-hHAgesAJu1otGzVxNm0mkyFB-eegkx6OSqpcQOHCSbWCQyPiOQNyokiqU6533my5OabF23EwKDioh3U4CtxRgwBJ2GZKZih')" }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-80"></div>
                  {pitch.status === 'available' ? (
                    <div className="absolute top-4 right-4 bg-surface-container border border-secondary-fixed px-2 py-1 rounded text-secondary-fixed font-label-caps text-label-caps flex items-center gap-1 backdrop-blur-sm">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                      Disponible
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 bg-surface-container border border-outline px-2 py-1 rounded text-outline font-label-caps text-label-caps flex items-center gap-1 backdrop-blur-sm">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                      Ocupada / Mantenimiento
                    </div>
                  )}
                </div>
                <div className="p-4 relative z-10 bg-surface/50">
                  <h3 className="font-headline-md text-headline-md mb-2">{pitch.name}</h3>
                  <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>sports_soccer</span>
                      <span>Modalidad: {pitch.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>lightbulb</span>
                      <span>Iluminación LED Profesional</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>grass</span>
                      <span>Césped Sintético Pro</span>
                    </div>
                  </div>
                  <Link href={`/booking?pitchId=${pitch.id}`} className="w-full btn-secondary py-3 rounded font-label-caps text-label-caps scale-95 active:scale-90 transition-transform block text-center">VER HORARIOS</Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Contact & Location */}
      <section className="py-10 px-4 md:px-8 relative border-t border-white/5 bg-surface-container-lowest" id="contacto">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Contact Actions */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <div className="mb-4">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">CONTACTO RÁPIDO</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">¿Dudas sobre reservas fijas o torneos? Hablá directo con la administración.</p>
            </div>
            <button className="w-full flex items-center justify-between p-4 glass-surface rounded-lg border-l-4 border-l-[#25D366] hover:bg-surface-container transition-colors group">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path></svg>
                <span className="font-headline-md text-headline-md text-on-surface">WhatsApp</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">open_in_new</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 glass-surface rounded-lg hover:bg-surface-container transition-colors group">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>call</span>
                <span className="font-headline-md text-headline-md text-on-surface">Llamar Ahora</span>
              </div>
              <span className="font-label-caps text-label-caps text-on-surface-variant group-hover:text-primary transition-colors">{process.env.NEXT_PUBLIC_COMPLEX_PHONE || '0800-F5-PLAY'}</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 glass-surface rounded-lg hover:bg-surface-container transition-colors group">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>location_on</span>
                <span className="font-headline-md text-headline-md text-on-surface">Ver Dirección</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">map</span>
            </button>
          </div>
          {/* Map Placeholder */}
          <div className="w-full lg:w-2/3 h-[400px] lg:h-auto rounded-xl overflow-hidden glass-elevated relative group">
            <div className="w-full h-full bg-surface-container-high relative flex items-center justify-center" data-location="Buenos Aires">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#61efb2 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>location_on</span>
                </div>
                <div className="mt-2 bg-surface px-3 py-1 rounded font-label-caps text-label-caps text-primary border border-primary/30 shadow-lg">
                  {process.env.NEXT_PUBLIC_COMPLEX_NAME || 'PROYECTO F5'} - SEDE CENTRAL
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
