-- ============================================================
-- FIXTURE COMPLETO — MUNDIAL FIFA 2026 (104 partidos)
-- Horarios en hora Argentina (UTC-3)
-- ET (UTC-4) + 1 hora = Argentina
-- Verificado contra fixture oficial FIFA
-- ============================================================

insert into matches (team1, team2, team1_flag, team2_flag, match_date, stage, group_name, venue) values

-- ══════════════════════════════════════════
-- FASE DE GRUPOS — FECHA 1
-- ══════════════════════════════════════════

-- Jueves 11 jun
('México',         'Sudáfrica',       '🇲🇽','🇿🇦', '2026-06-11 16:00:00-03', 'group', 'Grupo A', 'Estadio Ciudad de México'),
('Corea del Sur',  'Rep. Checa',      '🇰🇷','🇨🇿', '2026-06-11 23:00:00-03', 'group', 'Grupo A', 'Estadio Guadalajara'),

-- Viernes 12 jun
('Canadá',         'Bosnia y Herz.',  '🇨🇦','🇧🇦', '2026-06-12 16:00:00-03', 'group', 'Grupo B', 'Estadio Toronto'),
('Estados Unidos', 'Paraguay',        '🇺🇸','🇵🇾', '2026-06-12 22:00:00-03', 'group', 'Grupo D', 'Estadio Los Ángeles'),

-- Sábado 13 jun
('Catar',          'Suiza',           '🇶🇦','🇨🇭', '2026-06-13 16:00:00-03', 'group', 'Grupo B', 'Estadio Bahía de San Francisco'),
('Brasil',         'Marruecos',       '🇧🇷','🇲🇦', '2026-06-13 19:00:00-03', 'group', 'Grupo C', 'Estadio Nueva York Nueva Jersey'),
('Haití',          'Escocia',         '🇭🇹','🏴󠁧󠁢󠁳󠁣󠁴󠁿', '2026-06-13 22:00:00-03', 'group', 'Grupo C', 'Estadio Boston'),
('Australia',      'Turquía',         '🇦🇺','🇹🇷', '2026-06-14 01:00:00-03', 'group', 'Grupo D', 'Estadio BC Place Vancouver'),

-- Domingo 14 jun
('Alemania',       'Curazao',         '🇩🇪','🇨🇼', '2026-06-14 14:00:00-03', 'group', 'Grupo E', 'Estadio Houston'),
('Países Bajos',   'Japón',           '🇳🇱','🇯🇵', '2026-06-14 17:00:00-03', 'group', 'Grupo F', 'Estadio Dallas'),
('Costa de Marfil','Ecuador',         '🇨🇮','🇪🇨', '2026-06-14 20:00:00-03', 'group', 'Grupo E', 'Estadio Filadelfia'),
('Suecia',         'Túnez',           '🇸🇪','🇹🇳', '2026-06-14 23:00:00-03', 'group', 'Grupo F', 'Estadio Monterrey'),

-- Lunes 15 jun
('España',         'Cabo Verde',      '🇪🇸','🇨🇻', '2026-06-15 13:00:00-03', 'group', 'Grupo H', 'Estadio Atlanta'),
('Bélgica',        'Egipto',          '🇧🇪','🇪🇬', '2026-06-15 16:00:00-03', 'group', 'Grupo G', 'Estadio Seattle'),
('Arabia Saudí',   'Uruguay',         '🇸🇦','🇺🇾', '2026-06-15 19:00:00-03', 'group', 'Grupo H', 'Estadio Miami'),
('Irán',           'Nueva Zelanda',   '🇮🇷','🇳🇿', '2026-06-15 22:00:00-03', 'group', 'Grupo G', 'Estadio Los Ángeles'),

-- Martes 16 jun
('Francia',        'Senegal',         '🇫🇷','🇸🇳', '2026-06-16 16:00:00-03', 'group', 'Grupo I', 'Estadio Nueva York Nueva Jersey'),
('Irak',           'Noruega',         '🇮🇶','🇳🇴', '2026-06-16 19:00:00-03', 'group', 'Grupo I', 'Estadio Boston'),
('Argentina',      'Argelia',         '🇦🇷','🇩🇿', '2026-06-16 22:00:00-03', 'group', 'Grupo J', 'Estadio Kansas City'),
('Austria',        'Jordania',        '🇦🇹','🇯🇴', '2026-06-17 01:00:00-03', 'group', 'Grupo J', 'Estadio Bahía de San Francisco'),

