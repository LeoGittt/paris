"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Eye, EyeOff, ChevronDown } from "lucide-react"
import HCaptcha from "@hcaptcha/react-hcaptcha"
import { registerParticipant } from "@/lib/actions/register"

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? ""

const CAR_BRANDS = [
  "Chevrolet", "Ford", "Volkswagen", "Toyota", "Renault",
  "Fiat", "Peugeot", "Citroën", "Honda", "Nissan",
  "Jeep", "Kia", "Hyundai", "Mitsubishi", "Dodge", "RAM",
  "Suzuki", "Mercedes-Benz", "BMW", "Audi", "Subaru",
  "Alfa Romeo", "Chery", "GWM / Haval", "BYD", "JAC",
  "Geely", "Volvo", "Land Rover", "Mazda",
]

const CAR_MODELS_BY_BRAND: Record<string, string[]> = {
  Chevrolet: [
    "Onix", "Onix Plus", "Cruze", "Cruze RS", "Tracker", "Tracker Premier", "Equinox", "Equinox RS",
    "Trax", "Trax RS", "Blazer", "Captiva", "Trailblazer", "S10", "S10 High Country", "Montana",
    "Colorado", "Spin", "Camaro", "Camaro SS", "Camaro ZL1", "Silverado", "Silverado HD",
    "Suburban", "Tahoe", "Traverse", "Bolt EV", "Bolt EUV", "Groove", "Aveo", "Cobalt",
    "Corsa", "Corsa Classic", "Classic", "Celta", "Agile", "Meriva", "Zafira", "Astra",
    "Vectra", "Omega", "Prisma", "Joy", "Beat", "Spark", "Express", "Orlando",
  ],
  Ford: [
    "Ka", "Ka+", "Fiesta", "Fiesta ST", "Focus", "Focus ST", "Focus RS", "EcoSport",
    "Territory", "Ranger", "Ranger Raptor", "Ranger XLS", "Ranger XLT", "Ranger Limited",
    "F-150", "F-150 Raptor", "F-250", "F-350", "F-450", "Bronco", "Bronco Sport",
    "Explorer", "Explorer ST", "Maverick", "Edge", "Edge ST", "Escape", "Escape PHEV",
    "Kuga", "Mustang", "Mustang Mach-E", "Mustang GT", "Mustang Shelby GT350", "Mustang Shelby GT500",
    "Transit", "Transit Connect", "Transit Custom", "Tourneo", "Everest",
    "Fusion", "Mondeo", "Galaxy", "S-Max", "Puma", "C-Max", "Galaxy",
  ],
  Volkswagen: [
    "Gol", "Gol Trend", "Polo", "Polo Track", "Virtus", "Virtus GTS", "T-Cross", "Taos",
    "Tiguan", "Tiguan Allspace", "Amarok", "Amarok V6", "Saveiro", "Saveiro Cross",
    "Nivus", "Vento", "Suran", "Golf", "Golf GTI", "Golf R", "Up!", "CrossFox", "Fox",
    "Bora", "Jetta", "Passat", "Touareg", "Teramont", "ID.4", "ID.3", "ID.6",
    "Caddy", "Crafter", "Transporter", "Caravelle", "Sharan", "T-Roc",
  ],
  Toyota: [
    "Corolla", "Corolla Cross", "Corolla GR Sport", "Yaris", "Yaris Cross", "Etios",
    "Hilux", "Hilux SRV", "Hilux GR-S", "Hilux Revo", "SW4", "SW4 Diamond",
    "RAV4", "RAV4 Hybrid", "Land Cruiser Prado", "Land Cruiser 200", "Land Cruiser 300",
    "Fortuner", "Fortuner Legender", "C-HR", "GR86", "GR Yaris", "Supra",
    "Camry", "Camry Hybrid", "Avalon", "Venza", "Highlander", "Sequoia",
    "Tundra", "Tacoma", "4Runner", "FJ Cruiser", "Rush", "Prius", "bZ4X", "Sienna",
  ],
  Renault: [
    "Logan", "Logan Authentique", "Sandero", "Sandero RS", "Sandero Stepway",
    "Kwid", "Kwid Iconic", "Duster", "Duster Oroch", "Oroch", "Oroch Outsider",
    "Captur", "Captur Intens", "Koleos", "Koleos Bose", "Kangoo", "Kangoo Zen",
    "Master", "Master Minibus", "Clio", "Clio RS", "Mégane", "Mégane RS",
    "Fluence", "Latitude", "Symbol", "Scenic", "Grand Scenic", "Talisman",
    "Espace", "Kadjar", "Arkana", "Austral", "Zoe", "Spring", "Alaskan", "Trafic", "Dokker",
  ],
  Fiat: [
    "Uno", "Uno Way", "Uno Attractive", "Palio", "Palio Weekend", "Palio Adventure",
    "Cronos", "Cronos Precision", "Argo", "Argo HGT", "Pulse", "Pulse Abarth",
    "Fastback", "Fastback Abarth", "Mobi", "Mobi Way", "500", "500e", "500X", "500L",
    "Toro", "Toro Ranch", "Toro Ultra", "Strada", "Strada Volcano",
    "Ducato", "Doblò", "Fiorino", "Qubo", "Punto", "Grande Punto", "Bravo",
    "Siena", "Linea", "Tipo", "Freemont", "Abarth 595", "Abarth 124 Spider",
  ],
  Peugeot: [
    "108", "208", "208 GT", "308", "308 SW", "308 GT", "408", "408 GT",
    "508", "508 SW", "2008", "2008 GT", "3008", "3008 GT", "5008", "5008 GT",
    "e-208", "e-2008", "e-308", "RCZ", "Expert", "Partner", "Partner Tepee",
    "Rifter", "Traveller", "Boxer", "Manager", "Landtrek",
    "207", "207 CC", "207 SW", "307", "307 CC", "307 SW", "301", "107",
  ],
  "Citroën": [
    "C1", "C2", "C3", "C3 Aircross", "C3 Aircross Feel", "C4", "C4 Cactus",
    "C4 Picasso", "C4 SpaceTourer", "C5", "C5 Aircross", "C5 X", "C6", "C8",
    "DS3", "DS3 Crossback", "DS4", "DS5", "DS7 Crossback", "Berlingo",
    "Jumpy", "Jumper", "Dispatch", "Saxo", "Xsara", "Xsara Picasso", "Xantia", "ZX",
  ],
  Honda: [
    "Civic", "Civic Type R", "Civic Hatchback", "City", "City Hatchback",
    "Fit", "Fit EXL", "HR-V", "HR-V EXL", "CR-V", "CR-V Hybrid",
    "WR-V", "ZR-V", "BR-V", "Accord", "Accord Hybrid", "Pilot", "Passport",
    "Ridgeline", "Odyssey", "Jazz", "Legend", "Insight", "Freed",
    "Stream", "CR-Z", "NSX", "S2000", "Element",
  ],
  Nissan: [
    "Kicks", "Kicks Exclusive", "Sentra", "Sentra Exclusive", "Frontier",
    "Frontier PRO-4X", "Frontier LE", "Versa", "Versa Advance", "March",
    "X-Trail", "X-Trail Hybrid", "Murano", "Pathfinder", "Navara",
    "Armada", "Patrol", "Juke", "Qashqai", "Note", "Micra",
    "Altima", "Maxima", "Tiida", "Leaf", "Ariya", "GT-R", "370Z", "350Z",
    "Terra", "Xterra", "NV200", "NV350",
  ],
  Jeep: [
    "Renegade", "Renegade Sport", "Renegade Longitude", "Renegade Trailhawk",
    "Compass", "Compass Longitude", "Compass Trailhawk", "Compass Limited",
    "Grand Cherokee", "Grand Cherokee L", "Grand Cherokee Trailhawk",
    "Grand Cherokee Overland", "Grand Cherokee Summit", "Grand Cherokee SRT",
    "Wrangler", "Wrangler Sport", "Wrangler Sahara", "Wrangler Rubicon",
    "Gladiator", "Commander", "Cherokee", "Patriot", "Avenger",
  ],
  Kia: [
    "Picanto", "Picanto GT Line", "Rio", "Rio GT Line", "Cerato", "Cerato GT",
    "Sportage", "Sportage GT Line", "Sportage X-Line", "Seltos", "Seltos GT Line",
    "Stonic", "Stonic GT Line", "Sorento", "Sorento Hybrid", "Carnival",
    "Telluride", "EV6", "EV6 GT", "EV9", "Niro", "Niro EV", "Soul", "Stinger",
    "K5", "K8", "Mohave", "Cadenza", "ProCeed", "Ceed",
  ],
  Hyundai: [
    "Accent", "Accent GL", "Accent GLS", "Elantra", "Elantra N",
    "Tucson", "Tucson N Line", "Tucson PHEV", "Santa Fe", "Santa Fe PHEV",
    "i10", "i20", "i20 N", "i30", "i30 N", "Creta", "Creta GLS",
    "Venue", "Venue N Line", "Palisade", "Ioniq 5", "Ioniq 6", "Ioniq",
    "Kona", "Kona Electric", "Bayon", "Santa Cruz", "Nexo",
    "Sonata", "Azera", "Veloster", "Veloster N", "ix35", "Getz", "Staria",
  ],
  Mitsubishi: [
    "L200", "L200 Triton", "L200 Triton Sport", "L200 Triton HPE",
    "Outlander", "Outlander PHEV", "Outlander Sport", "Eclipse Cross",
    "Eclipse Cross PHEV", "ASX", "Montero", "Montero Sport", "Pajero",
    "Pajero Sport", "Galant", "Lancer", "Lancer Evolution", "Colt",
    "Space Star", "Space Wagon", "Grandis", "i-MiEV",
  ],
  Dodge: [
    "Journey", "Journey SE", "Journey SXT", "Journey GT", "Durango",
    "Durango SXT", "Durango GT", "Durango R/T", "Challenger", "Challenger SXT",
    "Challenger R/T", "Challenger SRT", "Challenger Hellcat", "Charger",
    "Charger SXT", "Charger R/T", "Charger SRT", "Charger Hellcat",
    "Nitro", "Avenger", "Caliber", "Neon", "Viper", "Grand Caravan", "Dakota",
  ],
  RAM: [
    "700", "700 Sport", "1000", "1000 Sport", "1500", "1500 Sport",
    "1500 Laramie", "1500 TRX", "2500", "2500 Laramie", "2500 Power Wagon",
    "3500", "3500 Laramie", "4500", "5500", "ProMaster", "Classic",
  ],
  Suzuki: [
    "Vitara", "Vitara Turbo", "S-Cross", "S-Cross Hybrid", "Swift",
    "Swift Sport", "Jimny", "Jimny Sierra", "Baleno", "Ignis",
    "Grand Vitara", "Grand Vitara Sport", "Ertiga", "XL7", "Across",
    "Celerio", "Wagon R", "Alto", "Kizashi", "SX4", "APV",
  ],
  "Mercedes-Benz": [
    "Clase A", "Clase A AMG", "Clase B", "Clase C", "Clase C AMG",
    "Clase E", "Clase E AMG", "Clase S", "Clase S AMG", "Clase G", "Clase G AMG",
    "GLA", "GLA AMG", "GLB", "GLC", "GLC AMG", "GLC Coupé",
    "GLE", "GLE AMG", "GLE Coupé", "GLS", "GLS AMG",
    "CLA", "CLA AMG", "CLS", "SL", "AMG GT", "AMG GT 4 puertas",
    "EQA", "EQB", "EQC", "EQE", "EQS", "EQV",
    "Vito", "Viano", "Sprinter", "Actros", "Atego", "Marco Polo",
  ],
  BMW: [
    "Serie 1", "Serie 2", "Serie 2 Gran Coupé", "Serie 3", "Serie 3 Touring",
    "Serie 4", "Serie 4 Gran Coupé", "Serie 5", "Serie 5 Touring",
    "Serie 6 Gran Turismo", "Serie 7", "Serie 8", "Serie 8 Gran Coupé",
    "X1", "X2", "X3", "X3 M", "X4", "X4 M", "X5", "X5 M", "X6", "X6 M", "X7",
    "M2", "M3", "M4", "M5", "M8", "Z4", "i3", "i4", "i5", "i7", "iX", "iX1", "iX3",
    "Active Tourer", "Gran Tourer", "XM",
  ],
  Audi: [
    "A1", "A1 Sportback", "A3", "A3 Sportback", "A3 Sedan", "A4", "A4 Avant",
    "A5", "A5 Sportback", "A5 Coupé", "A6", "A6 Avant", "A7", "A7 Sportback",
    "A8", "TT", "TT RS", "R8", "RS3", "RS4 Avant", "RS5", "RS6 Avant", "RS7",
    "S3", "S4", "S5", "S6", "S7", "S8",
    "Q2", "Q3", "Q3 Sportback", "RS Q3", "Q4 e-tron", "Q5", "Q5 Sportback",
    "SQ5", "Q6 e-tron", "Q7", "SQ7", "Q8", "RS Q8", "SQ8", "e-tron GT", "RS e-tron GT",
  ],
  Subaru: [
    "Impreza", "Impreza Sport", "XV", "Crosstrek", "Forester",
    "Forester Sport", "Outback", "Outback XT", "BRZ", "BRZ tS",
    "Legacy", "Legacy Sport", "WRX", "WRX STI", "Solterra",
    "Ascent", "Tribeca",
  ],
  "Alfa Romeo": [
    "Giulia", "Giulia Veloce", "Giulia Quadrifoglio", "Stelvio",
    "Stelvio Veloce", "Stelvio Quadrifoglio", "Giulietta", "Giulietta Veloce",
    "Tonale", "Tonale PHEV", "MiTo", "147", "156", "156 Sportwagon",
    "159", "159 Sportwagon", "Brera", "Spider", "GT",
  ],
  Chery: [
    "Tiggo 2", "Tiggo 2 Pro", "Tiggo 3", "Tiggo 3X", "Tiggo 4", "Tiggo 4 Pro",
    "Tiggo 5X", "Tiggo 7", "Tiggo 7 Pro", "Tiggo 7 Pro Max", "Tiggo 8",
    "Tiggo 8 Pro", "Tiggo 8 Pro Max", "Arrizo 5", "Arrizo 5 Pro",
    "Arrizo 6", "Arrizo 6 Pro", "Omoda 5", "Omoda C5",
  ],
  "GWM / Haval": [
    "Haval H2", "Haval H4", "Haval H6", "Haval H6 GT", "Haval H8", "Haval H9",
    "Haval Jolion", "Haval Jolion GT", "Haval Big Dog", "Haval M6",
    "Wingle 5", "Wingle 7", "Poer", "Poer King Kong", "Tank 300", "Tank 500",
    "ORA 03", "ORA 07",
  ],
  BYD: [
    "Dolphin", "Dolphin Mini", "Seal", "Seal U", "Atto 2", "Atto 3",
    "Tang", "Tang EV", "Han", "Han EV", "Song Plus", "Song Plus EV",
    "Song Pro", "Yuan Plus", "Sea Lion 7", "Destroyer 05", "Frigate 07",
    "Seagull", "e6", "F3",
  ],
  JAC: [
    "S3", "S4", "S5", "S7", "T6", "T8", "T40", "iEV7", "iEV A50",
    "iEV6E", "Sei 3", "Sei 5", "Sei 7", "X200", "Gallop", "Refine",
  ],
  Geely: [
    "Coolray", "Coolray Sport", "Emgrand", "Emgrand X7", "Emgrand X7 Sport",
    "Tugella", "Okavango", "Atlas", "Atlas Pro", "Boyue", "Boyue Pro",
    "Azkarra", "Preface", "GX3", "GX7",
  ],
  Volvo: [
    "XC40", "XC40 Recharge", "XC60", "XC60 Recharge", "XC90", "XC90 Recharge",
    "S60", "S60 Recharge", "S90", "S90 Recharge", "V60", "V60 Cross Country",
    "V90", "V90 Cross Country", "C40 Recharge", "EX30", "EX90",
    "V40", "S40", "V50", "XC70", "V70",
  ],
  "Land Rover": [
    "Defender", "Defender 90", "Defender 110", "Defender 130",
    "Discovery", "Discovery 4", "Discovery 5", "Discovery Sport",
    "Discovery Sport SE", "Discovery Sport HSE",
    "Range Rover", "Range Rover SV", "Range Rover Sport",
    "Range Rover Sport SVR", "Range Rover Evoque", "Range Rover Velar",
    "Freelander", "Freelander 2",
  ],
  Mazda: [
    "Mazda 2", "Mazda 2 Sedán", "Mazda 3", "Mazda 3 Hatchback", "Mazda 3 Sedán",
    "Mazda 6", "Mazda 6 Wagon", "CX-3", "CX-5", "CX-5 Grand Touring",
    "CX-30", "CX-50", "CX-60", "CX-8", "CX-9",
    "MX-5", "MX-5 RF", "MX-30", "RX-7", "RX-8",
    "BT-50", "MPV", "Premacy", "323", "626", "Tribute",
  ],
}

