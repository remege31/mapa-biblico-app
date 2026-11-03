// Datos compartidos de territorios históricos
// Usados en MapView.tsx (render) y App.tsx (búsqueda + panel)

import type { Lang } from './lang'

export const TERRITORY_COLORS: Record<string, string> = {
  'Egypt':                   '#C9A84C',
  'Assyria':                 '#8B3A3A',
  'Babylonia':               '#C0522A',
  'Hittites':                '#8B6914',
  'Elam':                    '#7A4A6A',
  'Israel':                  '#8B6A26',
  'Judah':                   '#B8963E',
  'Canaan':                  '#6B8E23',
  'Arameans':                '#8A7B6F',
  'Philistines':             '#8B7355',
  'Phoenicia':               '#4A7A8B',
  'Persia':                  '#A0522D',
  'Media':                   '#7A4A2E',
  'Urartu':                  '#6B4A8B',
  'Arabian pastoral nomads': '#6B6054',
  'Greek city-states':       '#3B6B8B',
  'Achaemenid Empire':                     '#A0522D',
  'Kingdom of David and Solomon':          '#8B6A26',
  'state societies and Aramaean kingdoms': '#8B6914',
  'Cimerians':                             '#6B6054',
  'Iranian pastoralists':                  '#8A7B6F',
  'Saharan pastoral nomads':               '#6B6054',
  'Illyrians':                             '#8A7B6F',
  'Blemmyes':                              '#6B6054',
  'Thrace':                                '#6B4A8B',
  'Kush':                                  '#7A4A6A',
  'Meroe':                                 '#7A4A6A',
  'Bell-shaped burials culture':           '#3B6B8B',
  'Karasuk culture':                       '#4A7A8B',
  'Urnfield cultures':                     '#3B6B8B',
  'Dravidians':                            '#4A7A8B',
  'Phrygians':                             '#8A7B6F',
  // bc1 — territorios NT (período helenístico-romano)
  'Roman Empire':                          '#8E4444',
  'Parthian Empire':                       '#A0522D',
  'Nabatean Kingdom':                      '#C08A3E',
  'Armenia':                               '#6B4A8B',
  'Judea':                                 '#B8963E',
  'default':                               '#8B7355',
}

export const TERRITORY_TYPE: Record<string, string> = {
  'Egypt':                   'Imperio',
  'Assyria':                 'Imperio',
  'Babylonia':               'Imperio',
  'Persia':                  'Imperio',
  'Hittites':                'Imperio',
  'Media':                   'Imperio',
  'Israel':                  'Reino',
  'Judah':                   'Reino',
  'Elam':                    'Reino',
  'Urartu':                  'Reino',
  'Canaan':                  'Región cultural',
  'Philistines':             'Región cultural',
  'Phoenicia':               'Región cultural',
  'Greek city-states':       'Región cultural',
  'Arameans':                'Zona tribal',
  'Arabian pastoral nomads': 'Zona tribal',
  'Achaemenid Empire':                     'Imperio',
  'Kingdom of David and Solomon':          'Reino',
  'state societies and Aramaean kingdoms': 'Reino',
  'Cimerians':                             'Zona tribal',
  'Iranian pastoralists':                  'Zona tribal',
  'Saharan pastoral nomads':               'Zona tribal',
  'Illyrians':                             'Zona tribal',
  'Blemmyes':                              'Zona tribal',
  'Thrace':                                'Región cultural',
  'Kush':                                  'Reino',
  'Meroe':                                 'Reino',
  'Bell-shaped burials culture':           'Región cultural',
  'Karasuk culture':                       'Región cultural',
  'Urnfield cultures':                     'Región cultural',
  'Dravidians':                            'Región cultural',
  'Phrygians':                             'Zona tribal',
  // bc1 — territorios NT
  'Roman Empire':                          'Imperio',
  'Parthian Empire':                       'Imperio',
  'Nabatean Kingdom':                      'Reino',
  'Armenia':                               'Reino',
  'Judea':                                 'Reino',
}

