export interface Team {
  name: string
  code: string
}

export interface Match {
  id: number
  team1: Team
  team2: Team
  date: string
  time: string
  stage: string
  group?: string
  stadium: string
}

// Mapping de códigos de equipo a códigos ISO de país para las banderas
export const countryCodeMap: Record<string, string> = {
  MEX: "mx", RSA: "za", KOR: "kr", CZE: "cz", CAN: "ca", BIH: "ba",
  USA: "us", PAR: "py", QAT: "qa", SUI: "ch", BRA: "br", MAR: "ma",
  HAI: "ht", SCO: "gb-sct", AUS: "au", TUR: "tr", GER: "de", CUW: "cw",
  NED: "nl", JPN: "jp", CIV: "ci", ECU: "ec", SWE: "se", TUN: "tn",
  ESP: "es", CPV: "cv", BEL: "be", EGY: "eg", KSA: "sa", URU: "uy",
  IRN: "ir", NZL: "nz", FRA: "fr", SEN: "sn", IRQ: "iq", NOR: "no",
  ARG: "ar", ALG: "dz", AUT: "at", JOR: "jo", POR: "pt", COD: "cd",
  ENG: "gb-eng", CRO: "hr", GHA: "gh", PAN: "pa", UZB: "uz", COL: "co",
  ITA: "it", POL: "pl", DEN: "dk", WAL: "gb-wls", SRB: "rs", CMR: "cm",
  NGR: "ng", CHI: "cl", PER: "pe", VEN: "ve"
}

