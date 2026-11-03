import L from 'leaflet'
import type { Lugar } from '../types/lugar'
import { t, currentLang } from '../data/ui'

// Radio base por jerarquía visual (7 / 5 / 3 px antes de aplicar zoomScale)
const PIN_RADIUS: Record<string, number> = { primario: 6, secundario: 5, terciario: 3, sublugar: 3, monte: 4, agua_mayor: 5, agua_menor: 3 }
const PIN = { fill: '#3C3C3C', stroke: '#fff', labelSize: 11 }

export function makeIcon(
  lugar: Lugar,
  selected: boolean,
  zoom: number,
  showPulse: boolean,
  showTooltip: boolean,
  dimmed: boolean,
  hideLabelOverride: boolean = false
): L.DivIcon {
  const zoomScale = Math.max(0.6, Math.min(1.6, (zoom - 3) / 4))
  const jerarquiaLugar = lugar.jerarquia_pin ?? 'primario'
  const baseRadius = PIN_RADIUS[jerarquiaLugar] ?? PIN_RADIUS.primario
  // Rasgos naturales: forma + color por subtipo (agua/montania/valle/desierto).
  // Montaña y valle comparten verde; se distinguen por la forma.
  const isNat = lugar.tipo === 'region_natural'
  const natSub = isNat ? (lugar.subtipo_natural ?? 'agua') : null
  const NAT_FILL: Record<string, string> = { agua: '#2E5F8A', montania: '#4A7C4E', valle: '#4A7C4E', desierto: '#C9A84C' }
  const NAT_FILL_SEL: Record<string, string> = { agua: '#1a3f5c', montania: '#2d5c32', valle: '#2d5c32', desierto: '#9C7F2F' }
  const rawR = Math.round(baseRadius * zoomScale)
  const minR = isNat ? 4 : 2
  const r = Math.max(rawR, minR)
  const labelSize = Math.min(15, Math.max(9, Math.round(PIN.labelSize * zoomScale)))
  const d = r * 2
  const fillBase = natSub ? (NAT_FILL[natSub] ?? PIN.fill) : PIN.fill
  const fillSelected = natSub ? (NAT_FILL_SEL[natSub] ?? '#8B4A26') : '#8B4A26'
  const fill = selected ? fillSelected : fillBase
  const labelColor = selected ? fillSelected : fillBase
  const shadow = selected
    ? 'box-shadow:0 2px 6px rgba(0,0,0,.35);'
    : 'box-shadow:0 1px 4px rgba(0,0,0,.25);'
  /* Selección: aro doble (blanco + color) detrás del pin. Es un elemento
     aparte porque clip-path recortaría el box-shadow en montes/valles/desiertos. */
  const ringR = r + 8
  const selRingHtml = selected ? `
    <div aria-hidden="true" style="
      position:absolute;top:${r}px;left:50%;
      transform:translate(-50%,-50%);
      width:${ringR * 2}px;height:${ringR * 2}px;
      border-radius:50%;box-sizing:border-box;
      background:rgba(255,255,255,0.85);
      border:3px solid ${fillSelected};
      box-shadow:0 0 0 2px #fff,0 2px 8px rgba(0,0,0,.4);
      pointer-events:none;
    "></div>` : ''
  const subtipoGeo = lugar.subtipo_geo ?? null
  const labelBase = lugar.id === 'jerusalen' ? `${lugar.nombre} ★` : lugar.nombre
  const label = subtipoGeo ? `${subtipoGeo} ${labelBase}` : labelBase
  const hideLabel = dimmed || hideLabelOverride
  const opacity = dimmed ? '0.45' : '1'

  const pulseHtml = showPulse ? `
    <div style="
      position:absolute;top:50%;left:50%;
      transform:translate(-50%,-50%);
      width:${d + 16}px;height:${d + 16}px;
      border-radius:50%;
      border:2px solid #8B4A26;
      animation:pulse-ring 1.8s ease-out infinite;
      pointer-events:none;
    "></div>` : ''

  const tooltipHtml = showTooltip ? `
    <div style="
      position:absolute;bottom:${d + 22}px;left:50%;
      transform:translateX(-50%);
      background:#3C3C3C;color:#F5F0E8;
      font-size:12px;font-family:system-ui,sans-serif;
      padding:4px 8px;border-radius:6px;
      white-space:nowrap;pointer-events:none;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    ">${t(currentLang, 'tap_explore')}
      <div style="
        position:absolute;bottom:-5px;left:50%;
        transform:translateX(-50%);
        width:0;height:0;
        border-left:5px solid transparent;
        border-right:5px solid transparent;
        border-top:5px solid #3C3C3C;
      "></div>
    </div>` : ''

  return L.divIcon({
    className: '',
    iconSize: [d + 120, d + 60],
    iconAnchor: [(d + 120) / 2, r],
    html: `
      <style>
        @keyframes pulse-ring {
          0%   { transform:translate(-50%,-50%) scale(0.8); opacity:0.8; }
          100% { transform:translate(-50%,-50%) scale(1.8); opacity:0; }
        }
      </style>
      <div
        tabindex="${dimmed ? '-1' : '0'}"
        role="${dimmed ? 'none' : 'button'}"
        aria-label="${dimmed ? '' : t(currentLang, 'explore_v') + ' ' + lugar.nombre}"
        aria-disabled="${dimmed ? 'true' : 'false'}"
        onkeydown="if(!${dimmed}&&(event.key==='Enter'||event.key===' ')){event.preventDefault();this.click();}"
        style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:${dimmed?'default':'pointer'};opacity:${opacity};overflow:visible;">
        ${tooltipHtml}
        ${selRingHtml}
        ${pulseHtml}
        <div style="
          width:${d}px;height:${d}px;
          ${
            natSub === 'montania' ? 'clip-path:polygon(50% 0%, 0% 100%, 100% 100%);border:none;'
            : natSub === 'valle' ? 'clip-path:polygon(0% 0%, 100% 0%, 50% 100%);border:none;'
            : natSub === 'desierto' ? 'clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);border:none;'
            : natSub === 'agua' ? 'border-radius:50%;'
            : jerarquiaLugar === 'sublugar' ? 'border-radius:2px;'
            : 'border-radius:50%;'
          }
          background:${fill};
          border:2px solid ${PIN.stroke};
          ${shadow}
          transition:all .2s;
          position:relative;z-index:1;
        "></div>
        <span style="
          font-size:${labelSize}px;font-weight:500;
          color:${labelColor};font-family:system-ui,sans-serif;
          white-space:nowrap;margin-top:2px;
          text-shadow:0 0 4px var(--label-halo),0 0 8px var(--label-halo),0 0 12px var(--label-halo);
          visibility:${hideLabel ? 'hidden' : 'visible'};
        ">${label}</span>
      </div>`,
  })
}
