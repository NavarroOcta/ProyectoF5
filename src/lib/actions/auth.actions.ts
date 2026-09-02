"use server";

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '../db';
import { users } from '../db/schema';
import { LoginDTOSchema } from '../../types';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

import { generateJwt } from '../auth/jwt';

/**
 * Server Action para realizar el inicio de sesión.
 * Busca al usuario por su email en la base de datos, valida su contraseña con bcryptjs
 * y emite un token de sesión en formato JWT firmado criptográficamente.
 *
 * @param payload Datos del inicio de sesión
 */
export async function login(payload: unknown) {
  const validationResult = LoginDTOSchema.safeParse(payload);

  if (!validationResult.success) {
    return {
      success: false as const,
      error: 'VALIDATION_ERROR' as const,
      details: validationResult.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validationResult.data;

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return {
        success: false as const,
        error: 'INVALID_CREDENTIALS' as const,
        message: 'El correo electrónico o la contraseña son incorrectos.',
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false as const,
        error: 'INVALID_CREDENTIALS' as const,
        message: 'El correo electrónico o la contraseña son incorrectos.',
      };
    }

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24 horas
    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp,
    };

    // Firmar criptográficamente el token
    const token = await generateJwt(tokenPayload);

    cookies().set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 horas
    });

    return {
      success: true as const,
      role: user.role,
    };
  } catch (error: any) {
    return {
      success: false as const,
      error: 'SERVER_ERROR' as const,
      message: 'Ocurrió un error inesperado al procesar el inicio de sesión.',
    };
  }
}

/**
 * Server Action para establecer una sesión simulada con rol específico.
 * Genera un token decodificable compatible con la validación del middleware en el Edge.
 *
 * @param role Rol que se asignará al usuario ('admin' | 'user')
 */
export async function setMockSession(role: 'admin' | 'user') {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24 horas
  const payload = { 
    id: `mock_${role}_id`,
    email: `${role}@mock.com`,
    name: role === 'admin' ? 'Mock Admin' : 'Mock User',
    role, 
    exp 
  };

  const token = await generateJwt(payload);

  cookies().set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return {
    success: true as const,
    role,
  };
}

/**
 * Server Action para destruir la sesión activa limpiando la cookie de sesión.
 */
export async function logout() {
  cookies().delete('session_token');

  revalidatePath('/');
  redirect('/login');
}
