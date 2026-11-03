# Fuentes, licencias y procedencia de datos — Mundo Bíblico · Mapa interactivo

Última revisión: 2026-11-03 (licencias y titular; antes, 2026-10-19: añadido Theographic como fuente de contraste). Referencia de rigor: https://viz.bible/bible-data/

## Procedencia de coordenadas (campo `fuente_coordenadas`)
Comparación de `lat`/`lng` de cada JSON con la tabla maestra de lugares (valores TIPNR; la geolocalización de TIPNR se basa en OpenBible):
- `tipnr` (209): diferencia ≤ 0,01° (~1 km) respecto a TIPNR.
- `revisada` (77): diferencia > 0,01°; ajustada por el proyecto. **El método/fuente primaria de cada ajuste no está registrado.**
- `propia` (10): lugar sin fila en TIPNR.
Al cambiar lat/lng de un lugar: reclasificar con el criterio anterior y actualizar los 3 idiomas (es, en/, it/).

## Conjuntos de datos
| Dato | Fuente | Licencia | Crédito exigido |
|---|---|---|---|
| Lugares / nombres | STEPBible TIPNR | CC BY 4.0 | "STEP Bible" (www.STEPBible.org) |
| Geolocalización base | OpenBible.info Bible Geocoding | CC BY 4.0 | OpenBible.info |
| Contraste de coordenadas | Theographic Bible Metadata (R. Rouse, Viz.Bible); incluye OpenBible.info, Pelagios Recogito, Pleiades, GeoNames | CC BY-SA 4.0 (cada fuente original conserva su licencia) | Theographic Bible Metadata — Robert Rouse, Viz.Bible. Solo se usa para comparar; no se importan sus datos. |
| Fronteras históricas | aourednik/historical-basemaps | GPL-3.0 (repo; sin licencia de datos separada) | — |
| Mapa base (por defecto) | Natural Earth (tierra, lagos y ríos, recortados en `public/geo/base_mapa.json`) | Dominio público | «Mapa base: Natural Earth» |
| Mapa actual (opcional) | Esri World Light Gray Base | Términos Esri | "Esri — HERE, DeLorme, MapmyIndia, © OpenStreetMap contributors" |
| Texto bíblico | NBJ (verificación de referencias, no se muestra su texto); enlaces de lectura a Bible Gateway: RVR1960 (es) — NIV (en) y NR06 (it) solo si se reactivan EN/IT, y entonces hay que acreditarlas | © editoriales | — |
| Tradiciones | Sefaria (Midrash, Talmud); Altafsir (Ibn Kathir) | Sefaria: por obra · Altafsir: © Royal Aal al-Bayt Institute | — |

## Textos propios
Descripciones, historias, personajes y contexto religioso: redactados con asistencia de IA (Claude) y aprobados por la autora (declarado en Fuentes → "Autoría y uso de IA").

## Decisiones (2026-10-19)
- Licencia: código MIT (`LICENSE`); contenido y datos propios CC BY-SA 4.0 (`LICENSE-CONTENT.md`). Visible en Menú → Créditos.
- Citas bíblicas: 5 citas largas de `madian` y `ur` pasadas a paráfrasis con referencia (ES/EN/IT). Quedan fragmentos de 3–6 palabras (p. ej. Heb 11:8, 11:10), aceptables como cita breve.
- Sefaria/Altafsir: solo se citan por nombre (no se reproducen textos).

## Verificación por muestreo de referencias de tradiciones (2026-10-19)

> ⚠ **Aviso.** Las referencias a tradiciones (Talmud, Midrash, Corán, Ibn Kathir) de las fichas las generó IA y **no están verificadas en su totalidad**. En una muestra de 15 (19 oct 2026): 7 correctas, 2 parciales, 2 erróneas (más 1 obra inexistente) y 4 vagas. Quedan unas 250 menciones sin revisar. Úsalas como orientación, no como cita académica.
Muestra estratificada de 15 entradas (seed fija) contra Sefaria y el tafsir de Ibn Kathir (cdn spa5k/tafsir_api). Referencias generadas con IA; **solo se comprobó esta muestra**.
| Lugar | Referencia | Resultado |
|---|---|---|
| dan | Sanhedrin 102a | ✓ menciona los becerros de Jeroboam en Dan |
| dan | Shemot Rabbah 42 | ⚠ trata el becerro de oro, no nombra Dan |
| bethlehem | Eichah Rabbah 1:51 | ✓ nace el redentor en Belén |
| bethlehem | Sanhedrin 98b | ⚠ nombre del Mesías; no nombra Belén |
| madian | Shemot Rabbah 2 | ✓ zarza como símbolo de Israel |
| beth_shemesh | Sotá 35a | ✓ hombres de Bet-semes heridos (1 Sam 6:19) |
| beth_shemesh | Rambam, Beit HaBechirah 4:1 | no comprobada (fallo de consulta) |
| gibeon | Avodá Zará 25a; Bereshit Rabbah 6 | ⚠ Josué y el sol (Jos 10:13); no nombran Gabaón |
| lachish | Sanhedrin 94b | ⚠ Senaquerib/Isaías 37; no nombra Laquis |
| lachish | "Midrash Rabbah, Isaías 37" | ✗ no existe un Midrash Rabbah sobre Isaías en Sefaria |
| ziklag | Berajot 10a | ✗ no menciona Siclag (trata los salmos de David y la enfermedad de Ezequías) |
| ziklag | Midrash Samuel 23 | referencia válida; tema no comprobado |
| anathoth | Ibn Kathir, Al-Baqara 2:61 | ✗ trata del maná y las codornices; sin relación con Anatot/Jeremías |
| tishbe | Ibn Kathir (Ilyas, 37:123) | ✓ Ilyas enviado a Israel; no nombra Tishbe |
| joppa | Ibn Kathir (As-Saffat, Yunus) | ✓ tema Yunus; no nombra Jope |
| gath | Corán 2:246-251 | ✓ Talut y Yalut (por conocimiento, no consultada) |
| zobah, judea, egipto, nazareth | "Tanaj / Talmud", "Talmud", "Corán / Hadiz" (x2) | vagas: no verificables |
Resumen: 7 correctas, 2 parciales, 2 erróneas (+1 obra inexistente), 4 vagas. Pendiente decidir el alcance de la revisión completa (~250 menciones).

## Pendiente
1. Comprobar una muestra (~15) de `fuente_primaria`/`fuente_secundaria` de tradiciones (Talmud 108 menciones, Midrash 47, Corán 46, Ibn Kathir 27) contra Sefaria/Altafsir; las generó IA y no están verificadas.
2. ~~Fronteras GPL-3.0 (`public/data/geo/`)~~ — resuelto el 2026-11-03: se redistribuyen bajo GPL-3.0 y se añadió `public/data/geo/LEEME.md` con la autoría y la licencia; el código sigue en MIT por tratarse de archivos de datos separados (lectura habitual, no es asesoría legal).
3. Coordenadas por revisar (Arpad, Ezion-geber y 9 grupos con coords idénticas); registrar la fuente de las 77 `revisada`.
4. Actualizar "Datos actualizados en octubre de 2026" (`src_cite_text` en `ui.ts`) cuando cambien los datos.
