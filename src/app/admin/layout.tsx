import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/admin/admin-sidebar';
import ThemeToggle from '@/components/theme-toggle';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

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