export const TERRITORY_NAMES_ES: Record<string, string> = {
  'Egypt':                   'Egipto',
  'Assyria':                 'Asiria',
  'Babylonia':               'Mesopotamia',
  'Hittites':                'Hititas',
  'Elam':                    'Elam',
  'Israel':                  'Israel',
  'Judah':                   'Judá',
  'Canaan':                  'Canaán',
  'Arameans':                'Arameos',
  'Philistines':             'Filisteos',
  'Phoenicia':               'Fenicia',
  'Persia':                  'Persia',
  'Media':                   'Media',
  'Urartu':                  'Urartu',
  'Arabian pastoral nomads': 'Pastores nómadas árabes',
  'Greek city-states':       'Ciudades-estado griegas',
  'Achaemenid Empire':                     'Imperio aqueménida',
  'Kingdom of David and Solomon':          'Reino unido de Israel',
  'state societies and Aramaean kingdoms': 'Reinos arameos',
  'Cimerians':                             'Cimerios',
  'Iranian pastoralists':                  'Pastores nómadas iranios',
  'Saharan pastoral nomads':               'Pastores nómadas del Sahara',
  'Illyrians':                             'Ilirios',
  'Blemmyes':                              'Blemios',
  'Thrace':                                'Tracia',
  'Kush':                                  'Reino de Kush',
  'Meroe':                                 'Reino de Meroë',
  'Bell-shaped burials culture':           'Cultura del vaso campaniforme',
  'Karasuk culture':                       'Cultura de Karasuk',
  'Urnfield cultures':                     'Cultura de los campos de urnas',
  'Dravidians':                            'Drávidas',
  'Phrygians':                             'Frigios',
  'Berbers':                'Bereberes',
  'Saba':                   'Saba',
  'Ethiopian highland farmers': 'Agricultores etíopes',
  'Celtiberians':           'Celtíberos',
  'Carthaginian Empire':    'Imperio cartaginés',
  'Etrurians':              'Etruscos',
  'Rome':                   'Roma',
  'Sabini':                 'Sabinos',
  'Samnites':               'Samnitas',
  'Boii':                   'Boyos',
  'Gandhāra':               'Gandhara',
  'Hindu kingdoms':         'Reinos hindúes',
  'Zhou states':            'Estados Zhou',
  'Saharan Pastoral Nomads': 'Pastores nómadas del Sahara',
  // bc2000 — territorios sin traducción detectados via auditoría GeoJSON
  'Hurrian Kingdoms':       'Reinos hurrites',
  'Semites':                'Semitas',
  'Anatolian tribes':       'Tribus anatolias',
  'Cycladic':               'Civilización cicládica',
  'Minoan':                 'Civilización minoica',
  'Kerma':                  'Reino de Kerma',
  'city-states':            'Ciudades-estado',
  'Andronovo':              'Cultura Andronovo',
  'Catacomb culture':       'Cultura de las catacumbas',
  // bc1 — territorios NT
  'Roman Empire':           'Imperio Romano',
  'Parthian Empire':        'Imperio Parto',
  'Nabatean Kingdom':       'Reino Nabateo',
  'Armenia':                'Armenia',
  'Judea':                  'Judea',
}

export function getTerritoryColor(name: string): string {
  for (const key of Object.keys(TERRITORY_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return TERRITORY_COLORS[key]
    }
  }
  return TERRITORY_COLORS['default']
}

export function getTerritoryType(name: string): string {
  for (const key of Object.keys(TERRITORY_TYPE)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return TERRITORY_TYPE[key]
    }
  }
  return ''
}

export function getTerritoryNameES(name: string): string {
  for (const key of Object.keys(TERRITORY_NAMES_ES)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return TERRITORY_NAMES_ES[key]
    }
  }
  return name
}

