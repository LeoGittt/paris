import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Bases y Condiciones",
  description: "Leé las bases y condiciones del Prode oficial del Mundial 2026 organizado por Chevrolet Grupo Paris.",
  alternates: { canonical: '/bases' },
}

export default function BasesPage() {
  return (
    <div className="min-h-screen bg-[#06192c]" style={{ fontFamily: "'ChevySans', sans-serif" }}>

      {/* Header */}
      <header className="bg-[#040f1c] border-b border-white/6 px-5 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative" style={{ width: 48, height: 20 }}>
            <Image src="/logo-paris.png" alt="Grupo Paris" fill className="object-contain" />
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
          <p className="text-[#c3871e] text-[11px] font-black uppercase tracking-[0.3em] mb-2">Reglamento</p>
          <h1 className="text-white font-black uppercase text-4xl md:text-5xl leading-none mb-4">
            BASES Y<br />CONDICIONES
          </h1>
          <p className="text-white/35 text-sm">
            PRODE GRUPO PARIS 2026 — Copa Mundial FIFA™ 2026
          </p>
        </div>

        <div className="space-y-8 text-white/55 text-sm leading-relaxed">

          <Section title="Artículo 1 — Denominación">
            El presente concurso se denominará <strong className="text-white/80">"PRODE GRUPO PARIS 2026"</strong> y
            será organizado por Grupo Paris S.A. con motivo de la realización de la Copa Mundial de Fútbol FIFA 2026,
            a disputarse en Estados Unidos, México y Canadá.
          </Section>

          <Section title="Artículo 2 — Período de vigencia">
            El concurso tendrá vigencia desde la fecha de apertura de registros hasta la finalización de la
            Copa Mundial FIFA 2026. La fecha de inicio del torneo es el <strong className="text-white/80">11 de junio de 2026</strong> y
            la Final está programada para el <strong className="text-white/80">19 de julio de 2026</strong>.
          </Section>

          <Section title="Artículo 3 — Área geográfica">
            El concurso se realizará en el ámbito de la provincia de San Juan, República Argentina,
            y estará dirigido exclusivamente a clientes de Grupo Paris S.A.
          </Section>

          <Section title="Artículo 4 — Participantes">
            <p>Podrán participar todas las personas físicas mayores de 18 años que cumplan con alguno de los
            siguientes requisitos:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Haber realizado un servicio de Taller en Grupo Paris durante el período de vigencia.</li>
              <li>Haber adquirido repuestos en Grupo Paris durante el período de vigencia.</li>
              <li>Haber participado de campañas comerciales digitales de Grupo Paris.</li>
              <li>Haber escaneado el código QR habilitado por Grupo Paris para este concurso.</li>
            </ul>
          </Section>

          <Section title="Artículo 5 — Mecánica del concurso">
            <p>El concurso consiste en predecir los resultados (marcador exacto) de los partidos de la
            Copa Mundial FIFA 2026. El participante deberá:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Registrarse en la plataforma completando todos los datos requeridos.</li>
              <li>Ingresar sus predicciones antes del inicio de cada partido.</li>
              <li>Acumular puntos según el sistema de puntuación vigente.</li>
              <li>Escalar en el ranking general para acceder a los premios.</li>
            </ol>
          </Section>

          <Section title="Artículo 6 — Sistema de puntos">
            <div className="bg-white/4 border border-white/8 rounded-xl overflow-hidden mt-3">
              <div className="grid grid-cols-2 divide-x divide-white/6">
                <div className="px-4 py-3 font-bold text-white/70">Tipo de acierto</div>
                <div className="px-4 py-3 font-bold text-white/70 text-center">Puntos</div>
              </div>
              {[
                ["Resultado exacto (marcador correcto)", "10 pts"],
                ["Ganador o empate correcto", "5 pts"],
                ["Diferencia de goles correcta", "2 pts"],
                ["Resultado incorrecto", "0 pts"],
              ].map(([tipo, pts]) => (
                <div key={tipo} className="grid grid-cols-2 divide-x divide-white/6 border-t border-white/6">
                  <div className="px-4 py-2.5">{tipo}</div>
                  <div className="px-4 py-2.5 text-center text-[#c3871e] font-black">{pts}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Artículo 7 — Ranking y determinación de ganadores">
            <p>El ranking se actualizará automáticamente luego de que el sistema procese los resultados
            de cada partido. En caso de empate en puntos entre dos o más participantes, se aplicarán
            los siguientes criterios de desempate en orden de prioridad:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Mayor cantidad de resultados exactos.</li>
              <li>Mayor cantidad de ganadores/empates correctos.</li>
              <li>Fecha y hora de registro más temprana.</li>
            </ol>
          </Section>

          <Section title="Artículo 8 — Premios">
            <p>Los premios serán comunicados oportunamente por el Organizador a través de la plataforma
            y los canales oficiales de Grupo Paris. Se contemplarán premios en las siguientes categorías:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-white/70">Premios semanales</strong>: para los mejores participantes de cada semana.</li>
              <li><strong className="text-white/70">Premios por etapa</strong>: para los líderes al finalizar cada fase del torneo.</li>
              <li><strong className="text-white/70">Premio final</strong>: para el ganador general del Prode.</li>
            </ul>
            <p className="mt-2">
              <strong className="text-white/70">[COMPLETAR CON LOS PREMIOS ESPECÍFICOS]</strong>
            </p>
          </Section>

          <Section title="Artículo 9 — Entrega de premios">
            <p>Los premios serán entregados en las instalaciones de Grupo Paris, San Juan. El ganador
            deberá presentarse con DNI original para retirar el premio. Los premios no reclamados dentro
            de los 30 días corridos de la notificación quedarán sin efecto.</p>
          </Section>

          <Section title="Artículo 10 — Descalificación">
            Será motivo de descalificación:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Proporcionar datos falsos en el registro.</li>
              <li>Crear más de una cuenta por persona.</li>
              <li>Utilizar medios automatizados o fraudulentos para cargar pronósticos.</li>
              <li>Cualquier conducta que el Organizador considere contraria al espíritu del concurso.</li>
            </ul>
          </Section>

          <Section title="Artículo 11 — Responsabilidad fiscal">
            Los premios que superen el mínimo no imponible establecido por la legislación vigente
            quedarán sujetos al pago de los impuestos correspondientes, los cuales estarán a cargo
            exclusivo del ganador.
          </Section>

          <Section title="Artículo 12 — Autorización de imagen">
            Los participantes ganadores autorizan al Organizador a utilizar su nombre, imagen y
            testimonio con fines publicitarios y promocionales relacionados con este concurso, sin
            derecho a compensación económica alguna.
          </Section>

          <Section title="Artículo 13 — Aceptación de las bases">
            La participación en el concurso implica la aceptación plena e incondicional de las
            presentes Bases y Condiciones. El Organizador resolverá cualquier situación no prevista
            en estas bases, siendo su decisión inapelable.
          </Section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">© 2026 Chevrolet Grupo Paris. Todos los derechos reservados.</p>
          <Link
            href="/terminos"
            className="text-[#7ab0e8] hover:text-white text-sm font-bold transition-colors"
          >
            Ver Términos y Condiciones →
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