-- Miércoles 17 jun
('Portugal',       'RD Congo',        '🇵🇹','🇨🇩', '2026-06-17 14:00:00-03', 'group', 'Grupo K', 'Estadio Houston'),
('Inglaterra',     'Croacia',         '🏴󠁧󠁢󠁥󠁮󠁧󠁿','🇭🇷', '2026-06-17 17:00:00-03', 'group', 'Grupo L', 'Estadio Dallas'),
('Ghana',          'Panamá',          '🇬🇭','🇵🇦', '2026-06-17 20:00:00-03', 'group', 'Grupo L', 'Estadio Toronto'),
('Uzbekistán',     'Colombia',        '🇺🇿','🇨🇴', '2026-06-17 23:00:00-03', 'group', 'Grupo K', 'Estadio Ciudad de México'),

-- ══════════════════════════════════════════
-- FASE DE GRUPOS — FECHA 2
-- ══════════════════════════════════════════

-- Jueves 18 jun
('Rep. Checa',     'Sudáfrica',       '🇨🇿','🇿🇦', '2026-06-18 13:00:00-03', 'group', 'Grupo A', 'Estadio Atlanta'),
('Suiza',          'Bosnia y Herz.',  '🇨🇭','🇧🇦', '2026-06-18 16:00:00-03', 'group', 'Grupo B', 'Estadio Los Ángeles'),
('Canadá',         'Catar',           '🇨🇦','🇶🇦', '2026-06-18 19:00:00-03', 'group', 'Grupo B', 'Estadio BC Place Vancouver'),
('México',         'Corea del Sur',   '🇲🇽','🇰🇷', '2026-06-18 22:00:00-03', 'group', 'Grupo A', 'Estadio Guadalajara'),

-- Viernes 19 jun
('Estados Unidos', 'Australia',       '🇺🇸','🇦🇺', '2026-06-19 16:00:00-03', 'group', 'Grupo D', 'Estadio Seattle'),
('Escocia',        'Marruecos',       '🏴󠁧󠁢󠁳󠁣󠁴󠁿','🇲🇦', '2026-06-19 19:00:00-03', 'group', 'Grupo C', 'Estadio Boston'),
('Brasil',         'Haití',           '🇧🇷','🇭🇹', '2026-06-19 22:30:00-03', 'group', 'Grupo C', 'Estadio Filadelfia'),
('Turquía',        'Paraguay',        '🇹🇷','🇵🇾', '2026-06-20 00:00:00-03', 'group', 'Grupo D', 'Estadio Bahía de San Francisco'),

-- Sábado 20 jun
('Países Bajos',   'Suecia',          '🇳🇱','🇸🇪', '2026-06-20 14:00:00-03', 'group', 'Grupo F', 'Estadio Houston'),
('Alemania',       'Costa de Marfil', '🇩🇪','🇨🇮', '2026-06-20 17:00:00-03', 'group', 'Grupo E', 'Estadio Toronto'),
('Ecuador',        'Curazao',         '🇪🇨','🇨🇼', '2026-06-20 22:00:00-03', 'group', 'Grupo E', 'Estadio Kansas City'),
('Túnez',          'Japón',           '🇹🇳','🇯🇵', '2026-06-21 01:00:00-03', 'group', 'Grupo F', 'Estadio Monterrey'),

-- Domingo 21 jun
('España',         'Arabia Saudí',    '🇪🇸','🇸🇦', '2026-06-21 13:00:00-03', 'group', 'Grupo H', 'Estadio Atlanta'),
('Bélgica',        'Irán',            '🇧🇪','🇮🇷', '2026-06-21 16:00:00-03', 'group', 'Grupo G', 'Estadio Los Ángeles'),
('Uruguay',        'Cabo Verde',      '🇺🇾','🇨🇻', '2026-06-21 19:00:00-03', 'group', 'Grupo H', 'Estadio Miami'),
('Nueva Zelanda',  'Egipto',          '🇳🇿','🇪🇬', '2026-06-21 22:00:00-03', 'group', 'Grupo G', 'Estadio BC Place Vancouver'),

