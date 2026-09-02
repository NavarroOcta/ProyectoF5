import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/admin/admin-sidebar';
import ThemeToggle from '@/components/theme-toggle';

function getAdminSession() {
  const token = cookies().get('session_token')?.value;
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
    return payload as { id: string; email: string; role: 'user' | 'admin'; exp: number };
  } catch (error) {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = getAdminSession();

  // Capa de Autorización a nivel de Componente
  if (!session || session.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Drawer */}
      <AdminSidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-surface/50 backdrop-blur-xl flex items-center justify-between pl-16 md:px-8 pr-8 z-10">
          <h1 className="font-headline-md text-headline-md text-on-surface">PANEL DE CONTROL</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/" className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors">
              Ir al Sitio Público
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