// Lista para la búsqueda — solo territorios principales del AT
export const TERRITORY_SEARCH_LIST: { nombreEN: string; nombreES: string }[] = [
  { nombreEN: 'Egypt',                        nombreES: 'Egipto' },
  { nombreEN: 'Assyria',                      nombreES: 'Asiria' },
  { nombreEN: 'Babylonia',                    nombreES: 'Mesopotamia / Babilonia' },
  { nombreEN: 'Hittites',                     nombreES: 'Hititas' },
  { nombreEN: 'Elam',                         nombreES: 'Elam' },
  { nombreEN: 'Israel',                       nombreES: 'Israel (reino)' },
  { nombreEN: 'Judah',                        nombreES: 'Judá (reino)' },
  { nombreEN: 'Canaan',                       nombreES: 'Canaán' },
  { nombreEN: 'Arameans',                     nombreES: 'Arameos' },
  { nombreEN: 'Philistines',                  nombreES: 'Filisteos' },
  { nombreEN: 'Phoenicia',                    nombreES: 'Fenicia' },
  { nombreEN: 'Persia',                       nombreES: 'Persia' },
  { nombreEN: 'Media',                        nombreES: 'Media' },
  { nombreEN: 'Urartu',                       nombreES: 'Urartu' },
  { nombreEN: 'Arabian pastoral nomads',      nombreES: 'Pastores nómadas árabes' },
  { nombreEN: 'Greek city-states',            nombreES: 'Ciudades-estado griegas' },
  { nombreEN: 'Achaemenid Empire',            nombreES: 'Imperio aqueménida' },
  { nombreEN: 'Kingdom of David and Solomon', nombreES: 'Reino unido de Israel' },
  { nombreEN: 'Kush',                         nombreES: 'Reino de Kush' },
  { nombreEN: 'Roman Empire',                 nombreES: 'Imperio Romano' },
  { nombreEN: 'Parthian Empire',              nombreES: 'Imperio Parto' },
  { nombreEN: 'Nabatean Kingdom',             nombreES: 'Reino Nabateo' },
  { nombreEN: 'Armenia',                      nombreES: 'Armenia' },
  { nombreEN: 'Judea',                        nombreES: 'Judea' },
]


