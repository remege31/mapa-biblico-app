// Subtipos de pin que el usuario puede mostrar u ocultar desde "Capas y filtros".
// La forma y el color reproducen el sistema de pines (mapIcons.ts): forma + color.
import type { Lugar } from '../types/lugar'

export type SubtipoKey = 'lugar' | 'sublugar' | 'agua' | 'montania' | 'valle' | 'desierto'
export type SubtipoShape = 'circle' | 'square' | 'triangle' | 'triangle-down' | 'diamond'

export const SUBTIPOS_LUGARES: SubtipoKey[] = ['lugar', 'sublugar']
export const SUBTIPOS_NATURALEZA: SubtipoKey[] = ['agua', 'desierto', 'montania', 'valle']
const TODOS: SubtipoKey[] = [...SUBTIPOS_LUGARES, ...SUBTIPOS_NATURALEZA]

export const SUBTIPO_LEGEND: Record<SubtipoKey, { shape: SubtipoShape; color: string; labelKey: string }> = {
  lugar:    { shape: 'circle',        color: '#3C3C3C', labelKey: 'legend_cities' },
  sublugar: { shape: 'square',        color: '#3C3C3C', labelKey: 'legend_sub' },
  agua:     { shape: 'circle',        color: '#2E5F8A', labelKey: 'legend_agua' },
  montania: { shape: 'triangle',      color: '#4A7C4E', labelKey: 'legend_montania' },
  valle:    { shape: 'triangle-down', color: '#4A7C4E', labelKey: 'legend_valle' },
  desierto: { shape: 'diamond',       color: '#C9A84C', labelKey: 'legend_desierto' },
}

export function isSubtipoKey(v: unknown): v is SubtipoKey {
  return typeof v === 'string' && (TODOS as string[]).includes(v)
}

/* Subtipo de un lugar. Los territorios no tienen subtipo (los controla su capa). */
export function subtipoDe(l: Lugar): SubtipoKey | null {
  if (l.tipo === 'region_natural') return l.subtipo_natural ?? 'agua'
  if (l.tipo === 'ciudad') return l.jerarquia_pin === 'sublugar' ? 'sublugar' : 'lugar'
  return null
}
