#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
translate.py — Traduccion de build de los JSON de lugares (ES -> EN / IT)
Mapa Interactivo del Antiguo Testamento (mapa-at)

Motor: Google Translate via deep-translator (endpoint libre, sin API key).
   NOTA: correr en la Terminal LOCAL de Rebeca. El sandbox de Claude tiene
   bloqueado translate.google.com; tu Mac no.

Que hace:
  - Recorre /public/data/*.json
  - Traduce SOLO los campos de texto libre (segun manifest). Congela ids,
    coords, enums, periodos_at, personajes_clave, ruta, aparece_en, emoji.
  - Protege nombres propios con glosario (placeholder antes de traducir,
    forma canonica despues) -> Betel siempre "Bethel", etc.
  - Convierte referencias biblicas y fuente_primaria por tabla de
    abreviaturas (NO por Google): "Jos 8:1-29" -> "Josh 8:1-29".
  - Convierte fechas: "c. 1220 a.C." -> EN "c. 1220 BC" (IT mantiene a.C.).
  - Cachea cada string traducido en scripts/.cache/ -> reanudable, no re-paga
    llamadas ni re-traduce si lo volves a correr.
  - Escribe /public/data/en/<archivo>.json y /public/data/it/<archivo>.json
    espejando la estructura.

Uso:
  pip install deep-translator
  python3 scripts/translate.py --lang en            # solo ingles
  python3 scripts/translate.py --lang en,it         # ambos
  python3 scripts/translate.py --lang en --only ai.json   # un archivo de prueba
  python3 scripts/translate.py --lang en --limit 5        # primeros 5 archivos
  python3 scripts/translate.py --lang en --force          # ignora cache/reescribe

Recomendado para la 1a vez:  --only ai.json  (ves calidad antes de largar todo)
"""

import os, sys, json, re, time, argparse, glob, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "public", "data")
SCRIPTS_DIR = os.path.join(ROOT, "scripts")
CACHE_DIR = os.path.join(SCRIPTS_DIR, ".cache")

# ---- Campos que NUNCA se traducen (se copian tal cual) --------------------
FREEZE_KEYS = {
    "id", "tipo", "nivel", "lat", "lng", "frecuencia_at", "jerarquia_pin",
    "periodos_at", "periodo_at", "personajes_clave", "ruta", "aparece_en",
    "emoji", "desde", "hasta", "nota_coordenadas", "fuente_coordenadas",
}
# Campos de referencias biblicas -> conversion por tabla de abreviaturas
REF_KEYS = {"referencias", "fuente_primaria", "fuente_secundaria"}
# Campos de fecha -> conversion a.C./d.C.
DATE_KEYS = {"fecha"}

# ---- Carga de recursos -----------------------------------------------------
def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

GLOSARIO_RAW = load_json(os.path.join(SCRIPTS_DIR, "glosario_nombres.json"))
ABREV = load_json(os.path.join(SCRIPTS_DIR, "biblia_abreviaturas.json"))

# Aplanar glosario: { "Betel": {"en":..,"it":..}, ... }  (mas largos primero)
GLOSARIO = {}
for seccion, mapa in GLOSARIO_RAW.items():
    if seccion.startswith("_"):
        continue
    for k, v in mapa.items():
        GLOSARIO[k] = v
GLOSARIO_KEYS = sorted(GLOSARIO.keys(), key=len, reverse=True)

# Abreviaturas ordenadas por longitud desc (para matchear "1 Cr" antes que "Cr")
ABREV_KEYS = sorted([k for k in ABREV if not k.startswith("_")], key=len, reverse=True)


# ---- Proteccion de nombres propios ----------------------------------------
def proteger_nombres(texto, lang):
    """Reemplaza nombres del glosario por placeholders. Devuelve (texto, mapa)."""
    reemplazos = {}
    idx = 0
    out = texto
    for nombre in GLOSARIO_KEYS:
        # limite de palabra unicode-aware
        patron = r"(?<![0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ])" + re.escape(nombre) + r"(?![0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ])"
        if re.search(patron, out):
            token = f"NPX{idx}XPN"  # token alfanumerico que Google preserva bien
            out = re.sub(patron, token, out)
            reemplazos[token] = GLOSARIO[nombre][lang]
            idx += 1
    return out, reemplazos

def restituir_nombres(texto, reemplazos):
    # case-insensitive: Google a veces cambia la capitalizacion del token
    for token, valor in reemplazos.items():
        texto = re.sub(re.escape(token), valor, texto, flags=re.IGNORECASE)
    # aviso si quedo algun placeholder sin restituir (token alterado por el MT)
    sueltos = re.findall(r"NPX\d+XPN", texto, flags=re.IGNORECASE)
    if sueltos:
        print(f"    ! placeholder sin restituir: {sueltos} (revisar en QA)")
    return texto


# ---- Referencias biblicas --------------------------------------------------
def convertir_referencia(ref, lang):
    """'Jos 8:1-29' -> 'Josh 8:1-29'. Solo cambia el nombre del libro."""
    ref = ref.strip()
    for abbr in ABREV_KEYS:
        # el libro va al inicio, seguido de espacio y un digito (capitulo)
        patron = r"^" + re.escape(abbr) + r"(?=\s+\d)"
        if re.match(patron, ref):
            return re.sub(patron, ABREV[abbr][lang], ref, count=1)
    return ref  # desconocida -> se deja igual (la QA lo agarra)


# ---- Fechas ----------------------------------------------------------------
def convertir_fecha(txt, lang):
    if lang == "en":
        txt = re.sub(r"\ba\.?\s?C\.?", "BC", txt)
        txt = re.sub(r"\bd\.?\s?C\.?", "AD", txt)
    # IT usa a.C./d.C. igual que ES -> no se toca
    return txt


# ---- Motor Google + cache --------------------------------------------------
_translator = {}
def get_translator(lang):
    if lang not in _translator:
        from deep_translator import GoogleTranslator
        _translator[lang] = GoogleTranslator(source="es", target=lang)
    return _translator[lang]

def cache_path(lang):
    return os.path.join(CACHE_DIR, f"cache_{lang}.json")

def load_cache(lang):
    p = cache_path(lang)
    if os.path.exists(p):
        return load_json(p)
    return {}

def save_cache(lang, cache):
    os.makedirs(CACHE_DIR, exist_ok=True)
    with open(cache_path(lang), "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False)

def mt_translate(texto, lang, cache, force=False):
    """Traduce un string con Google, protegiendo nombres propios. Usa cache."""
    if not texto or not texto.strip():
        return texto
    key = hashlib.md5(texto.encode("utf-8")).hexdigest()
    if not force and key in cache:
        return cache[key]

    protegido, reemplazos = proteger_nombres(texto, lang)
    # reintentos con backoff (endpoint libre es inestable)
    intento, res = 0, None
    while intento < 4:
        try:
            res = get_translator(lang).translate(protegido)
            break
        except Exception as e:
            intento += 1
            if intento >= 4:
                print(f"    ! fallo tras {intento} intentos: {type(e).__name__}. Se deja original.")
                res = protegido
                break
            time.sleep(2 * intento)
    if res is None:
        res = protegido
    res = restituir_nombres(res, reemplazos)
    cache[key] = res
    time.sleep(0.4)  # respirar entre llamadas para no comer rate-limit
    return res


# ---- Recorrido recursivo del JSON -----------------------------------------
def traducir_nodo(obj, lang, cache, key_padre=None, force=False):
    if isinstance(obj, dict):
        out = {}
        for k, v in obj.items():
            if k in FREEZE_KEYS:
                out[k] = v
            else:
                out[k] = traducir_nodo(v, lang, cache, key_padre=k, force=force)
        return out
    if isinstance(obj, list):
        return [traducir_nodo(v, lang, cache, key_padre=key_padre, force=force) for v in obj]
    if isinstance(obj, str):
        if key_padre in REF_KEYS:
            return convertir_referencia(obj, lang)
        if key_padre in DATE_KEYS:
            return convertir_fecha(obj, lang)
        # 'nombre' con match exacto en glosario -> forma canonica directa
        if key_padre == "nombre" and obj in GLOSARIO:
            return GLOSARIO[obj][lang]
        txt = mt_translate(obj, lang, cache, force=force)
        if key_padre in DATE_KEYS:  # por si una fecha llega como texto libre
            txt = convertir_fecha(txt, lang)
        return txt
    return obj  # numeros, bool, null


# ---- Main ------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", default="en", help="Idiomas destino, coma-separados: en,it")
    ap.add_argument("--only", default=None, help="Traducir solo este archivo (ej: ai.json)")
    ap.add_argument("--limit", type=int, default=0, help="Traducir solo los primeros N archivos")
    ap.add_argument("--force", action="store_true", help="Ignora cache y reescribe todo")
    args = ap.parse_args()

    langs = [l.strip() for l in args.lang.split(",") if l.strip()]
    archivos = sorted(glob.glob(os.path.join(DATA_DIR, "*.json")))
    if args.only:
        archivos = [a for a in archivos if os.path.basename(a) == args.only]
        if not archivos:
            print(f"No existe {args.only} en {DATA_DIR}"); sys.exit(1)
    if args.limit:
        archivos = archivos[:args.limit]

    print(f"Idiomas: {langs} | Archivos: {len(archivos)}")
    for lang in langs:
        out_dir = os.path.join(DATA_DIR, lang)
        os.makedirs(out_dir, exist_ok=True)
        cache = load_cache(lang)
        print(f"\n=== {lang.upper()} -> {out_dir} ===")
        for i, path in enumerate(archivos, 1):
            base = os.path.basename(path)
            dst = os.path.join(out_dir, base)
            if os.path.exists(dst) and not args.force and not args.only:
                print(f"[{i}/{len(archivos)}] {base}  (ya existe, skip)")
                continue
            print(f"[{i}/{len(archivos)}] {base} ...", flush=True)
            data = load_json(path)
            traducido = traducir_nodo(data, lang, cache, force=args.force)
            with open(dst, "w", encoding="utf-8") as f:
                json.dump(traducido, f, ensure_ascii=False, indent=2)
            save_cache(lang, cache)  # persistir cache tras cada archivo (reanudable)
        save_cache(lang, cache)
        print(f"=== {lang.upper()} listo ===")

if __name__ == "__main__":
    main()
