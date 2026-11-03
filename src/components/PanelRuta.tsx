import type { Lugar, RutaSeleccionada } from '../types/lugar'
import { WAYPOINTS } from '../data/waypoints'
import { haversineKm } from '../utils/geo'
import type { Lang } from '../data/lang'
import { t, LangContext, periodName, periodRange } from '../data/ui'
import { esCitaBiblica, refHref } from '../data/refs'
import { DrawerHeader } from './InfoCards'

export function PanelRuta({ ruta, lugares, onClose, onBack, onSelectLugar, activeViajeIdx, onNavigateViaje, lang }: {
  ruta: RutaSeleccionada
  lugares: Lugar[]
  onClose: () => void
  onBack?: () => void
  onSelectLugar: (l: Lugar) => void
  activeViajeIdx: number
  onNavigateViaje: (idx: number) => void
  lang: Lang
}) {
  const lugarMap = new Map(lugares.map(l => [l.id, l]))
  const viajes = ruta.viajes
  const hasViajes = viajes && viajes.length > 1
  const viajeActual = hasViajes ? viajes[activeViajeIdx] : null
  const rutaActual = viajeActual ? viajeActual.ruta : ruta.ruta
  const refsActuales = viajeActual?.referencias?.length ? viajeActual.referencias : ruta.referencias

  // T4.1: km de la ruta (línea recta entre paradas, aproximado). Incluye
  // waypoints sin JSON propio. segKm[i] = distancia de la parada i a la i+1.
  const coordOf = (id: string): [number, number] | null => {
    const l = lugarMap.get(id)
    if (l) return [l.lat, l.lng]
    return WAYPOINTS[id] ?? null
  }
  const segKm: (number | null)[] = []
  let totalKm = 0
  for (let i = 1; i < rutaActual.length; i++) {
    const a = coordOf(rutaActual[i - 1]), b = coordOf(rutaActual[i])
    if (a && b) { const d = haversineKm(a, b); segKm[i - 1] = d; totalKm += d }
    else segKm[i - 1] = null
  }
  const totalKmRound = Math.round(totalKm / 10) * 10
  const kmTitle = t(lang, 'km_title')

  return (
    <LangContext.Provider value={lang}>
    <>
      <DrawerHeader title={`${t(lang, 'route_of')} ${ruta.nombre}`} onClose={onClose} onBack={onBack} backLabel={t(lang, 'back_prev')} />
      <div style={{ height: 3, background: ruta.color, flexShrink: 0 }} />
      <div id="panel-body" className="panel-body-scroll">

        {/* Header personaje */}
        <div className="person-head" style={{ paddingBottom: 12, borderBottom: '1px solid var(--divider, #e8e2d8)', marginBottom: 0 }}>
          <div>
            <div className="pname">{ruta.nombre}</div>
            <div className="prole" style={{ color: ruta.color }}>{ruta.rol}{ruta.rol && ruta.periodo ? ' · ' : ''}{periodName(lang, ruta.periodo)}</div>
            {periodRange(lang, ruta.periodo) && <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 2 }}>{periodRange(lang, ruta.periodo)}</div>}
          </div>
        </div>

        {/* T4.1: resumen de distancia (aproximada) */}
        {totalKmRound > 0 && (
          <div title={kmTitle} style={{ display: 'flex', alignItems: 'baseline', gap: 6, padding: '10px 0 2px' }}>
            <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>≈ {totalKmRound} km</span>
            <span style={{ fontSize: 13, color: 'var(--gray)' }}>· {rutaActual.length} {t(lang, 'stops')}</span>
          </div>
        )}

        {/* Navegador de viajes */}
        {hasViajes && (
          <div style={{
            padding: '10px 14px', borderBottom: '1px solid var(--divider, #e8e2d8)',
            background: 'var(--surface-1, #F0EBE2)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>
              {t(lang, 'journey').toUpperCase()} {activeViajeIdx + 1} {t(lang, 'of_word').toUpperCase()} {viajes.length}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', flex: 1 }}>
                {viajeActual?.nombre}
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button
                  onClick={() => onNavigateViaje(Math.max(0, activeViajeIdx - 1))}
                  disabled={activeViajeIdx === 0}
                  style={{
                    width: 26, height: 26, borderRadius: 6,
                    border: '1px solid var(--divider, #e8e2d8)',
                    background: 'var(--surface-2, #FAF5EE)',
                    cursor: activeViajeIdx === 0 ? 'default' : 'pointer',
                    fontSize: 14, color: 'var(--ink)', opacity: activeViajeIdx === 0 ? 0.3 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >←</button>
                <button
                  onClick={() => onNavigateViaje(Math.min(viajes.length - 1, activeViajeIdx + 1))}
                  disabled={activeViajeIdx === viajes.length - 1}
                  style={{
                    width: 26, height: 26, borderRadius: 6,
                    border: '1px solid var(--divider, #e8e2d8)',
                    background: 'var(--surface-2, #FAF5EE)',
                    cursor: activeViajeIdx === viajes.length - 1 ? 'default' : 'pointer',
                    fontSize: 14, color: 'var(--ink)', opacity: activeViajeIdx === viajes.length - 1 ? 0.3 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >→</button>
              </div>
            </div>
            {/* Dots de progreso */}
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 7 }}>
              {viajes.map((_v, i) => (
                <button
                  key={i}
                  onClick={() => onNavigateViaje(i)}
                  style={{
                    width: i === activeViajeIdx ? 14 : 5,
                    height: 5, borderRadius: 3,
                    background: i === activeViajeIdx ? ruta.color : 'var(--divider, #e8e2d8)',
                    border: 'none', padding: 0, cursor: 'pointer',
                    transition: 'width 0.2s, background 0.2s',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {ruta.descripcion && !hasViajes && <p className="desc" style={{ marginBottom: 14, marginTop: 12 }}>{ruta.descripcion}</p>}

        {/* Timeline de paradas */}
        <div className="sec-label" style={{ marginTop: 14 }}>{t(lang, 'paradas')}</div>
        <div style={{ position: 'relative', paddingLeft: 28, marginTop: 10 }}>
          <div style={{
            position: 'absolute', left: 7, top: 10, bottom: 10,
            width: 2, background: `linear-gradient(to bottom, ${ruta.color}, ${ruta.color}30)`,
            borderRadius: 1,
          }} />

          {rutaActual.map((id, i) => {
            const lugar = lugarMap.get(id)
            const isLast = i === rutaActual.length - 1
            const tipoLabel = lugar?.tipo === 'ciudad' ? t(lang, 'tipo_ciudad') : lugar?.tipo === 'territorio' ? t(lang, 'tipo_territorio') : t(lang, 'tipo_natural')
            const tipoDisplay = lugar?.subtipo_geo ?? tipoLabel
            const importancia = lugar?.importancia_estrategica
            const snippet = importancia && importancia.length > 80 ? importancia.slice(0, 80) + '…' : importancia
            const truncated = importancia ? importancia.length > 80 : false

            return (
              <div key={id + i} style={{ position: 'relative', paddingBottom: isLast ? 4 : 16 }}>
                <div style={{
                  position: 'absolute', left: -21, top: 3,
                  width: 14, height: 14, borderRadius: '50%',
                  background: ruta.color, border: `2px solid ${ruta.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{i + 1}</span>
                </div>

                {lugar ? (
                  <button onClick={() => onSelectLugar(lugar)} style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    fontSize: 15, fontWeight: 600, color: ruta.color,
                    textDecoration: 'underline', textDecorationColor: `${ruta.color}44`,
                    textUnderlineOffset: '2px', textAlign: 'left', fontFamily: 'inherit',
                  }}>
                    {lugar.nombre}
                  </button>
                ) : (
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{id}</div>
                )}

                {lugar && <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 1 }}>{tipoDisplay}</div>}
                {snippet && <div style={{ fontSize: 13, color: 'var(--text-secondary, #6B6560)', marginTop: 3, lineHeight: 1.45 }}>{snippet}</div>}
                {lugar && (
                  <button onClick={() => onSelectLugar(lugar)} style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    fontSize: 13, color: ruta.color, fontFamily: 'inherit',
                    marginTop: 4, display: 'flex', alignItems: 'center', gap: 3,
                    opacity: truncated ? 1 : 0.7,
                  }}>
                    {truncated ? t(lang, 'leer_mas') : t(lang, 'ver_lugar')}
                  </button>
                )}

                {/* T4.1: km al siguiente tramo (aproximado) */}
                {!isLast && segKm[i] != null && (
                  <div title={kmTitle} style={{ fontSize: 11, color: 'var(--gray)', marginTop: 8, letterSpacing: '0.02em' }}>
                    ≈ {Math.max(5, Math.round((segKm[i] as number) / 5) * 5)} km
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Referencias */}
        {refsActuales.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--divider, #e8e2d8)' }}>
            <div className="sec-label">{t(lang, 'referencias')}</div>
            <div className="meta" style={{ paddingBottom: 12 }}>
              {refsActuales.map(r => esCitaBiblica(r)
                ? <a key={r} className="ref" href={refHref(r, lang)} target="_blank" rel="noopener noreferrer">{r}</a>
                : <span key={r} className="ref ref-plain">{r}</span>
              )}
            </div>
          </div>
        )}
      </div>
      <div id="panel-nav"><span className="nav-note">{`${t(lang, 'app_title')} ${t(lang, 'map_subtitle')}`}</span></div>
    </>
    </LangContext.Provider>
  )
}
