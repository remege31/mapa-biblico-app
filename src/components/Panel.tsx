import { useState, useEffect, useRef } from 'react'
import type { Lugar, Historia, Personaje, ModoTestamento, ContextoReligioso } from '../types/lugar'
import type { Lang } from '../data/lang'
import { t, useLang, LangContext } from '../data/ui'
import {
  Acc,
  HistoriaCard,
  PersonajeCard,
  MitoCard,
  DrawerHeader,
  TestamentoBadge,
  FranjaTestamento,
} from './InfoCards'

// ─── Helpers de contenido por testamento ─────────────────────────────────────

function getATContent(lugar: Lugar) {
  return {
    historias:          lugar.at?.historias          ?? lugar.historias          ?? [],
    personajes:         lugar.at?.personajes          ?? lugar.personajes          ?? [],
    contexto_religioso: lugar.at?.contexto_religioso  ?? lugar.contexto_religioso  ?? null,
  }
}

function getNTContent(lugar: Lugar) {
  return {
    historias:          lugar.nt?.historias          ?? [],
    personajes:         lugar.nt?.personajes          ?? [],
    contexto_religioso: lugar.nt?.contexto_religioso  ?? null,
  }
}

function ContentSections({
  historias, personajes, contexto_religioso, openAcc, onToggle, offsetIdx = 0,
}: {
  historias: Historia[]
  personajes: Personaje[]
  contexto_religioso: ContextoReligioso | null
  openAcc: number
  onToggle: (i: number) => void
  offsetIdx?: number
}) {
  const lang = useLang()
  return (
    <>
      <Acc title={t(lang, 'acc_historias')} open={openAcc === offsetIdx + 0} onToggle={() => onToggle(offsetIdx + 0)}>
        {historias.length > 0 ? historias.map(h => <HistoriaCard key={h.id} h={h} />) : <p className="desc" style={{ opacity: 0.5 }}>{t(lang, 'no_historias')}</p>}
      </Acc>
      <Acc title={t(lang, 'acc_personajes')} open={openAcc === offsetIdx + 1} onToggle={() => onToggle(offsetIdx + 1)}>
        {personajes.length > 0 ? personajes.map(p => <PersonajeCard key={p.id} p={p} />) : <p className="desc" style={{ opacity: 0.5 }}>{t(lang, 'no_personajes')}</p>}
      </Acc>
      {contexto_religioso && (
        <Acc title={t(lang, 'acc_contexto')} open={openAcc === offsetIdx + 2} onToggle={() => onToggle(offsetIdx + 2)}>
          <div className="sec-label" style={{ marginTop: 0 }}>{t(lang, 'ctx_lugar')}</div>
          <div className="ctx-block">{contexto_religioso.contexto_lugar}</div>
          {contexto_religioso.religiones_presentes.length > 0 && (<>
            <div className="sec-label">{t(lang, 'religiones')}</div>
            <ul className="resource-list" style={{ marginBottom: 8 }}>{contexto_religioso.religiones_presentes.map(r => <li key={r}>{r}</li>)}</ul>
          </>)}
          {contexto_religioso.mitos.length > 0 && (<>
            <div className="sec-label">{t(lang, 'mitos_persp')}</div>
            {contexto_religioso.mitos.map(m => <MitoCard key={m.id} m={m} />)}
          </>)}
        </Acc>
      )}
    </>
  )
}

