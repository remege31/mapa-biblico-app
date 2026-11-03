// Períodos / épocas bíblicas y helpers de consulta.
// Extraído de App.tsx para reutilización y navegabilidad.

export const PERIODS = [
  { id: 'todos',        name: 'Todas las épocas',      range: '',                  ancla: '',                          testamento: 'ambos' as const },
  { id: 'bronce_medio', name: 'Edad de Bronce Media',  range: '2100–1550 a.C.',    ancla: 'los patriarcas',            testamento: 'AT'    as const },
  { id: 'bronce_tardio',name: 'Edad de Bronce Tardía', range: '1500–1200 a.C.',    ancla: 'el Éxodo',                  testamento: 'AT'    as const },
  { id: 'hierro_1',     name: 'Edad de Hierro I',      range: '1200–1000 a.C.',    ancla: 'la conquista y los jueces', testamento: 'AT'    as const },
  { id: 'hierro_2',     name: 'Edad de Hierro II',     range: '1000–586 a.C.',     ancla: 'los reyes y los profetas',  testamento: 'AT'    as const },
  { id: 'post_exilio',  name: 'Post-Exilio',           range: '586–400 a.C.',      ancla: 'el regreso del destierro',  testamento: 'AT'    as const },
  { id: 'vida_jesus',   name: 'Vida de Jesús',         range: '6 a.C.–33 d.C.',    ancla: 'los evangelios',            testamento: 'NT'    as const },
  { id: 'apostolico',   name: 'Época apostólica',      range: '33–70 d.C.',        ancla: 'Pablo y la iglesia primitiva', testamento: 'NT' as const },
]

export function getPeriodName(id: string): string {
  return PERIODS.find(p => p.id === id)?.name ?? PERIODS[2].name
}

export function getPeriodRange(id: string): string {
  return PERIODS.find(p => p.id === id)?.range ?? PERIODS[2].range
}

export function getPeriodAncla(id: string): string {
  return PERIODS.find(p => p.id === id)?.ancla ?? ''
}

export const KNOWN_PERIOD_IDS = new Set(['bronce_medio','bronce_tardio','hierro_1','hierro_2','post_exilio','vida_jesus','apostolico','todos'])

const ROMAN: Record<string, number> = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12,
}

// Clasifica un año a.C. (positivo) a su época del AT.
function clasificarAC(y: number): string {
  if (y >= 1551) return 'bronce_medio'
  if (y >= 1201) return 'bronce_tardio'
  if (y >= 1001) return 'hierro_1'
  if (y >= 587)  return 'hierro_2'
  return 'post_exilio'
}

/**
 * Clasifica el campo `periodo` de un personaje a un ID de época.
 * Acepta tanto un ID de época ('hierro_2') como una fecha en texto libre
 * ('c. 975 a.C.', 'Activo c. 740–700 a.C.', 'Narrativa, s. VIII a.C.').
 * Regla de frontera: se usa el año de FIN del rango (el más reciente), que
 * ubica al personaje por la culminación de su actividad (p. ej. David
 * 'c. 1010–970 a.C.' → hierro_2). Devuelve null si no puede resolverse.
 */
export function periodoAEpoca(periodo: string): string | null {
  if (!periodo) return null
  if (KNOWN_PERIOD_IDS.has(periodo)) return periodo === 'todos' ? null : periodo
  const dc = /d\.?\s?C\.|\bAD\b/.test(periodo)  // d.C. (es/it) o AD (en)
  const years = (periodo.match(/\d{3,4}/g) ?? []).map(n => parseInt(n, 10))
  if (years.length) {
    const y = Math.min(...years) // en a.C., el año de fin (más reciente) es el menor
    if (dc) return y <= 33 ? 'vida_jesus' : 'apostolico'
    return clasificarAC(y)
  }
  const m = periodo.match(/s\.\s*([IVXLC]+)/)
  if (m && ROMAN[m[1]]) return dc ? 'vida_jesus' : clasificarAC(ROMAN[m[1]] * 100 - 99)
  return null
}
