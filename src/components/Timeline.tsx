import { Fragment } from 'react'
import type { RefObject } from 'react'
import { PERIODS } from '../data/periods'
import type { Lang } from '../data/lang'
import { t, periodName, periodRange, periodAncla } from '../data/ui'

/* ─── Timeline de épocas (línea de tiempo inferior) ───────────────────────────
   Reemplaza el dropdown por una línea de tiempo pegada al borde inferior.
   Marcas discretas en orden cronológico; "Todas las épocas" como reset; eras
   fuera del testamento activo atenuadas; eras NT en terracota; divisor visual
   entre Antiguo y Nuevo Testamento. Scroll horizontal si no caben. Cada marca
   es un botón accesible por teclado. */
export function Timeline({ activeId, onSelect, isDisabled, resetRef, lang }: {
  activeId: string
  onSelect: (id: string) => void
  isDisabled: (p: typeof PERIODS[number]) => boolean
  resetRef?: RefObject<HTMLButtonElement | null>
  lang: Lang
}) {
  const eras = PERIODS.filter(p => p.id !== 'todos')
  return (
    <div id="timeline-ctl" role="group" aria-label={t(lang, 'eras_aria')}>
      <div className="timeline-card">
        <button
          ref={resetRef}
          type="button"
          className={`tl-reset${activeId === 'todos' ? ' active' : ''}`}
          aria-pressed={activeId === 'todos'}
          onClick={() => onSelect('todos')}
          title={t(lang, 'all_eras_title')}
        >
          {t(lang, 'all_eras')}
        </button>
        <div className="tl-track">
          {eras.map((p, i) => {
            const disabled = isDisabled(p)
            const selected = p.id === activeId
            const isNT = p.testamento === 'NT'
            const prev = eras[i - 1]
            const boundary = prev && prev.testamento !== 'NT' && isNT
            return (
              <Fragment key={p.id}>
                {boundary && <span className="tl-boundary" aria-hidden="true" />}
                <button
                  type="button"
                  data-era={p.id}
                  className={`tl-node${selected ? ' selected' : ''}${disabled ? ' dimmed' : ''}${isNT ? ' nt' : ''}`}
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => onSelect(p.id)}
                  title={disabled
                    ? t(lang, 'era_disabled')
                    : `${periodRange(lang, p.id)}${periodAncla(lang, p.id) ? ' · ' + periodAncla(lang, p.id) : ''}`}
                >
                  <span className="tl-dot" aria-hidden="true" />
                  <span className="tl-node-name">{periodName(lang, p.id)}</span>
                  <span className="tl-node-range">{periodRange(lang, p.id)}</span>
                </button>
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
