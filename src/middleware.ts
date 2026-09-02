import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from './lib/auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('session_token')?.value;

  // Redireccionar al login si no se encuentra el token en una ruta restringida
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyJwt(sessionToken);

  // Redireccionar si la firma es inválida o expiró
  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session_token');
    return response;
  }

  // Comprobación de Roles (RBAC) para el área de administración
  if (pathname.startsWith('/admin') && payload.role !== 'admin') {
    // Si no es administrador, redirigir al inicio o login
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Permitir la solicitud inyectando los datos del usuario decodificado en las cabeceras
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.id || '');
  requestHeaders.set('x-user-role', payload.role || '');
  requestHeaders.set('x-user-email', payload.email || '');
  requestHeaders.set('x-user-name', payload.name || '');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configuración de rutas protegidas
export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
  ],
};
