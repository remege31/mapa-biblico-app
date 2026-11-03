import type { Lugar } from '../types/lugar'

// ─── Helpers de filtrado por testamento ────────────────────────────────────
export function hasAT(lugar: Lugar): boolean {
  // Lugar AT si: tiene sección at explícita, o es legacy (sin sección nt), o tiene historias en raíz
  return lugar.at !== undefined || lugar.nt === undefined || (lugar.historias?.length ?? 0) > 0
}

export function hasNT(lugar: Lugar): boolean {
  return lugar.nt !== undefined
}
