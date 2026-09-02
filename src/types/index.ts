import { z } from 'zod';

// Esquema Base de Reserva (validación estructural simple sin restricciones estrictas de formato de fecha)
export const BaseBookingSchema = z.object({
  userId: z.string().min(1, { message: "El ID del usuario es requerido." }),
  pitchId: z.string().uuid({ message: "El ID de la cancha debe ser un UUID válido." }),
  startTime: z.string(),
  endTime: z.string(),
  paymentMethod: z.string().optional(),
});

// Esquema de Validación DTO para la creación de reservas (hereda de BaseBookingSchema y añade validaciones estrictas)
export const CreateBookingDTOSchema = BaseBookingSchema.extend({
  startTime: z.string({ message: "La hora de inicio es requerida." }),
  endTime: z.string({ message: "La hora de fin es requerida." }),
  paymentMethod: z.enum(['cash', 'card', 'transfer'], { message: "El método de pago debe ser 'cash', 'card' o 'transfer'." }).default('cash'),
}).refine(
  (data) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    return start < end;
  },
  {
    message: "La hora de finalización debe ser estrictamente posterior a la hora de inicio.",
    path: ["endTime"],
  }
);

// Tipo inferido a partir del esquema de validación Zod
export type CreateBookingDTO = z.infer<typeof CreateBookingDTOSchema>;

// Interfaces base del modelo de dominio mapeadas a PostgreSQL (TIMESTAMP WITH TIME ZONE -> Date)
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface Pitch {
  id: string;
  name: string;
  type: string;
  price: number;
  status: 'available' | 'maintenance';
  createdAt: Date;
}

export interface Reservation {
  id: string;
  userId: string;
  pitchId: string;
  startTime: Date;
  endTime: Date;
  status: 'confirmed' | 'cancelled';
  isPaid: boolean;
  createdAt: Date;
}

// Esquema de Validación para Registro de Usuarios
export const RegisterUserDTOSchema = z.object({
  email: z.string().email({ message: "El correo electrónico no es válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  name: z.string().min(1, { message: "El nombre completo es requerido." }),
  phone: z.string().min(1, { message: "El número telefónico es requerido." }),
});

export type RegisterUserDTO = z.infer<typeof RegisterUserDTOSchema>;

// Esquema de Validación para Inicio de Sesión
export const LoginDTOSchema = z.object({
  email: z.string().email({ message: "El correo electrónico no es válido." }),
  password: z.string().min(1, { message: "La contraseña es requerida." }),
});

export type LoginDTO = z.infer<typeof LoginDTOSchema>;

// Esquema de Validación para Alta de Canchas (Backoffice)
export const CreatePitchDTOSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  type: z.string().min(1, { message: "El tipo de cancha es requerido." }), // Ej: 'F5', 'F7', 'F11'
  price: z.coerce.number().min(0, { message: "El precio de alquiler debe ser mayor o igual a 0." }).default(0),
  status: z.enum(['available', 'maintenance'], { message: "El estado debe ser 'available' o 'maintenance'." }),
});

export type CreatePitchDTO = z.input<typeof CreatePitchDTOSchema>;



