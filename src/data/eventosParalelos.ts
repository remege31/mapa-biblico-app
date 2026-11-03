import type { EventoParalelo } from '../types/lugar'

// Eventos paralelos globales por período histórico — independientes del lugar seleccionado.
export const EVENTOS_PARALELOS_GLOBAL: EventoParalelo[] = [
  {
    civilizacion: 'Egipto',
    periodo_historico: 'Imperio Nuevo (1550–1070 a.C.) y Período Tardío (664–332 a.C.)',
    periodo_at: ['bronce_tardio', 'hierro_1', 'hierro_2'],
    evento: 'Rivalidad Egipto-Mesopotamia por el Levante',
    descripcion: 'Egipto y Mesopotamia compiten por el control del corredor cananeo durante siglos. La Batalla de Carquemis (605 a.C.) entre Babilonia y Egipto decide el dominio del Levante a favor de Nabucodonosor II.',
  },
  {
    civilizacion: 'Asiria',
    periodo_historico: 'Imperio Neoasirio (911–609 a.C.)',
    periodo_at: ['hierro_2'],
    evento: 'Dominio asirio de Mesopotamia y el Levante',
    descripcion: 'Asiria en su apogeo (Sargón II, Senaquerib, Asurbanipal) controla desde Egipto hasta Persia. Su capital Nínive es destruida (612 a.C.) por la coalición medo-babilónica — colapso predicho por el profeta Nahúm.',
  },
  {
    civilizacion: 'Babilonia',
    periodo_historico: 'Imperio Neobabilónico (626–539 a.C.)',
    periodo_at: ['hierro_2', 'post_exilio'],
    evento: 'Apogeo de Babilonia bajo Nabucodonosor II',
    descripcion: 'Babilonia es la ciudad más grande del mundo c. 600 a.C. Los Jardines Colgantes (maravilla antigua). El Proceso de Ishtar es el eje cultural del mundo mesopotámico. Cae ante Ciro el Grande (539 a.C.) sin resistencia militar.',
  },
  {
    civilizacion: 'Persia',
    periodo_historico: 'Imperio Aqueménida (550–330 a.C.)',
    periodo_at: ['post_exilio'],
    evento: 'Ciro conquista Babilonia — decreto de retorno judío',
    descripcion: "Ciro el Grande toma Babilonia sin batalla (539 a.C.) y emite el Decreto de Ciro (Esd 1:1-4), permitiendo el retorno de los judíos a Jerusalén. El AT lo llama 'el ungido de Yahvé' (Is 45:1) — el único pagano con este título.",
  },
  {
    civilizacion: 'Grecia',
    periodo_historico: 'Período Arcaico y Clásico (800–323 a.C.)',
    periodo_at: ['hierro_2', 'post_exilio'],
    evento: 'Contacto comercial con Mesopotamia vía fenicios',
    descripcion: 'El alfabeto fenicio (derivado del cananeo) llega a Grecia c. 800 a.C. y genera el alfabeto griego. Las guerras médicas (490–479 a.C.) son el primer choque directo entre Grecia y el mundo persa-mesopotámico.',
  },
  {
    civilizacion: 'Roma',
    periodo_historico: 'República Romana (509–27 a.C.)',
    periodo_at: ['post_exilio'],
    evento: 'Roma emerge sin contacto con Mesopotamia',
    descripcion: 'Roma se convierte en república (509 a.C.) y comienza su expansión en Italia. Sin contacto directo con Mesopotamia hasta la época helenística. El encuentro romano-parto por Mesopotamia ocurrirá en el siglo I a.C.',
  },
  {
    civilizacion: 'India',
    periodo_historico: 'Período Védico Tardío y Budismo temprano (800–400 a.C.)',
    periodo_at: ['hierro_2', 'post_exilio'],
    evento: 'Siddharta Gautama — emergencia del Budismo (c. 500 a.C.)',
    descripcion: 'Simultáneo al exilio judío en Mesopotamia, Siddharta Gautama funda el Budismo en India (c. 500 a.C.). El Eje Axial (s. VI a.C.) produce simultáneamente el monoteísmo profético judío, el budismo, el confucianismo y la filosofía griega.',
  },
  {
    civilizacion: 'China',
    periodo_historico: 'Zhou Oriental — Primaveras y Otoños (771–476 a.C.)',
    periodo_at: ['hierro_2', 'post_exilio'],
    evento: 'Confucio (551–479 a.C.) — emergencia del confucianismo',
    descripcion: 'Confucio vive simultáneamente al exilio babilónico y al retorno judío. La ética confuciana del ren (benevolencia) y la ética profética israelita del mishpat (justicia) emergen en paralelo como respuestas a crisis políticas comparables.',
  },
  {
    civilizacion: 'América',
    periodo_historico: 'Formativo Tardío Mesoamericano (600–200 a.C.)',
    periodo_at: ['post_exilio'],
    evento: 'Declive olmeca y emergencia de Teotihuacán',
    descripcion: 'La civilización olmeca declina. Emergen culturas regionales en el Valle de México y Oaxaca. Monte Albán (zapoteca) es fundado c. 500 a.C. Sin ningún contacto con el mundo mesopotámico.',
  },

  // ── Edad de Bronce Tardía (1500–1200 a.C.) ──
  {
    civilizacion: 'Anatolia',
    periodo_historico: 'Imperio Hitita (c. 1650–1180 a.C.)',
    periodo_at: ['bronce_tardio'],
    evento: 'Batalla de Cades — Hititas vs Egipto (1274 a.C.)',
    descripcion: 'El Imperio Hitita disputa a Egipto el control de Siria. La Batalla de Cades (1274 a.C.) entre Ramsés II y Muwatalli II termina en el primer tratado de paz documentado de la historia. Es la época del Éxodo según la cronología tradicional.',
  },
  {
    civilizacion: 'Grecia',
    periodo_historico: 'Civilización Micénica (c. 1600–1100 a.C.)',
    periodo_at: ['bronce_tardio'],
    evento: 'Apogeo micénico y guerra de Troya',
    descripcion: 'Los palacios micénicos (Micenas, Pilos, Tirinto) dominan el Egeo con escritura Lineal B. La guerra de Troya se sitúa tradicionalmente c. 1250 a.C., contemporánea a la salida de Egipto y la travesía del desierto.',
  },
  {
    civilizacion: 'China',
    periodo_historico: 'Dinastía Shang (c. 1600–1046 a.C.)',
    periodo_at: ['bronce_tardio'],
    evento: 'Dinastía Shang — huesos oraculares y bronce',
    descripcion: 'La Shang desarrolla la escritura china más antigua conocida (huesos oraculares) y una metalurgia del bronce excepcional. La adivinación y el culto a los ancestros estructuran el Estado, mientras en el Levante toma forma el Israel primitivo.',
  },
  {
    civilizacion: 'India',
    periodo_historico: 'Período Védico Temprano (c. 1500–1000 a.C.)',
    periodo_at: ['bronce_tardio', 'hierro_1'],
    evento: 'Composición del Rig Veda',
    descripcion: 'Los pueblos indoarios se asientan en el noroeste del subcontinente y componen oralmente el Rig Veda, el texto sagrado más antiguo del hinduismo. Simultáneo a las tradiciones orales patriarcales y mosaicas de Israel.',
  },
  {
    civilizacion: 'América',
    periodo_historico: 'Preclásico / Formativo mesoamericano (c. 1500–1000 a.C.)',
    periodo_at: ['bronce_tardio', 'hierro_1'],
    evento: 'Nacimiento de la civilización olmeca',
    descripcion: 'En la costa del Golfo emerge la cultura olmeca, la "cultura madre" de Mesoamérica, con el centro de San Lorenzo (c. 1200 a.C.) y sus colosales cabezas de piedra. Sin ningún contacto con el Viejo Mundo.',
  },

  // ── Edad de Hierro I (1200–1000 a.C.) ──
  {
    civilizacion: 'Mediterráneo Oriental',
    periodo_historico: 'Colapso de la Edad de Bronce (c. 1200–1150 a.C.)',
    periodo_at: ['hierro_1'],
    evento: 'Colapso del Bronce y los Pueblos del Mar',
    descripcion: 'Una ola de destrucción derrumba a los hititas, los micénicos y ciudades cananeas; los "Pueblos del Mar" (entre ellos los filisteos) se asientan en la costa. El vacío de las grandes potencias coincide con el período de los Jueces en Israel.',
  },
  {
    civilizacion: 'China',
    periodo_historico: 'Dinastía Zhou Occidental (1046–771 a.C.)',
    periodo_at: ['hierro_1'],
    evento: 'Los Zhou derrocan a los Shang — Mandato del Cielo',
    descripcion: 'La dinastía Zhou vence a los Shang (1046 a.C.) y formula el "Mandato del Cielo": el gobernante reina por virtud moral y puede perderlo si es injusto. Una teología política del poder que resuena con la crítica profética israelita.',
  },
  {
    civilizacion: 'Grecia',
    periodo_historico: 'Edad Oscura griega (c. 1100–800 a.C.)',
    periodo_at: ['hierro_1'],
    evento: 'Caída de Micenas y Edad Oscura',
    descripcion: 'Tras el colapso micénico se pierde la escritura y las ciudades palaciegas; comienza la Edad Oscura griega. De su tradición oral surgirán más tarde los poemas homéricos, en paralelo a la consolidación tribal de Israel.',
  },

  // ── Vida de Jesús (6 a.C.–33 d.C.) ──
  {
    civilizacion: 'Roma',
    periodo_historico: 'Principado — Augusto (27 a.C.–14 d.C.) y Tiberio (14–37 d.C.)',
    periodo_at: ['vida_jesus'],
    evento: 'Pax Romana bajo Augusto y Tiberio',
    descripcion: 'Augusto inaugura el Principado (27 a.C.) y una era de paz y calzadas que unifica el Mediterráneo. El censo de Augusto enmarca el nacimiento de Jesús (Lc 2:1); Tiberio reina durante su ministerio y crucifixión (c. 30–33 d.C.).',
  },
  {
    civilizacion: 'Partia',
    periodo_historico: 'Imperio Parto (247 a.C.–224 d.C.)',
    periodo_at: ['vida_jesus'],
    evento: 'Roma y Partia se disputan Oriente',
    descripcion: 'El Imperio Parto es el gran rival de Roma en el este y controla las rutas hacia Persia e India. Los "magos de Oriente" (Mt 2) provienen de esta tradición astronómica de raíz mesopotámico-persa.',
  },
  {
    civilizacion: 'China',
    periodo_historico: 'Dinastía Xin — usurpación de Wang Mang (9–23 d.C.)',
    periodo_at: ['vida_jesus'],
    evento: 'Interregno de Wang Mang',
    descripcion: 'Wang Mang interrumpe la dinastía Han fundando la efímera dinastía Xin (9–23 d.C.) con reformas radicales de tierra y moneda. Tras su caída se restaura la Han Oriental. La Ruta de la Seda ya enlaza China con el mundo romano.',
  },
  {
    civilizacion: 'India',
    periodo_historico: 'Imperios Kushan y Satavahana (s. I d.C.)',
    periodo_at: ['vida_jesus', 'apostolico'],
    evento: 'Comercio índico-romano por el monzón',
    descripcion: 'El dominio del régimen de monzones abre el comercio marítimo directo entre el Imperio Romano y la India (especias, seda, marfil). El budismo se expande bajo los kushanes justo cuando nace el cristianismo.',
  },
  {
    civilizacion: 'América',
    periodo_historico: 'Preclásico Tardío mesoamericano (c. 100 a.C.–250 d.C.)',
    periodo_at: ['vida_jesus', 'apostolico'],
    evento: 'Auge de Teotihuacán y cultura Nazca',
    descripcion: 'Teotihuacán crece hasta ser una de las mayores ciudades del mundo y erige la Pirámide del Sol. En los Andes, la cultura Nazca traza sus geoglifos. Ningún contacto con el mundo mediterráneo.',
  },

  // ── Época apostólica (33–70 d.C.) ──
  {
    civilizacion: 'Roma',
    periodo_historico: 'Dinastía Julio-Claudia (Calígula, Claudio, Nerón, 37–68 d.C.)',
    periodo_at: ['apostolico'],
    evento: 'Incendio de Roma y persecución de Nerón (64 d.C.)',
    descripcion: 'Nerón culpa a los cristianos del Gran Incendio de Roma (64 d.C.), desatando la primera persecución imperial; la tradición sitúa allí el martirio de Pedro y Pablo. Antes, Claudio había expulsado a los judíos de Roma (c. 49 d.C., cf. Hch 18:2).',
  },
  {
    civilizacion: 'Judea',
    periodo_historico: 'Primera Guerra Judío-Romana (66–70 d.C.)',
    periodo_at: ['apostolico'],
    evento: 'Destrucción del Templo de Jerusalén (70 d.C.)',
    descripcion: 'La rebelión judía termina con la toma de Jerusalén y la destrucción del Segundo Templo por Tito (70 d.C.), fin del culto sacrificial y punto de inflexión para el judaísmo y la iglesia primitiva. Masada cae en 73/74 d.C.',
  },
  {
    civilizacion: 'China',
    periodo_historico: 'Dinastía Han Oriental (25–220 d.C.)',
    periodo_at: ['apostolico'],
    evento: 'Entrada del budismo en China (c. 67 d.C.)',
    descripcion: 'Según la tradición, el emperador Ming introduce el budismo y funda el Templo del Caballo Blanco (c. 67 d.C.), el primero de China. Ocurre en paralelo a la expansión misionera de Pablo por el Mediterráneo.',
  },
]
