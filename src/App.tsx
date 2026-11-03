import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { MapView } from './components/MapView'
import { PanelBienvenida } from './components/PanelBienvenida'
import { CapasFiltros } from './components/CapasFiltros'
import { subtipoDe, isSubtipoKey, type SubtipoKey } from './data/subtipos'
import { Timeline } from './components/Timeline'
import { Panel } from './components/Panel'
import { MenuNav } from './components/MenuNav'
import { PanelRuta } from './components/PanelRuta'
import { PanelTerritorio } from './components/PanelTerritorio'
import type {
  Lugar,
  RutaSeleccionada,
  TerritorioSeleccionado,
  ModoTestamento,
} from './types/lugar'
import { PERSONAJE_COLORS, DEFAULT_COLOR } from './data/rutaColors'
import {
  TERRITORY_SEARCH_LIST,
  getTerritoryColor,
  getTerritoryType,
  getTerritoryName,
} from './data/territorios'
import { PERIODS } from './data/periods'
import { WAYPOINTS } from './data/waypoints'
import { encuadre } from './utils/geo'
import { initLang, saveLang, dataBase, IDIOMAS_ACTIVOS, type Lang } from './data/lang'
import { t, periodName, setCurrentLang } from './data/ui'
import {
  HamburgerIcon,
  DrawerHeader,
} from './components/InfoCards'
import './App.css'

type SearchResult =
  | { kind: 'lugar'; data: Lugar }
  | { kind: 'ruta'; data: RutaSeleccionada }
  | { kind: 'territorio'; nombreES: string; nombreEN: string }

/* "←" del panel: vista anterior (lugar, ruta o territorio) para volver a donde estabas */
type Vista =
  | { kind: 'lugar'; lugar: Lugar }
  | { kind: 'ruta'; ruta: RutaSeleccionada; viajeIdx: number }
  | { kind: 'territorio'; territorio: TerritorioSeleccionado }
  | { kind: 'menu' }
  | { kind: 'bienvenida' }
const vistaId = (v: Vista) => v.kind === 'lugar' ? v.lugar.id : v.kind === 'ruta' ? v.ruta.personajeId : v.kind === 'territorio' ? v.territorio.nombreEN : v.kind

/* T2b: persistencia de capas + filtros en el navegador. Solo capas y filtros;
   nunca la selección. Fallback limpio si el dato falta o está corrupto. */
const VIEW_STORAGE_KEY = 'mapa-at:view:v1'
const WELCOME_SEEN_KEY = 'mapa-at:welcomeSeen:v1'
type SavedView = Partial<{
  testamento: ModoTestamento; periodId: string
  territoriosActive: boolean; rutasActive: boolean; lugaresActive: boolean; naturalezaActive: boolean
  subtiposOcultos: SubtipoKey[]; mapaActual: boolean
}>
function readSavedView(): SavedView {
  try {
    const raw = localStorage.getItem(VIEW_STORAGE_KEY)
    if (!raw) return {}
    const o = JSON.parse(raw)
    return o && typeof o === 'object' ? (o as SavedView) : {}
  } catch { return {} }
}

