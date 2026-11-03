// Panel inicial "Cómo explorar el mapa": cinco gestos, cada uno con un botón
// que ejecuta la acción en el mapa (sustituye al antiguo tour con foco).
import type { Lang } from '../data/lang'
import { t } from '../data/ui'

export function PanelBienvenida({ lang, onBuscar, onFicha, onEpoca, onViaje, onCapas }: {
  lang: Lang
  onBuscar: () => void
  onFicha: () => void
  onEpoca: () => void
  onViaje: (nombre: string) => void
  onCapas: () => void
}) {
  const pasos: { n: number; titulo: string; desc: string; cta?: string; onClick?: () => void; viajes?: string[] }[] = [
    { n: 1, titulo: t(lang, 'cx1_t'), desc: t(lang, 'cx1_d'), cta: t(lang, 'cx1_b'), onClick: onBuscar },
    { n: 2, titulo: t(lang, 'cx2_t'), desc: t(lang, 'cx2_d'), cta: t(lang, 'cx2_b'), onClick: onFicha },
    { n: 3, titulo: t(lang, 'cx3_t'), desc: t(lang, 'cx3_d'), cta: t(lang, 'cx3_b'), onClick: onEpoca },
    { n: 4, titulo: t(lang, 'cx4_t'), desc: t(lang, 'cx4_d'), viajes: ['Abraham', 'Moisés', 'David', 'Pablo'] },
    { n: 5, titulo: t(lang, 'cx5_t'), desc: t(lang, 'cx5_d'), cta: t(lang, 'cx5_b'), onClick: onCapas },
  ]
  return (
    <div className="cx-wrap">
      <h2 className="cx-title">{t(lang, 'cx_title')}</h2>
      <p className="cx-sub">{t(lang, 'cx_sub')}</p>
      <ol className="cx-list">
        {pasos.map(p => (
          <li key={p.n} className="cx-step">
            <span className="cx-num" aria-hidden="true">{p.n}</span>
            <div className="cx-body">
              <div className="cx-step-title">{p.titulo}</div>
              <p className="cx-step-desc">{p.desc}</p>
              {p.viajes ? (
                <div className="cx-chips">
                  {p.viajes.map(v => (
                    <button key={v} type="button" className="cx-cta" data-viaje={v} onClick={() => onViaje(v)}>{v} →</button>
                  ))}
                </div>
              ) : (
                <button type="button" className="cx-cta" onClick={p.onClick}>{p.cta}</button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