export function Panel({ lugar, testamento, onClose, onBack, lang }: {
  lugar: Lugar; testamento: ModoTestamento; onClose: () => void; onBack?: () => void; lang: Lang
}) {
  const [openAcc, setOpenAcc] = useState(-1)
  const [showFade, setShowFade] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = bodyRef.current
    if (el) setShowFade(el.scrollHeight > el.clientHeight)
  }, [openAcc])

  const handleScroll = () => {
    const el = bodyRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10
    setShowFade(!atBottom)
  }

  const toggle = (i: number) => setOpenAcc(prev => prev === i ? -1 : i)
  const tipoLabel = lugar.tipo === 'ciudad' ? t(lang, 'tipo_ciudad') : lugar.tipo === 'territorio' ? t(lang, 'tipo_territorio') : t(lang, 'tipo_natural')
  const altitudLabel = typeof lugar.altitud_m === 'number' ? `${lugar.altitud_m} m` : lugar.altitud_m

  const lugarTieneNT = lugar.nt !== undefined
  const mostrarAmbos  = testamento === 'ambos' && lugarTieneNT

  const atContent = getATContent(lugar)
  const ntContent = getNTContent(lugar)

  return (
    <LangContext.Provider value={lang}>
    <>
      <DrawerHeader title={lugar.nombre} onClose={onClose} onBack={onBack} backLabel={t(lang, 'back_prev')} />
      <div className="drawer-fade-wrap"><div id="panel-body" className="panel-body-scroll" ref={bodyRef} onScroll={handleScroll}>

        {/* ── Sección geográfica (siempre visible) ── */}
        <Acc title={t(lang, 'acc_lugar')} open={openAcc === 0} onToggle={() => toggle(0)}>
          <div className="grid2">
            <div><div className="gl">{t(lang, 'fld_altitud')}</div><div className="gv">{altitudLabel}</div></div>
            <div><div className="gl">{t(lang, 'fld_tipo')}</div><div className="gv">{lugar.subtipo_geo ?? tipoLabel}</div></div>
          </div>
          <div className="sec-label" style={{ marginTop: 0 }}>{t(lang, 'fld_clima')}</div>
          <p className="desc">{lugar.clima}</p>
          <div className="sec-label">{t(lang, 'fld_geografia')}</div>
          <p className="desc">{lugar.descripcion_geo}</p>
          <div className="sec-label">{t(lang, 'fld_importancia')}</div>
          <p className="desc">{lugar.importancia_estrategica}</p>
          {(lugar.recursos ?? []).length > 0 && (<>
            <div className="sec-label">{t(lang, 'fld_recursos')}</div>
            <ul className="resource-list">{(lugar.recursos ?? []).map(r => <li key={r}>{r}</li>)}</ul>
          </>)}
          {(lugar.otros_habitantes ?? []).length > 0 && (<>
            <div className="sec-label">{t(lang, 'fld_habitantes')}</div>
            <div className="hab-list">
              {(lugar.otros_habitantes ?? []).map((h, i) => (
                <div key={h.id} className="hab-row" style={i === (lugar.otros_habitantes ?? []).length - 1 ? { borderBottom: 'none' } : {}}>
                  <div className="hab-name">{h.nombre}</div>
                  <div className="hab-desc">{h.descripcion}</div>
                </div>
              ))}
            </div>
          </>)}
          {lugar.jerarquia_pin === 'sublugar' && (
            <p style={{ fontSize: '11px', color: 'var(--gray)', marginTop: '12px', fontStyle: 'italic' }}>{t(lang, 'nota_sublugar')}</p>
          )}
          {lugar.id === 'rephidim' && (
            <p style={{ fontSize: '11px', color: 'var(--gray)', marginTop: '12px', fontStyle: 'italic' }}>{t(lang, 'nota_rephidim')}</p>
          )}
        </Acc>

        {/* ── Contenido narrativo según modo ── */}
        {mostrarAmbos ? (
          <>
            <TestamentoBadge tipo="AT" />
            <ContentSections
              historias={atContent.historias}
              personajes={atContent.personajes}
              contexto_religioso={atContent.contexto_religioso}
              openAcc={openAcc}
              onToggle={toggle}
              offsetIdx={1}
            />
            <FranjaTestamento />
            <TestamentoBadge tipo="NT" />
            <ContentSections
              historias={ntContent.historias}
              personajes={ntContent.personajes}
              contexto_religioso={ntContent.contexto_religioso}
              openAcc={openAcc}
              onToggle={toggle}
              offsetIdx={10}
            />
          </>
        ) : testamento === 'NT' ? (
          <ContentSections
            historias={ntContent.historias}
            personajes={ntContent.personajes}
            contexto_religioso={ntContent.contexto_religioso}
            openAcc={openAcc}
            onToggle={toggle}
            offsetIdx={1}
          />
        ) : (
          // Modo AT (default) — contenido legacy
          <ContentSections
            historias={atContent.historias}
            personajes={atContent.personajes}
            contexto_religioso={atContent.contexto_religioso}
            openAcc={openAcc}
            onToggle={toggle}
            offsetIdx={1}
          />
        )}

      </div>
      {showFade && <div className="panel-scroll-fade" />}
      </div>
      <div id="panel-nav"><span className="nav-note">{`${t(lang, 'app_title')} ${t(lang, 'map_subtitle')}`}</span></div>
    </>
    </LangContext.Provider>
  )
}
