# Traducción de contenido (ES → EN / IT)

Pipeline de build para traducir los JSON de `/public/data/` a inglés e italiano
usando **Google Translate gratis** (sin API key). Se corre **una sola vez** (o
cuando cambie el contenido), en tu Terminal local.

> ⚠ **Correr en tu Mac, no desde Claude.** El sandbox de Claude tiene bloqueado
> `translate.google.com`. Tu red no.

## Archivos

- `translate.py` — script principal.
- `glosario_nombres.json` — nombres propios protegidos (Betel→Bethel, etc.). Editable.
- `biblia_abreviaturas.json` — abreviaturas de libros bíblicos ES→EN/IT. Editable.
- `.cache/` — caché de strings traducidos (se crea solo; reanudable). Ignorar en git.

## Instalación

```bash
cd /Users/rebeca/Documents/Claude/mapa-at
pip install deep-translator
```

## Uso

**Primero, una prueba de 1 archivo** para ver la calidad antes de largar todo:

```bash
python3 scripts/translate.py --lang en --only ai.json
# revisá public/data/en/ai.json
```

Si te convence, todo el corpus:

```bash
python3 scripts/translate.py --lang en,it
```

Otras opciones:

```bash
python3 scripts/translate.py --lang en --limit 5   # primeros 5 archivos
python3 scripts/translate.py --lang en --force      # ignora caché, reescribe
```

## Cómo funciona

- Traduce **solo texto libre**. Congela `id`, `lat`, `lng`, `tipo`, `nivel`,
  `frecuencia_at`, `jerarquia_pin`, `periodos_at`, `personajes_clave`, `ruta`,
  `aparece_en`, `emoji`, `desde`, `hasta`.
- **Nombres propios**: los reemplaza por un placeholder antes de mandar a Google
  y los restituye con la forma canónica después → consistencia garantizada.
- **Referencias bíblicas** (`referencias`, `fuente_primaria`, `fuente_secundaria`):
  convierte la abreviatura del libro por tabla, **sin** Google. `Jos 8:1-29` → `Josh 8:1-29`.
- **Fechas** (`fecha`): `c. 1220 a.C.` → EN `c. 1220 BC`. IT mantiene `a.C.`.
- **Caché**: cada string se guarda en `.cache/cache_<lang>.json`. Si cortás y
  reanudás, no re-traduce nada ya hecho. Los archivos ya escritos se saltan
  (salvo `--force`).

## Tiempo estimado

~13.000 strings/idioma con pausa de 0,4s entre llamadas → **~1,5–2 h por idioma**
la primera vez (después la caché lo hace instantáneo). Podés cortarlo (Ctrl+C) y
retomar cuando quieras: reanuda solo.

## Rendimiento del endpoint libre

Google puede tirar rate-limit si vas muy rápido. El script ya mete pausa +
reintentos con backoff. Si ves muchos fallos, subí la pausa (`time.sleep(0.4)`
en `mt_translate`) a 0.8–1.0.

## Después de traducir: pasada de QA (Claude)

El glosario cubre los nombres más comunes, pero Google va a errar topónimos y
matices en los que no está en el glosario. **Pasame los `public/data/en/` (o `it/`)
y hago una revisión** de nombres propios, referencias y teología, y amplío el
glosario con lo que aparezca.

## Siguiente paso (aparte): loader runtime

Falta el cargador en React: detectar `navigator.language`, cargar desde
`/public/data/en/` o `/it/`, fallback español, override manual. Eso es otra tarea
—no lo toca este script.
