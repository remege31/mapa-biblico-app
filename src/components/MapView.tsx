import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Lugar, RutaSeleccionada, ModoTestamento, TerritorioSeleccionado } from '../types/lugar'
import { useTerritoryLayer } from '../hooks/useTerritoryLayer'
import { useMarkers } from '../hooks/useMarkers'
import { useCharacterRoutes } from '../hooks/useCharacterRoutes'
import { dataBase, type Lang } from '../data/lang'
import { MAPA_BASE, BASE_URL, TILES_ACTUAL_URL } from '../data/mapaBase'

// Capa GeoJSON de territorio con acceso tipado a feature + setStyle
type TerritorioLayer = L.Path & { feature?: { properties?: { NAME?: string } } }

// IDs cargados dinámicamente desde /data/index.json

interface MapViewProps {
  flyToTarget?: {lat: number, lng: number, zoom?: number} | null
  onSelectLugar: (lugar: Lugar) => void
  onSelectRuta?: (ruta: RutaSeleccionada) => void
  onSelectTerritorio?: (t: TerritorioSeleccionado) => void
  onMapReady?: (map: L.Map) => void
  selectedId?: string
  periodId?: string
  testamento?: ModoTestamento
  territoriosActive?: boolean
  rutasActive?: boolean
  selectedPersonaje?: string
  selectedViajeIdx?: number
  selectedTerritorio?: TerritorioSeleccionado | null
  /* T6: px que ocupa el panel lateral (overlay). Se usa para compensar el
     flyTo y que el lugar seleccionado no quede oculto bajo el panel. */
  panelOffsetX?: number
  /* T2b: capa de Lugares (pines). Si está apagada, se ocultan las ciudades. */
  lugaresActive?: boolean
  /* Capa de Naturaleza: ríos, montes y lugares naturales (tipo=region_natural). */
  naturalezaActive?: boolean
  /* Subtipos de pin ocultos (Capas y filtros). */
  subtiposOcultos?: string[]
  /* true: mapa base actual (países y ciudades, tiles Esri); false: mapa histórico liso */
  mapaActual?: boolean
  /* Territorio elegido desde el índice o el buscador: el mapa se encuadra sobre él */
  focusTerritorio?: { nombreEN: string; n: number } | null
  lang?: Lang
}

