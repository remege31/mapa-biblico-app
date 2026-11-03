// Glosarios temáticos del menú: agrupan los rasgos naturales del mapa por tipo
// (agua, montes, valles, desierto) con una introducción breve y la lista de
// lugares, cada uno abre su ficha.
import { useState } from 'react'
import type { Lugar } from '../types/lugar'
import type { Lang } from '../data/lang'
import { t } from '../data/ui'
import { SUBTIPOS_NATURALEZA, SUBTIPO_LEGEND, type SubtipoKey } from '../data/subtipos'

export function Glosarios({ lugares, onSelectLugar, lang, activoLugarId }: {
  activoLugarId?: string
  lugares: Lugar[]
  onSelectLugar: (l: Lugar) => void
  lang: Lang
}) {
  const [abierto, setAbierto] = useState<SubtipoKey | null>(null)
  return (
    <>
      <div className="menu-section-label">{t(lang, 'glossaries')}</div>
      <div className="menu-list">
        {SUBTIPOS_NATURALEZA.map(k => {
          const items = lugares
            .filter(l => l.tipo === 'region_natural' && (l.subtipo_natural ?? 'agua') === k)
            .sort((a, b) => a.nombre.localeCompare(b.nombre, lang))
          if (items.length === 0) return null
          const def = SUBTIPO_LEGEND[k]
          const open = abierto === k
          return (
            <div className="acc" key={k}>
              <button type="button" className={`acc-h${open ? ' open' : ''}`} aria-expanded={open}
                onClick={() => setAbierto(open ? null : k)}>
                <span className="acc-title">
                  <span className={`lg-ico lg-${def.shape}`} style={{ background: def.color }} aria-hidden="true" />
                  {t(lang, `gl_${k}_t`)} <span className="idx-count">{items.length}</span>
                </span>
                <span className={`acc-ch${open ? ' open' : ''}`}>▼</span>
              </button>
              {open && (
                <div className="acc-body">
                  <p className="gl-intro">{t(lang, `gl_${k}_p`)}</p>
                  <div className="idx-list">
                    {items.map(l => (
                      <button key={l.id} type="button" className={`idx-item${l.id === activoLugarId ? ' is-active' : ''}`} aria-current={l.id === activoLugarId ? 'true' : undefined} onClick={() => onSelectLugar(l)}>{l.nombre}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
