# Mundo Bíblico · Mapa interactivo

Mapa web interactivo de los lugares del Antiguo y Nuevo Testamento. Cada lugar tiene su ficha con ubicación, periodos, personajes y pasajes bíblicos.

**Producción:** https://mundobiblico-mapainteractivo.vercel.app

## Tecnología

React 19, TypeScript, Vite y Leaflet. Los datos son archivos JSON, uno por lugar, en `public/data/`.

## Ejecutar en local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # versión de producción
```

## Datos y fuentes

Basados en STEPBible, OpenBible.info y otras fuentes abiertas. Detalle y licencias en [`FUENTES_Y_LICENCIAS.md`](FUENTES_Y_LICENCIAS.md).

## Licencias

- Código: MIT ([`LICENSE`](LICENSE)).
- Contenido: CC BY-SA 4.0 ([`LICENSE-CONTENT.md`](LICENSE-CONTENT.md)). Atribución: «rebe.lation — Mundo Bíblico».

## Nota sobre IA

Los textos se redactaron con asistencia de IA (Claude) y fueron revisados y aprobados por la autora.
