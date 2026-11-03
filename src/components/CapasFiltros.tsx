// "Capas y filtros": botón plegable que abre un panel con las capas del mapa.
// La leyenda de pines hace de filtro: cada fila de subtipo muestra la forma y el
// color reales del pin y lo muestra u oculta.
import type { Lang } from '../data/lang'
import { t } from '../data/ui'
import {
  SUBTIPOS_LUGARES, SUBTIPOS_NATURALEZA, SUBTIPO_LEGEND, type SubtipoKey,
} from '../data/subtipos'

/* El estado (encendido/apagado) lo marca la clase `on` del botón padre */
function Interruptor() {
  return <span className="lt-switch" aria-hidden="true"><span className="lt-knob" /></span>
}

function FilaSubtipo({ lang, clave, visible, capaActiva, onToggle }: {
  lang: Lang; clave: SubtipoKey; visible: boolean; capaActiva: boolean; onToggle: (k: SubtipoKey) => void
}) {
  const def = SUBTIPO_LEGEND[clave]
  return (
    <button
      type="button"
      className={`layer-toggle layer-sub${visible ? ' on' : ''}`}
      aria-pressed={visible}
      disabled={!capaActiva}
      onClick={() => onToggle(clave)}
    >
      <span className={`lg-ico lg-${def.shape}`} style={{ background: def.color }} aria-hidden="true" />
      <span className="lt-name">{t(lang, def.labelKey)}</span>
      <Interruptor />
    </button>
  )
}

export function CapasFiltros({
  lang, open, onOpenChange,
  lugaresActive, onLugares, territoriosActive, onTerritorios, periodId,
  rutasActive, onRutas, naturalezaActive, onNaturaleza,
  ocultos, onToggleSubtipo, mapaActual, onMapaActual,
}: {
  lang: Lang
  open: boolean
  onOpenChange: (o: boolean) => void
  lugaresActive: boolean; onLugares: () => void
  territoriosActive: boolean; onTerritorios: () => void; periodId: string
  rutasActive: boolean; onRutas: () => void
  naturalezaActive: boolean; onNaturaleza: () => void
  ocultos: SubtipoKey[]
  onToggleSubtipo: (k: SubtipoKey) => void
  mapaActual: boolean; onMapaActual: () => void
}) {
  const sinEpoca = periodId === 'todos'
  return (
    <>
      {open && (
        <div id="layers-panel" className="layers-card layers-card-open" role="group" aria-label={t(lang, 'layers_aria')}>
          <div className="layers-title">{t(lang, 'layers_hdr')}</div>

          <button type="button" className={`layer-toggle${territoriosActive ? ' on' : ''}`} aria-pressed={territoriosActive}
            disabled={sinEpoca} onClick={onTerritorios}
            title={sinEpoca ? t(lang, 'terr_title_off') : t(lang, 'terr_title_on')}>
            <span className="lt-name">{t(lang, 'territories')}</span>
            <Interruptor />
          </button>
          {sinEpoca && <div className="layer-hint">{t(lang, 'terr_need_period')}</div>}

          <button type="button" data-capa="rutas" className={`layer-toggle${rutasActive ? ' on' : ''}`} aria-pressed={rutasActive}
            onClick={onRutas} title={t(lang, 'routes_title')}>
            <span className="lt-name">{t(lang, 'routes')}</span>
            <Interruptor />
          </button>

          <button type="button" className={`layer-toggle${naturalezaActive ? ' on' : ''}`} aria-pressed={naturalezaActive}
            onClick={onNaturaleza} title={t(lang, 'nature_title')}>
            <span className="lt-name">{t(lang, 'nature')}</span>
            <Interruptor />
          </button>
          {SUBTIPOS_NATURALEZA.map(k => (
            <FilaSubtipo key={k} lang={lang} clave={k} visible={!ocultos.includes(k)} capaActiva={naturalezaActive} onToggle={onToggleSubtipo} />
          ))}

          <button type="button" className={`layer-toggle${lugaresActive ? ' on' : ''}`} aria-pressed={lugaresActive}
            onClick={onLugares} title={t(lang, 'places_title')}>
            <span className="lt-name">{t(lang, 'places')}</span>
            <Interruptor />
          </button>
          {SUBTIPOS_LUGARES.map(k => (
            <FilaSubtipo key={k} lang={lang} clave={k} visible={!ocultos.includes(k)} capaActiva={lugaresActive} onToggle={onToggleSubtipo} />
          ))}

          <div className="layers-sep" />
          <button type="button" className={`layer-toggle${mapaActual ? ' on' : ''}`} aria-pressed={mapaActual}
            onClick={onMapaActual} title={t(lang, 'base_modern_title')}>
            <span className="lt-name">{t(lang, 'base_modern')}</span>
            <Interruptor />
          </button>
        </div>
      )}
      <button
        type="button"
        className="layers-pill"
        aria-expanded={open}
        aria-controls="layers-panel"
        onClick={() => onOpenChange(!open)}
      >
        <span aria-hidden="true">⚑</span>
        <span>{t(lang, 'layers_btn')}</span>
        <span className={`layers-pill-ch${open ? ' open' : ''}`} aria-hidden="true">▲</span>
      </button>
    </>
  )
}
