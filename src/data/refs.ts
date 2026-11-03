// Referencias bíblicas: validación y enlace a Bible Gateway.
// - Solo se enlazan citas canónicas (66 libros RVR1960). Las fuentes históricas,
//   patrísticas o deuterocanónicas (p. ej. "Historia romana", "2 Mac 2:4") se
//   muestran como texto plano, sin link, para no abrir páginas vacías.
// - La versión de Bible Gateway se ajusta al idioma activo.
import type { Lang } from './lang'

// Versión de Bible Gateway por idioma.
const BIBLE_VERSION: Record<Lang, string> = {
  es: 'RVR1960',
  en: 'NIV',
  it: 'NR06',
}

// Whitelist de libros canónicos en sus abreviaturas ES / EN (SBL) / IT (CEI),
// derivada de scripts/biblia_abreviaturas.json. Ordenada por longitud
// descendente para coincidir por el prefijo de libro más largo primero.
const BOOK_TOKENS: string[] = [
  '1 Thess', '2 Thess', 'Filemón', '1 John', '2 John', '3 John', '1 Chr', '1 Cor',
  '1 Kgs', '1 Pet', '1 Sam', '1 Tes', '1 Tim', '2 Chr', '2 Cor', '2 Kgs', '2 Pet',
  '2 Sam', '2 Tes', '2 Tim', 'Jonah', 'Titus', '1 Co', '1 Cr', '1 Gv', '1 Jn',
  '1 Pe', '1 Pt', '1 Re', '1 Ti', '1 Tm', '1 Ts', '2 Co', '2 Cr', '2 Gv', '2 Jn',
  '2 Pe', '2 Pt', '2 Re', '2 Ti', '2 Tm', '2 Ts', '3 Gv', '3 Jn', 'Acts', 'Amos',
  'Apoc', 'Cant', 'Deut', 'Eccl', 'Esth', 'Exod', 'Ezek', 'Ezeq', 'Ezra', 'Joel',
  'John', 'Josh', 'Jude', 'Judg', 'Luke', 'Mark', 'Matt', 'Obad', 'Phil', 'Phlm',
  'Prov', 'Ruth', 'Sant', 'Song', 'Zech', 'Zeph', '1 P', '1 R', '1 S', '2 P',
  '2 R', '2 S', 'Abd', 'Cnt', 'Col', 'Dan', 'Ecl', 'Eph', 'Esd', 'Est', 'Fil',
  'Flm', 'Flp', 'Gal', 'Gdc', 'Gen', 'Ger', 'Gio', 'Gál', 'Gén', 'Hab', 'Hag',
  'Hch', 'Heb', 'Hos', 'Isa', 'Jas', 'Jds', 'Jer', 'Job', 'Jon', 'Jos', 'Jud',
  'Jue', 'Lam', 'Lev', 'Mal', 'Mic', 'Miq', 'Nah', 'Neh', 'Num', 'Núm', 'Rev',
  'Rom', 'Rut', 'Sal', 'Sof', 'Stg', 'Tit', 'Zac', 'Ab', 'Ag', 'Am', 'Ap', 'At',
  'Ct', 'Dn', 'Dt', 'Eb', 'Ef', 'Es', 'Ex', 'Ez', 'Fm', 'Ga', 'Gb', 'Gc', 'Gd',
  'Gl', 'Gn', 'Gs', 'Gv', 'Hb', 'Is', 'Jc', 'Jl', 'Jn', 'Jr', 'Lc', 'Lm', 'Lv',
  'Mc', 'Mi', 'Ml', 'Mr', 'Mt', 'Na', 'Ne', 'Nm', 'Os', 'Pr', 'Ps', 'Qo', 'Rm',
  'Ro', 'Rt', 'Tt', 'Za', 'Zc', 'Éx',
]

/** ¿La referencia es una cita bíblica canónica (libro + capítulo) enlazable? */
export function esCitaBiblica(ref: string): boolean {
  const s = ref.trim()
  for (const tok of BOOK_TOKENS) {
    if (s.startsWith(tok) && /^\s+\d/.test(s.slice(tok.length))) return true
  }
  return false
}

/** URL de Bible Gateway para la referencia, en la versión del idioma activo. */
export function refHref(ref: string, lang: Lang): string {
  const version = BIBLE_VERSION[lang] ?? BIBLE_VERSION.es
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(ref)}&version=${version}`
}