const THIS_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: THIS_YEAR - 1979 }, (_, i) => THIS_YEAR - i)

function SelectField({
  value, onChange, disabled, required, children,
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const empty = !value
  return (
    <div className={`relative group ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      <select
        required={required}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{ appearance: "none", WebkitAppearance: "none", MozAppearance: "none" }}
        className={[
          "w-full pl-4 pr-10 py-3 rounded-xl text-sm font-medium outline-none cursor-pointer transition-all",
          "bg-[#06192c] border",
          "focus:ring-2 focus:ring-[#054a9d]/25 focus:border-[#054a9d]",
          "hover:border-white/25",
          empty ? "text-white/35 border-white/10" : "text-white border-white/20",
        ].join(" ")}
      >
        {children}
      </select>
      <ChevronDown
        className={[
          "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-all duration-200",
          empty ? "text-white/20" : "text-white/40",
          "group-focus-within:text-[#7ab0e8] group-focus-within:rotate-180",
        ].join(" ")}
      />
    </div>
  )
}

interface Props { onClose?: () => void; leadSource?: string }

const inputCls = `
  w-full px-4 py-3 rounded-xl text-white text-sm font-medium
  bg-[#06192c] border border-white/10
  placeholder:text-white/20
  focus:outline-none focus:border-[#054a9d] focus:ring-2 focus:ring-[#054a9d]/20
  transition-all
`

const labelCls = "block text-white/50 text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5"

type Step = 1 | 2

export function RegistrationForm({ onClose, leadSource }: Props) {
  const router = useRouter()
  const [step, setStep]           = useState<Step>(1)
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState("")
  const [showPass, setShowPass]   = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<HCaptcha>(null)
  const [customBrand, setCustomBrand] = useState(false)
  const [customModel, setCustomModel] = useState(false)

  const [form, setForm] = useState({
    first_name:        "",
    last_name:         "",
    dni:               "",
    phone:             "",
    email:             "",
    password:          "",
    license_plate:     "",
    car_brand:         "",
    car_model:         "",
    car_year:          "",
    city:              "",
    accepts_terms:     false,
    accepts_marketing: false,
  })

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  const step1Valid =
    form.first_name.trim().length > 1 &&
    form.last_name.trim().length > 1 &&
    form.dni.replace(/\D/g, "").length >= 7 &&
    form.phone.trim().length >= 8 &&
    form.email.includes("@") &&
    form.password.length >= 8

  const step2Valid =
    form.license_plate.trim().length >= 6 &&
    form.car_brand.trim().length > 0 &&
    form.car_model.trim().length > 0 &&
    !!form.car_year &&
    form.city.trim().length > 0 &&
    form.accepts_terms

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      if (!step1Valid) return
      setStep(2)
      return
    }
    if (!step2Valid) return
    if (HCAPTCHA_SITE_KEY && !captchaToken) {
      setError("Por favor completá el captcha para continuar.")
      return
    }
    setLoading(true)
    setError("")
    const result = await registerParticipant({ ...form, lead_source: leadSource }, captchaToken ?? undefined)
    if (result.ok) {
      setDone(true)
    } else {
      setError(result.error)
      captchaRef.current?.resetCaptcha()
      setCaptchaToken(null)
    }
    setLoading(false)
  }

  if (done) return (
    <div className="text-center py-6">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-white font-black uppercase text-2xl mb-2" style={{ fontFamily: "'ChevySans', sans-serif" }}>
        ¡Estás dentro!
      </h3>
      <p className="text-white/45 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
        Tu registro fue realizado correctamente. Ya podés comenzar a cargar tus pronósticos.
      </p>
      <button
        onClick={() => { onClose?.(); window.location.href = "/dashboard" }}
        className="bg-[#054a9d] hover:bg-[#1558b8] text-white font-black uppercase tracking-wide px-8 h-11 rounded-xl text-sm transition-colors"
        style={{ fontFamily: "'ChevySans', sans-serif" }}
      >
        Ir al Panel
      </button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">

      {/* Indicador de paso */}
      <div className="flex items-center gap-2 mb-2">
        {([1, 2] as Step[]).map(s => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                step >= s
                  ? "bg-[#054a9d] text-white"
                  : "bg-white/8 text-white/25"
              }`}
            >
              {s}
            </div>
            {s < 2 && <div className={`flex-1 h-px w-8 ${step > s ? "bg-[#054a9d]" : "bg-white/10"}`} />}
          </div>
        ))}
        <span className="text-white/25 text-[11px] ml-1">
          {step === 1 ? "Datos personales" : "Tu vehículo"}
        </span>
      </div>

      {step === 1 && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nombre</label>
              <input type="text" required placeholder="Juan"
                value={form.first_name} onChange={e => set("first_name", e.target.value)}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Apellido</label>
              <input type="text" required placeholder="Pérez"
                value={form.last_name} onChange={e => set("last_name", e.target.value)}
                className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>DNI</label>
              <input type="text" required placeholder="12345678"
                value={form.dni} onChange={e => set("dni", e.target.value)}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Celular</label>
              <input type="tel" required placeholder="+54 264 ..."
                value={form.phone} onChange={e => set("phone", e.target.value)}
                className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Correo electrónico</label>
            <input type="email" required placeholder="tu@email.com"
              value={form.email} onChange={e => set("email", e.target.value)}
              className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                value={form.password}
                onChange={e => set("password", e.target.value)}
                className={inputCls + " pr-11"}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!step1Valid}
            className="group w-full h-12 bg-[#054a9d] hover:bg-[#1558b8] disabled:opacity-40 disabled:cursor-not-allowed
                       text-white font-black uppercase tracking-wide rounded-xl text-sm
                       flex items-center justify-center gap-2 transition-all"
            style={{ fontFamily: "'ChevySans', sans-serif" }}
          >
            Continuar
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Patente</label>
              <input type="text" required placeholder="AA123BB"
                value={form.license_plate}
                onChange={e => set("license_plate", e.target.value.toUpperCase())}
                className={inputCls + " uppercase"} />
            </div>
            <div>
              <label className={labelCls}>Localidad</label>
              <input type="text" required placeholder="San Juan"
                value={form.city} onChange={e => set("city", e.target.value)}
                className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Marca</label>
              {customBrand ? (
                <div className="space-y-1">
                  <input type="text" required placeholder="Ej: Citroen"
                    value={form.car_brand} onChange={e => set("car_brand", e.target.value)}
                    className={inputCls} />
                  <button type="button"
                    onClick={() => { setCustomBrand(false); setCustomModel(false); set("car_brand", ""); set("car_model", "") }}
                    className="text-white/25 text-[10px] hover:text-white/50 transition-colors">
                    ← volver al listado
                  </button>
                </div>
              ) : (
                <SelectField required value={form.car_brand}
                  onChange={e => {
                    if (e.target.value === "__other__") {
                      setCustomBrand(true); setCustomModel(true)
                      set("car_brand", ""); set("car_model", "")
                    } else {
                      set("car_brand", e.target.value); set("car_model", ""); setCustomModel(false)
                    }
                  }}>
                  <option value="">Seleccioná una marca</option>
                  {CAR_BRANDS.map(b => <option key={b} value={b} className="bg-[#06192c] text-white">{b}</option>)}
                  <option value="__other__" className="bg-[#06192c] text-white/50">Otra marca...</option>
                </SelectField>
              )}
            </div>
            <div>
              <label className={labelCls}>Modelo</label>
              {(customBrand || customModel) ? (
                <div className="space-y-1">
                  <input type="text" required placeholder="Ej: Tracker"
                    value={form.car_model} onChange={e => set("car_model", e.target.value)}
                    className={inputCls} />
                  {!customBrand && (
                    <button type="button"
                      onClick={() => { setCustomModel(false); set("car_model", "") }}
                      className="text-white/25 text-[10px] hover:text-white/50 transition-colors">
                      ← volver al listado
                    </button>
                  )}
                </div>
              ) : (
                <SelectField required value={form.car_model}
                  onChange={e => {
                    if (e.target.value === "__other__") { setCustomModel(true); set("car_model", "") }
                    else { set("car_model", e.target.value) }
                  }}
                  disabled={!form.car_brand}>
                  <option value="">{form.car_brand ? "Seleccioná un modelo" : "Primero elegí marca"}</option>
                  {(CAR_MODELS_BY_BRAND[form.car_brand] ?? []).map(m => <option key={m} value={m} className="bg-[#06192c] text-white">{m}</option>)}
                  {form.car_brand && <option value="__other__" className="bg-[#06192c] text-white/50">Otro modelo...</option>}
                </SelectField>
              )}
            </div>
            <div>
              <label className={labelCls}>Año</label>
              <SelectField required value={form.car_year}
                onChange={e => set("car_year", e.target.value)}>
                <option value="">Año</option>
                {YEARS.map(y => <option key={y} value={String(y)} className="bg-[#06192c] text-white">{y}</option>)}
              </SelectField>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" required
                checked={form.accepts_terms}
                onChange={e => set("accepts_terms", e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#06192c] accent-[#054a9d] cursor-pointer shrink-0"
              />
              <span className="text-white/35 text-xs leading-relaxed">
                Acepto las{" "}
                <a href="/bases" target="_blank" className="text-[#7ab0e8] hover:text-white transition-colors underline underline-offset-2">
                  Bases y Condiciones
                </a>
                {" "}y los{" "}
                <a href="/terminos" target="_blank" className="text-[#7ab0e8] hover:text-white transition-colors underline underline-offset-2">
                  Términos y Condiciones
                </a>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox"
                checked={form.accepts_marketing}
                onChange={e => set("accepts_marketing", e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#06192c] accent-[#054a9d] cursor-pointer shrink-0"
              />
              <span className="text-white/35 text-xs leading-relaxed">
                Acepto recibir comunicaciones comerciales de Grupo Paris
              </span>
            </label>
          </div>

          {/* hCaptcha — solo renderiza si la site key está configurada */}
          {HCAPTCHA_SITE_KEY && (
            <div className="flex justify-center pt-1">
              <HCaptcha
                ref={captchaRef}
                sitekey={HCAPTCHA_SITE_KEY}
                onVerify={token => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
                theme="dark"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-xs font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => { setStep(1); setError("") }}
              className="h-12 bg-white/6 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white
                         font-bold uppercase tracking-wide rounded-xl text-sm transition-all"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={loading || !step2Valid || (!!HCAPTCHA_SITE_KEY && !captchaToken)}
              className="group h-12 bg-[#054a9d] hover:bg-[#1558b8] disabled:opacity-40 disabled:cursor-not-allowed
                         text-white font-black uppercase tracking-wide rounded-xl text-sm
                         flex items-center justify-center gap-2 transition-all"
              style={{ fontFamily: "'ChevySans', sans-serif" }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Registrando...
                </>
              ) : (
                <>
                  Registrarme
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </form>
  )
}
