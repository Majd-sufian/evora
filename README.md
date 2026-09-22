# Evora

**European EV Intelligence, Live.**

A real-time EV charging intelligence dashboard for Europe, presented as an interactive 3D globe. Explore charging station networks, live electricity grid prices, and carbon intensity across Europe — zooming from a world overview down to individual stations.

## What it does

- **Interactive vector-tile globe** — real OSM map data rendered on a MapLibre GL globe, scoped to Europe.
- **World → Country → Station drill-down** — smooth cinematic zoom transitions between three view levels, with clustering that adapts to zoom level.
- **Live charging station data** — real station locations, status, and per-city coverage via the OpenChargeMap API.
- **Grid price heatmap** — live day-ahead electricity prices per country via the ENTSO-E Transparency Platform.
- **Carbon intensity overlay** — live grid carbon intensity via Electricity Maps.
- **Responsive HUD** — network stats, price charts, and station detail panels that adapt to the current view and screen size.

## Tech stack

- [Next.js 14](https://nextjs.org) (App Router)
- [MapLibre GL](https://maplibre.org) — vector-tile globe rendering
- [Three.js](https://threejs.org) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) — globe shaders and effects
- [Zustand](https://github.com/pmndrs/zustand) — state management
- [Framer Motion](https://www.framer.com/motion) — UI animation
- Tailwind CSS

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

### Environment variables

The app integrates with three external APIs. Create a `.env.local` with:

```bash
OPENCHARGEMAP_API_KEY=
ENTSOE_API_TOKEN=
ELECTRICITYMAPS_API_KEY=
```

## Project structure

```
app/                  Next.js App Router pages
components/globe/     Three.js globe, camera rig, clustering, markers
components/maplibre/  MapLibre GL globe + duotone map style
components/hud/       Overlay panels (network stats, price chart, station detail)
components/modals/    About modal, etc.
lib/api/              OpenChargeMap / ENTSO-E / Electricity Maps clients
lib/clustering.ts     Adaptive city/country clustering
lib/store.ts          Zustand app state
```

## Status

Portfolio project, actively evolving — see [specs/evora-full-context.md](specs/evora-full-context.md) for the full build spec and roadmap.
