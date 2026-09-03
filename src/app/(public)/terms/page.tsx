export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-on-surface mt-20">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-6">Términos y Condiciones</h1>
      <div className="flex flex-col gap-4 font-body-md text-body-md text-on-surface-variant">
        <p>
          Bienvenido a la plataforma de reservas de {process.env.NEXT_PUBLIC_COMPLEX_NAME || 'nuestro complejo'}. Al utilizar este sitio web, aceptas cumplir y estar sujeto a los siguientes términos y condiciones de uso.
        </p>
        <h2 className="font-headline-md text-headline-md text-on-surface mt-4">1. Uso del Servicio</h2>
        <p>
          Esta plataforma se proporciona para facilitar la reserva de canchas deportivas. Nos reservamos el derecho de cancelar reservas, restringir el acceso o suspender cuentas por uso indebido, fraudulento o incumplimiento reiterado.
        </p>
        <h2 className="font-headline-md text-headline-md text-on-surface mt-4">2. Reservas y Cancelaciones</h2>
        <p>
          Toda reserva confirmada representa un compromiso. Las cancelaciones deben realizarse con la debida anticipación indicada en la plataforma. El incumplimiento de esto podría resultar en la imposibilidad temporal de efectuar nuevas reservas.
        </p>
        <h2 className="font-headline-md text-headline-md text-on-surface mt-4">3. Modificaciones</h2>
        <p>
          Nos reservamos el derecho de modificar o reemplazar estos términos en cualquier momento. El uso continuado del servicio después de cualquier cambio constituye la aceptación explícita de los nuevos términos.
        </p>
      </div>
    </div>
  );
}
