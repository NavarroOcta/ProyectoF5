export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-on-surface mt-20">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-6">Política de Privacidad</h1>
      <div className="flex flex-col gap-4 font-body-md text-body-md text-on-surface-variant">
        <p>
          Su privacidad es de suma importancia para nosotros. Esta Política de Privacidad explica de forma transparente cómo recopilamos, usamos y protegemos su información personal al utilizar nuestra plataforma de reservas deportivas.
        </p>
        <h2 className="font-headline-md text-headline-md text-on-surface mt-4">1. Recopilación de Datos</h2>
        <p>
          Recopilamos estrictamente la información que usted nos proporciona de manera directa al crear una cuenta e interactuar con la plataforma, incluyendo datos esenciales como su nombre, correo electrónico y número de teléfono de contacto.
        </p>
        <h2 className="font-headline-md text-headline-md text-on-surface mt-4">2. Uso de la Información</h2>
        <p>
          Utilizamos sus datos personales exclusivamente de forma operativa: para gestionar sus reservas en tiempo real, enviar notificaciones relacionadas con sus turnos (modificaciones o cancelaciones) y autenticar su identidad. No vendemos ni compartimos sus datos con terceros con fines de marketing.
        </p>
        <h2 className="font-headline-md text-headline-md text-on-surface mt-4">3. Seguridad y Retención</h2>
        <p>
          Implementamos medidas de seguridad y cifrado mediante infraestructuras modernas (Supabase Auth) para proteger sus credenciales y datos. Solo conservamos su información mientras su cuenta se mantenga activa o según lo requiera la normativa legal.
        </p>
      </div>
    </div>
  );
}
