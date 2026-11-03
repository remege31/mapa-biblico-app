import { useEffect } from 'react'
import type { RefObject } from 'react'
import L from 'leaflet'
import type { Lugar, Personaje, Viaje, RutaSeleccionada } from '../types/lugar'
import { WAYPOINTS } from '../data/waypoints'
import { PERSONAJE_COLORS, DEFAULT_COLOR } from '../data/rutaColors'
import { periodoAEpoca } from '../data/periods'

export function useCharacterRoutes(opts: {
  mapRef: RefObject<L.Map | null>
  rutasLayerRef: RefObject<L.LayerGroup | null>
  onSelectRutaRef: RefObject<((ruta: RutaSeleccionada) => void) | undefined>
  rutasActive: boolean
  lugares: Lugar[]
  periodId: string
  zoom: number
  selectedPersonaje: string | undefined
  selectedViajeIdx: number | undefined
}) {
  const {
    mapRef, rutasLayerRef, onSelectRutaRef,
    rutasActive, lugares, periodId, zoom, selectedPersonaje, selectedViajeIdx,
  } = opts

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (rutasLayerRef.current) {
      map.removeLayer(rutasLayerRef.current)
      rutasLayerRef.current = null
    }
    if (!rutasActive || !lugares.length) return

    const coordMap: Record<string, [number, number]> = { ...WAYPOINTS }
    lugares.forEach(l => { coordMap[l.id] = [l.lat, l.lng] })

    // Helper: punto geográfico medio de una polilínea
    function midpoint(pts: [number, number][]): [number, number] {
      let totalLen = 0
      for (let j = 1; j < pts.length; j++) {
        const dlat = pts[j][0] - pts[j-1][0], dlng = pts[j][1] - pts[j-1][1]
        totalLen += Math.sqrt(dlat*dlat + dlng*dlng)
      }
      let remaining = totalLen / 2
      let mid: [number, number] = pts[0]
      for (let j = 1; j < pts.length; j++) {
        const dlat = pts[j][0] - pts[j-1][0], dlng = pts[j][1] - pts[j-1][1]
        const segLen = Math.sqrt(dlat*dlat + dlng*dlng)
        if (remaining <= segLen) {
          const t = remaining / segLen
          mid = [pts[j-1][0] + t * dlat, pts[j-1][1] + t * dlng]
          break
        }
        remaining -= segLen
      }
      return mid
    }

    // Helper: crear icono de label
    function makeLabelIcon(text: string, color: string) {
      return L.divIcon({
        className: '',
        iconSize: [100, 20],
        iconAnchor: [50, 10],
        html: `<div style="font-family:system-ui,sans-serif;font-size:11px;font-weight:600;color:${color};background:rgba(245,240,232,0.9);border:1px solid ${color};border-radius:4px;padding:2px 8px;white-space:nowrap;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.15);cursor:pointer;">${text}</div>`,
      })
    }

    const group = L.layerGroup()

    // Construir mapa de personajes deduplicado por nombre
    // Preferir entradas con viajes sobre entradas con ruta plana
    type PData = { p: Personaje; color: string }
    const personajeData = new Map<string, PData>()
    lugares.forEach(lugar => {
      ;(lugar.personajes ?? []).forEach(p => {
        /* QA: sin filtro de época ('todos') se muestran todas las rutas.
           El campo `periodo` mezcla IDs de época y fechas en texto libre
           ('c. 975 a.C.'), así que se normaliza con periodoAEpoca en vez de
           comparar por igualdad exacta (antes ~28% de rutas nunca aparecían). */
        if (!p.ruta && !p.viajes) return
        if (periodId !== 'todos' && periodoAEpoca(p.periodo ?? '') !== periodId) return
        const existing = personajeData.get(p.nombre)
        const tieneViajes = !!p.viajes && p.viajes.length > 0
        if (!existing || (tieneViajes && !existing.p.viajes)) {
          personajeData.set(p.nombre, {
            p,
            color: PERSONAJE_COLORS[p.nombre] ?? DEFAULT_COLOR,
          })
        }
      })
    })

    // Hay alguna ruta seleccionada?
    const haySeleccion = !!selectedPersonaje

    personajeData.forEach(({ p, color }, nombre) => {
      const isMismoPersonaje = haySeleccion && selectedPersonaje === nombre
      const viajes: Viaje[] | undefined = p.viajes
      const hasViajes = viajes && viajes.length > 0

      if (hasViajes) {
        // ── Personaje con múltiples viajes ──────────────────────────────
        viajes.forEach((viaje, viajeIdx) => {
          const pts = (viaje.ruta as string[])
            .filter(id => coordMap[id])
            .map(id => coordMap[id] as [number, number])
          if (pts.length < 2) return

          const isActiveViaje = isMismoPersonaje && selectedViajeIdx === viajeIdx
          const opacity = haySeleccion
            ? (isActiveViaje ? 1 : isMismoPersonaje ? 0.5 : 0.2)
            : 0.8

          const rutaPayload: RutaSeleccionada = {
            nombre: p.nombre,
            rol: p.rol ?? '',
            periodo: p.periodo ?? '',
            descripcion: p.descripcion ?? '',
            referencias: viaje.referencias ?? p.referencias ?? [],
            ruta: viaje.ruta,
            color,
            personajeId: nombre,
            viajeIdx,
            viajeNombre: viaje.nombre,
            viajes,
          }

          const baseWeight = isActiveViaje ? 4.5 : 2
          if (isActiveViaje) L.polyline(pts, { color: '#fff', weight: baseWeight + 4, opacity: 0.9, interactive: false }).addTo(group)
          const visLine = L.polyline(pts, { color, weight: baseWeight, opacity, dashArray: '6 4', interactive: false })
          visLine.addTo(group)

          // T4: línea gruesa invisible = zona de interacción. Hover → tooltip
          // con el nombre + engrosa la línea; click → selecciona la ruta.
          const tipText = viaje.nombre ? `${p.nombre} — ${viaje.nombre}` : p.nombre
          L.polyline(pts, { color, weight: 20, opacity: 0 })
            .bindTooltip(tipText, { sticky: true, direction: 'top', className: 'ruta-tooltip', opacity: 1 })
            .on('mouseover', () => visLine.setStyle({ weight: 4, opacity: Math.max(opacity, 0.85) }))
            .on('mouseout', () => visLine.setStyle({ weight: baseWeight, opacity }))
            .on('click', () => onSelectRutaRef.current?.(rutaPayload))
            .addTo(group)
        })

        // T4: label persistente SOLO para la ruta seleccionada (antes se
        // mostraba en todas y se apilaban ilegibles cerca de Jerusalén)
        if (isMismoPersonaje && zoom >= 7) {
          const firstViajePts = viajes
            .map(v => v.ruta.filter(id => coordMap[id]).map(id => coordMap[id] as [number, number]))
            .find((pts: [number,number][]) => pts.length >= 2)
          if (firstViajePts && p.nombre.trim()) {
            const mid = midpoint(firstViajePts)
            const labelText = `${p.nombre} · ${viajes.length}`
            const payload0: RutaSeleccionada = {
              nombre: p.nombre, rol: p.rol ?? '',
              periodo: p.periodo ?? '', descripcion: p.descripcion ?? '',
              referencias: viajes[0].referencias ?? p.referencias ?? [],
              ruta: viajes[0].ruta, color,
              personajeId: nombre, viajeIdx: 0,
              viajeNombre: viajes[0].nombre, viajes,
            }
            L.marker(mid, { icon: makeLabelIcon(labelText, color), interactive: true, zIndexOffset: 500 })
              .on('click', () => onSelectRutaRef.current?.(payload0))
              .addTo(group)
          }
        }

      } else {
        // ── Personaje con ruta plana (sin viajes) ───────────────────────
        const pts = (p.ruta ?? [])
          .filter((id: string) => coordMap[id])
          .map((id: string) => coordMap[id] as [number, number])
        if (pts.length < 2) return

        const opacity = haySeleccion ? (isMismoPersonaje ? 1 : 0.2) : 0.8

        const rutaPayload: RutaSeleccionada = {
          nombre: p.nombre, rol: p.rol ?? '',
          periodo: p.periodo ?? '', descripcion: p.descripcion ?? '',
          referencias: p.referencias ?? [], ruta: p.ruta ?? [], color,
          personajeId: nombre, viajeIdx: 0, viajes: undefined,
        }

        const baseWeight = isMismoPersonaje ? 4.5 : 2
        if (isMismoPersonaje) L.polyline(pts, { color: '#fff', weight: baseWeight + 4, opacity: 0.9, interactive: false }).addTo(group)
        const visLine = L.polyline(pts, { color, weight: baseWeight, opacity, dashArray: '6 4', interactive: false })
        visLine.addTo(group)

        // T4: hover → tooltip + engrosa; click → selecciona
        L.polyline(pts, { color, weight: 20, opacity: 0 })
          .bindTooltip(p.nombre, { sticky: true, direction: 'top', className: 'ruta-tooltip', opacity: 1 })
          .on('mouseover', () => visLine.setStyle({ weight: 4, opacity: Math.max(opacity, 0.85) }))
          .on('mouseout', () => visLine.setStyle({ weight: baseWeight, opacity }))
          .on('click', () => onSelectRutaRef.current?.(rutaPayload))
          .addTo(group)

        // T4: label persistente SOLO para la ruta seleccionada
        if (isMismoPersonaje && zoom >= 7 && p.nombre.trim()) {
          const mid = midpoint(pts)
          L.marker(mid, { icon: makeLabelIcon(p.nombre, color), interactive: true, zIndexOffset: 500 })
            .on('click', () => onSelectRutaRef.current?.(rutaPayload))
            .addTo(group)
        }
      }
    })

    group.addTo(map)
    rutasLayerRef.current = group
  }, [rutasActive, lugares, periodId, zoom, selectedPersonaje, selectedViajeIdx])
}
