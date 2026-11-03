// Waypoints para rutas — lugares sin JSON propio o excluidos del render de pins.
// Compartido entre MapView (dibujo de rutas) y App (cálculo de km en el panel).
export const WAYPOINTS: Record<string, [number, number]> = {
  'ur':           [30.9628, 46.1027],
  'haran':        [36.8631, 39.0275],
  'madian':       [28.4500, 35.0000],
  'berseba':      [31.2430, 34.7993],
  'siquem':       [32.2073, 35.2860],
  'jerico':       [31.8710, 35.4440],
  'gabaon':       [31.8390, 35.1790],
  'anatot':       [31.8330, 35.2670],
  'belen':        [31.7054, 35.2103],
  'monte-efraim': [32.0500, 35.2000],
  'tabor':        [32.6860, 35.3920],
  'meguido':      [32.5840, 35.1840],
  'monte-carmelo':[32.7500, 35.0500],
  // Excluidos del render de pins pero usados en rutas
  'egipto':       [29.8000, 31.2000],
  'mesopotamia':  [32.5000, 44.5000],
}