-- Lunes 22 jun
('Argentina',      'Austria',         '🇦🇷','🇦🇹', '2026-06-22 14:00:00-03', 'group', 'Grupo J', 'Estadio Dallas'),
('Francia',        'Irak',            '🇫🇷','🇮🇶', '2026-06-22 18:00:00-03', 'group', 'Grupo I', 'Estadio Filadelfia'),
('Noruega',        'Senegal',         '🇳🇴','🇸🇳', '2026-06-22 21:00:00-03', 'group', 'Grupo I', 'Estadio Nueva York Nueva Jersey'),
('Jordania',       'Argelia',         '🇯🇴','🇩🇿', '2026-06-23 00:00:00-03', 'group', 'Grupo J', 'Estadio Bahía de San Francisco'),

-- Martes 23 jun
('Portugal',       'Uzbekistán',      '🇵🇹','🇺🇿', '2026-06-23 14:00:00-03', 'group', 'Grupo K', 'Estadio Houston'),
('Inglaterra',     'Ghana',           '🏴󠁧󠁢󠁥󠁮󠁧󠁿','🇬🇭', '2026-06-23 17:00:00-03', 'group', 'Grupo L', 'Estadio Boston'),
('Panamá',         'Croacia',         '🇵🇦','🇭🇷', '2026-06-23 20:00:00-03', 'group', 'Grupo L', 'Estadio Toronto'),
('Colombia',       'RD Congo',        '🇨🇴','🇨🇩', '2026-06-23 23:00:00-03', 'group', 'Grupo K', 'Estadio Guadalajara'),

-- ══════════════════════════════════════════
-- FASE DE GRUPOS — FECHA 3
-- ══════════════════════════════════════════

-- Miércoles 24 jun
('Suiza',          'Canadá',          '🇨🇭','🇨🇦', '2026-06-24 16:00:00-03', 'group', 'Grupo B', 'Estadio BC Place Vancouver'),
('Bosnia y Herz.', 'Catar',           '🇧🇦','🇶🇦', '2026-06-24 16:00:00-03', 'group', 'Grupo B', 'Estadio Seattle'),
('Escocia',        'Brasil',          '🏴󠁧󠁢󠁳󠁣󠁴󠁿','🇧🇷', '2026-06-24 19:00:00-03', 'group', 'Grupo C', 'Estadio Miami'),
('Marruecos',      'Haití',           '🇲🇦','🇭🇹', '2026-06-24 19:00:00-03', 'group', 'Grupo C', 'Estadio Atlanta'),
('Rep. Checa',     'México',          '🇨🇿','🇲🇽', '2026-06-24 22:00:00-03', 'group', 'Grupo A', 'Estadio Ciudad de México'),
('Sudáfrica',      'Corea del Sur',   '🇿🇦','🇰🇷', '2026-06-24 22:00:00-03', 'group', 'Grupo A', 'Estadio Monterrey'),

-- Jueves 25 jun
('Curazao',        'Costa de Marfil', '🇨🇼','🇨🇮', '2026-06-25 17:00:00-03', 'group', 'Grupo E', 'Estadio Filadelfia'),
('Ecuador',        'Alemania',        '🇪🇨','🇩🇪', '2026-06-25 17:00:00-03', 'group', 'Grupo E', 'Estadio Nueva York Nueva Jersey'),
('Japón',          'Suecia',          '🇯🇵','🇸🇪', '2026-06-25 20:00:00-03', 'group', 'Grupo F', 'Estadio Dallas'),
('Túnez',          'Países Bajos',    '🇹🇳','🇳🇱', '2026-06-25 20:00:00-03', 'group', 'Grupo F', 'Estadio Kansas City'),
('Turquía',        'Estados Unidos',  '🇹🇷','🇺🇸', '2026-06-25 23:00:00-03', 'group', 'Grupo D', 'Estadio Los Ángeles'),
('Paraguay',       'Australia',       '🇵🇾','🇦🇺', '2026-06-25 23:00:00-03', 'group', 'Grupo D', 'Estadio Bahía de San Francisco'),

-- Viernes 26 jun
('Noruega',        'Francia',         '🇳🇴','🇫🇷', '2026-06-26 16:00:00-03', 'group', 'Grupo I', 'Estadio Boston'),
('Senegal',        'Irak',            '🇸🇳','🇮🇶', '2026-06-26 16:00:00-03', 'group', 'Grupo I', 'Estadio Toronto'),
('Cabo Verde',     'Arabia Saudí',    '🇨🇻','🇸🇦', '2026-06-26 21:00:00-03', 'group', 'Grupo H', 'Estadio Houston'),
('Uruguay',        'España',          '🇺🇾','🇪🇸', '2026-06-26 21:00:00-03', 'group', 'Grupo H', 'Estadio Guadalajara'),
('Egipto',         'Irán',            '🇪🇬','🇮🇷', '2026-06-27 00:00:00-03', 'group', 'Grupo G', 'Estadio Seattle'),
('Nueva Zelanda',  'Bélgica',         '🇳🇿','🇧🇪', '2026-06-27 00:00:00-03', 'group', 'Grupo G', 'Estadio BC Place Vancouver'),

