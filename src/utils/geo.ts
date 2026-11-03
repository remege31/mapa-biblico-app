// Distancia haversine (en línea recta sobre la esfera) en km entre dos puntos
// [lat, lng]. Aproximada: no refleja el trayecto real por caminos antiguos.
export function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371 // radio medio de la Tierra en km
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Encuadre aproximado para un conjunto de puntos [lat, lng]: centro y zoom de
// Leaflet con el que caben en pantalla (descontando el panel lateral en escritorio).
export function encuadre(puntos: [number, number][]): { lat: number; lng: number; zoom: number } | null {
  if (puntos.length === 0) return null
  const lats = puntos.map(p => p[0]), lngs = puntos.map(p => p[1])
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const lat = (minLat + maxLat) / 2, lng = (minLng + maxLng) / 2
  const anchoPx = Math.max(300, window.innerWidth - (window.innerWidth >= 769 ? 380 : 0))
  const altoPx = Math.max(300, window.innerHeight - 220)
  const margen = 1.35
  const spanLng = Math.max((maxLng - minLng) * margen, 0.05)
  const spanLat = Math.max(((maxLat - minLat) / Math.cos((lat * Math.PI) / 180)) * margen, 0.05)
  const z = Math.min(
    Math.log2((360 * anchoPx) / (256 * spanLng)),
    Math.log2((360 * altoPx) / (256 * spanLat)),
  )
  return { lat, lng, zoom: Math.max(4, Math.min(10, Math.floor(z))) }
}