export default function App() {
  const [selected, setSelected] = useState<Lugar | null>(null)
  const [selectedRuta, setSelectedRuta] = useState<RutaSeleccionada | null>(null)
  const [selectedTerritorio, setSelectedTerritorio] = useState<TerritorioSeleccionado | null>(null)
  const [activeViajeIdx, setActiveViajeIdx] = useState(0)
  /* T2b: estado inicial restaurado desde localStorage (capas + filtros) */
  const [testamento, setTestamento] = useState<ModoTestamento>(() => readSavedView().testamento ?? 'ambos')
  const [periodId, setPeriodId] = useState(() => readSavedView().periodId ?? 'todos')
  const [lang, setLang] = useState<Lang>(() => initLang())
  /* QA (complementarios): en la primera visita el panel de bienvenida se abre
     solo (estado inicial), sin depender del menú. Se marca como visto en un
     efecto aparte para no llamar setState dentro de un efecto. */
  const [drawerOpen, setDrawerOpen] = useState(() => {
    try { return !localStorage.getItem(WELCOME_SEEN_KEY) } catch { return false }
  })
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [welcomeFromMenu, setWelcomeFromMenu] = useState(false) /* QA: bienvenida abierta desde "Cómo usar el mapa" */
  const [territoriosActive, setTerritoriosActive] = useState(() => readSavedView().territoriosActive ?? false)
  const [rutasActive, setRutasActive] = useState(() => readSavedView().rutasActive ?? false)
  const [lugaresActive, setLugaresActive] = useState(() => readSavedView().lugaresActive ?? true)
  const [naturalezaActive, setNaturalezaActive] = useState(() => readSavedView().naturalezaActive ?? true)
  const [subtiposOcultos, setSubtiposOcultos] = useState<SubtipoKey[]>(() => {
    const v = readSavedView().subtiposOcultos
    return Array.isArray(v) ? v.filter(isSubtipoKey) : []
  })
  const [mapaActual, setMapaActual] = useState(() => readSavedView().mapaActual === true)
  const [capasOpen, setCapasOpen] = useState(false)
  const [focusTerritorio, setFocusTerritorio] = useState<{ nombreEN: string; n: number } | null>(null)
  const lugaresRef = useRef<Lugar[]>([])
  /* Resalte temporal de la parte de la interfaz que usa un botón de la guía.
     Es un atributo en la raíz (data-guia) y el CSS marca el elemento, así el
     resalte sobrevive aunque Leaflet recree los pines. */
  const [guia, setGuia] = useState<string | null>(null)
  const guiaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resaltar = useCallback((clave: string) => {
    if (guiaTimer.current) clearTimeout(guiaTimer.current)
    setGuia(clave)
    guiaTimer.current = setTimeout(() => setGuia(null), 3600)
  }, [])
  useEffect(() => () => { if (guiaTimer.current) clearTimeout(guiaTimer.current) }, [])
  const [historial, setHistorial] = useState<Vista[]>([])
  const vistaRef = useRef<Vista | null>(null)

  /* QA: los territorios requieren un período concreto — si se vuelve a
     "sin filtro de época", la capa se apaga en lugar de fallar en silencio */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync intencional: apagar territorios al quitar el filtro de época
    if (periodId === 'todos' && territoriosActive) setTerritoriosActive(false)
  }, [periodId, territoriosActive])

  /* T2b: persistir capas + filtros al cambiar (nunca la selección) */
  useEffect(() => {
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify({
        testamento, periodId, territoriosActive, rutasActive, lugaresActive, naturalezaActive, subtiposOcultos, mapaActual,
      }))
    } catch { /* almacenamiento no disponible — ignorar */ }
  }, [testamento, periodId, territoriosActive, rutasActive, lugaresActive, naturalezaActive, subtiposOcultos, mapaActual])

  /* vista actual (para apilarla en el historial al navegar a otra) */
  useEffect(() => {
    vistaRef.current = menuOpen ? { kind: 'menu' }
      : selectedRuta ? { kind: 'ruta', ruta: selectedRuta, viajeIdx: activeViajeIdx }
      : selectedTerritorio ? { kind: 'territorio', territorio: selectedTerritorio }
      : selected ? { kind: 'lugar', lugar: selected }
      : { kind: 'bienvenida' }
  }, [menuOpen, selected, selectedRuta, selectedTerritorio, activeViajeIdx])

  useEffect(() => { saveLang(lang); setCurrentLang(lang) }, [lang])

  useEffect(() => { document.title = t(lang, 'app_title') }, [lang])

  useEffect(() => {
    try { localStorage.setItem(WELCOME_SEEN_KEY, '1') } catch { /* almacenamiento no disponible */ }
  }, [])
  const [searchQuery, setSearchQuery] = useState("")
  const [lugares, setLugares] = useState<import("./types/lugar").Lugar[]>([])
  const [flyToTarget, setFlyToTarget] = useState<{lat: number, lng: number, zoom?: number} | null>(null)
  useEffect(() => { lugaresRef.current = lugares }, [lugares])

  useEffect(() => {
    const base = dataBase(lang)
    fetch("/data/index.json")
      .then(r => r.json())
      .then((ids: string[]) => Promise.all(ids.map(id =>
        fetch(base + "/" + id + ".json")
          .then(r => r.ok ? r.json() : fetch("/data/" + id + ".json").then(r2 => r2.ok ? r2.json() : null))
          .catch(() => null))))
      .then(results => setLugares(results.filter(Boolean)))
      .catch(console.error)
  }, [lang])

  const apilarVista = useCallback((destino: Vista) => {
    const actual = vistaRef.current
    if (!actual) return
    if (actual.kind === destino.kind && vistaId(actual) === vistaId(destino)) return
    setHistorial(h => [...h.slice(-19), actual])
  }, [])

  const handleSelect = useCallback((l: Lugar) => {
    apilarVista({ kind: 'lugar', lugar: l })
    /* si la capa o el subtipo del lugar estaban apagados, se reactivan para que su pin sea visible */
    if (l.tipo === 'region_natural') setNaturalezaActive(true)
    else if (l.tipo === 'ciudad') setLugaresActive(true)
    const sub = subtipoDe(l)
    if (sub) setSubtiposOcultos(o => o.includes(sub) ? o.filter(x => x !== sub) : o)
    if (l.lat && l.lng) setFlyToTarget({ lat: l.lat, lng: l.lng })
    setSelected(l)
    setSelectedRuta(null)
    setSelectedTerritorio(null)
    setMenuOpen(false)
    setDrawerOpen(true)
    setPanelCollapsed(false)
  }, [apilarVista])

  const handleSelectRuta = useCallback((ruta: RutaSeleccionada) => {
    apilarVista({ kind: 'ruta', ruta, viajeIdx: ruta.viajeIdx ?? 0 })
    setSelectedRuta(ruta)
    setActiveViajeIdx(ruta.viajeIdx ?? 0)
    setSelected(null)
    setSelectedTerritorio(null)
    setMenuOpen(false)
    setDrawerOpen(true)
    setPanelCollapsed(false)
  }, [apilarVista])

  const handleSelectTerritorio = useCallback((t: TerritorioSeleccionado) => {
    apilarVista({ kind: 'territorio', territorio: t })
    setSelectedTerritorio(t)
    setSelected(null)
    setSelectedRuta(null)
    setMenuOpen(false)
    setDrawerOpen(true)
    setPanelCollapsed(false)
  }, [apilarVista])

  const closeAll = () => { setHistorial([]); setDrawerOpen(false); setMenuOpen(false); setSelectedRuta(null); setSelectedTerritorio(null); setActiveViajeIdx(0); setWelcomeFromMenu(false) }

  /* T2c: volver a la vista por defecto — limpia capas, filtros y selección,
     y borra el estado persistido. */
  const resetView = () => {
    setSelected(null); setSelectedRuta(null); setSelectedTerritorio(null)
    setDrawerOpen(false); setMenuOpen(false); setActiveViajeIdx(0); setWelcomeFromMenu(false)
    setTestamento('ambos'); setPeriodId('todos')
    setTerritoriosActive(false); setRutasActive(false); setLugaresActive(true); setNaturalezaActive(true)
    setSubtiposOcultos([]); setHistorial([]); setMapaActual(false)
    try { localStorage.removeItem(VIEW_STORAGE_KEY) } catch { /* ignore */ }
  }

  // Índice de rutas: personajes únicos con ruta o viajes
  /* T2d: índice completo de rutas/personajes (memoizado). Se usa tanto en el
     buscador como en el índice del menú. */
  const rutasIndex = useMemo<RutaSeleccionada[]>(() => {
    const seen = new Set<string>()
    const result: RutaSeleccionada[] = []
    lugares.forEach(lugar => {
      ;(lugar.personajes ?? []).forEach(p => {
        const tieneRuta = (p.ruta?.length ?? 0) > 0 || (p.viajes?.length ?? 0) > 0
        if (!tieneRuta || seen.has(p.nombre)) return
        seen.add(p.nombre)
        const color = PERSONAJE_COLORS[p.nombre] ?? DEFAULT_COLOR
        const viajes = p.viajes?.length ? p.viajes : undefined
        result.push({
          nombre: p.nombre,
          rol: p.rol,
          periodo: p.periodo,
          descripcion: p.descripcion,
          referencias: viajes ? (viajes[0].referencias ?? p.referencias) : p.referencias,
          ruta: viajes ? viajes[0].ruta : p.ruta,
          color,
          personajeId: p.nombre,
          viajeIdx: 0,
          viajeNombre: viajes?.[0]?.nombre,
          viajes,
        })
      })
    })
    return result.sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [lugares])

  const q = searchQuery.toLowerCase()
  const searchResults: SearchResult[] = searchQuery.length >= 2 ? [
    ...lugares
      .filter(l => l.nombre.toLowerCase().includes(q))
      .slice(0, 4)
      .map(l => ({ kind: 'lugar' as const, data: l })),
    ...rutasIndex
      .filter(r => r.nombre.toLowerCase().includes(q))
      .slice(0, 3)
      .map(r => ({ kind: 'ruta' as const, data: r })),
    ...TERRITORY_SEARCH_LIST
      .filter(t => t.nombreES.toLowerCase().includes(q) || t.nombreEN.toLowerCase().includes(q))
      .slice(0, 2)
      .map(t => ({ kind: 'territorio' as const, nombreES: t.nombreES, nombreEN: t.nombreEN })),
  ].slice(0, 8) : []

  const handleSearchSelectRuta = useCallback((ruta: RutaSeleccionada) => {
    apilarVista({ kind: 'ruta', ruta, viajeIdx: ruta.viajeIdx ?? 0 })
    setRutasActive(true)
    if (ruta.periodo && ruta.periodo !== 'todos') setPeriodId(ruta.periodo)
    /* el mapa se encuadra sobre todas las paradas de la ruta */
    const puntos = (ruta.ruta ?? [])
      .map(id => { const l = lugaresRef.current.find(x => x.id === id); return l ? [l.lat, l.lng] as [number, number] : (WAYPOINTS[id] ?? null) })
      .filter((p): p is [number, number] => p !== null)
    const enc = encuadre(puntos)
    if (enc) setFlyToTarget(enc)
    setSelectedRuta(ruta)
    setActiveViajeIdx(ruta.viajeIdx ?? 0)
    setSelected(null)
    setMenuOpen(false)
    setDrawerOpen(true)
    setPanelCollapsed(false)
  }, [apilarVista])

  const handleSearchSelectTerritorio = useCallback((nombreEN: string, nombreES: string) => {
    const periodo = periodId === 'todos' ? 'hierro_2' : periodId
    setTerritoriosActive(true)
    setPeriodId(periodo)
    setFocusTerritorio({ nombreEN, n: Date.now() })
    handleSelectTerritorio({
      nombreEN,
      nombreES,
      tipo: getTerritoryType(nombreEN),
      color: getTerritoryColor(nombreEN),
      periodo,
    })
  }, [periodId, handleSelectTerritorio])

  /* "←": regresa a la vista anterior sin volver a apilarla */
  const volver = useCallback(() => {
    const prev = historial[historial.length - 1]
    if (prev) setHistorial(h => h.slice(0, -1))
    /* sin historial, "←" lleva al panel de inicio (Cómo explorar el mapa) */
    const destino: Vista = prev ?? { kind: 'bienvenida' }
    if (destino.kind === 'menu') {
      setDrawerOpen(false)
      setMenuOpen(true)
      return
    }
    setMenuOpen(false)
    setWelcomeFromMenu(false)
    setSelected(null); setSelectedRuta(null); setSelectedTerritorio(null)
    if (destino.kind === 'lugar') {
      setSelected(destino.lugar)
      if (destino.lugar.lat && destino.lugar.lng) setFlyToTarget({ lat: destino.lugar.lat, lng: destino.lugar.lng })
    } else if (destino.kind === 'ruta') {
      setSelectedRuta(destino.ruta); setActiveViajeIdx(destino.viajeIdx)
    } else if (destino.kind === 'territorio') {
      setSelectedTerritorio(destino.territorio)
    }
    setDrawerOpen(true)
    setPanelCollapsed(false)
  }, [historial])
  /* "←" siempre disponible en los paneles de lugar, ruta y territorio */
  const onBack = volver

  const openMenu = () => { setDrawerOpen(false); setMenuOpen(true) }
  const goToLastPlace = async () => {
    /* QA: antes faltaba setPanelCollapsed(false) — con el panel colapsado se
       seleccionaba el lugar pero la barra lateral no se abría. Además ahora
       el mapa vuela al lugar. */
    let lugar = selected
    if (!lugar) {
      let res = await fetch(dataBase(lang) + '/jerusalen.json').catch(() => null)
      if (!res || !res.ok) res = await fetch('/data/jerusalen.json').catch(() => null)
      lugar = res?.ok ? await res.json() : null
      if (lugar) setSelected(lugar)
    }
    if (lugar?.lat && lugar?.lng) setFlyToTarget({ lat: lugar.lat, lng: lugar.lng })
    setMenuOpen(false)
    setDrawerOpen(true)
    setPanelCollapsed(false)
  }
  const isMobile = window.innerWidth < 769
  const postExilioRef = useRef<HTMLButtonElement>(null)

  /* Acciones de los botones del panel "Cómo explorar el mapa" */
  const irAlBuscador = () => {
    if (isMobile) closeAll()
    setTimeout(() => document.getElementById('topbar-search-input')?.focus(), 0)
    resaltar('buscar')
  }
  const abrirFichaJerusalen = () => {
    const jer = lugares.find(l => l.id === 'jerusalen')
    if (jer) { handleSelect(jer); if (!isMobile) resaltar('ficha') }
  }
  const verEgiptoEnSuEpoca = () => {
    setTerritoriosActive(true)
    setPeriodId('bronce_tardio')
    setFlyToTarget({ lat: 27, lng: 33, zoom: 5 })
    handleSelectTerritorio({
      nombreEN: 'Egypt', nombreES: 'Egipto',
      tipo: getTerritoryType('Egypt'), color: getTerritoryColor('Egypt'), periodo: 'bronce_tardio',
    })
    if (!isMobile) resaltar('epoca')
  }
  const verViaje = (nombre: string) => {
    const r = rutasIndex.find(x => x.nombre === nombre)
    if (!r) return
    handleSearchSelectRuta(r)
    if (!isMobile) { setCapasOpen(true); resaltar('rutas') }
  }
  const abrirCapas = () => {
    if (isMobile) closeAll()
    setCapasOpen(true)
    resaltar('capas')
  }
  const toggleSubtipo = (k: SubtipoKey) =>
    setSubtiposOcultos(o => o.includes(k) ? o.filter(x => x !== k) : [...o, k])

  /* las épocas que no corresponden al testamento activo se muestran
     atenuadas (deshabilitadas) en el timeline en lugar de ocultarse */
  const isPeriodDisabled = (p: typeof PERIODS[number]) => {
    if (testamento === 'AT') return !(p.testamento === 'AT' || p.testamento === 'ambos')
    if (testamento === 'NT') return !(p.testamento === 'NT' || p.testamento === 'ambos')
    return false
  }

  const showOverlay = menuOpen || (drawerOpen && isMobile && !window.matchMedia('(min-width: 769px)').matches)
  const drawerStyle = isMobile ? { top: 0 } : undefined /* móvil: drawer a altura completa; desktop: flotante vía CSS */
  /* T2c: hay filtros/capas fuera de su valor por defecto → mostrar Restablecer */
  const hasActiveFilters = periodId !== 'todos' || testamento !== 'ambos' || territoriosActive || rutasActive || !lugaresActive || !naturalezaActive || subtiposOcultos.length > 0 || mapaActual

  return (
    <div id="app" className={(!isMobile && !panelCollapsed) ? 'panel-open' : ''} data-guia={guia ?? undefined}>
      {/* T2a: controles flotantes sobre el mapa full-screen */}
      {/* título del mapa: esquina superior izquierda */}
      <div id="map-ctl-tl" className="map-ctl">
        <div id="map-title-card">
          <div id="map-title-line">
            <span id="map-title">{t(lang, 'app_title')}</span>
          </div>
          <div id="map-title-tag">{t(lang, 'map_tag')}</div>
        </div>
        <div id="testament-card" role="group" aria-label={t(lang, 'test_filter')}>
          <div id="testament-toggle">
            {(['ambos', 'AT', 'NT'] as const).map(modo => (
              <button
                key={modo}
                className={`testament-btn${testamento === modo ? ' active-' + modo : ''}`}
                aria-pressed={testamento === modo}
                aria-label={modo === 'ambos' ? t(lang, 'test_all') : modo === 'AT' ? t(lang, 'test_at') : t(lang, 'test_nt')}
                onClick={() => { setTestamento(modo); setPeriodId('todos') }}
              >
                <span className="tb-long" aria-hidden="true">{modo === 'ambos' ? t(lang, 'test_all') : modo === 'AT' ? t(lang, 'test_at') : t(lang, 'test_nt')}</span>
                <span className="tb-short" aria-hidden="true">{modo === 'ambos' ? t(lang, 'test_all_s') : modo === 'AT' ? 'AT' : 'NT'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* búsqueda + menú: esquina superior derecha, sobre el panel flotante */}
      <div id="map-ctl-tr" className="map-ctl">
        <div id="topbar-search-wrap">
          <input
            id="topbar-search-input"
            type="text"
            placeholder={t(lang, 'search_ph')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && searchResults.length > 0) {
                const first = searchResults[0]
                if (first.kind === 'lugar') { handleSelect(first.data); setSearchQuery("") }
                else if (first.kind === 'ruta') { handleSearchSelectRuta(first.data); setSearchQuery("") }
                else if (first.kind === 'territorio') { handleSearchSelectTerritorio(first.nombreEN, first.nombreES); setSearchQuery("") }
              }
            }}
            aria-label={t(lang, 'search_aria')}
          />
          {searchResults.length > 0 && (
            <div id="search-dropdown">
              {searchResults.map((r, i) => {
                if (r.kind === 'lugar') return (
                  <button key={r.data.id} className={`search-result${r.data.id === selected?.id ? ' is-active' : ''}`} onClick={() => { handleSelect(r.data); setSearchQuery("") }}>
                    <span className="search-result-name">{r.data.nombre}</span>
                    <span className="search-result-tipo">{r.data.tipo === "ciudad" ? t(lang, 'tipo_ciudad') : r.data.tipo === "territorio" ? t(lang, 'tipo_territorio') : t(lang, 'tipo_natural')}</span>
                  </button>
                )
                if (r.kind === 'ruta') return (
                  <button key={'ruta-' + r.data.nombre + i} className={`search-result${r.data.personajeId === selectedRuta?.personajeId ? ' is-active' : ''}`} onClick={() => { handleSearchSelectRuta(r.data); setSearchQuery("") }}>
                    <span className="search-result-name">{r.data.nombre}</span>
                    <span className="search-result-tipo">{t(lang, 'route_word')} · {periodName(lang, r.data.periodo)}</span>
                  </button>
                )
                if (r.kind === 'territorio') return (
                  <button key={'ter-' + r.nombreEN} className={`search-result${r.nombreEN === selectedTerritorio?.nombreEN ? ' is-active' : ''}`} onClick={() => { handleSearchSelectTerritorio(r.nombreEN, r.nombreES); setSearchQuery("") }}>
                    <span className="search-result-name">{getTerritoryName(lang, r.nombreEN)}</span>
                    <span className="search-result-tipo">{t(lang, 'terr_hist')}</span>
                  </button>
                )
                return null
              })}
            </div>
          )}
        </div>
        {IDIOMAS_ACTIVOS.length > 1 && (
          <div id="topbar-lang" role="group" aria-label="Idioma / Language / Lingua">
            {([['es', 'ESP'], ['en', 'ENG'], ['it', 'ITA']] as [Lang, string][]).filter(([code]) => IDIOMAS_ACTIVOS.includes(code)).map(([code, label]) => (
              <button key={code} className={`topbar-lang-btn${lang === code ? ' active' : ''}`} aria-pressed={lang === code} onClick={() => setLang(code)}>{label}</button>
            ))}
          </div>
        )}
        <button id="topbar-menu-btn" onClick={openMenu} aria-label={t(lang, 'menu')}>
          <HamburgerIcon />
        </button>
      </div>

      {/* filtros abajo-izquierda: testamento + capas en tarjetas separadas */}
      <div id="map-ctl-bl" className="map-ctl">
        {hasActiveFilters && (
          <button className="reset-chip" onClick={resetView} title={t(lang, 'reset_title')}>
            {t(lang, 'reset')} <span aria-hidden="true">×</span>
          </button>
        )}
        <CapasFiltros
          lang={lang}
          open={capasOpen}
          onOpenChange={setCapasOpen}
          lugaresActive={lugaresActive} onLugares={() => setLugaresActive(a => !a)}
          territoriosActive={territoriosActive} onTerritorios={() => setTerritoriosActive(a => !a)} periodId={periodId}
          rutasActive={rutasActive} onRutas={() => setRutasActive(a => !a)}
          naturalezaActive={naturalezaActive} onNaturaleza={() => setNaturalezaActive(a => !a)}
          ocultos={subtiposOcultos}
          onToggleSubtipo={toggleSubtipo}
          mapaActual={mapaActual} onMapaActual={() => setMapaActual(a => !a)}
        />
      </div>

      {/* timeline de épocas: pegado al borde inferior, centrado en el mapa */}
      <Timeline
        activeId={periodId}
        onSelect={setPeriodId}
        isDisabled={isPeriodDisabled}
        resetRef={postExilioRef}
        lang={lang}
      />
      <div id="main">
        <div id="map-wrap">
          <MapView
            onSelectLugar={handleSelect}
            onSelectRuta={handleSelectRuta}
            onSelectTerritorio={handleSelectTerritorio}
            flyToTarget={flyToTarget}
            selectedId={selected?.id}
            periodId={periodId}
            testamento={testamento}
            territoriosActive={territoriosActive}
            rutasActive={rutasActive}
            selectedPersonaje={selectedRuta?.personajeId}
            selectedViajeIdx={activeViajeIdx}
            selectedTerritorio={selectedTerritorio}
            panelOffsetX={(!isMobile && drawerOpen && !panelCollapsed) ? 340 : 0}
            lugaresActive={lugaresActive}
            naturalezaActive={naturalezaActive}
            subtiposOcultos={subtiposOcultos}
            mapaActual={mapaActual}
            focusTerritorio={focusTerritorio}
            lang={lang}
          />
        </div>
        <div id="panel" className={[drawerOpen ? 'drawer-open' : '', (!isMobile && panelCollapsed) ? 'panel-collapsed' : ''].filter(Boolean).join(' ')} style={drawerStyle}>
          {selectedRuta ? (
            <PanelRuta ruta={selectedRuta} lugares={lugares} onClose={closeAll} onBack={onBack} onSelectLugar={handleSelect} activeViajeIdx={activeViajeIdx} onNavigateViaje={setActiveViajeIdx} lang={lang} />
          ) : selectedTerritorio ? (
            <PanelTerritorio territorio={selectedTerritorio} onClose={closeAll} onBack={onBack} lugares={lugares} onSelectLugar={handleSelect} lang={lang} />
          ) : selected ? (
            <Panel key={selected.id} lugar={selected} testamento={testamento} onClose={closeAll} onBack={onBack} lang={lang} />
          ) : (
            <>
              <DrawerHeader
                title={welcomeFromMenu ? t(lang, 'how_to') : t(lang, 'app_title')}
                onClose={closeAll}
                onBack={welcomeFromMenu ? () => { setWelcomeFromMenu(false); setDrawerOpen(false); setMenuOpen(true) } : undefined}
              />
              <div id="panel-body" className="panel-body-scroll">
                <PanelBienvenida
                  lang={lang}
                  onBuscar={irAlBuscador}
                  onFicha={abrirFichaJerusalen}
                  onEpoca={verEgiptoEnSuEpoca}
                  onViaje={verViaje}
                  onCapas={abrirCapas}
                />
              </div>
            </>
          )}
        </div>
        <button id="panel-toggle" className={panelCollapsed ? 'collapsed' : ''} onClick={() => setPanelCollapsed(c => !c)} aria-label={panelCollapsed ? t(lang, 'panel_open') : t(lang, 'panel_close')} style={{ '--toggle-top': '72px' } as React.CSSProperties}>
          {panelCollapsed ? '◀' : '▶'}
        </button>
        <div id="menu-drawer" className={menuOpen ? 'drawer-open' : ''} style={drawerStyle}>
          <MenuNav
            lastPlace={selected}
            onGoToPlace={goToLastPlace}
            onClose={closeAll}
            onShowWelcome={() => { setWelcomeFromMenu(true); setMenuOpen(false); setSelected(null); setSelectedRuta(null); setSelectedTerritorio(null); setDrawerOpen(true); setPanelCollapsed(false) }}
            lugares={lugares}
            rutas={rutasIndex}
            territorios={TERRITORY_SEARCH_LIST}
            onSelectLugar={handleSelect}
            onSelectRuta={handleSearchSelectRuta}
            onSelectTerritorio={handleSearchSelectTerritorio}
            lang={lang}
            activoLugarId={selected?.id}
            activoRutaId={selectedRuta?.personajeId}
            activoTerr={selectedTerritorio?.nombreEN}
          />
        </div>
        {showOverlay && <div id="drawer-overlay" className={window.innerWidth >= 769 ? 'desktop-active' : ''} onClick={closeAll} />}
      </div>
    </div>
  )
}
