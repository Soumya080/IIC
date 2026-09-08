# VORTEX Frontend — MapLibre GL JS Integration & Architecture

VORTEX command center frontend built with React, MapLibre GL JS, Three.js, and Framer Motion.

## 🗺️ Map Architecture

The 2D geographic rendering engine is located at [`src/components/map/`](file:///c:/Soham/Coding/GitHub/IIC/frontend/src/components/map/):

- **[`VortexMap.jsx`](file:///c:/Soham/Coding/GitHub/IIC/frontend/src/components/map/VortexMap.jsx)**: Reusable MapLibre component. Initializes native `maplibregl.Map` instance once with correct lifecycle cleanup. Updates map sources reactively via `setData()`.
- **[`mapConfig.js`](file:///c:/Soham/Coding/GitHub/IIC/frontend/src/components/map/mapConfig.js)**: Map constants (`DEFAULT_CENTER` `[82.5, 18.5]`, `DEFAULT_ZOOM` `4.5`), VORTEX visual system tokens, scenario styles, and map status enum. Reads `VITE_MAP_STYLE_URL` from environment.
- **[`mapLayers.js`](file:///c:/Soham/Coding/GitHub/IIC/frontend/src/components/map/mapLayers.js)**: Modular native MapLibre source & layer registry for tracks, scenarios, uncertainty cones, wind hazard, flood impact index, composite risk, district risk, resources, RRAS routes, and SOS clusters.
- **[`mapUtils.js`](file:///c:/Soham/Coding/GitHub/IIC/frontend/src/components/map/mapUtils.js)**: Pure GeoJSON builders and MapLibre camera transition helpers (`flyToCyclone`, `fitCycloneTrack`, `resetView`, `flyToDistrict`, `flyToResource`, `flyToSOS`).

## ⚙️ Environment Setup

Copy `.env.example` to `.env.local` and configure your MapLibre vector style URL:

```env
VITE_MAP_STYLE_URL=https://demotiles.maplibre.org/style.json
VITE_API_BASE_URL=http://localhost:8000
```

## 🔄 Backend Data Flow & RRAS Integration

FastAPI backend → `appStore.js` / API services → MapLibre `setSourceData()` native source updates.
RRAS route geometries returned by the backend optimizer are passed directly into the `routes` (`rras-routes`) GeoJSON source.

