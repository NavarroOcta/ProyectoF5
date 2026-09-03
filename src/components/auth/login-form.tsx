"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { LoginDTO, LoginDTOSchema } from '@/types';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDTO>({
    resolver: zodResolver(LoginDTOSchema),
  });

  const onSubmit = async (data: LoginDTO) => {
    setServerError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setServerError(error.message || 'Error al iniciar sesión.');
      } else {
        router.refresh();
        router.push('/admin');
      }
    } catch (error) {
      setServerError('Ocurrió un error inesperado de red.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 glass-elevated rounded-xl">
      <div className="text-center mb-8">
        <h2 className="font-headline-lg text-headline-lg text-primary mb-2">INICIAR SESIÓN</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Ingresá tus credenciales para continuar</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-label-caps text-label-caps text-on-surface">Correo Electrónico</label>
          <input
            type="email"
            {...register('email')}
            className="w-full bg-surface-container border border-white/10 rounded px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
            placeholder="tu@email.com"
          />
          {errors.email && <span className="text-error text-sm">{errors.email.message}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-caps text-label-caps text-on-surface">Contraseña</label>
          <input
            type="password"
            {...register('password')}
            className="w-full bg-surface-container border border-white/10 rounded px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
            placeholder="••••••••"
          />
          {errors.password && <span className="text-error text-sm">{errors.password.message}</span>}
        </div>

        {serverError && (
          <div className="p-3 bg-error/10 border border-error/50 rounded text-error text-sm text-center">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-4 rounded-lg font-headline-md text-headline-md mt-2 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? 'INGRESANDO...' : 'INGRESAR'}
        </button>
      </form>
    </div>
  );
}
