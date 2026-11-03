import { useEffect } from 'react'
import type { RefObject } from 'react'
import L from 'leaflet'
import type { TerritorioSeleccionado } from '../types/lugar'
import { getTerritoryColor, getTerritoryType, getTerritoryNameES, getTerritoryName, getTerritoryCat } from '../data/territorios'
import type { Lang } from '../data/lang'
import { GEOJSON_BY_PERIOD, geojsonCache, isInRegion, getPolygonCenter } from '../components/mapGeo'

// Capa GeoJSON de territorio con acceso tipado a feature + setStyle
type TerritorioLayer = L.Path & { feature?: { properties?: { NAME?: string } } }

export function useTerritoryLayer(opts: {
  mapRef: RefObject<L.Map | null>
  requestIdRef: RefObject<number>
  fadeOutTimeoutRef: RefObject<number | null>
  fadeInTimeoutRef: RefObject<number | null>
  pendingOldRef: RefObject<{ layer: L.GeoJSON | null; labels: L.Marker[] } | null>
  territoriosLayerRef: RefObject<L.GeoJSON | null>
  labelMarkersRef: RefObject<L.Marker[]>
  onSelectTerritorioRef: RefObject<((t: TerritorioSeleccionado) => void) | undefined>
  selectedTerritorioRef: RefObject<TerritorioSeleccionado | null | undefined>
  territoriosActive: boolean
  periodId: string
  zoom: number
  lang: Lang
}) {
  const {
    mapRef, requestIdRef, fadeOutTimeoutRef, fadeInTimeoutRef, pendingOldRef,
    territoriosLayerRef, labelMarkersRef, onSelectTerritorioRef, selectedTerritorioRef,
    territoriosActive, periodId, zoom, lang,
  } = opts

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const myRequestId = ++requestIdRef.current

    // Si quedó un fade-out anterior sin completar, remover esa capa/etiquetas ya
    if (fadeOutTimeoutRef.current) {
      clearTimeout(fadeOutTimeoutRef.current)
      fadeOutTimeoutRef.current = null
      if (pendingOldRef.current) {
        const { layer, labels } = pendingOldRef.current
        if (layer) map.removeLayer(layer)
        labels.forEach(m => map.removeLayer(m))
        pendingOldRef.current = null
      }
    }
    if (fadeInTimeoutRef.current) {
      clearTimeout(fadeInTimeoutRef.current)
      fadeInTimeoutRef.current = null
    }

    // Fade-out de la capa y etiquetas anteriores antes de eliminarlas
    const oldLayer = territoriosLayerRef.current
    const oldLabels = labelMarkersRef.current
    territoriosLayerRef.current = null
    labelMarkersRef.current = []

    if (oldLayer || oldLabels.length) {
      oldLayer?.setStyle({ fillOpacity: 0, opacity: 0 })
      oldLabels.forEach(m => {
        const el = m.getElement()
        if (el) el.style.opacity = '0'
      })

      pendingOldRef.current = { layer: oldLayer, labels: oldLabels }
      fadeOutTimeoutRef.current = window.setTimeout(() => {
        if (mapRef.current) {
          if (oldLayer) mapRef.current.removeLayer(oldLayer)
          oldLabels.forEach(m => mapRef.current!.removeLayer(m))
        }
        pendingOldRef.current = null
        fadeOutTimeoutRef.current = null
      }, 300)
    }

    if (!territoriosActive) return

    const url = GEOJSON_BY_PERIOD[periodId]
    /* QA: sin período seleccionado no hay mapa de territorios — antes esto
       fetcheaba "undefined" y producía un 404 + SyntaxError en consola */
    if (!url) return

    /* QA: caché en memoria — el efecto depende de `zoom` (labels) y antes
       re-fetcheaba el GeoJSON en cada cambio de zoom (1-2s de parpadeo) */
    let cached = geojsonCache.get(url)
    if (!cached) {
      cached = fetch(url).then(r => {
        if (!r.ok) throw new Error(`GeoJSON ${r.status}`)
        return r.json() as Promise<GeoJSON.FeatureCollection>
      })
      cached.catch(() => geojsonCache.delete(url))
      geojsonCache.set(url, cached)
    }

    cached
      .then((data: GeoJSON.FeatureCollection) => {
        if (!mapRef.current) return
        if (myRequestId !== requestIdRef.current) return // respuesta obsoleta

        const filtered = {
          ...data,
          features: data.features.filter(isInRegion),
        }

        const layer = L.geoJSON(filtered, {
          interactive: true,
          style: (feature) => {
            const name: string = feature?.properties?.NAME ?? ''
            const color = getTerritoryColor(name)
            return {
              className: 'territorio-shape',
              fillColor: color,
              fillOpacity: 0,
              color: color,
              weight: 2,
              opacity: 0,
              cursor: 'pointer',
            }
          },
          onEachFeature: (feature, featureLayer) => {
            const name: string = feature.properties?.NAME ?? ''
            if (!name) return

            // Click en el polígono → panel de territorio
            featureLayer.on('click', () => {
              onSelectTerritorioRef.current?.({
                nombreEN: name,
                nombreES: getTerritoryNameES(name),
                tipo: getTerritoryType(name),
                color: getTerritoryColor(name),
                periodo: periodId,
              })
            })

            const center = getPolygonCenter(feature)
            if (!center) return

            const tipo = getTerritoryType(name)
            const color = getTerritoryColor(name)
            const nameES = getTerritoryNameES(name)

            const labelFontSize = zoom >= 7 ? 11 : zoom === 6 ? 9 : 7
            const showCategoria = zoom >= 6
            const categoriaFontSize = Math.max(7, labelFontSize - 2)

            const labelIcon = L.divIcon({
              className: '',
              iconSize: [120, 32],
              iconAnchor: [60, 16],
              html: `
                <div style="
                  text-align:center;
                  pointer-events:none;
                  user-select:none;
                ">
                  <div style="
                    font-family:Georgia,serif;
                    font-size:${labelFontSize}px;
                    font-weight:600;
                    color:${color};
                    text-transform:uppercase;
                    letter-spacing:0.06em;
                    text-shadow:0 0 4px var(--label-halo),0 0 8px var(--label-halo);
                    line-height:1.3;
                  ">${getTerritoryName(lang, name)}</div>
                  ${tipo && showCategoria ? `<div style="
                    font-family:system-ui,sans-serif;
                    font-size:${categoriaFontSize}px;
                    color:#6B6054;
                    text-shadow:0 0 3px var(--label-halo),0 0 6px var(--label-halo);
                    margin-top:1px;
                  ">${getTerritoryCat(lang, name)}</div>` : ''}
                </div>`,
            })

            const labelMarker = L.marker(center, {
              icon: labelIcon,
              interactive: true,
              zIndexOffset: 200,
            })

            labelMarker.on('click', () => {
              onSelectTerritorioRef.current?.({
                nombreEN: name,
                nombreES: nameES,
                tipo,
                color,
                periodo: periodId,
              })
            })

            labelMarker.addTo(mapRef.current!)
            const el = labelMarker.getElement()
            if (el) {
              el.style.transition = 'opacity 300ms ease'
              el.style.opacity = '0'
            }
            labelMarkersRef.current.push(labelMarker)
          },
        })

        layer.addTo(mapRef.current)
        layer.bringToBack()
        territoriosLayerRef.current = layer

        // Fade-in: tras un breve respiro, subir a la opacidad final
        fadeInTimeoutRef.current = window.setTimeout(() => {
          layer.setStyle({ fillOpacity: 0.18, opacity: 0.85 })
          // Restylea el territorio seleccionado si ya hay uno
          const sel = selectedTerritorioRef.current
          if (sel) {
            layer.eachLayer(l => {
              const fl = l as TerritorioLayer
              const name: string = fl.feature?.properties?.NAME ?? ''
              if (name === sel.nombreEN) {
                fl.setStyle({ fillOpacity: 0.38, weight: 3, opacity: 0.85 })
              }
            })
          }
          labelMarkersRef.current.forEach(m => {
            const el = m.getElement()
            if (el) el.style.opacity = '1'
          })
          fadeInTimeoutRef.current = null
        }, 30)
      })
      .catch(console.error)

    return () => {
      if (fadeOutTimeoutRef.current) clearTimeout(fadeOutTimeoutRef.current)
      if (fadeInTimeoutRef.current) clearTimeout(fadeInTimeoutRef.current)
    }
  }, [territoriosActive, periodId, zoom, lang])
}
