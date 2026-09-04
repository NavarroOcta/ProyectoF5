import type { Metadata } from 'next';
import { Bebas_Neue, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import SupabaseProvider from '@/components/auth/supabase-provider';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue',
});

const hankenGrotesk = Hanken_Grotesk({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-hanken-grotesk',
});

const jetbrainsMono = JetBrains_Mono({
  weight: '600',
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

const complexName = process.env.NEXT_PUBLIC_COMPLEX_NAME || 'Complejo Deportivo';

export const metadata: Metadata = {
  title: `${complexName} - Reservá tu cancha`,
  description: 'Plataforma rápida, fácil y sin intermediarios para reservar tu cancha de fútbol',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className={`${bebasNeue.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} bg-background text-on-background font-body-md text-body-md antialiased overflow-x-hidden selection:bg-primary selection:text-black flex flex-col min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SupabaseProvider>
            {children}
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