/* i18n territorios */
const TERR_NAMES_IT: Record<string, string> = {
  "Egypt": "Egitto",
  "Assyria": "Assiria",
  "Babylonia": "Mesopotamia",
  "Hittites": "Ittiti",
  "Elam": "Elam",
  "Israel": "Israele",
  "Judah": "Giuda",
  "Canaan": "Canaan",
  "Arameans": "Aramei",
  "Philistines": "Filistei",
  "Phoenicia": "Fenicia",
  "Persia": "Persia",
  "Media": "Media",
  "Urartu": "Urartu",
  "Arabian pastoral nomads": "Nomadi pastori arabi",
  "Greek city-states": "Città-stato greche",
  "Achaemenid Empire": "Impero achemenide",
  "Kingdom of David and Solomon": "Regno unito d'Israele",
  "state societies and Aramaean kingdoms": "Regni aramei",
  "Cimerians": "Cimmeri",
  "Iranian pastoralists": "Nomadi pastori iranici",
  "Saharan pastoral nomads": "Nomadi pastori del Sahara",
  "Illyrians": "Illiri",
  "Blemmyes": "Blemmi",
  "Thrace": "Tracia",
  "Kush": "Regno di Kush",
  "Meroe": "Regno di Meroe",
  "Bell-shaped burials culture": "Cultura del vaso campaniforme",
  "Karasuk culture": "Cultura di Karasuk",
  "Urnfield cultures": "Cultura dei campi di urne",
  "Dravidians": "Dravidi",
  "Phrygians": "Frigi",
  "Berbers": "Berberi",
  "Saba": "Saba",
  "Ethiopian highland farmers": "Agricoltori etiopi",
  "Celtiberians": "Celtiberi",
  "Carthaginian Empire": "Impero cartaginese",
  "Etrurians": "Etruschi",
  "Rome": "Roma",
  "Sabini": "Sabini",
  "Samnites": "Sanniti",
  "Boii": "Boi",
  "Gandh\u0101ra": "Gandhara",
  "Hindu kingdoms": "Regni indù",
  "Zhou states": "Stati Zhou",
  "Saharan Pastoral Nomads": "Nomadi pastori del Sahara",
  "Hurrian Kingdoms": "Regni hurriti",
  "Semites": "Semiti",
  "Anatolian tribes": "Tribù anatoliche",
  "Cycladic": "Civiltà cicladica",
  "Minoan": "Civiltà minoica",
  "Kerma": "Regno di Kerma",
  "city-states": "Città-stato",
  "Andronovo": "Cultura di Andronovo",
  "Catacomb culture": "Cultura delle catacombe",
  "Roman Empire": "Impero Romano",
  "Parthian Empire": "Impero partico",
  "Nabatean Kingdom": "Regno nabateo",
  "Armenia": "Armenia",
  "Judea": "Giudea",
}
const TERR_NAMES_EN: Record<string, string> = {
  "Egypt": "Egypt",
  "Assyria": "Assyria",
  "Babylonia": "Mesopotamia",
  "Hittites": "Hittites",
  "Elam": "Elam",
  "Israel": "Israel",
  "Judah": "Judah",
  "Canaan": "Canaan",
  "Arameans": "Arameans",
  "Philistines": "Philistines",
  "Phoenicia": "Phoenicia",
  "Persia": "Persia",
  "Media": "Media",
  "Urartu": "Urartu",
  "Arabian pastoral nomads": "Arabian pastoral nomads",
  "Greek city-states": "Greek city-states",
  "Achaemenid Empire": "Achaemenid Empire",
  "Kingdom of David and Solomon": "United Kingdom of Israel",
  "state societies and Aramaean kingdoms": "Aramaean kingdoms",
  "Cimerians": "Cimmerians",
  "Iranian pastoralists": "Iranian pastoralists",
  "Saharan pastoral nomads": "Saharan pastoral nomads",
  "Illyrians": "Illyrians",
  "Blemmyes": "Blemmyes",
  "Thrace": "Thrace",
  "Kush": "Kingdom of Kush",
  "Meroe": "Kingdom of Meroë",
  "Bell-shaped burials culture": "Bell Beaker culture",
  "Karasuk culture": "Karasuk culture",
  "Urnfield cultures": "Urnfield culture",
  "Dravidians": "Dravidians",
  "Phrygians": "Phrygians",
  "Berbers": "Berbers",
  "Saba": "Sheba",
  "Ethiopian highland farmers": "Ethiopian highland farmers",
  "Celtiberians": "Celtiberians",
  "Carthaginian Empire": "Carthaginian Empire",
  "Etrurians": "Etruscans",
  "Rome": "Rome",
  "Sabini": "Sabines",
  "Samnites": "Samnites",
  "Boii": "Boii",
  "Gandh\u0101ra": "Gandhara",
  "Hindu kingdoms": "Hindu kingdoms",
  "Zhou states": "Zhou states",
  "Saharan Pastoral Nomads": "Saharan pastoral nomads",
  "Hurrian Kingdoms": "Hurrian kingdoms",
  "Semites": "Semites",
  "Anatolian tribes": "Anatolian tribes",
  "Cycladic": "Cycladic civilization",
  "Minoan": "Minoan civilization",
  "Kerma": "Kingdom of Kerma",
  "city-states": "City-states",
  "Andronovo": "Andronovo culture",
  "Catacomb culture": "Catacomb culture",
  "Roman Empire": "Roman Empire",
  "Parthian Empire": "Parthian Empire",
  "Nabatean Kingdom": "Nabatean Kingdom",
  "Armenia": "Armenia",
  "Judea": "Judea",
}
const CAT_IT: Record<string, string> = { 'Imperio': 'Impero', 'Reino': 'Regno', 'Región cultural': 'Regione culturale', 'Zona tribal': 'Zona tribale' }
const CAT_EN: Record<string, string> = { 'Imperio': 'Empire', 'Reino': 'Kingdom', 'Región cultural': 'Cultural region', 'Zona tribal': 'Tribal zone' }
export function getTerritoryName(lang: Lang, name: string): string {
  if (lang === 'es') return getTerritoryNameES(name)
  const map = lang === 'it' ? TERR_NAMES_IT : TERR_NAMES_EN
  for (const key of Object.keys(map)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return map[key]
  }
  return getTerritoryNameES(name)
}
export function getTerritoryCat(lang: Lang, name: string): string {
  const es = getTerritoryType(name)
  if (!es || lang === 'es') return es
  return (lang === 'it' ? CAT_IT : CAT_EN)[es] ?? es
}
