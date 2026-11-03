import { useState } from 'react'
import type { Lugar, RutaSeleccionada } from '../types/lugar'
import type { Lang } from '../data/lang'
import { t, LangContext } from '../data/ui'
import { DrawerHeader } from './InfoCards'
import { getTerritoryName } from '../data/territorios'
import { Glosarios } from './Glosarios'

export function MenuNav({ lastPlace, onGoToPlace, onClose, onShowWelcome, lugares, rutas, territorios, onSelectLugar, onSelectRuta, onSelectTerritorio, lang, activoLugarId, activoRutaId, activoTerr }: {
  activoLugarId?: string
  activoRutaId?: string
  activoTerr?: string
  lastPlace: Lugar | null; onGoToPlace: () => void; onClose: () => void; onShowWelcome: () => void
  lugares: Lugar[]
  rutas: RutaSeleccionada[]
  territorios: { nombreES: string; nombreEN: string }[]
  onSelectLugar: (l: Lugar) => void
  onSelectRuta: (r: RutaSeleccionada) => void
  onSelectTerritorio: (nombreEN: string, nombreES: string) => void
  lang: Lang
}) {
  const [open, setOpen] = useState<null | 'acerca' | 'fuentes' | 'creditos'>(null)
  const toggle = (key: typeof open) => setOpen(prev => prev === key ? null : key)
  const [openIdx, setOpenIdx] = useState<null | 'lugares' | 'rutas' | 'territorios'>(null)
  const toggleIdx = (key: typeof openIdx) => setOpenIdx(prev => prev === key ? null : key)
  const territoriosOrd = [...territorios].sort((a, b) => a.nombreES.localeCompare(b.nombreES))
  const lugaresOrd = [...lugares].sort((a, b) => a.nombre.localeCompare(b.nombre))

  const displayPlace = lastPlace?.nombre ?? t(lang, 'jerusalem')
  const labelPrefix = lastPlace ? t(lang, 'last_query') : t(lang, 'explore')

  const nTipnr = lugares.filter(l => l.fuente_coordenadas === 'tipnr').length
  const nRev = lugares.filter(l => l.fuente_coordenadas === 'revisada').length
  const nOwn = lugares.filter(l => l.fuente_coordenadas === 'propia').length
  const coordsNote = nTipnr + nRev + nOwn === 0 ? '' : t(lang, 'src_coords_note')
    .replace('{tipnr}', String(nTipnr)).replace('{n}', String(nTipnr + nRev + nOwn))
    .replace('{rev}', String(nRev)).replace('{own}', String(nOwn))
  const citeNote = t(lang, 'src_cite_text').replace('{year}', String(new Date().getFullYear())).replace('{title}', t(lang, 'app_title'))

  const FUENTES: [string, { text: string; url?: string }[], string?][] = [
    [t(lang, 'src_biblia'), [
      { text: t(lang, 'src_nbj') },
      { text: t(lang, 'src_bg'), url: 'https://www.biblegateway.com/versions/Reina-Valera-1960-RVR1960-Biblia/' },
    ]],
    [t(lang, 'src_geo'), [
      { text: 'STEPBible TIPNR — Transliterated Identified Place Names of the Bible (CC BY 4.0) · STEP Bible, www.STEPBible.org', url: 'https://github.com/STEPBible/STEPBible-Data' },
      { text: 'OpenBible.info — Bible Geocoding Data (CC BY 4.0)', url: 'https://www.openbible.info/geo/' },
      { text: t(lang, 'src_theo'), url: 'https://github.com/robertrouse/theographic-bible-metadata' },
    ], coordsNote],
    [t(lang, 'src_basemap'), [
      { text: 'Natural Earth — mapa base histórico (dominio público)', url: 'https://www.naturalearthdata.com/' },
      { text: 'Mapa actual (opcional): Tiles © Esri — HERE, DeLorme, MapmyIndia, © OpenStreetMap contributors', url: 'https://www.esri.com/' },
      { text: 'OpenStreetMap (ODbL)', url: 'https://www.openstreetmap.org/copyright' },
    ]],
    [t(lang, 'src_carto'), [
      { text: 'historical-basemaps — André Ourednik (GPL-3.0)', url: 'https://github.com/aourednik/historical-basemaps' },
    ]],
    [t(lang, 'src_judia'), [
      { text: 'Midrash Rabbah — vía Sefaria.org', url: 'https://www.sefaria.org/texts/Midrash' },
      { text: t(lang, 'src_talmud'), url: 'https://www.sefaria.org/texts/Talmud' },
    ], t(lang, 'src_sefaria_note')],
    [t(lang, 'src_islam'), [
      { text: 'Tafsir Ibn Kathir — vía Altafsir.com', url: 'https://www.altafsir.com' },
    ], t(lang, 'src_altafsir_note')],
    [t(lang, 'src_crist'), [
      { text: t(lang, 'src_eusebio'), url: 'https://www.tertullian.org/fathers/eusebius_onomasticon_02_trans.htm' },
      { text: t(lang, 'src_jeronimo') },
      { text: t(lang, 'src_origenes') },
    ]],
    [t(lang, 'src_ia'), [], t(lang, 'src_ia_text')],
    [t(lang, 'src_cite'), [], citeNote],
  ]

  return (
    <LangContext.Provider value={lang}>
    <>
      <DrawerHeader title={`${t(lang, 'app_title')} ${t(lang, 'map_subtitle')}`} onClose={onClose} />
      <div id="panel-body" className="panel-body-scroll">
        <button className="menu-last-place" onClick={onGoToPlace}>
          <span className="menu-last-text">
            <em>{labelPrefix}</em>
            <strong>{displayPlace}</strong>
          </span>
          <span className="menu-last-arrow">→</span>
        </button>

        {/* T2d: índice navegable */}
        <div className="menu-section-label">{t(lang, 'index')}</div>
        <div className="menu-list">
          <div className="acc">
            <button className={`acc-h${openIdx === 'lugares' ? ' open' : ''}`} onClick={() => toggleIdx('lugares')}>
              <span className="acc-title">{t(lang, 'places')} <span className="idx-count">{lugaresOrd.length}</span></span>
              <span className={`acc-ch${openIdx === 'lugares' ? ' open' : ''}`}>▼</span>
            </button>
            {openIdx === 'lugares' && (
              <div className="acc-body idx-list">
                {lugaresOrd.map(l => (
                  <button key={l.id} className={`idx-item${l.id === activoLugarId ? ' is-active' : ''}`} aria-current={l.id === activoLugarId ? 'true' : undefined} onClick={() => onSelectLugar(l)}>{l.nombre}</button>
                ))}
              </div>
            )}
          </div>

          <div className="acc">
            <button className={`acc-h${openIdx === 'rutas' ? ' open' : ''}`} onClick={() => toggleIdx('rutas')}>
              <span className="acc-title">{t(lang, 'chars_routes')} <span className="idx-count">{rutas.length}</span></span>
              <span className={`acc-ch${openIdx === 'rutas' ? ' open' : ''}`}>▼</span>
            </button>
            {openIdx === 'rutas' && (
              <div className="acc-body idx-list">
                {rutas.map((r, i) => (
                  <button key={r.personajeId + '-' + i} className={`idx-item${r.personajeId === activoRutaId ? ' is-active' : ''}`} aria-current={r.personajeId === activoRutaId ? 'true' : undefined} onClick={() => onSelectRuta(r)}>
                    {r.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="acc">
            <button className={`acc-h${openIdx === 'territorios' ? ' open' : ''}`} onClick={() => toggleIdx('territorios')}>
              <span className="acc-title">{t(lang, 'territories')} <span className="idx-count">{territoriosOrd.length}</span></span>
              <span className={`acc-ch${openIdx === 'territorios' ? ' open' : ''}`}>▼</span>
            </button>
            {openIdx === 'territorios' && (
              <div className="acc-body idx-list">
                {territoriosOrd.map(t => (
                  <button key={t.nombreEN} className={`idx-item${t.nombreEN === activoTerr ? ' is-active' : ''}`} aria-current={t.nombreEN === activoTerr ? 'true' : undefined} onClick={() => onSelectTerritorio(t.nombreEN, t.nombreES)}>{getTerritoryName(lang, t.nombreEN)}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ola 2: glosarios temáticos */}
        <Glosarios lugares={lugares} onSelectLugar={onSelectLugar} lang={lang} activoLugarId={activoLugarId} />

        <div className="menu-section-label">{t(lang, 'the_map')}</div>
        <div className="menu-list">

          {/* Acerca del proyecto — acordeón */}
          <div className="acc">
            <button className={`acc-h${open === 'acerca' ? ' open' : ''}`} onClick={() => toggle('acerca')}>
              <span className="acc-title">{t(lang, 'about')}</span>
              <span className={`acc-ch${open === 'acerca' ? ' open' : ''}`}>▼</span>
            </button>
            {open === 'acerca' && (
              <div className="acc-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink)', fontFamily: 'Georgia, serif', margin: 0 }}>
                  {t(lang, 'about_p1')}
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink)', fontFamily: 'Georgia, serif', margin: 0 }}>
                  {t(lang, 'about_p2')}
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink)', fontFamily: 'Georgia, serif', margin: 0 }}>
                  {t(lang, 'about_p3')}
                </p>
              </div>
            )}
          </div>

          {/* Fuentes consultadas — acordeón */}
          <div className="acc">
            <button className={`acc-h${open === 'fuentes' ? ' open' : ''}`} onClick={() => toggle('fuentes')}>
              <span className="acc-title">{t(lang, 'sources')}</span>
              <span className={`acc-ch${open === 'fuentes' ? ' open' : ''}`}>▼</span>
            </button>
            {open === 'fuentes' && (
              <div className="acc-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--gray)', fontStyle: 'italic', margin: 0 }}>
                  {t(lang, 'sources_intro')}
                </p>
                {FUENTES.map(([section, items, note]) => (
                  <div key={section}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: 4 }}>{section}</div>
                    {items.map(item => (
                      <div key={item.text} style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6, paddingLeft: 8, borderLeft: '2px solid var(--beige)', marginBottom: 2 }}>
                        {item.url
                          ? <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecorationColor: 'var(--ocre)' }}>{item.text} ↗</a>
                          : item.text}
                      </div>
                    ))}
                    {note && (
                      <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--gray)', margin: '4px 0 0', paddingLeft: 8 }}>{note}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cómo usar el mapa — abre panel de bienvenida */}
          <button className="menu-item" onClick={onShowWelcome} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span>{t(lang, 'how_to')}</span>
            <span aria-hidden="true" style={{ color: 'var(--terra)' }}>→</span>
          </button>

          {/* Créditos — acordeón (unificado en "El mapa") */}
          <div className="acc">
            <button className={`acc-h${open === 'creditos' ? ' open' : ''}`} onClick={() => toggle('creditos')}>
              <span className="acc-title">{t(lang, 'credits')}</span>
              <span className={`acc-ch${open === 'creditos' ? ' open' : ''}`}>▼</span>
            </button>
            {open === 'creditos' && (
              <div className="acc-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontFamily: 'Georgia, serif', color: 'var(--ink)', marginBottom: 2 }}>Rebeca Martínez</div>
                  <div style={{ fontSize: 13, color: 'var(--gray)' }}>{t(lang, 'credits_role')}</div>
                </div>
                <div style={{ borderTop: '1px solid var(--beige)', paddingTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: 6 }}>{t(lang, 'tech_stack')}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.8 }}>React · TypeScript · Leaflet.js · Vite<br />{t(lang, 'deployed')} · 2026–{new Date().getFullYear()}</div>
                </div>
                <div style={{ borderTop: '1px solid var(--beige)', paddingTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: 6 }}>{t(lang, 'license_title')}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.8 }}>
                    {t(lang, 'license_text')}
                    <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecorationColor: 'var(--ocre)' }}>CC BY-SA 4.0 ↗</a>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      <div id="panel-nav"><span className="nav-note">{`${t(lang, 'app_title')} ${t(lang, 'map_subtitle')}`}</span></div>
    </>
    </LangContext.Provider>
  )
}