-- Sábado 27 jun
('Panamá',         'Inglaterra',      '🇵🇦','🏴󠁧󠁢󠁥󠁮󠁧󠁿', '2026-06-27 18:00:00-03', 'group', 'Grupo L', 'Estadio Nueva York Nueva Jersey'),
('Croacia',        'Ghana',           '🇭🇷','🇬🇭', '2026-06-27 18:00:00-03', 'group', 'Grupo L', 'Estadio Filadelfia'),
('Colombia',       'Portugal',        '🇨🇴','🇵🇹', '2026-06-27 20:30:00-03', 'group', 'Grupo K', 'Estadio Miami'),
('RD Congo',       'Uzbekistán',      '🇨🇩','🇺🇿', '2026-06-27 20:30:00-03', 'group', 'Grupo K', 'Estadio Atlanta'),
('Argelia',        'Austria',         '🇩🇿','🇦🇹', '2026-06-27 23:00:00-03', 'group', 'Grupo J', 'Estadio Kansas City'),
('Jordania',       'Argentina',       '🇯🇴','🇦🇷', '2026-06-27 23:00:00-03', 'group', 'Grupo J', 'Estadio Dallas'),

-- ══════════════════════════════════════════
-- DIECISEISAVOS DE FINAL
-- ══════════════════════════════════════════
-- P73 dom 28 jun 16:00
('2° Grupo A',     '2° Grupo B',      '🏳️','🏳️', '2026-06-28 16:00:00-03', 'round_of_32', null, 'Estadio Los Ángeles'),

-- P76 lun 29 15:00 | P74 lun 29 18:30 | P75 lun 29 23:00
('1° Grupo C',     '2° Grupo F',      '🏳️','🏳️', '2026-06-29 15:00:00-03', 'round_of_32', null, 'Estadio Houston'),
('1° Grupo E',     '3° A/B/C/D/F',   '🏳️','🏳️', '2026-06-29 18:30:00-03', 'round_of_32', null, 'Estadio Boston'),
('1° Grupo F',     '2° Grupo C',      '🏳️','🏳️', '2026-06-29 23:00:00-03', 'round_of_32', null, 'Estadio Monterrey'),

-- P78 mar 30 15:00 | P77 mar 30 19:00 | P79 mar 30 23:00
('2° Grupo E',     '2° Grupo I',      '🏳️','🏳️', '2026-06-30 15:00:00-03', 'round_of_32', null, 'Estadio Dallas'),
('1° Grupo I',     '3° C/D/F/G/H',   '🏳️','🏳️', '2026-06-30 19:00:00-03', 'round_of_32', null, 'Estadio Nueva York Nueva Jersey'),
('1° Grupo A',     '3° C/E/F/H/I',   '🏳️','🏳️', '2026-06-30 23:00:00-03', 'round_of_32', null, 'Estadio Ciudad de México'),

-- P80 mié 1/7 14:00 | P82 mié 1/7 18:00 | P81 mié 1/7 22:00
('1° Grupo L',     '3° E/H/I/J/K',   '🏳️','🏳️', '2026-07-01 14:00:00-03', 'round_of_32', null, 'Estadio Atlanta'),
('1° Grupo G',     '3° A/E/H/I/J',   '🏳️','🏳️', '2026-07-01 18:00:00-03', 'round_of_32', null, 'Estadio Seattle'),
('1° Grupo D',     '3° B/E/F/I/J',   '🏳️','🏳️', '2026-07-01 22:00:00-03', 'round_of_32', null, 'Estadio Bahía de San Francisco'),

-- P84 jue 2/7 17:00 | P83 jue 2/7 21:00 | P85 jue 2/7 00:00 (técnicamente madrugada vie 3)
('1° Grupo H',     '2° Grupo J',      '🏳️','🏳️', '2026-07-02 17:00:00-03', 'round_of_32', null, 'Estadio Los Ángeles'),
('2° Grupo K',     '2° Grupo L',      '🏳️','🏳️', '2026-07-02 21:00:00-03', 'round_of_32', null, 'Estadio Toronto'),
('1° Grupo B',     '3° E/F/G/I/J',   '🏳️','🏳️', '2026-07-03 00:00:00-03', 'round_of_32', null, 'Estadio BC Place Vancouver'),

