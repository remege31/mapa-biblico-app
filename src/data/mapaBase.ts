// Mapa base "histórico": tierra y mar lisos, sin países ni ciudades actuales.
// Datos: Natural Earth (dominio público), recortados a la región bíblica en
// public/geo/base_mapa.json. Los colores siguen el estilo de Mundo Homérico.
export const MAPA_BASE = {
  sea: '#B3C7D3',
  land: '#EAE1CB',
  coast: '#A39677',
  river: '#7FA3BC',
} as const

export const BASE_URL = '/geo/base_mapa.json'
export const TILES_ACTUAL_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
