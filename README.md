# Mundo Bíblico · Mapa interactivo

Mapa web interactivo de los lugares del Antiguo y Nuevo Testamento. Cada lugar tiene su ficha con ubicación, periodos, personajes y pasajes bíblicos.

**Producción:** https://mundobiblico-mapainteractivo.vercel.app

## Idiomas

La app está hoy solo en español. El contenido también existe en inglés e italiano (`public/data/en/` y `public/data/it/`), archivado y sin activar.

## Tecnología

React 19, TypeScript, Vite y Leaflet. Los datos son archivos JSON, uno por lugar, en `public/data/`.

## Ejecutar en local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # versión de producción
```

## Datos y fuentes

Basados en STEPBible, OpenBible.info y otras fuentes abiertas. Detalle y licencias en [`FUENTES_Y_LICENCIAS.md`](FUENTES_Y_LICENCIAS.md). Las referencias a tradiciones (Talmud, Midrash, Corán, Ibn Kathir) no están verificadas en su totalidad; ver ese mismo archivo.

## Cómo se construyó

Proyecto diseñado y dirigido por Rebeca Martínez, que decide qué se construye, qué se incluye y cómo se verifica. El código y los textos se desarrollaron con asistencia de IA (Claude, de Anthropic); la autora revisó y aprobó el resultado. Es un proyecto personal en evolución y puede contener errores.

## Cómo citar

Martínez, R. (2026). Mundo Bíblico · Mapa interactivo [aplicación web]. mundobiblico-mapainteractivo.vercel.app

## Licencias

- Código: MIT ([`LICENSE`](LICENSE)).
- Contenido: CC BY-SA 4.0 ([`LICENSE-CONTENT.md`](LICENSE-CONTENT.md)). Atribución: «Rebeca Martínez — Mundo Bíblico».
- Fronteras históricas (`public/data/geo/`): GPL-3.0, de aourednik/historical-basemaps.
- Titular de los derechos: Rebeca Martínez.