export const groupStageMatches: Match[] = [
  // Jueves, 11 de junio 2026
  { id: 1, team1: { name: "México", code: "MEX" }, team2: { name: "Sudáfrica", code: "RSA" }, date: "11 de Junio", time: "16:00", stage: "Fase de Grupos", group: "Grupo A", stadium: "Ciudad de México" },
  { id: 2, team1: { name: "Corea del Sur", code: "KOR" }, team2: { name: "República Checa", code: "CZE" }, date: "11 de Junio", time: "23:00", stage: "Fase de Grupos", group: "Grupo A", stadium: "Guadalajara" },

  // Viernes, 12 de junio 2026
  { id: 3, team1: { name: "Canadá", code: "CAN" }, team2: { name: "Bosnia y Herz.", code: "BIH" }, date: "12 de Junio", time: "16:00", stage: "Fase de Grupos", group: "Grupo B", stadium: "Toronto" },
  { id: 4, team1: { name: "Estados Unidos", code: "USA" }, team2: { name: "Paraguay", code: "PAR" }, date: "12 de Junio", time: "22:00", stage: "Fase de Grupos", group: "Grupo D", stadium: "Los Ángeles" },

  // Sábado, 13 de junio 2026
  { id: 5, team1: { name: "Catar", code: "QAT" }, team2: { name: "Suiza", code: "SUI" }, date: "13 de Junio", time: "16:00", stage: "Fase de Grupos", group: "Grupo B", stadium: "San Francisco" },
  { id: 6, team1: { name: "Brasil", code: "BRA" }, team2: { name: "Marruecos", code: "MAR" }, date: "13 de Junio", time: "19:00", stage: "Fase de Grupos", group: "Grupo C", stadium: "Nueva York" },
  { id: 7, team1: { name: "Haití", code: "HAI" }, team2: { name: "Escocia", code: "SCO" }, date: "13 de Junio", time: "22:00", stage: "Fase de Grupos", group: "Grupo C", stadium: "Boston" },

  // Domingo, 14 de junio 2026
  { id: 8, team1: { name: "Australia", code: "AUS" }, team2: { name: "Turquía", code: "TUR" }, date: "14 de Junio", time: "01:00", stage: "Fase de Grupos", group: "Grupo D", stadium: "Vancouver" },
  { id: 9, team1: { name: "Alemania", code: "GER" }, team2: { name: "Curazao", code: "CUW" }, date: "14 de Junio", time: "14:00", stage: "Fase de Grupos", group: "Grupo E", stadium: "Houston" },
  { id: 10, team1: { name: "Países Bajos", code: "NED" }, team2: { name: "Japón", code: "JPN" }, date: "14 de Junio", time: "17:00", stage: "Fase de Grupos", group: "Grupo F", stadium: "Dallas" },
  { id: 11, team1: { name: "Costa de Marfil", code: "CIV" }, team2: { name: "Ecuador", code: "ECU" }, date: "14 de Junio", time: "20:00", stage: "Fase de Grupos", group: "Grupo E", stadium: "Filadelfia" },
  { id: 12, team1: { name: "Suecia", code: "SWE" }, team2: { name: "Túnez", code: "TUN" }, date: "14 de Junio", time: "23:00", stage: "Fase de Grupos", group: "Grupo F", stadium: "Monterrey" },

  // Lunes, 15 de junio 2026
  { id: 13, team1: { name: "España", code: "ESP" }, team2: { name: "Cabo Verde", code: "CPV" }, date: "15 de Junio", time: "13:00", stage: "Fase de Grupos", group: "Grupo H", stadium: "Atlanta" },
  { id: 14, team1: { name: "Bélgica", code: "BEL" }, team2: { name: "Egipto", code: "EGY" }, date: "15 de Junio", time: "16:00", stage: "Fase de Grupos", group: "Grupo G", stadium: "Seattle" },
  { id: 15, team1: { name: "Arabia Saudí", code: "KSA" }, team2: { name: "Uruguay", code: "URU" }, date: "15 de Junio", time: "19:00", stage: "Fase de Grupos", group: "Grupo H", stadium: "Miami" },
  { id: 16, team1: { name: "Irán", code: "IRN" }, team2: { name: "Nueva Zelanda", code: "NZL" }, date: "15 de Junio", time: "22:00", stage: "Fase de Grupos", group: "Grupo G", stadium: "Los Ángeles" },

  // Martes, 16 de junio 2026
  { id: 17, team1: { name: "Francia", code: "FRA" }, team2: { name: "Senegal", code: "SEN" }, date: "16 de Junio", time: "16:00", stage: "Fase de Grupos", group: "Grupo I", stadium: "Nueva York" },
  { id: 18, team1: { name: "Irak", code: "IRQ" }, team2: { name: "Noruega", code: "NOR" }, date: "16 de Junio", time: "19:00", stage: "Fase de Grupos", group: "Grupo I", stadium: "Boston" },
  { id: 19, team1: { name: "Argentina", code: "ARG" }, team2: { name: "Argelia", code: "ALG" }, date: "16 de Junio", time: "22:00", stage: "Fase de Grupos", group: "Grupo J", stadium: "Kansas City" },

  // Miércoles, 17 de junio 2026
  { id: 20, team1: { name: "Austria", code: "AUT" }, team2: { name: "Jordania", code: "JOR" }, date: "17 de Junio", time: "01:00", stage: "Fase de Grupos", group: "Grupo J", stadium: "San Francisco" },
  { id: 21, team1: { name: "Portugal", code: "POR" }, team2: { name: "RD Congo", code: "COD" }, date: "17 de Junio", time: "14:00", stage: "Fase de Grupos", group: "Grupo K", stadium: "Houston" },
  { id: 22, team1: { name: "Inglaterra", code: "ENG" }, team2: { name: "Croacia", code: "CRO" }, date: "17 de Junio", time: "17:00", stage: "Fase de Grupos", group: "Grupo L", stadium: "Dallas" },
  { id: 23, team1: { name: "Ghana", code: "GHA" }, team2: { name: "Panamá", code: "PAN" }, date: "17 de Junio", time: "20:00", stage: "Fase de Grupos", group: "Grupo L", stadium: "Toronto" },
  { id: 24, team1: { name: "Uzbekistán", code: "UZB" }, team2: { name: "Colombia", code: "COL" }, date: "17 de Junio", time: "23:00", stage: "Fase de Grupos", group: "Grupo K", stadium: "Ciudad de México" },

  // Jueves, 18 de junio 2026 - Fecha 2
  { id: 25, team1: { name: "República Checa", code: "CZE" }, team2: { name: "Sudáfrica", code: "RSA" }, date: "18 de Junio", time: "13:00", stage: "Fase de Grupos", group: "Grupo A", stadium: "Atlanta" },
  { id: 26, team1: { name: "Suiza", code: "SUI" }, team2: { name: "Bosnia y Herz.", code: "BIH" }, date: "18 de Junio", time: "16:00", stage: "Fase de Grupos", group: "Grupo B", stadium: "Los Ángeles" },
  { id: 27, team1: { name: "Canadá", code: "CAN" }, team2: { name: "Catar", code: "QAT" }, date: "18 de Junio", time: "19:00", stage: "Fase de Grupos", group: "Grupo B", stadium: "Vancouver" },
  { id: 28, team1: { name: "México", code: "MEX" }, team2: { name: "Corea del Sur", code: "KOR" }, date: "18 de Junio", time: "22:00", stage: "Fase de Grupos", group: "Grupo A", stadium: "Guadalajara" },

  // Viernes, 19 de junio 2026
  { id: 29, team1: { name: "Estados Unidos", code: "USA" }, team2: { name: "Australia", code: "AUS" }, date: "19 de Junio", time: "16:00", stage: "Fase de Grupos", group: "Grupo D", stadium: "Seattle" },
  { id: 30, team1: { name: "Escocia", code: "SCO" }, team2: { name: "Marruecos", code: "MAR" }, date: "19 de Junio", time: "19:00", stage: "Fase de Grupos", group: "Grupo C", stadium: "Boston" },
  { id: 31, team1: { name: "Brasil", code: "BRA" }, team2: { name: "Haití", code: "HAI" }, date: "19 de Junio", time: "21:30", stage: "Fase de Grupos", group: "Grupo C", stadium: "Filadelfia" },

  // Sábado, 20 de junio 2026
  { id: 32, team1: { name: "Turquía", code: "TUR" }, team2: { name: "Paraguay", code: "PAR" }, date: "20 de Junio", time: "00:00", stage: "Fase de Grupos", group: "Grupo D", stadium: "San Francisco" },
  { id: 33, team1: { name: "Países Bajos", code: "NED" }, team2: { name: "Suecia", code: "SWE" }, date: "20 de Junio", time: "14:00", stage: "Fase de Grupos", group: "Grupo F", stadium: "Houston" },
  { id: 34, team1: { name: "Alemania", code: "GER" }, team2: { name: "Costa de Marfil", code: "CIV" }, date: "20 de Junio", time: "17:00", stage: "Fase de Grupos", group: "Grupo E", stadium: "Toronto" },
  { id: 35, team1: { name: "Ecuador", code: "ECU" }, team2: { name: "Curazao", code: "CUW" }, date: "20 de Junio", time: "21:00", stage: "Fase de Grupos", group: "Grupo E", stadium: "Kansas City" },

  // Domingo, 21 de junio 2026
  { id: 36, team1: { name: "Túnez", code: "TUN" }, team2: { name: "Japón", code: "JPN" }, date: "21 de Junio", time: "01:00", stage: "Fase de Grupos", group: "Grupo F", stadium: "Monterrey" },
  { id: 37, team1: { name: "España", code: "ESP" }, team2: { name: "Arabia Saudí", code: "KSA" }, date: "21 de Junio", time: "13:00", stage: "Fase de Grupos", group: "Grupo H", stadium: "Atlanta" },
  { id: 38, team1: { name: "Bélgica", code: "BEL" }, team2: { name: "Irán", code: "IRN" }, date: "21 de Junio", time: "16:00", stage: "Fase de Grupos", group: "Grupo G", stadium: "Los Ángeles" },
  { id: 39, team1: { name: "Uruguay", code: "URU" }, team2: { name: "Cabo Verde", code: "CPV" }, date: "21 de Junio", time: "19:00", stage: "Fase de Grupos", group: "Grupo H", stadium: "Miami" },
  { id: 40, team1: { name: "Nueva Zelanda", code: "NZL" }, team2: { name: "Egipto", code: "EGY" }, date: "21 de Junio", time: "22:00", stage: "Fase de Grupos", group: "Grupo G", stadium: "Vancouver" },

  // Lunes, 22 de junio 2026
  { id: 41, team1: { name: "Argentina", code: "ARG" }, team2: { name: "Austria", code: "AUT" }, date: "22 de Junio", time: "14:00", stage: "Fase de Grupos", group: "Grupo J", stadium: "Dallas" },
  { id: 42, team1: { name: "Francia", code: "FRA" }, team2: { name: "Irak", code: "IRQ" }, date: "22 de Junio", time: "18:00", stage: "Fase de Grupos", group: "Grupo I", stadium: "Filadelfia" },
  { id: 43, team1: { name: "Noruega", code: "NOR" }, team2: { name: "Senegal", code: "SEN" }, date: "22 de Junio", time: "21:00", stage: "Fase de Grupos", group: "Grupo I", stadium: "Nueva York" },

  // Martes, 23 de junio 2026
  { id: 44, team1: { name: "Jordania", code: "JOR" }, team2: { name: "Argelia", code: "ALG" }, date: "23 de Junio", time: "00:00", stage: "Fase de Grupos", group: "Grupo J", stadium: "San Francisco" },
  { id: 45, team1: { name: "Portugal", code: "POR" }, team2: { name: "Uzbekistán", code: "UZB" }, date: "23 de Junio", time: "14:00", stage: "Fase de Grupos", group: "Grupo K", stadium: "Houston" },
  { id: 46, team1: { name: "Inglaterra", code: "ENG" }, team2: { name: "Ghana", code: "GHA" }, date: "23 de Junio", time: "17:00", stage: "Fase de Grupos", group: "Grupo L", stadium: "Boston" },
  { id: 47, team1: { name: "Panamá", code: "PAN" }, team2: { name: "Croacia", code: "CRO" }, date: "23 de Junio", time: "20:00", stage: "Fase de Grupos", group: "Grupo L", stadium: "Toronto" },
  { id: 48, team1: { name: "Colombia", code: "COL" }, team2: { name: "RD Congo", code: "COD" }, date: "23 de Junio", time: "23:00", stage: "Fase de Grupos", group: "Grupo K", stadium: "Guadalajara" },

  // Miércoles, 24 de junio 2026 - Fecha 3
  { id: 49, team1: { name: "Suiza", code: "SUI" }, team2: { name: "Canadá", code: "CAN" }, date: "24 de Junio", time: "16:00", stage: "Fase de Grupos", group: "Grupo B", stadium: "Vancouver" },
  { id: 50, team1: { name: "Bosnia y Herz.", code: "BIH" }, team2: { name: "Catar", code: "QAT" }, date: "24 de Junio", time: "16:00", stage: "Fase de Grupos", group: "Grupo B", stadium: "Seattle" },
  { id: 51, team1: { name: "Escocia", code: "SCO" }, team2: { name: "Brasil", code: "BRA" }, date: "24 de Junio", time: "19:00", stage: "Fase de Grupos", group: "Grupo C", stadium: "Miami" },
  { id: 52, team1: { name: "Marruecos", code: "MAR" }, team2: { name: "Haití", code: "HAI" }, date: "24 de Junio", time: "19:00", stage: "Fase de Grupos", group: "Grupo C", stadium: "Atlanta" },
  { id: 53, team1: { name: "República Checa", code: "CZE" }, team2: { name: "México", code: "MEX" }, date: "24 de Junio", time: "22:00", stage: "Fase de Grupos", group: "Grupo A", stadium: "Ciudad de México" },
  { id: 54, team1: { name: "Sudáfrica", code: "RSA" }, team2: { name: "Corea del Sur", code: "KOR" }, date: "24 de Junio", time: "22:00", stage: "Fase de Grupos", group: "Grupo A", stadium: "Monterrey" },

  // Jueves, 25 de junio 2026
  { id: 55, team1: { name: "Curazao", code: "CUW" }, team2: { name: "Costa de Marfil", code: "CIV" }, date: "25 de Junio", time: "17:00", stage: "Fase de Grupos", group: "Grupo E", stadium: "Filadelfia" },
  { id: 56, team1: { name: "Ecuador", code: "ECU" }, team2: { name: "Alemania", code: "GER" }, date: "25 de Junio", time: "17:00", stage: "Fase de Grupos", group: "Grupo E", stadium: "Nueva York" },
  { id: 57, team1: { name: "Japón", code: "JPN" }, team2: { name: "Suecia", code: "SWE" }, date: "25 de Junio", time: "20:00", stage: "Fase de Grupos", group: "Grupo F", stadium: "Dallas" },
  { id: 58, team1: { name: "Túnez", code: "TUN" }, team2: { name: "Países Bajos", code: "NED" }, date: "25 de Junio", time: "20:00", stage: "Fase de Grupos", group: "Grupo F", stadium: "Kansas City" },
  { id: 59, team1: { name: "Turquía", code: "TUR" }, team2: { name: "Estados Unidos", code: "USA" }, date: "25 de Junio", time: "23:00", stage: "Fase de Grupos", group: "Grupo D", stadium: "Los Ángeles" },
  { id: 60, team1: { name: "Paraguay", code: "PAR" }, team2: { name: "Australia", code: "AUS" }, date: "25 de Junio", time: "23:00", stage: "Fase de Grupos", group: "Grupo D", stadium: "San Francisco" },

  // Viernes, 26 de junio 2026
  { id: 61, team1: { name: "Noruega", code: "NOR" }, team2: { name: "Francia", code: "FRA" }, date: "26 de Junio", time: "16:00", stage: "Fase de Grupos", group: "Grupo I", stadium: "Boston" },
  { id: 62, team1: { name: "Senegal", code: "SEN" }, team2: { name: "Irak", code: "IRQ" }, date: "26 de Junio", time: "16:00", stage: "Fase de Grupos", group: "Grupo I", stadium: "Toronto" },
  { id: 63, team1: { name: "Cabo Verde", code: "CPV" }, team2: { name: "Arabia Saudí", code: "KSA" }, date: "26 de Junio", time: "21:00", stage: "Fase de Grupos", group: "Grupo H", stadium: "Houston" },
  { id: 64, team1: { name: "Uruguay", code: "URU" }, team2: { name: "España", code: "ESP" }, date: "26 de Junio", time: "21:00", stage: "Fase de Grupos", group: "Grupo H", stadium: "Guadalajara" },

  // Sábado, 27 de junio 2026
  { id: 65, team1: { name: "Egipto", code: "EGY" }, team2: { name: "Irán", code: "IRN" }, date: "27 de Junio", time: "00:00", stage: "Fase de Grupos", group: "Grupo G", stadium: "Seattle" },
  { id: 66, team1: { name: "Nueva Zelanda", code: "NZL" }, team2: { name: "Bélgica", code: "BEL" }, date: "27 de Junio", time: "00:00", stage: "Fase de Grupos", group: "Grupo G", stadium: "Vancouver" },
  { id: 67, team1: { name: "Panamá", code: "PAN" }, team2: { name: "Inglaterra", code: "ENG" }, date: "27 de Junio", time: "18:00", stage: "Fase de Grupos", group: "Grupo L", stadium: "Nueva York" },
  { id: 68, team1: { name: "Croacia", code: "CRO" }, team2: { name: "Ghana", code: "GHA" }, date: "27 de Junio", time: "18:00", stage: "Fase de Grupos", group: "Grupo L", stadium: "Filadelfia" },
  { id: 69, team1: { name: "Colombia", code: "COL" }, team2: { name: "Portugal", code: "POR" }, date: "27 de Junio", time: "20:30", stage: "Fase de Grupos", group: "Grupo K", stadium: "Miami" },
  { id: 70, team1: { name: "RD Congo", code: "COD" }, team2: { name: "Uzbekistán", code: "UZB" }, date: "27 de Junio", time: "20:30", stage: "Fase de Grupos", group: "Grupo K", stadium: "Atlanta" },
  { id: 71, team1: { name: "Argelia", code: "ALG" }, team2: { name: "Austria", code: "AUT" }, date: "27 de Junio", time: "23:00", stage: "Fase de Grupos", group: "Grupo J", stadium: "Kansas City" },
  { id: 72, team1: { name: "Jordania", code: "JOR" }, team2: { name: "Argentina", code: "ARG" }, date: "27 de Junio", time: "23:00", stage: "Fase de Grupos", group: "Grupo J", stadium: "Dallas" },
]

