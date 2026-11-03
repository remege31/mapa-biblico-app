import { useEffect } from 'react'
import type { RefObject } from 'react'
import L from 'leaflet'
import type { Lugar, ModoTestamento } from '../types/lugar'
import { makeIcon } from '../components/mapIcons'
import { hasAT, hasNT } from '../components/mapFilters'
import { subtipoDe } from '../data/subtipos'

export function useMarkers(opts: {
  mapRef: RefObject<L.Map | null>
  markersRef: RefObject<Map<string, L.Marker>>
  cbRef: RefObject<(lugar: Lugar) => void>
  setShowHint: (value: boolean) => void
  lugares: Lugar[]
  lugaresActive: boolean
  naturalezaActive: boolean
  territoriosActive: boolean
  testamento: ModoTestamento
  selectedId: string | undefined
  showHint: boolean
  periodId: string
  zoom: number
  /* subtipos de pin ocultos desde Capas y filtros (ver data/subtipos.ts) */
  subtiposOcultos: string[]
}) {
  const {
    mapRef, markersRef, cbRef, setShowHint,
    lugares, lugaresActive, naturalezaActive, territoriosActive, testamento, selectedId, showHint, periodId, zoom, subtiposOcultos,
  } = opts
  const ocultosKey = subtiposOcultos.join(',')

  useEffect(() => {
    const map = mapRef.current
    if (!map || !lugares.length) return

    // Todas las capas de puntos apagadas → ocultar todos los pines
    if (!lugaresActive && !naturalezaActive && !territoriosActive) {
      markersRef.current.forEach(m => map.removeLayer(m))
      markersRef.current.clear()
      return
    }

    // Filtrar por capa (según tipo) y por testamento activo.
    //   region_natural → Naturaleza · territorio → Territorio · ciudad → Lugares
    const lugaresFiltrados = lugares.filter(l => {
      const capaActiva =
        l.tipo === 'region_natural' ? naturalezaActive
        : l.tipo === 'territorio' ? territoriosActive
        : lugaresActive
      /* el lugar seleccionado se muestra siempre, aunque su capa, época o testamento estén filtrados */
      if (l.id === selectedId) return true
      if (!capaActiva) return false
      const sub = subtipoDe(l)
      if (sub && ocultosKey.split(',').includes(sub)) return false
      if (testamento === 'AT') return hasAT(l)
      if (testamento === 'NT') return hasNT(l)
      return true
    })

    // Eliminar markers de lugares que ya no son visibles
    markersRef.current.forEach((marker, id) => {
      if (!lugaresFiltrados.find(l => l.id === id)) {
        map.removeLayer(marker)
        markersRef.current.delete(id)
      }
    })

    // Collision avoidance por distancia mínima entre pins
    const ORDEN: Record<string, number> = { primario: 0, secundario: 1, terciario: 2 }
    /* T5: Jerusalén y el lugar seleccionado se pintan primero para que anclen
       su clúster — así conservan su label y los pines superpuestos ocultan el
       suyo (antes los primarios estaban exentos y se apilaban ilegibles). */
    const anchorRank = (id: string) => (id === 'jerusalen' ? 0 : id === selectedId ? 1 : 2)
    const sorted = [...lugaresFiltrados].sort((a, b) => {
      const ra = anchorRank(a.id), rb = anchorRank(b.id)
      if (ra !== rb) return ra - rb
      const ja = a.jerarquia_pin ?? 'primario'
      const jb = b.jerarquia_pin ?? 'primario'
      return (ORDEN[ja] ?? 2) - (ORDEN[jb] ?? 2)
    })

    // Pins ya procesados con su posición en pantalla
    const placedPins: Array<{ x: number; y: number }> = []
    const MIN_DIST = 64 // H-01/03: píxeles mínimos entre pins para mostrar label

    sorted.forEach(lugar => {
      const isJerusalen = lugar.id === 'jerusalen'
      const showPulse = isJerusalen && showHint
      const showTooltip = isJerusalen && showHint

      const periodosAt: string[] = lugar.periodos_at ?? []
      const dimmed = periodId !== 'todos' && !periodosAt.includes(periodId) && lugar.id !== selectedId
      const jerarquia = lugar.jerarquia_pin ?? 'primario'
      const hiddenByZoom = (jerarquia === 'secundario' && zoom < 6) || (jerarquia === 'terciario' && zoom < 8) || (jerarquia === 'sublugar' && zoom < 10) || (jerarquia === 'monte' && zoom < 8) || (jerarquia === 'agua_mayor' && zoom < 7) || (jerarquia === 'agua_menor' && zoom < 9)

      if (hiddenByZoom && lugar.id !== selectedId) {
        const existing = markersRef.current.get(lugar.id)
        if (existing) {
          map.removeLayer(existing)
          markersRef.current.delete(lugar.id)
        }
        return
      }

      const pt = map.latLngToContainerPoint([lugar.lat, lugar.lng])

      /* T5: el anti-colisión ahora aplica también a los primarios (antes
         exentos). Jerusalén y el seleccionado son ancla: nunca ocultan su
         label. El resto oculta el label si se solapa con un pin ya colocado
         de mayor prioridad; el punto permanece (nombre en hover). */
      const isAnchor = isJerusalen || lugar.id === selectedId
      const colisiona = !dimmed && !isAnchor && placedPins.some(p => {
        const dx = pt.x - p.x
        const dy = pt.y - p.y
        return Math.sqrt(dx * dx + dy * dy) < MIN_DIST
      })
      if (!dimmed) placedPins.push({ x: pt.x, y: pt.y })

      const icon = makeIcon(lugar, lugar.id === selectedId, zoom, showPulse, showTooltip, dimmed, colisiona)

      const existing = markersRef.current.get(lugar.id)
      if (existing) {
        map.removeLayer(existing)
        markersRef.current.delete(lugar.id)
      }

      const isSelected = lugar.id === selectedId
      const marker = L.marker([lugar.lat, lugar.lng], {
        icon,
        zIndexOffset: isSelected ? 2000 : jerarquia === 'primario' ? 1000 : jerarquia === 'secundario' ? 500 : 100,
      })

      if (!dimmed) {
        marker.on('click', () => {
          if (isJerusalen && showHint) setShowHint(false)
          cbRef.current(lugar)
        })
      }

      marker.addTo(map)
      if (!dimmed) {
        marker.bindTooltip(lugar.nombre, {
          direction: "top",
          offset: [0, -12],
          className: "pin-tooltip",
        })
      }
      markersRef.current.set(lugar.id, marker)
    })
  }, [lugares, selectedId, zoom, showHint, periodId, testamento, lugaresActive, naturalezaActive, territoriosActive, ocultosKey])
}
