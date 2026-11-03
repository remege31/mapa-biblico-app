/* T7: GeoJSON servidos localmente desde /public/data/geo/ (antes en
   raw.githubusercontent.com, sin SLA). Fuente: aourednik/historical-basemaps. */
export const GEOJSON_BY_PERIOD: Record<string, string> = {
  bronce_medio:        '/data/geo/world_bc2000.geojson',
  bronce_tardio:       '/data/geo/world_bc1500.geojson',
  hierro_1:            '/data/geo/world_bc1000.geojson',
  hierro_2:            '/data/geo/world_bc1000.geojson',
  post_exilio:         '/data/geo/world_bc500.geojson',
  vida_jesus:          '/data/geo/world_bc1.geojson',
  apostolico:          '/data/geo/world_bc1.geojson',
}

/* QA: caché en memoria url → promesa del GeoJSON (evita re-fetch por zoom) */
export const geojsonCache = new Map<string, Promise<GeoJSON.FeatureCollection>>()

const REGION_BOUNDS = {
  minLat: 20, maxLat: 42,
  minLng: 25, maxLng: 55,
}

export function isInRegion(feature: GeoJSON.Feature): boolean {
  try {
    const geom = feature.geometry
    if (geom.type === 'Polygon') {
      const coords = geom.coordinates[0]
      return coords.some(([lng, lat]) =>
        lat >= REGION_BOUNDS.minLat && lat <= REGION_BOUNDS.maxLat &&
        lng >= REGION_BOUNDS.minLng && lng <= REGION_BOUNDS.maxLng
      )
    }
    if (geom.type === 'MultiPolygon') {
      return geom.coordinates.some(poly =>
        poly[0].some(([lng, lat]) =>
          lat >= REGION_BOUNDS.minLat && lat <= REGION_BOUNDS.maxLat &&
          lng >= REGION_BOUNDS.minLng && lng <= REGION_BOUNDS.maxLng
        )
      )
    }
  } catch { /* ignorar */ }
  return false
}

export function getPolygonCenter(feature: GeoJSON.Feature): [number, number] | null {
  try {
    const geom = feature.geometry
    let coords: number[][] = []
    if (geom.type === 'Polygon') {
      coords = geom.coordinates[0]
    } else if (geom.type === 'MultiPolygon') {
      // Usar el polígono más grande
      let maxLen = 0
      for (const poly of geom.coordinates) {
        if (poly[0].length > maxLen) {
          maxLen = poly[0].length
          coords = poly[0]
        }
      }
    }
    if (!coords.length) return null
    const lngSum = coords.reduce((s, c) => s + c[0], 0)
    const latSum = coords.reduce((s, c) => s + c[1], 0)
    return [latSum / coords.length, lngSum / coords.length]
  } catch { return null }
}