-- P88 vie 3/7 16:00 | P86 vie 3/7 20:00 | P87 vie 3/7 23:30
('2° Grupo D',     '2° Grupo G',      '🏳️','🏳️', '2026-07-03 16:00:00-03', 'round_of_32', null, 'Estadio Dallas'),
('1° Grupo J',     '2° Grupo H',      '🏳️','🏳️', '2026-07-03 20:00:00-03', 'round_of_32', null, 'Estadio Miami'),
('1° Grupo K',     '3° D/E/I/J/L',   '🏳️','🏳️', '2026-07-03 23:30:00-03', 'round_of_32', null, 'Estadio Kansas City'),

-- ══════════════════════════════════════════
-- OCTAVOS DE FINAL
-- ══════════════════════════════════════════
-- P90 sáb 4/7 15:00 | P89 sáb 4/7 19:00
('Gan. P73',       'Gan. P75',        '🏳️','🏳️', '2026-07-04 15:00:00-03', 'round_of_16', null, 'Estadio Houston'),
('Gan. P74',       'Gan. P77',        '🏳️','🏳️', '2026-07-04 19:00:00-03', 'round_of_16', null, 'Estadio Filadelfia'),

('Gan. P76',       'Gan. P78',        '🏳️','🏳️', '2026-07-05 17:00:00-03', 'round_of_16', null, 'Estadio Nueva York Nueva Jersey'),
('Gan. P79',       'Gan. P80',        '🏳️','🏳️', '2026-07-05 21:00:00-03', 'round_of_16', null, 'Estadio Ciudad de México'),

('Gan. P83',       'Gan. P84',        '🏳️','🏳️', '2026-07-06 16:00:00-03', 'round_of_16', null, 'Estadio Dallas'),
('Gan. P81',       'Gan. P82',        '🏳️','🏳️', '2026-07-06 22:00:00-03', 'round_of_16', null, 'Estadio Seattle'),

('Gan. P86',       'Gan. P88',        '🏳️','🏳️', '2026-07-07 14:00:00-03', 'round_of_16', null, 'Estadio Atlanta'),
('Gan. P85',       'Gan. P87',        '🏳️','🏳️', '2026-07-07 18:00:00-03', 'round_of_16', null, 'Estadio BC Place Vancouver'),

-- ══════════════════════════════════════════
-- CUARTOS DE FINAL
-- ══════════════════════════════════════════
('Gan. P89',       'Gan. P90',        '🏳️','🏳️', '2026-07-09 18:00:00-03', 'quarterfinal', null, 'Estadio Boston'),
('Gan. P93',       'Gan. P94',        '🏳️','🏳️', '2026-07-10 17:00:00-03', 'quarterfinal', null, 'Estadio Los Ángeles'),
('Gan. P91',       'Gan. P92',        '🏳️','🏳️', '2026-07-11 19:00:00-03', 'quarterfinal', null, 'Estadio Miami'),
('Gan. P95',       'Gan. P96',        '🏳️','🏳️', '2026-07-11 23:00:00-03', 'quarterfinal', null, 'Estadio Kansas City'),

-- ══════════════════════════════════════════
-- SEMIFINALES
-- ══════════════════════════════════════════
('Gan. P97',       'Gan. P98',        '🏳️','🏳️', '2026-07-14 17:00:00-03', 'semifinal', null, 'Estadio Dallas'),
('Gan. P99',       'Gan. P100',       '🏳️','🏳️', '2026-07-15 17:00:00-03', 'semifinal', null, 'Estadio Atlanta'),

-- ══════════════════════════════════════════
-- TERCER PUESTO
-- ══════════════════════════════════════════
('Perd. P101',     'Perd. P102',      '🏳️','🏳️', '2026-07-18 19:00:00-03', 'third_place', null, 'Estadio Miami'),

-- ══════════════════════════════════════════
-- FINAL
-- ══════════════════════════════════════════
('Gan. P101',      'Gan. P102',       '🏳️','🏳️', '2026-07-19 17:00:00-03', 'final', null, 'Estadio Nueva York Nueva Jersey');
