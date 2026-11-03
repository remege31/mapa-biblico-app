// Componentes de presentación (tarjetas y elementos de UI) usados por los
// paneles de contenido. Extraídos de App.tsx: solo reciben props, sin estado
// propio del contenedor.
import type { ReactNode } from 'react'
import type { Historia, Personaje, Mito, EventoParalelo } from '../types/lugar'
import { KNOWN_PERIOD_IDS } from '../data/periods'
import { useLang, t, periodName } from '../data/ui'
import { tEvento } from '../data/dataI18n'
import { esCitaBiblica, refHref } from '../data/refs'

export function Acc({ title, open, onToggle, children }: {
  title: string; open: boolean; onToggle: () => void; children: ReactNode
}) {
  return (
    <div className="acc">
      <div className={`acc-h${open ? ' open' : ''}`} onClick={onToggle}>
        <span className="acc-title">{title}</span>
        <span className={`acc-ch${open ? ' open' : ''}`}>▼</span>
      </div>
      {open && <div className="acc-body">{children}</div>}
    </div>
  )
}

export function HistoriaCard({ h }: { h: Historia }) {
  const lang = useLang()
  return (
    <div className="story-card">
      <div className="story-head">
        <div className="story-title">{h.titulo}</div>
        <div className="story-date">{h.fecha}</div>
      </div>
      <div className="story-body">
        <p className="desc">{h.descripcion}</p>
        {h.referencias.length > 0 && (
          <div className="meta">
            <span className="ml">{t(lang, 'ref')}</span>
            {h.referencias.map(r => esCitaBiblica(r)
              ? <a key={r} className="ref" href={refHref(r, lang)} target="_blank" rel="noopener noreferrer">{r}</a>
              : <span key={r} className="ref ref-plain">{r}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function PersonajeCard({ p }: { p: Personaje }) {
  const lang = useLang()
  const periodoDisplay = KNOWN_PERIOD_IDS.has(p.periodo) ? periodName(lang, p.periodo) : p.periodo
  return (
    <div className="person-card">
      <div className="person-head">
        <div>
          <div className="pname">{p.nombre}</div>
          <div className="prole">{p.rol} · {periodoDisplay}</div>
        </div>
      </div>
      <div className="story-body">
        <p className="desc">{p.descripcion}</p>
        {p.referencias.length > 0 && (
          <div className="meta">
            <span className="ml">{t(lang, 'ref')}</span>
            {p.referencias.slice(0, 3).map(r => esCitaBiblica(r)
              ? <a key={r} className="ref" href={refHref(r, lang)} target="_blank" rel="noopener noreferrer">{r}</a>
              : <span key={r} className="ref ref-plain">{r}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const TRADICIONES = [
  { key: 'judaismo' as const,     label: 'Judaísmo' },
  { key: 'cristianismo' as const, label: 'Cristianismo' },
  { key: 'islam' as const,        label: 'Islam' },
]

export function MitoCard({ m }: { m: Mito }) {
  const lang = useLang()
  return (
    <div className="myth-card">
      <div className="myth-head">
        <div className="myth-name">{m.nombre}</div>
        <div className="cb-row">
          {TRADICIONES.map(tr => (
            <div key={tr.key} className="cb-item">
              <div className={`cb ${m.aparece_en[tr.key] ? 'cb-on' : 'cb-off'}`}>
                {m.aparece_en[tr.key] ? '✓' : ''}
              </div>
              {t(lang, 'trad_' + tr.key)}
            </div>
          ))}
        </div>
      </div>
      {TRADICIONES.map(tr => {
        const td = m[tr.key]
        if (!td) return (
          <div key={tr.key} className="rel-block">
            <div className="rel-name">{t(lang, 'trad_' + tr.key)}</div>
            <div className="rel-na">{t(lang, 'no_aplica')}</div>
          </div>
        )
        return (
          <div key={tr.key} className="rel-block">
            <div className="rel-name">{t(lang, 'trad_' + tr.key)}</div>
            <div className="rel-desc">{td.descripcion}</div>
            <div className="src">{td.fuente_primaria}</div>
            {(td.diferencias || td.similitudes) && (
              <div className="diff-row">
                {td.diferencias && <span className="diff-tag">{t(lang, 'diferencia')}: {td.diferencias.slice(0, 70)}</span>}
                {td.similitudes && <span className="diff-tag">{t(lang, 'similitud')}: {td.similitudes.slice(0, 70)}</span>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function EventoCard({ e }: { e: EventoParalelo }) {
  const lang = useLang()
  const ev = tEvento(lang, e.civilizacion)
  return (
    <div className="civ-card">
      <div className="civ-head">
        <span className="civ-name">{ev?.civ ?? e.civilizacion}</span>
        <span className="civ-per">{ev?.per ?? e.periodo_historico}</span>
      </div>
      <div className="civ-body">
        <div className="civ-event">{ev?.evento ?? e.evento}</div>
        <div className="civ-desc">{ev?.desc ?? e.descripcion}</div>
      </div>
    </div>
  )
}

export function HamburgerIcon() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="2" rx="1" fill="currentColor"/>
      <rect y="6" width="14" height="2" rx="1" fill="currentColor"/>
      <rect y="12" width="17" height="2" rx="1" fill="currentColor"/>
    </svg>
  )
}

export function DrawerHeader({ title, onClose, onBack, backLabel }: { title: string; onClose: () => void; onBack?: () => void; backLabel?: string }) {
  const lang = useLang()
  return (
    <div className="drawer-header">
      {onBack && <button className="drawer-close-btn drawer-back-btn" onClick={onBack} aria-label={backLabel ?? t(lang, 'volver')}>←</button>}
      <button className="drawer-close-btn" onClick={onClose} aria-label={t(lang, 'cerrar')}>✕</button>
      <span className="drawer-header-title">{title}</span>
    </div>
  )
}

export function TestamentoBadge({ tipo }: { tipo: 'AT' | 'NT' }) {
  return (
    <div style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.08em',
      background: tipo === 'AT' ? 'var(--badge-at)' : 'var(--badge-nt)',
      color: 'var(--topbar-text)',
      marginBottom: 8,
    }}>
      {tipo}
    </div>
  )
}

export function FranjaTestamento() {
  return (
    <div style={{
      margin: '16px -16px',
      height: 1,
      background: 'linear-gradient(90deg, transparent, var(--beige) 15%, var(--beige) 85%, transparent)',
    }} />
  )
}
