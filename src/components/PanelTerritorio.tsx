import { useState } from 'react'
import type { Lugar, TerritorioSeleccionado } from '../types/lugar'
import { TERRITORY_INFO } from '../data/territorioInfo'
import { getTerritoryName, getTerritoryCat } from '../data/territorios'
import { tSignificado, tPueblos } from '../data/dataI18n'
import { EVENTOS_PARALELOS_GLOBAL } from '../data/eventosParalelos'
import type { Lang } from '../data/lang'
import { t, LangContext, periodName as periodNameL, periodRange as periodRangeL } from '../data/ui'
import { Acc, EventoCard, DrawerHeader } from './InfoCards'

export function PanelTerritorio({ territorio, onClose, onBack, lugares, onSelectLugar, lang }: {
  territorio: TerritorioSeleccionado
  onClose: () => void
  onBack?: () => void
  lugares: Lugar[]
  onSelectLugar: (l: Lugar) => void
  lang: Lang
}) {
  const [eventosOpen, setEventosOpen] = useState(false)
  const periodName = periodNameL(lang, territorio.periodo)
  const periodRange = periodRangeL(lang, territorio.periodo)
  const c = territorio.color
  const info = TERRITORY_INFO[territorio.nombreEN] ?? null

  // Eventos paralelos: globales por época, según el período activo de la línea de tiempo
  const eventosDelPeriodo = EVENTOS_PARALELOS_GLOBAL.filter(e => e.periodo_at.includes(territorio.periodo))

  // Resuelve IDs a objetos Lugar (solo los que están cargados)
  const lugaresById = new Map(lugares.map(l => [l.id, l]))
  const ciudadesList = info
    ? info.ciudades.map(id => lugaresById.get(id)).filter((l): l is Lugar => !!l)
    : []
  const naturalesList = info
    ? info.naturales.map(id => lugaresById.get(id)).filter((l): l is Lugar => !!l)
    : []

  const divider = (
    <div style={{ height: 0.5, background: 'var(--border, #D4C5B0)', margin: '14px 0' }} />
  )

  return (
    <LangContext.Provider value={lang}>
    <>
      <DrawerHeader title={getTerritoryName(lang, territorio.nombreEN)} onClose={onClose} onBack={onBack} backLabel={t(lang, 'back_prev')} />
      <div style={{ height: 3, background: c, flexShrink: 0 }} />
      <div id="panel-body" className="panel-body-scroll">
        <div style={{ padding: '16px 16px 0' }}>

          {/* Categoría */}
          {territorio.tipo && (
            <div style={{
              display: 'inline-block',
              background: `${c}22`,
              border: `1px solid ${c}66`,
              borderRadius: 4,
              padding: '3px 10px',
              fontSize: 13,
              fontWeight: 600,
              color: c,
              marginBottom: 16,
              letterSpacing: '0.04em',
            }}>
              {getTerritoryCat(lang, territorio.nombreEN)}
            </div>
          )}

          {/* Período */}
          <div className="sec-label" style={{ marginTop: 0 }}>{t(lang, 'terr_periodo')}</div>
          <div className="gv" style={{ fontSize: 15 }}>{periodName}</div>
          {periodRange && (
            <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 2 }}>{periodRange}</div>
          )}

          {/* Significado bíblico */}
          {info?.significado && (
            <>
              {divider}
              <div className="sec-label">{t(lang, 'terr_significado')}</div>
              <div style={{
                fontSize: 14,
                color: 'var(--gray)',
                lineHeight: 1.65,
                fontFamily: 'Georgia, serif',
                borderLeft: `2px solid ${c}66`,
                paddingLeft: 10,
              }}>
                {tSignificado(lang, territorio.nombreEN, info.significado)}
              </div>
            </>
          )}

          {/* Lugares en esta región */}
          {(ciudadesList.length > 0 || naturalesList.length > 0) && (
            <>
              {divider}
              <div className="sec-label">{t(lang, 'terr_lugares')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 6 }}>
                {ciudadesList.map(l => (
                  <button
                    key={l.id}
                    onClick={() => onSelectLugar(l)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '7px 10px',
                      background: 'var(--surface-1, #F0EBE2)',
                      border: '0.5px solid var(--border, #D4C5B0)',
                      borderRadius: 6, cursor: 'pointer',
                      fontSize: 14, color: 'var(--ink, #3C3C3C)',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{
                        display: 'inline-block', width: 7, height: 7,
                        borderRadius: '50%', background: '#6B6060', flexShrink: 0,
                      }} />
                      {l.nombre}
                    </span>
                    <span style={{ color: c, fontSize: 15, opacity: 0.85 }}>→</span>
                  </button>
                ))}
                {naturalesList.map(l => (
                  <button
                    key={l.id}
                    onClick={() => onSelectLugar(l)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '7px 10px',
                      background: 'var(--surface-1, #F0EBE2)',
                      border: '0.5px solid var(--border, #D4C5B0)',
                      borderRadius: 6, cursor: 'pointer',
                      fontSize: 14, color: 'var(--ink, #3C3C3C)',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{
                        display: 'inline-block', width: 7, height: 7,
                        borderRadius: 1, background: '#2E5F8A', flexShrink: 0,
                      }} />
                      {l.nombre}
                    </span>
                    <span style={{ color: c, fontSize: 15, opacity: 0.85 }}>→</span>
                  </button>
                ))}
              </div>
              {/* Leyenda */}
              <div style={{ display: 'flex', gap: 14, paddingLeft: 2, marginBottom: 4 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--gray)' }}>
                  <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#6B6060' }} />
                  {t(lang, 'tipo_ciudad')}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--gray)' }}>
                  <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 1, background: '#2E5F8A' }} />
                  {t(lang, 'leg_natural')}
                </span>
              </div>
            </>
          )}

          {/* Pueblos principales */}
          {info?.pueblos && info.pueblos.length > 0 && (
            <>
              {divider}
              <div className="sec-label">{t(lang, 'terr_pueblos')}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tPueblos(lang, territorio.nombreEN, info.pueblos).map(p => (
                  <span key={p} style={{
                    fontSize: 13, padding: '3px 9px',
                    borderRadius: 20,
                    background: 'var(--surface-1, #F0EBE2)',
                    border: '0.5px solid var(--border, #D4C5B0)',
                    color: 'var(--gray)',
                  }}>
                    {p}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Eventos paralelos — al final de la sidebar de Territorio, según la época activa */}
          {eventosDelPeriodo.length > 0 && (
            <>
              {divider}
              <Acc
                title={t(lang, 'acc_eventos')}
                open={eventosOpen}
                onToggle={() => setEventosOpen(o => !o)}
              >
                {eventosDelPeriodo.map(e => <EventoCard key={e.civilizacion} e={e} />)}
              </Acc>
            </>
          )}

          {/* Nota fuente */}
          <div style={{
            marginTop: 20,
            marginBottom: 4,
            padding: '10px 12px',
            background: 'var(--surface-1, #F0EBE2)',
            borderRadius: 6,
            fontSize: 13,
            color: 'var(--gray)',
            lineHeight: 1.55,
          }}>
            {t(lang, 'terr_src_pre')} <em>Historical Basemaps</em> {t(lang, 'terr_src_post')}
          </div>
        </div>
      </div>
      <div id="panel-nav"><span className="nav-note">{`${t(lang, 'app_title')} ${t(lang, 'map_subtitle')}`}</span></div>
    </>
    </LangContext.Provider>
  )
}
