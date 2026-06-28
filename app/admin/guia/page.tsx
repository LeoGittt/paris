import type { Metadata } from "next"
import { BookOpen, Users, Calendar, Gift, BarChart3, Settings, Shield, Target, Trophy, Star, AlertTriangle, CheckCircle2, Info, Zap, ChevronRight } from "lucide-react"

export const metadata: Metadata = { title: "Guía del Sistema" }

// ─── Componentes de la guía ───────────────────────────────────────────────────

function SectionAnchor({ id }: { id: string }) {
  return <div id={id} className="absolute -top-20" />
}

function GuideSection({ id, icon: Icon, title, subtitle, color = "#c3871e", children }: {
  id: string
  icon: React.ElementType
  title: string
  subtitle?: string
  color?: string
  children: React.ReactNode
}) {
  return (
    <section className="relative mb-16">
      <SectionAnchor id={id} />
      <div className="flex items-start gap-4 mb-8">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <h2 className="text-white font-black uppercase text-2xl md:text-3xl leading-none mb-1"
            style={{ fontFamily: "'ChevySans', sans-serif" }}>
            {title}
          </h2>
          {subtitle && <p className="text-white/40 text-sm font-medium">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-white/60 text-sm leading-relaxed space-y-3 font-medium">
      {children}
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 flex flex-col items-center">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
          style={{ background: "rgba(195,135,30,0.15)", border: "1px solid rgba(195,135,30,0.35)", color: "#c3871e" }}
        >
          {n}
        </div>
        {children && <div className="w-px flex-1 bg-white/6 mt-2" />}
      </div>
      <div className="flex-1 pb-4">
        <p className="text-white font-black text-sm mb-1">{title}</p>
        {children && <div className="text-white/45 text-sm leading-relaxed">{children}</div>}
      </div>
    </div>
  )
}

function Callout({ type, title, children }: {
  type: "tip" | "warning" | "danger" | "info"
  title: string
  children: React.ReactNode
}) {
  const styles = {
    tip:     { bg: "rgba(74,222,128,0.06)",  border: "rgba(74,222,128,0.2)",  color: "#4ade80",  icon: CheckCircle2 },
    warning: { bg: "rgba(251,191,36,0.06)",  border: "rgba(251,191,36,0.2)",  color: "#fbbf24",  icon: AlertTriangle },
    danger:  { bg: "rgba(248,113,113,0.06)", border: "rgba(248,113,113,0.2)", color: "#f87171",  icon: AlertTriangle },
    info:    { bg: "rgba(122,176,232,0.06)", border: "rgba(122,176,232,0.2)", color: "#7ab0e8",  icon: Info },
  }
  const s = styles[type]
  return (
    <div className="rounded-2xl p-4" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      <div className="flex items-center gap-2 mb-2">
        <s.icon className="w-4 h-4 shrink-0" style={{ color: s.color }} />
        <p className="font-black text-sm" style={{ color: s.color }}>{title}</p>
      </div>
      <div className="text-white/55 text-sm leading-relaxed pl-6">{children}</div>
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[13px] px-2 py-0.5 rounded-lg bg-[#06192c] text-[#7ab0e8] border border-white/8">
      {children}
    </code>
  )
}

function CodeBlock({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/8">
      {label && (
        <div className="bg-[#040f1c] border-b border-white/8 px-4 py-2">
          <p className="text-white/25 text-[10px] font-black uppercase tracking-widest">{label}</p>
        </div>
      )}
      <div className="bg-[#030b16] px-5 py-4 font-mono text-sm text-white/70 leading-relaxed overflow-x-auto">
        {children}
      </div>
    </div>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="rounded-2xl border border-white/8 overflow-hidden">
      <div className="grid overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#040f1c] border-b border-white/8">
              {headers.map(h => (
                <th key={h} className="px-5 py-3 text-left text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/4">
            {rows.map((row, i) => (
              <tr key={i} className="bg-[#0b2440] hover:bg-[#0d2b50] transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-5 py-3 text-white/60 font-medium">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide"
      style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
    >
      {children}
    </span>
  )
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-white font-black text-lg mb-3 flex items-center gap-2">
      <ChevronRight className="w-4 h-4 text-[#c3871e]" />
      {children}
    </h3>
  )
}

// ─── Tabla de contenidos ──────────────────────────────────────────────────────

const TOC = [
  { id: "overview",       label: "Visión general",           icon: BookOpen    },
  { id: "roles",          label: "Roles y accesos",          icon: Shield      },
  { id: "participants",   label: "Participantes",            icon: Users       },
  { id: "employees",      label: "Empleados Paris",          icon: Star        },
  { id: "matches",        label: "Partidos y pronósticos",   icon: Calendar    },
  { id: "points",         label: "Sistema de puntos",        icon: Target      },
  { id: "prizes",         label: "Premios",                  icon: Gift        },
  { id: "metrics",        label: "Métricas y reportes",      icon: BarChart3   },
  { id: "callcenter",     label: "Call Center",              icon: Trophy      },
  { id: "workflows",      label: "Flujos paso a paso",       icon: Zap         },
  { id: "faq",            label: "FAQ",                      icon: Settings    },
]

// ─── Página ───────────────────────────────────────────────────────────────────

export default function GuiaPage() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="relative pb-8 border-b border-white/6">
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(195,135,30,0.5), transparent)" }} />
        <p className="text-[#c3871e] text-[11px] font-black uppercase tracking-[0.3em] mb-2">
          Documentación interna
        </p>
        <h1 className="text-white font-black uppercase text-5xl md:text-6xl leading-none mb-3"
          style={{ fontFamily: "'ChevySans', sans-serif" }}>
          GUÍA DEL<br />
          <span style={{
            background: "linear-gradient(135deg, #e8a832 0%, #c3871e 50%, #9a6815 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>SISTEMA</span>
        </h1>
        <p className="text-white/35 text-sm font-medium max-w-lg">
          Manual completo para administradores del Prode Grupo Paris 2026.
          Cubre registro, pronósticos, puntos, premios, empleados y todos los flujos operativos.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">

        {/* Tabla de contenidos — sticky en desktop */}
        <aside className="lg:w-56 shrink-0">
          <div className="lg:sticky lg:top-8">
            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mb-3 px-1">
              Contenidos
            </p>
            <nav className="space-y-0.5">
              {TOC.map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-bold text-white/30 hover:text-white/70 hover:bg-white/4 transition-all group"
                >
                  <item.icon className="w-3.5 h-3.5 shrink-0 group-hover:text-[#c3871e] transition-colors" />
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Contenido */}
        <div className="flex-1 min-w-0">

          {/* ═══════════════════════════════════════════════════════════════
              1. VISIÓN GENERAL
          ═══════════════════════════════════════════════════════════════ */}
          <GuideSection id="overview" icon={BookOpen} title="Visión general">
            <Prose>
              <p>
                El <strong className="text-white">Prode Grupo Paris 2026</strong> es una plataforma
                de pronósticos deportivos para el Mundial FIFA 2026. Los participantes predicen resultados
                de partidos, acumulan puntos y compiten por premios en cada etapa del torneo.
              </p>
              <p>
                El sistema está construido con <strong className="text-white">Next.js 16 + React 19 + Supabase</strong>.
                Se despliega en Vercel y usa Supabase tanto para la base de datos (PostgreSQL) como para
                autenticación y almacenamiento de archivos.
              </p>
            </Prose>

            <SubTitle>Flujo general del participante</SubTitle>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-wrap">
              {["Se registra en la landing", "Carga pronósticos", "El partido comienza → se bloquean", "El admin carga el resultado", "Se recalculan puntos automáticamente", "Sube en el ranking"].map((step, i, arr) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-[#0b2440] border border-white/8 rounded-xl px-3 py-2">
                    <span className="text-[#c3871e] font-black text-[10px]">{i + 1}</span>
                    <span className="text-white/60 text-[11px] font-medium">{step}</span>
                  </div>
                  {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-white/15 shrink-0 hidden sm:block" />}
                </div>
              ))}
            </div>
          </GuideSection>

          {/* ═══════════════════════════════════════════════════════════════
              2. ROLES
          ═══════════════════════════════════════════════════════════════ */}
          <GuideSection id="roles" icon={Shield} title="Roles y accesos" color="#7ab0e8">
            <Table
              headers={["Rol", "Acceso", "Cómo se asigna"]}
              rows={[
                [<Badge color="#c3871e">admin</Badge>, "/admin — panel completo", "Manualmente en Supabase → user_roles"],
                [<Badge color="#7ab0e8">callcenter</Badge>, "/callcenter — solo lectura de clientes", "Manualmente en Supabase → user_roles"],
                [<Badge color="#4ade80">participant</Badge>, "/dashboard — su panel personal", "Automático al registrarse"],
                [<Badge color="#f472b6">employee</Badge>, "/empleados — ranking interno", "Automático: email con formato especial"],
              ]}
            />

            <Callout type="info" title="Los roles no son excluyentes">
              Un admin también puede ver el dashboard de participante. Un empleado Paris también
              tiene acceso al dashboard regular. Los roles se leen en el middleware antes de cada request.
            </Callout>

            <SubTitle>Cómo asignar rol admin o callcenter</SubTitle>
            <div className="space-y-3">
              <Step n={1} title="Ir a Supabase Dashboard → Table Editor → user_roles">
                O bien usar el SQL Editor.
              </Step>
              <Step n={2} title="Insertar el registro con el user_id del usuario y el rol deseado">
                <CodeBlock label="SQL">
                  {`INSERT INTO user_roles (user_id, role)\nVALUES ('uuid-del-usuario', 'admin');`}
                </CodeBlock>
              </Step>
              <Step n={3} title="El acceso queda activo en el próximo request del usuario" />
            </div>
          </GuideSection>

          {/* ═══════════════════════════════════════════════════════════════
              3. PARTICIPANTES
          ═══════════════════════════════════════════════════════════════ */}
          <GuideSection id="participants" icon={Users} title="Participantes" subtitle="Registro, búsqueda, edición y exportación">

            <SubTitle>Registro desde la landing</SubTitle>
            <Prose>
              <p>
                El formulario tiene 2 pasos. El sistema valida server-side antes de crear el usuario en Supabase Auth.
                Si algo falla tras crear el usuario (ej: DNI duplicado), se elimina automáticamente para no dejar cuentas huérfanas.
              </p>
            </Prose>

            <Table
              headers={["Campo", "Validación", "Notas"]}
              rows={[
                ["Nombre / Apellido", "Mínimo 2 caracteres", "Se guarda como ingresado"],
                ["DNI", "7-8 dígitos, único", "Se normaliza: se eliminan puntos y guiones"],
                ["Celular", "Mínimo 8 caracteres", "Sin validación de formato estricto"],
                ["Email", "Debe contener @, único", "Se usa para autenticación"],
                ["Contraseña", "Mínimo 8 caracteres", "Encriptada por Supabase Auth"],
                ["Patente", "6-7 chars, única", "Se guarda en mayúsculas sin espacios"],
                ["Localidad / Marca / Modelo", "Campo requerido", "Texto libre"],
              ]}
            />

            <Callout type="warning" title="Rate limiting en registro">
              El sistema permite máximo <strong>3 registros por IP por hora</strong>. Esto previene
              creación masiva de cuentas. Si un cliente reporta que no puede registrarse, verificar
              si comparte IP con otro intento reciente.
            </Callout>

            <SubTitle>Buscar participantes en el admin</SubTitle>
            <div className="space-y-3">
              <Step n={1} title='Ir a Admin → Participantes' />
              <Step n={2} title="Usar el buscador superior">
                Filtra por nombre, apellido, email, DNI o patente en tiempo real (cliente-side).
              </Step>
              <Step n={3} title="Filtrar por origen">
                El selector de <strong className="text-white">Lead Source</strong> filtra según cómo llegó el participante:
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {[
                    { val: "taller", desc: "Llegó desde el taller" },
                    { val: "repuestos", desc: "Llegó desde repuestos" },
                    { val: "digital", desc: "Llegó por redes/web" },
                    { val: "qr", desc: "Escaneó un QR" },
                    { val: "direct", desc: "Registro directo" },
                  ].map(s => (
                    <div key={s.val} className="flex items-center gap-2 bg-[#040f1c] rounded-lg px-3 py-1.5">
                      <Code>{s.val}</Code>
                      <span className="text-white/40 text-[11px]">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </Step>
            </div>

            <SubTitle>Exportar participantes</SubTitle>
            <Prose>
              <p>
                El botón <strong className="text-white">Exportar</strong> tiene dos opciones:
              </p>
              <ul className="list-none space-y-1 pl-0">
                <li className="flex items-start gap-2"><span className="text-[#c3871e] mt-1">→</span><span><strong className="text-white">CSV</strong>: Todos los campos. Compatible con Excel, Google Sheets.</span></li>
                <li className="flex items-start gap-2"><span className="text-[#c3871e] mt-1">→</span><span><strong className="text-white">XLSX</strong>: Planilla Excel formateada con columnas tipadas.</span></li>
              </ul>
              <p>
                El export aplica protección contra <strong className="text-white">CSV injection</strong>:
                valores que empiezan con <Code>=</Code> <Code>+</Code> <Code>-</Code> <Code>@</Code>
                se prefijan con <Code>'</Code> para que Excel no los interprete como fórmulas.
              </p>
            </Prose>

            <SubTitle>Bloquear / desbloquear un participante</SubTitle>
            <div className="space-y-3">
              <Step n={1} title="Encontrar al participante en la tabla" />
              <Step n={2} title='Hacer clic en el ícono de "bloquear"'>
                El participante queda con <Code>is_blocked = true</Code>. No aparece en rankings.
                Si intenta ingresar, es redirigido a <Code>/?blocked=1</Code>.
              </Step>
              <Step n={3} title='Para desbloquear: mismo botón, ahora dice "desbloquear"' />
            </div>
            <Callout type="info" title="El bloqueo no elimina datos">
              El participante bloqueado conserva sus pronósticos y puntos históricos.
              Solo pierde visibilidad en el ranking y acceso al dashboard.
            </Callout>
          </GuideSection>

          {/* ═══════════════════════════════════════════════════════════════
              4. EMPLEADOS
          ═══════════════════════════════════════════════════════════════ */}
          <GuideSection id="employees" icon={Star} title="Empleados Paris" subtitle="Registro especial y ranking interno" color="#f472b6">

            <Prose>
              <p>
                Los empleados de Grupo Paris participan del mismo prode que los clientes, pero
                además tienen acceso a un <strong className="text-white">ranking interno</strong> exclusivo
                con fotos de perfil y trofeos.
              </p>
            </Prose>

            <SubTitle>Formato del email para empleados</SubTitle>
            <CodeBlock label="Formato">
              {`empleadoparis@{DNI}.com\n\n`}
              <span className="text-emerald-400">{"// Ejemplos válidos:"}</span>{"\n"}
              {`empleadoparis@12345678.com   ✓  (DNI de 8 dígitos)\n`}
              {`empleadoparis@1234567.com    ✓  (DNI de 7 dígitos)\n`}
              {`empleadoparis@123456.com     ✗  (solo 6 dígitos, inválido)\n`}
              {`empleadoparis@12345678.ar    ✗  (dominio incorrecto)`}
            </CodeBlock>

            <Callout type="tip" title="Detección automática">
              El sistema detecta el email automáticamente. No hace falta ninguna configuración manual.
              Al registrarse con este email, <Code>is_employee = true</Code> se guarda en la base de datos.
            </Callout>

            <SubTitle>Acceso al panel de empleados</SubTitle>
            <div className="space-y-3">
              <Step n={1} title="El empleado se registra con su email especial en la landing normal" />
              <Step n={2} title='En su dashboard verá un botón dorado "Panel Empleados"'>
                Solo visible para empleados, en la barra lateral.
              </Step>
              <Step n={3} title='En /empleados/ranking ve el ranking interno con fotos y trofeos' />
            </div>

            <SubTitle>Trofeos del ranking interno</SubTitle>
            <Table
              headers={["Insignia", "Nombre", "Criterio"]}
              rows={[
                ["🥇", "Campeón Paris", "1° lugar en el ranking interno"],
                ["🥈", "Subcampeón", "2° lugar"],
                ["🥉", "Top 3 Paris", "3° lugar"],
                ["🎯", "Francotirador", "Más aciertos exactos (marcador exacto)"],
                ["🔥", "El Más Activo", "Más pronósticos cargados"],
                ["💡", "Adivinador", "Más resultados con ganador correcto"],
                ["⚽", "Prode Paris", "Trofeo de participación — todos lo tienen"],
              ]}
            />

            <Callout type="info" title="Foto de perfil">
              Cada empleado puede subir su foto tocando el avatar en el panel. Acepta JPG, PNG o WebP
              hasta 2 MB. La foto se guarda en Supabase Storage (bucket <Code>avatars</Code>).
            </Callout>
          </GuideSection>

          {/* ═══════════════════════════════════════════════════════════════
              5. PARTIDOS Y PRONÓSTICOS
          ═══════════════════════════════════════════════════════════════ */}
          <GuideSection id="matches" icon={Calendar} title="Partidos y pronósticos" subtitle="Ciclo de vida completo de un partido" color="#4ade80">

            <SubTitle>Ciclo de vida de un partido</SubTitle>
            <div className="rounded-2xl border border-white/8 bg-[#0b2440]/50 p-5">
              <div className="flex flex-col gap-3">
                {[
                  { state: "Creado",           color: "#7ab0e8", desc: "El partido existe en la DB. Pronósticos abiertos." },
                  { state: "Bloqueado",        color: "#fbbf24", desc: "predictions_locked = true. El cron detectó que la fecha ya pasó." },
                  { state: "Resultado cargado", color: "#c3871e", desc: "Admin ingresó score1/score2. El sistema recalcula puntos." },
                  { state: "Finalizado",       color: "#4ade80", desc: "is_finished = true. Aparece en historial con resultado." },
                ].map((s, i) => (
                  <div key={s.state} className="flex items-center gap-4">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                      style={{ background: `${s.color}15`, border: `1px solid ${s.color}35`, color: s.color }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <span className="font-black text-sm" style={{ color: s.color }}>{s.state}</span>
                      <span className="text-white/40 text-sm ml-2">{s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SubTitle>Bloqueo automático de pronósticos</SubTitle>
            <Prose>
              <p>
                Existe un cron en Vercel que llama a <Code>/api/cron/lock-matches</Code> y ejecuta la función
                SQL <Code>lock_started_matches()</Code>. Esta función bloquea todos los partidos cuya
                <Code>match_date</Code> ya pasó.
              </p>
              <p>
                Además, la acción <Code>savePrediction</Code> tiene una guardia independiente:
                aunque el cron no haya corrido, si la fecha del partido ya pasó al momento del submit,
                el pronóstico se rechaza.
              </p>
            </Prose>
            <Callout type="warning" title="Frecuencia del cron">
              La frecuencia ideal es cada minuto <Code>* * * * *</Code>. Con <Code>*/5 * * * *</Code>
              hay una ventana de hasta 5 minutos donde se podrían cargar pronósticos después del pitido.
              Esto se puede configurar en <Code>vercel.json</Code>.
            </Callout>

            <SubTitle>Crear un nuevo partido</SubTitle>
            <div className="space-y-3">
              <Step n={1} title='Admin → Partidos → botón "Nuevo partido"' />
              <Step n={2} title="Completar: equipo local, visitante, banderas, fecha/hora, grupo/etapa">
                Las banderas usan emojis de país (🇦🇷, 🇧🇷, etc.). La fecha debe ser en la zona
                horaria local — el sistema la convierte a UTC internamente.
              </Step>
              <Step n={3} title="Guardar → el partido aparece inmediatamente en el prode" />
            </div>

            <SubTitle>Cargar resultado de un partido</SubTitle>
            <div className="space-y-3">
              <Step n={1} title='Admin → Partidos → clic en el partido → "Cargar resultado"' />
              <Step n={2} title="Ingresar los goles de cada equipo (0 a 30)" />
              <Step n={3} title='Hacer clic en "Guardar resultado"'>
                El sistema llama a <Code>recalculate_points(match_id)</Code> automáticamente.
                Actualiza los puntos de cada participante que había pronosticado ese partido.
              </Step>
              <Step n={4} title="El ranking se actualiza en tiempo real" />
            </div>

            <Callout type="tip" title="Partidos por fases">
              Actualmente el sistema solo muestra partidos de Argentina en el dashboard de pronósticos.
              Para habilitar todos los partidos, en <Code>app/dashboard/pronosticos/page.tsx</Code>
              eliminar la línea: <Code>.or("team1.ilike.%argentina%,team2.ilike.%argentina%")</Code>
            </Callout>
          </GuideSection>

          {/* ═══════════════════════════════════════════════════════════════
              6. SISTEMA DE PUNTOS
          ═══════════════════════════════════════════════════════════════ */}
          <GuideSection id="points" icon={Target} title="Sistema de puntos" subtitle="Cómo se calculan y configuran" color="#c3871e">

            <Table
              headers={["Tipo de acierto", "Puntos", "Descripción"]}
              rows={[
                [<Badge color="#4ade80">Resultado exacto</Badge>, "10 pts", "Marcador correcto (ej: predijo 2-1, fue 2-1)"],
                [<Badge color="#c3871e">Diferencia de goles</Badge>, "7 pts", "Mismo ganador, misma diferencia (ej: 3-1 → predijo 2-0)"],
                [<Badge color="#7ab0e8">Ganador / empate</Badge>, "5 pts", "Acertó quién ganó o que empataron, diferencia incorrecta"],
                [<Badge color="#f87171">Error</Badge>, "0 pts", "Ganador equivocado o empató cuando predijo victoria"],
              ]}
            />

            <SubTitle>Ejemplos de cálculo</SubTitle>
            <div className="space-y-3">
              {[
                { real: "2-1", pred: "2-1", result: "Exacto",    pts: 10, color: "#4ade80" },
                { real: "3-1", pred: "2-0", result: "Diferencia", pts: 7,  color: "#c3871e" },
                { real: "3-0", pred: "1-0", result: "Ganador",   pts: 5,  color: "#7ab0e8" },
                { real: "2-0", pred: "0-1", result: "Error",     pts: 0,  color: "#f87171" },
              ].map(ex => (
                <div key={ex.pred} className="flex items-center gap-4 bg-[#0b2440] border border-white/8 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <span className="text-white/40 text-[10px]">Real:</span>
                    <span className="text-white font-black">{ex.real}</span>
                    <span className="text-white/20 mx-1">·</span>
                    <span className="text-white/40 text-[10px]">Pred:</span>
                    <span className="text-white/70 font-bold">{ex.pred}</span>
                  </div>
                  <div className="flex-1" />
                  <Badge color={ex.color}>{ex.result}</Badge>
                  <span className="font-black text-lg tabular-nums" style={{ color: ex.color }}>
                    {ex.pts}<span className="text-[10px] font-bold ml-1" style={{ color: `${ex.color}70` }}>pts</span>
                  </span>
                </div>
              ))}
            </div>

            <SubTitle>Modificar los valores de puntos</SubTitle>
            <div className="space-y-3">
              <Step n={1} title="Admin → Configuración → sección Puntuación" />
              <Step n={2} title="Modificar los valores de Exacto, Ganador y Diferencia" />
              <Step n={3} title="Guardar — los nuevos valores aplican a los próximos recálculos" />
            </div>
            <Callout type="danger" title="Cambiar puntos recalcula TODO">
              Si modificás los valores, necesitás recalcular manualmente todos los partidos ya finalizados
              para que el ranking sea consistente. Hacerlo desde el panel de partidos → "Recalcular".
            </Callout>
          </GuideSection>

          {/* ═══════════════════════════════════════════════════════════════
              7. PREMIOS
          ═══════════════════════════════════════════════════════════════ */}
          <GuideSection id="prizes" icon={Gift} title="Premios" subtitle="Creación, asignación y estados" color="#a78bfa">

            <Table
              headers={["Estado", "Descripción"]}
              rows={[
                [<Badge color="#4ade80">available</Badge>, "El premio está disponible, sin ganador asignado"],
                [<Badge color="#fbbf24">pending</Badge>, "Se asignó un ganador, pendiente de entrega"],
                [<Badge color="#7ab0e8">delivered</Badge>, "Premio entregado. Se registra la fecha de entrega"],
              ]}
            />

            <SubTitle>Crear un premio</SubTitle>
            <div className="space-y-3">
              <Step n={1} title='Admin → Premios → botón "Nuevo premio"' />
              <Step n={2} title="Completar: título, descripción, etapa del torneo (semanal/mensual/final)" />
              <Step n={3} title="Subir foto del premio (opcional pero recomendado)">
                Acepta JPG, PNG o WebP. La imagen se sube a Supabase Storage (bucket <Code>prize-images</Code>).
              </Step>
              <Step n={4} title='Guardar → el premio aparece en la landing para los participantes' />
            </div>

            <SubTitle>Asignar ganador</SubTitle>
            <div className="space-y-3">
              <Step n={1} title='Ir al premio → clic en "Asignar ganador"' />
              <Step n={2} title="Seleccionar participante del ranking (aparece ordenado por puntos)" />
              <Step n={3} title='Confirmar → el estado cambia a "pending"' />
              <Step n={4} title='Una vez entregado → clic en "Marcar como entregado"' />
            </div>
            <Callout type="tip" title="El participante no recibe notificación automática">
              El sistema no envía emails automáticos al ganador. Coordinar la comunicación por
              WhatsApp o el canal que maneje el concesionario.
            </Callout>
          </GuideSection>

          {/* ═══════════════════════════════════════════════════════════════
              8. MÉTRICAS Y REPORTES
          ═══════════════════════════════════════════════════════════════ */}
          <GuideSection id="metrics" icon={BarChart3} title="Métricas y reportes" subtitle="Vistas analíticas y generación de informes" color="#fb923c">

            <SubTitle>Panel de métricas</SubTitle>
            <Prose>
              <p>
                Admin → Métricas muestra datos en tiempo real desde vistas SQL:
              </p>
            </Prose>
            <Table
              headers={["Métrica", "Descripción"]}
              rows={[
                ["Total participantes", "Todos los registrados (activos + bloqueados)"],
                ["Participantes activos", "Solo los no bloqueados"],
                ["Pronósticos cargados", "Total de predicciones en la plataforma"],
                ["Partidos finalizados", "De los partidos creados, cuántos tienen resultado"],
                ["Distribución por origen", "Cuántos vinieron de taller/digital/qr/etc."],
                ["Top por ciudad", "Las ciudades con más participantes"],
              ]}
            />

            <SubTitle>Generación de reportes</SubTitle>
            <div className="space-y-3">
              <Step n={1} title="Admin → Reportes" />
              <Step n={2} title='Seleccionar el tipo de reporte (semanal / mensual / completo)' />
              <Step n={3} title='Clic en "Generar"'>
                El reporte tarda unos segundos. Al finalizar se puede descargar como CSV o ver en pantalla.
              </Step>
            </div>
            <Callout type="info" title="Reportes automáticos">
              El sistema genera reportes automáticos mediante crons:
              <ul className="mt-2 space-y-1">
                <li><Code>daily-report</Code> — todos los días</li>
                <li><Code>weekly-report</Code> — cada lunes</li>
                <li><Code>monthly-report</Code> — primer día de cada mes</li>
              </ul>
              Los reportes se guardan en la tabla <Code>report_snapshots</Code>.
            </Callout>

            <SubTitle>API externa para integraciones</SubTitle>
            <Prose>
              <p>
                La API v1 expone endpoints para sistemas externos (CRM, BI, etc.):
              </p>
            </Prose>
            <CodeBlock label="Endpoints disponibles">
              {`GET /api/v1/participants?page=1&limit=50\n`}
              {`  → Lista paginada de participantes\n\n`}
              {`GET /api/v1/metrics\n`}
              {`  → Resumen ejecutivo: totales + top 10 ranking\n\n`}
              {`Authorization: Bearer {API_SECRET_KEY}`}
            </CodeBlock>
          </GuideSection>

          {/* ═══════════════════════════════════════════════════════════════
              9. CALL CENTER
          ═══════════════════════════════════════════════════════════════ */}
          <GuideSection id="callcenter" icon={Trophy} title="Call Center" subtitle="Panel de consulta para operadores" color="#94a3b8">

            <Prose>
              <p>
                El panel de Call Center en <Code>/callcenter</Code> permite buscar clientes de forma
                rápida sin exponer datos sensibles innecesarios. Los operadores de call center solo
                pueden <strong className="text-white">leer</strong>, nunca modificar.
              </p>
            </Prose>

            <SubTitle>Búsqueda de clientes</SubTitle>
            <div className="space-y-3">
              <Step n={1} title="Ingresar con una cuenta con rol callcenter" />
              <Step n={2} title="Buscar por nombre, apellido, DNI o email">
                El sistema también permite buscar por DNI cuando el cliente no recuerda su email.
                Usa el endpoint <Code>findEmailByDni</Code> con rate limit de 10 intentos/5 min.
              </Step>
              <Step n={3} title="Ver sus datos: pronósticos, puntos, ranking y datos de contacto" />
            </div>

            <Callout type="warning" title="Rate limiting en búsqueda por DNI">
              Para prevenir enumeración masiva de DNIs, hay un rate limit de 10 intentos por IP
              cada 5 minutos. Si el operador hace muchas búsquedas seguidas puede quedar bloqueado.
              En ese caso esperar 5 minutos o cambiar de IP.
            </Callout>
          </GuideSection>

          {/* ═══════════════════════════════════════════════════════════════
              10. FLUJOS
          ═══════════════════════════════════════════════════════════════ */}
          <GuideSection id="workflows" icon={Zap} title="Flujos paso a paso" subtitle="Los escenarios más comunes" color="#fbbf24">

            <SubTitle>Flujo 1: Fin de partido → cargar resultado</SubTitle>
            <div className="space-y-2">
              <Step n={1} title="El árbitro pitó el final → esperar confirmación del marcador oficial" />
              <Step n={2} title="Admin → Partidos → buscar el partido" />
              <Step n={3} title='Clic en "Cargar resultado" → ingresar goles de cada equipo' />
              <Step n={4} title='Guardar → puntos se recalculan automáticamente para todos' />
              <Step n={5} title="Verificar en el Dashboard que el total de pronósticos procesados sea correcto" />
            </div>

            <SubTitle>Flujo 2: Asignar premio semanal</SubTitle>
            <div className="space-y-2">
              <Step n={1} title="Verificar que todos los partidos de la semana tengan resultado cargado" />
              <Step n={2} title="Admin → Premios → el premio semanal debe estar en estado 'available'" />
              <Step n={3} title="Admin → Participantes → ordenar por puntos para ver al líder" />
              <Step n={4} title='Volver a Premios → "Asignar ganador" → seleccionar al participante' />
              <Step n={5} title="Contactar al ganador por WhatsApp / email para coordinar entrega" />
              <Step n={6} title='Una vez entregado → "Marcar como entregado"' />
            </div>

            <SubTitle>Flujo 3: Alta de un nuevo empleado Paris</SubTitle>
            <div className="space-y-2">
              <Step n={1} title="El empleado va a la landing y hace clic en Participar">
                No hay landing separada — misma landing que los clientes.
              </Step>
              <Step n={2} title='En el campo email ingresar: empleadoparis@{DNI}.com'>
                <CodeBlock>empleadoparis@12345678.com</CodeBlock>
              </Step>
              <Step n={3} title="Completar el resto del formulario normalmente" />
              <Step n={4} title="Al loguear → en el sidebar verá el botón dorado 'Panel Empleados'" />
              <Step n={5} title="Puede subir su foto de perfil tocando el avatar en /empleados/ranking" />
            </div>

            <SubTitle>Flujo 4: Un cliente no puede hacer pronósticos</SubTitle>
            <div className="space-y-2">
              <Step n={1} title="Verificar si el partido fue bloqueado (la fecha ya pasó)">
                Si <Code>predictions_locked = true</Code>, no se pueden cargar pronósticos. Esto es correcto.
              </Step>
              <Step n={2} title="Verificar si el participante está bloqueado">
                Admin → Participantes → buscar → verificar estado.
              </Step>
              <Step n={3} title="Verificar si hay problemas con la sesión">
                Pedirle al cliente que cierre sesión y vuelva a ingresar.
              </Step>
            </div>

            <SubTitle>Flujo 5: Exportar datos para Marketing</SubTitle>
            <div className="space-y-2">
              <Step n={1} title="Admin → Participantes" />
              <Step n={2} title="Opcionalmente filtrar por lead_source (ej: solo 'taller')" />
              <Step n={3} title='Clic en "Exportar" → elegir XLSX o CSV' />
              <Step n={4} title="El archivo incluye: nombre, apellido, DNI, celular, email, ciudad, patente, marca, modelo, puntos, ranking" />
            </div>
          </GuideSection>

          {/* ═══════════════════════════════════════════════════════════════
              11. FAQ
          ═══════════════════════════════════════════════════════════════ */}
          <GuideSection id="faq" icon={Settings} title="Preguntas frecuentes" color="#7ab0e8">

            <div className="space-y-4">
              {[
                {
                  q: "¿Por qué un participante no puede registrarse?",
                  a: "Posibles causas: (1) DNI, email o patente ya registrados — el sistema muestra el error específico. (2) Rate limit activo — máx. 3 registros por IP por hora. (3) Captcha no completado si está configurado NEXT_PUBLIC_HCAPTCHA_SITE_KEY.",
                },
                {
                  q: "¿Se puede cambiar la contraseña de un participante?",
                  a: 'No desde el panel admin directamente. El participante puede usar "Olvidé mi contraseña" en el login, que envía un email de reset vía Supabase Auth.',
                },
                {
                  q: "¿Qué pasa si se carga el resultado equivocado?",
                  a: "Se puede volver a cargar el resultado correcto desde el panel de partidos. Al guardar, recalculate_points() se ejecuta de nuevo con los valores actualizados. El ranking se ajusta automáticamente.",
                },
                {
                  q: "¿Por qué no aparece el badge 🇳🇿 en el ranking?",
                  a: "El badge de Tim Payne solo aparece si hay participantes que hayan pronosticado una victoria de Nueva Zelanda. Si aún no hay partidos de NZ creados o nadie los pronosticó, el badge no aparece. El easter egg del 🇳🇿 en el hero es independiente.",
                },
                {
                  q: "¿Cómo agrego el torneo de más países (octavos, cuartos, etc.)?",
                  a: "Cuando avance el torneo: (1) Crear los partidos en Admin → Partidos con los equipos clasificados. (2) Editar app/dashboard/pronosticos/page.tsx para eliminar el filtro de Argentina y mostrar todos. El ranking y los puntos funcionan automáticamente para cualquier partido.",
                },
                {
                  q: "¿El sistema funciona en tiempo real?",
                  a: "El ranking en la landing se actualiza cada 30 segundos (ISR revalidate=30). El dashboard de participantes muestra datos frescos en cada carga. Los puntos se recalculan en el momento que el admin guarda el resultado.",
                },
                {
                  q: "¿Cómo sé si los crons están funcionando?",
                  a: (
                    <span>
                      En Vercel Dashboard → Cron Jobs se puede ver el historial de ejecuciones y si fallaron.
                      El cron <Code>lock-matches</Code> debería ejecutarse cada minuto (o cada 5 min según configuración).
                      Si un partido no se bloqueó automáticamente, se puede bloquear manualmente desde el panel de partidos.
                    </span>
                  ),
                },
                {
                  q: "¿Se puede tener un admin y también participar en el prode?",
                  a: "Sí. El admin puede registrarse como participante con un email diferente. Los roles son independientes. Un usuario puede tener rol admin y también un perfil de participante en otra cuenta.",
                },
              ].map(item => (
                <details key={item.q} className="group rounded-2xl border border-white/8 bg-[#0b2440] overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-white/3 transition-colors">
                    <span className="text-white/80 font-bold text-sm pr-4">{item.q}</span>
                    <ChevronRight className="w-4 h-4 text-white/20 shrink-0 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-5 pb-4 text-white/45 text-sm leading-relaxed border-t border-white/6 pt-4">
                    {typeof item.a === "string" ? <p>{item.a}</p> : item.a}
                  </div>
                </details>
              ))}
            </div>

          </GuideSection>

          {/* Footer de la guía */}
          <div className="rounded-2xl border border-white/6 bg-[#0b2440]/40 px-6 py-5 text-center">
            <p className="text-white/20 text-xs font-medium">
              Prode Grupo Paris 2026 · Documentación interna · Uso exclusivo del equipo Paris
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