export const knockoutMatches: Match[] = [
  // Dieciseisavos de final
  { id: 73, team1: { name: "2° Grupo A", code: "TBD" }, team2: { name: "2° Grupo B", code: "TBD" }, date: "28 de Junio", time: "16:00", stage: "Dieciseisavos", stadium: "Los Ángeles" },
  { id: 74, team1: { name: "1° Grupo C", code: "TBD" }, team2: { name: "2° Grupo F", code: "TBD" }, date: "29 de Junio", time: "14:00", stage: "Dieciseisavos", stadium: "Houston" },
  { id: 75, team1: { name: "1° Grupo E", code: "TBD" }, team2: { name: "3° Grupo A/B/C/D/F", code: "TBD" }, date: "29 de Junio", time: "17:30", stage: "Dieciseisavos", stadium: "Boston" },
  { id: 76, team1: { name: "1° Grupo F", code: "TBD" }, team2: { name: "2° Grupo C", code: "TBD" }, date: "29 de Junio", time: "22:00", stage: "Dieciseisavos", stadium: "Monterrey" },
  { id: 77, team1: { name: "2° Grupo E", code: "TBD" }, team2: { name: "2° Grupo I", code: "TBD" }, date: "30 de Junio", time: "14:00", stage: "Dieciseisavos", stadium: "Dallas" },
  { id: 78, team1: { name: "1° Grupo I", code: "TBD" }, team2: { name: "3° Grupo C/D/F/G/H", code: "TBD" }, date: "30 de Junio", time: "18:00", stage: "Dieciseisavos", stadium: "Nueva York" },
  { id: 79, team1: { name: "1° Grupo A", code: "TBD" }, team2: { name: "3° Grupo C/E/F/H/I", code: "TBD" }, date: "30 de Junio", time: "22:00", stage: "Dieciseisavos", stadium: "Ciudad de México" },
  { id: 80, team1: { name: "1° Grupo L", code: "TBD" }, team2: { name: "3° Grupo E/H/I/J/K", code: "TBD" }, date: "1 de Julio", time: "13:00", stage: "Dieciseisavos", stadium: "Atlanta" },
  { id: 81, team1: { name: "1° Grupo G", code: "TBD" }, team2: { name: "3° Grupo A/E/H/I/J", code: "TBD" }, date: "1 de Julio", time: "17:00", stage: "Dieciseisavos", stadium: "Seattle" },
  { id: 82, team1: { name: "1° Grupo D", code: "TBD" }, team2: { name: "3° Grupo B/E/F/I/J", code: "TBD" }, date: "1 de Julio", time: "21:00", stage: "Dieciseisavos", stadium: "San Francisco" },
  { id: 83, team1: { name: "1° Grupo H", code: "TBD" }, team2: { name: "2° Grupo J", code: "TBD" }, date: "2 de Julio", time: "16:00", stage: "Dieciseisavos", stadium: "Los Ángeles" },
  { id: 84, team1: { name: "2° Grupo K", code: "TBD" }, team2: { name: "2° Grupo L", code: "TBD" }, date: "2 de Julio", time: "20:00", stage: "Dieciseisavos", stadium: "Toronto" },
  { id: 85, team1: { name: "1° Grupo B", code: "TBD" }, team2: { name: "3° Grupo E/F/G/I/J", code: "TBD" }, date: "3 de Julio", time: "00:00", stage: "Dieciseisavos", stadium: "Vancouver" },
  { id: 86, team1: { name: "2° Grupo D", code: "TBD" }, team2: { name: "2° Grupo G", code: "TBD" }, date: "3 de Julio", time: "15:00", stage: "Dieciseisavos", stadium: "Dallas" },
  { id: 87, team1: { name: "1° Grupo J", code: "TBD" }, team2: { name: "2° Grupo H", code: "TBD" }, date: "3 de Julio", time: "19:00", stage: "Dieciseisavos", stadium: "Miami" },
  { id: 88, team1: { name: "1° Grupo K", code: "TBD" }, team2: { name: "3° Grupo D/E/I/J/L", code: "TBD" }, date: "3 de Julio", time: "22:30", stage: "Dieciseisavos", stadium: "Kansas City" },

  // Octavos de final
  { id: 89, team1: { name: "Ganador P73", code: "TBD" }, team2: { name: "Ganador P75", code: "TBD" }, date: "4 de Julio", time: "14:00", stage: "Octavos de Final", stadium: "Houston" },
  { id: 90, team1: { name: "Ganador P74", code: "TBD" }, team2: { name: "Ganador P77", code: "TBD" }, date: "4 de Julio", time: "18:00", stage: "Octavos de Final", stadium: "Filadelfia" },
  { id: 91, team1: { name: "Ganador P76", code: "TBD" }, team2: { name: "Ganador P78", code: "TBD" }, date: "5 de Julio", time: "17:00", stage: "Octavos de Final", stadium: "Nueva York" },
  { id: 92, team1: { name: "Ganador P79", code: "TBD" }, team2: { name: "Ganador P80", code: "TBD" }, date: "5 de Julio", time: "21:00", stage: "Octavos de Final", stadium: "Ciudad de México" },
  { id: 93, team1: { name: "Ganador P83", code: "TBD" }, team2: { name: "Ganador P84", code: "TBD" }, date: "6 de Julio", time: "16:00", stage: "Octavos de Final", stadium: "Dallas" },
  { id: 94, team1: { name: "Ganador P81", code: "TBD" }, team2: { name: "Ganador P82", code: "TBD" }, date: "6 de Julio", time: "21:00", stage: "Octavos de Final", stadium: "Seattle" },
  { id: 95, team1: { name: "Ganador P86", code: "TBD" }, team2: { name: "Ganador P88", code: "TBD" }, date: "7 de Julio", time: "13:00", stage: "Octavos de Final", stadium: "Atlanta" },
  { id: 96, team1: { name: "Ganador P85", code: "TBD" }, team2: { name: "Ganador P87", code: "TBD" }, date: "7 de Julio", time: "17:00", stage: "Octavos de Final", stadium: "Vancouver" },

  // Cuartos de final
  { id: 97, team1: { name: "Ganador P89", code: "TBD" }, team2: { name: "Ganador P90", code: "TBD" }, date: "9 de Julio", time: "17:00", stage: "Cuartos de Final", stadium: "Boston" },
  { id: 98, team1: { name: "Ganador P93", code: "TBD" }, team2: { name: "Ganador P94", code: "TBD" }, date: "10 de Julio", time: "16:00", stage: "Cuartos de Final", stadium: "Los Ángeles" },
  { id: 99, team1: { name: "Ganador P91", code: "TBD" }, team2: { name: "Ganador P92", code: "TBD" }, date: "11 de Julio", time: "18:00", stage: "Cuartos de Final", stadium: "Miami" },
  { id: 100, team1: { name: "Ganador P95", code: "TBD" }, team2: { name: "Ganador P96", code: "TBD" }, date: "11 de Julio", time: "22:00", stage: "Cuartos de Final", stadium: "Kansas City" },

  // Semifinales
  { id: 101, team1: { name: "Ganador P97", code: "TBD" }, team2: { name: "Ganador P98", code: "TBD" }, date: "14 de Julio", time: "16:00", stage: "Semifinal", stadium: "Dallas" },
  { id: 102, team1: { name: "Ganador P99", code: "TBD" }, team2: { name: "Ganador P100", code: "TBD" }, date: "15 de Julio", time: "16:00", stage: "Semifinal", stadium: "Atlanta" },

  // Tercer puesto
  { id: 103, team1: { name: "Perdedor SF1", code: "TBD" }, team2: { name: "Perdedor SF2", code: "TBD" }, date: "18 de Julio", time: "18:00", stage: "Tercer Puesto", stadium: "Miami" },

  // Final
  { id: 104, team1: { name: "Ganador SF1", code: "TBD" }, team2: { name: "Ganador SF2", code: "TBD" }, date: "19 de Julio", time: "16:00", stage: "FINAL", stadium: "Nueva York" },
]

export const allMatches = [...groupStageMatches, ...knockoutMatches]

export const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]

export const getMatchesByGroup = (group: string) =>
  groupStageMatches.filter(m => m.group === `Grupo ${group}`)

export const getMatchesByDate = (date: string) =>
  groupStageMatches.filter(m => m.date === date)

export const getMatchesByStage = (stage: string) =>
  allMatches.filter(m => m.stage === stage)
