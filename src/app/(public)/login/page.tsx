import LoginForm from '@/components/auth/login-form';

export const metadata = {
  title: 'Iniciar Sesión | Proyecto F5',
  description: 'Ingresa a tu cuenta para gestionar reservas de canchas.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 md:px-8 bg-background relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90"></div>
      </div>
      
      <div className="relative z-10 w-full">
        <LoginForm />
      </div>
    </div>
  );
}
