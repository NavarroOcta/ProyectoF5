"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { RegisterUserDTO, RegisterUserDTOSchema } from '@/types';
import { registerUser } from '@/lib/actions/public.actions';

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterUserDTO>({
    resolver: zodResolver(RegisterUserDTOSchema),
  });

  const onSubmit = async (data: RegisterUserDTO) => {
    setServerError(null);
    setSuccessMsg(null);
    try {
      const response = await registerUser(data);
      if (response.success) {
        setSuccessMsg('Registro exitoso. Serás redirigido...');
        // Flujo Post-Registro: router.push('/login') y mensaje (acá usamos state para el banner)
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setServerError(response.message || 'Error al registrar.');
      }
    } catch (error) {
      setServerError('Ocurrió un error inesperado de red.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 glass-elevated rounded-xl">
      <div className="text-center mb-8">
        <h2 className="font-headline-lg text-headline-lg text-primary mb-2">REGISTRARSE</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Creá tu cuenta para reservar</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-label-caps text-label-caps text-on-surface">Nombre Completo</label>
          <input
            type="text"
            {...register('name')}
            className="w-full bg-surface-container border border-white/10 rounded px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
            placeholder="Juan Pérez"
          />
          {errors.name && <span className="text-error text-sm">{errors.name.message}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-caps text-label-caps text-on-surface">Número Telefónico</label>
          <input
            type="tel"
            {...register('phone')}
            className="w-full bg-surface-container border border-white/10 rounded px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
            placeholder="11 2345-6789"
          />
          {errors.phone && <span className="text-error text-sm">{errors.phone.message}</span>}
        </div>

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
            placeholder="Mínimo 6 caracteres"
          />
          {errors.password && <span className="text-error text-sm">{errors.password.message}</span>}
        </div>

        {serverError && (
          <div className="p-3 bg-error/10 border border-error/50 rounded text-error text-sm text-center">
            {serverError}
          </div>
        )}
        
        {successMsg && (
          <div className="p-3 bg-primary/20 border border-primary/50 rounded text-primary text-sm text-center">
            {successMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !!successMsg}
          className="w-full btn-primary py-4 rounded-lg font-headline-md text-headline-md mt-2 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? 'REGISTRANDO...' : 'CREAR CUENTA'}
        </button>
      </form>
    </div>
  );
}
