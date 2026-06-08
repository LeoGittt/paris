import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Términos y Condiciones — Prode Chevrolet Grupo Paris 2026",
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#06192c]" style={{ fontFamily: "'ChevySans', sans-serif" }}>

      {/* Header */}
      <header className="bg-[#040f1c] border-b border-white/6 px-5 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative" style={{ width: 48, height: 20 }}>
            <Image src="/logo-grupo-paris.png" alt="Grupo Paris" fill className="object-contain" />
          </div>
          <div className="w-px h-5 bg-white/15" />
          <span className="text-white font-black text-[13px] uppercase tracking-wide">Prode 2026</span>
        </div>
        <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-5 md:px-10 py-12 md:py-16">

        {/* Título */}
        <div className="mb-10">
          <p className="text-[#c3871e] text-[11px] font-black uppercase tracking-[0.3em] mb-2">Legal</p>
          <h1 className="text-white font-black uppercase text-4xl md:text-5xl leading-none mb-4">
            TÉRMINOS Y<br />CONDICIONES
          </h1>
          <p className="text-white/35 text-sm">
            Última actualización: Junio 2026
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-white/60 text-sm leading-relaxed">

          <Section title="1. Aceptación de los términos">
            Al registrarse en el PRODE GRUPO PARIS 2026 (en adelante, "el Prode"), el participante declara haber leído,
            comprendido y aceptado en su totalidad los presentes Términos y Condiciones, así como las Bases y Condiciones
            del concurso. Si no está de acuerdo con alguno de estos términos, deberá abstenerse de participar.
          </Section>

          <Section title="2. Organizador">
            El Prode es organizado por <strong className="text-white/80">Grupo Paris S.A.</strong>, con domicilio en
            San Juan, Argentina (en adelante, "el Organizador"). El Organizador se reserva el derecho de modificar,
            suspender o cancelar el Prode en cualquier momento, sin necesidad de aviso previo.
          </Section>

          <Section title="3. Elegibilidad">
            Podrán participar del Prode únicamente aquellas personas físicas que:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Sean mayores de 18 años de edad.</li>
              <li>Sean clientes de Grupo Paris que hayan realizado servicios en Taller, adquirido repuestos o participado de campañas comerciales.</li>
              <li>Residan en la República Argentina.</li>
              <li>Completen correctamente el formulario de registro.</li>
            </ul>
            Quedan excluidos de participar los empleados de Grupo Paris S.A. y sus familiares directos.
          </Section>

          <Section title="4. Registro y cuenta">
            <p>El participante deberá completar el formulario de registro con datos verídicos y actualizados. Cada persona
            podrá crear una única cuenta. Se prohíbe el registro múltiple bajo distintos datos personales.</p>
            <p className="mt-2">El Organizador se reserva el derecho de verificar la identidad de los participantes y
            dar de baja aquellas cuentas que presenten datos falsos, duplicados o inconsistentes.</p>
          </Section>

          <Section title="5. Funcionamiento del Prode">
            <p>El Prode consiste en la predicción de resultados de los partidos del Mundial FIFA 2026. Los participantes
            deberán ingresar sus pronósticos antes del inicio de cada partido. Una vez comenzado el partido, no se
            aceptarán modificaciones ni nuevos pronósticos para ese encuentro.</p>
            <p className="mt-2">El sistema de puntos vigente es el siguiente:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-white/70">Resultado exacto</strong> (marcador correcto): 10 puntos.</li>
              <li><strong className="text-white/70">Ganador o empate correcto</strong>: 5 puntos.</li>
              <li><strong className="text-white/70">Diferencia de goles correcta</strong>: 2 puntos.</li>
            </ul>
            <p className="mt-2">El Organizador podrá modificar el sistema de puntos con previo aviso a los participantes.</p>
          </Section>

          <Section title="6. Premios">
            <p>Los premios serán definidos y comunicados por el Organizador a través de la plataforma y los canales
            oficiales de Grupo Paris. Los premios son personales e intransferibles.</p>
            <p className="mt-2">El participante ganador será contactado por el Organizador a través del email o teléfono
            registrado. En caso de no poder ser contactado dentro de los 15 días corridos desde la notificación,
            el premio quedará sin efecto.</p>
            <p className="mt-2">Los premios no tienen equivalente en dinero en efectivo ni pueden ser canjeados por
            otros productos o servicios.</p>
          </Section>

          <Section title="7. Protección de datos personales">
            <p>Los datos personales recopilados durante el registro serán tratados conforme a la
            <strong className="text-white/70"> Ley N° 25.326 de Protección de los Datos Personales</strong> de la
            República Argentina.</p>
            <p className="mt-2">Los datos serán utilizados exclusivamente para la gestión del Prode y, con el
            consentimiento expreso del participante, para el envío de comunicaciones comerciales de Grupo Paris.
            El participante podrá ejercer sus derechos de acceso, rectificación, cancelación y oposición
            contactando al Organizador.</p>
          </Section>

          <Section title="8. Comunicaciones comerciales">
            Al aceptar recibir comunicaciones comerciales durante el registro, el participante autoriza a
            Grupo Paris S.A. a contactarlo mediante email, SMS o WhatsApp con información sobre productos,
            servicios y promociones. Esta autorización puede revocarse en cualquier momento enviando un
            email a <strong className="text-white/70">[EMAIL DE CONTACTO]</strong>.
          </Section>

          <Section title="9. Limitación de responsabilidad">
            El Organizador no será responsable por fallas técnicas, interrupciones del servicio, problemas
            de conectividad o cualquier otra circunstancia ajena a su control que pudiera afectar la
            participación en el Prode. Tampoco será responsable por el uso indebido que los participantes
            hagan de la plataforma.
          </Section>

          <Section title="10. Modificaciones">
            El Organizador se reserva el derecho de modificar los presentes Términos y Condiciones en
            cualquier momento. Los cambios serán notificados a través de la plataforma y entrarán en
            vigencia a partir de su publicación.
          </Section>

          <Section title="11. Jurisdicción">
            Para cualquier controversia derivada de la participación en el Prode, las partes se someten
            a la jurisdicción de los Tribunales Ordinarios de la Ciudad de San Juan, Argentina, renunciando
            a cualquier otro fuero que pudiera corresponder.
          </Section>

          <Section title="12. Contacto">
            Para consultas relacionadas con estos Términos y Condiciones, el participante podrá comunicarse con:
            <div className="mt-2 bg-white/4 border border-white/8 rounded-xl px-5 py-4 space-y-1">
              <p><strong className="text-white/70">Grupo Paris S.A.</strong></p>
              <p>San Juan, Argentina</p>
              <p>Email: <strong className="text-white/70">[EMAIL DE CONTACTO]</strong></p>
              <p>Teléfono: <strong className="text-white/70">[TELÉFONO DE CONTACTO]</strong></p>
            </div>
          </Section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">© 2026 Chevrolet Grupo Paris. Todos los derechos reservados.</p>
          <Link
            href="/bases"
            className="text-[#7ab0e8] hover:text-white text-sm font-bold transition-colors"
          >
            Ver Bases y Condiciones →
          </Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-white font-black uppercase text-base tracking-wide mb-3"
          style={{ fontFamily: "'ChevySans', sans-serif" }}>
        {title}
      </h2>
      <div className="text-white/55 text-sm leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  )
}