export function MapView({
  flyToTarget,
  onSelectLugar,
  onSelectRuta,
  onSelectTerritorio,
  onMapReady,
  selectedId,
  periodId = 'hierro_2',
  testamento = 'AT',
  territoriosActive = false,
  rutasActive = false,
  selectedPersonaje,
  selectedViajeIdx,
  selectedTerritorio,
  panelOffsetX = 0,
  lugaresActive = true,
  naturalezaActive = true,
  subtiposOcultos = [],
  mapaActual = false,
  focusTerritorio = null,
  lang = 'es',
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef(new Map<string, L.Marker>())
  const territoriosLayerRef = useRef<L.GeoJSON | null>(null)
  const onSelectRutaRef = useRef(onSelectRuta)
  useEffect(() => { onSelectRutaRef.current = onSelectRuta }, [onSelectRuta])
  const onMapReadyRef = useRef(onMapReady)
  useEffect(() => { onMapReadyRef.current = onMapReady }, [onMapReady])
  const onSelectTerritorioRef = useRef(onSelectTerritorio)
  useEffect(() => { onSelectTerritorioRef.current = onSelectTerritorio }, [onSelectTerritorio])
  const selectedTerritorioRef = useRef(selectedTerritorio)
  useEffect(() => { selectedTerritorioRef.current = selectedTerritorio }, [selectedTerritorio])

  // Restylea polígonos cuando cambia la selección (sin re-fetch del GeoJSON)
  useEffect(() => {
    const layer = territoriosLayerRef.current
    if (!layer) return
    layer.eachLayer(l => {
      const fl = l as TerritorioLayer
      const name: string = fl.feature?.properties?.NAME ?? ''
      const isSelected = name === selectedTerritorio?.nombreEN
      fl.setStyle({
        fillOpacity: isSelected ? 0.5 : selectedTerritorio ? 0.1 : 0.18,
        weight: isSelected ? 4.5 : 2,
        opacity: isSelected ? 1 : 0.85,
      })
    })
  }, [selectedTerritorio])

  const labelMarkersRef = useRef<L.Marker[]>([])
  const fadeOutTimeoutRef = useRef<number | null>(null)
  const fadeInTimeoutRef = useRef<number | null>(null)
  const pendingOldRef = useRef<{ layer: L.GeoJSON | null; labels: L.Marker[] } | null>(null)
  const requestIdRef = useRef(0)
  const cbRef = useRef(onSelectLugar)
  const [lugares, setLugares] = useState<Lugar[]>([])
  const [zoom, setZoom] = useState(9) /* M-14: coincidir con zoom inicial del mapa */
  const [showHint, setShowHint] = useState(() => window.innerWidth < 769)

  useEffect(() => { cbRef.current = onSelectLugar }, [onSelectLugar])

  /* T6: offset del panel leído por ref para no re-disparar el flyTo al
     abrir/cerrar el panel */
  const panelOffsetRef = useRef(panelOffsetX)
  useEffect(() => { panelOffsetRef.current = panelOffsetX }, [panelOffsetX])

  useEffect(() => {
    if (!flyToTarget || !mapRef.current) return
    const map = mapRef.current
    const targetZoom = flyToTarget.zoom !== undefined
      ? flyToTarget.zoom
      : Math.max(map.getZoom(), 10)
    /* QA: esperar a que termine la transición del panel (300ms) antes de volar.
       Con el panel colapsado, el flyTo inmediato se cancelaba y el mapa
       no navegaba al lugar seleccionado desde la búsqueda. */
    const t = window.setTimeout(() => {
      map.invalidateSize({ animate: false })
      /* T6: si el panel está visible, desplazar el centro a la derecha medio
         panel para que el lugar quede centrado en el área visible (no oculto
         ni con su label cortado bajo el panel). */
      const offsetX = panelOffsetRef.current
      let center: [number, number] = [flyToTarget.lat, flyToTarget.lng]
      if (offsetX > 0) {
        const pt = map.project([flyToTarget.lat, flyToTarget.lng], targetZoom)
        const c = map.unproject(pt.add([offsetX / 2, 0]), targetZoom)
        center = [c.lat, c.lng]
      }
      map.flyTo(center, targetZoom, { animate: true, duration: 1.2 })
    }, 350)
    return () => window.clearTimeout(t)
  }, [flyToTarget])

  useEffect(() => {
    const base = dataBase(lang)
    fetch('/data/index.json')
      .then(r => r.json() as Promise<string[]>)
      .then(ids =>
        Promise.all(
          ids.map(id =>
            fetch(`${base}/${id}.json`)
              .then(r => r.ok ? r.json() as Promise<Lugar> : fetch(`/data/${id}.json`).then(r2 => r2.ok ? r2.json() as Promise<Lugar> : null))
              .catch(() => null)
          )
        )
      )
      .then(results => setLugares(results.filter((l): l is Lugar => l != null && !['mesopotamia', 'egipto', 'massah'].includes(l.id))))
      .catch(console.error)
  }, [lang])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const markers = markersRef.current

    /* M-15: en mobile usar zoom más alejado y centro más al norte para ver Galilea */
    const isMobileInit = window.innerWidth < 769
    const map = L.map(containerRef.current, {
      center: isMobileInit ? [32.3, 35.3] : [31.8, 35.5],
      zoom: isMobileInit ? 8 : 9,
      minZoom: 4,
      maxZoom: 19,
      zoomControl: false,
    })

    /* En esquinas inferiores Leaflet ANTEPONE cada control nuevo (insertBefore),
       así que el último añadido queda arriba. Para que la escala quede DEBAJO
       de los botones, añadimos primero la escala y luego el zoom. */
    L.control.scale({ position: 'bottomright', imperial: false, maxWidth: 120 }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    /* Mapa base histórico: tierra, lagos y ríos de Natural Earth en un panel
       propio bajo los pines. El mar es el color de fondo del contenedor. */
    map.createPane('basePane')
    const basePane = map.getPane('basePane')
    if (basePane) basePane.style.zIndex = '150'
    map.attributionControl.addAttribution('Mapa base: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a>')
    fetch(BASE_URL)
      .then(r => r.json())
      .then(base => {
        if (!mapRef.current) return
        const renderer = L.canvas({ pane: 'basePane' })
        const comun = { pane: 'basePane', renderer, interactive: false } as const
        const grupo = L.layerGroup()
        L.geoJSON(base.land, { ...comun, style: { fillColor: MAPA_BASE.land, fillOpacity: 1, color: MAPA_BASE.coast, weight: 0.8 } }).addTo(grupo)
        L.geoJSON(base.lakes, { ...comun, style: { fillColor: MAPA_BASE.sea, fillOpacity: 1, color: MAPA_BASE.coast, weight: 0.8 } }).addTo(grupo)
        L.geoJSON(base.rivers, { ...comun, style: { color: MAPA_BASE.river, weight: 1.3, opacity: 0.9, fill: false } }).addTo(grupo)
        grupo.addTo(map)
      })
      .catch(console.error)

    map.on('zoomend', () => setZoom(map.getZoom()))
    setZoom(map.getZoom()) /* M-14: sincronizar estado con zoom real del mapa */
    mapRef.current = map
    onMapReadyRef.current?.(map)

    /* QA: mantener el tamaño interno de Leaflet sincronizado con el contenedor
       (colapso/expansión del panel, rotación en mobile, etc.) */
    const ro = new ResizeObserver(() => {
      mapRef.current?.invalidateSize({ animate: false })
    })
    ro.observe(map.getContainer())

    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
      markers.clear()
      territoriosLayerRef.current = null
    }
  }, [])

  const rutasLayerRef = useRef<L.LayerGroup | null>(null)

  /* Encuadra el territorio elegido: la capa se carga en segundo plano, así que se reintenta unos segundos */
  useEffect(() => {
    if (!focusTerritorio) return
    let intentos = 0
    const id = window.setInterval(() => {
      const map = mapRef.current
      intentos++
      let bounds: L.LatLngBounds | null = null
      territoriosLayerRef.current?.eachLayer(l => {
        const fl = l as TerritorioLayer & { getBounds?: () => L.LatLngBounds }
        if (fl.feature?.properties?.NAME === focusTerritorio.nombreEN && fl.getBounds) bounds = fl.getBounds()
      })
      if (map && bounds) {
        window.clearInterval(id)
        map.flyToBounds(bounds, {
          paddingTopLeft: [20, 90],
          paddingBottomRight: [panelOffsetRef.current + 20, 130],
          maxZoom: 8,
          duration: 1.0,
        })
      } else if (intentos > 30) {
        window.clearInterval(id)
      }
    }, 150)
    return () => window.clearInterval(id)
  }, [focusTerritorio])

  /* "Mapa actual": muestra los tiles con países y ciudades modernos y oculta el mapa histórico */
  const tilesActualRef = useRef<L.TileLayer | null>(null)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const pane = map.getPane('basePane')
    if (mapaActual) {
      if (!tilesActualRef.current) {
        tilesActualRef.current = L.tileLayer(TILES_ACTUAL_URL, {
          attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; HERE, DeLorme, MapmyIndia, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          maxNativeZoom: 16,
        })
      }
      tilesActualRef.current.addTo(map)
      if (pane) pane.style.display = 'none'
    } else {
      if (tilesActualRef.current) map.removeLayer(tilesActualRef.current)
      if (pane) pane.style.display = ''
    }
  }, [mapaActual])

  // ─── Capas del mapa (hooks) ───────────────────────────────────────────────
  useTerritoryLayer({
    mapRef, requestIdRef, fadeOutTimeoutRef, fadeInTimeoutRef, pendingOldRef,
    territoriosLayerRef, labelMarkersRef, onSelectTerritorioRef, selectedTerritorioRef,
    territoriosActive, periodId, zoom, lang,
  })
  useMarkers({
    mapRef, markersRef, cbRef, setShowHint,
    lugares, lugaresActive, naturalezaActive, territoriosActive, testamento, selectedId, showHint, periodId, zoom, subtiposOcultos,
  })
  useCharacterRoutes({
    mapRef, rutasLayerRef, onSelectRutaRef,
    rutasActive, lugares, periodId, zoom, selectedPersonaje, selectedViajeIdx,
  })

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', background: mapaActual ? 'var(--bg-map)' : MAPA_BASE.sea }}
    />
  )
}
