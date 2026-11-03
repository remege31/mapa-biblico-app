export type Lang = 'es' | 'en' | 'it'

const KEY = 'mapa-at:lang'

/* Idiomas activos en la interfaz. Para reactivar EN/IT basta con
   añadirlos aquí: ['es', 'en', 'it'] (los datos traducidos siguen en public/data/en|it). */
export const IDIOMAS_ACTIVOS: Lang[] = ['es']

export function initLang(): Lang {
  const activo = (l: string | null): l is Lang => IDIOMAS_ACTIVOS.includes(l as Lang)
  try {
    const saved = localStorage.getItem(KEY)
    if (activo(saved)) return saved
  } catch { /* almacenamiento no disponible */ }
  const nav = (navigator.language || 'es').toLowerCase().slice(0, 2)
  return activo(nav) ? nav : 'es'
}

export function saveLang(l: Lang): void {
  try { localStorage.setItem(KEY, l) } catch { /* ignore */ }
}

export function dataBase(l: Lang): string {
  return l === 'es' ? '/data' : `/data/${l}`
}
