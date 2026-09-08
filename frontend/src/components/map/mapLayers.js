/**
 * VORTEX Map Layer Registry (native MapLibre sources/layers)
 *
 * Every operational dataset has an independent source + layer(s) so that each
 * supports: add / remove / update (setData) / toggle / visibility / styling.
 *
 * Groups:
 *  cyclone-track, cyclone-forecast, cyclone-scenarios, uncertainty, cyclone-center,
 *  wind, flood, composite-risk, district-risk, population, infrastructure,
 *  roads, resources, resource-movements, routes (RRAS), sos, satellite
 *
 * Data flow: backend → React state → setSourceData() → these layers render.
 * Rendering uses native MapLibre layers (never hundreds of React markers).
 */
import { VORTEX_COLORS, SCENARIO_STYLES } from './mapConfig.js';
import { EMPTY_FC } from './mapUtils.js';

const C = VORTEX_COLORS;
const fc = () => ({ type: 'geojson', data: EMPTY_FC });

/* ------------------------------------------------------------------ */
/* Registry: source + layer specs per logical group                    */
/* ------------------------------------------------------------------ */

export const LAYER_GROUPS = {
  'cyclone-track': {
    source: { id: 'cyclone-track', ...fc() },
    layers: [
      {
        id: 'cyclone-track-line', type: 'line', filter: ['==', ['get', 'kind'], 'track'],
        paint: { 'line-color': C.primary, 'line-width': 2, 'line-opacity': 0.8, 'line-dasharray': [4, 2] },
      },
      {
        id: 'cyclone-track-points', type: 'circle', filter: ['==', ['get', 'kind'], 'track-point'],
        paint: {
          'circle-radius': ['case', ['get', 'isCurrent'], 6, 3.5],
          'circle-color': ['case', ['get', 'isCurrent'], C.primary, 'rgba(66,199,255,0.5)'],
          'circle-stroke-width': 1,
          'circle-stroke-color': C.background,
        },
      },
    ],
  },

  'cyclone-forecast': {
    source: { id: 'cyclone-forecast', ...fc() },
    layers: [
      {
        id: 'cyclone-forecast-line', type: 'line',
        filter: ['==', ['get', 'scenario_id'], 'BASE'],
        paint: {
          'line-color': SCENARIO_STYLES.BASE.color,
          'line-width': SCENARIO_STYLES.BASE.width,
          'line-opacity': SCENARIO_STYLES.BASE.opacity,
        },
      },
      {
        id: 'cyclone-scenario-line', type: 'line',
        filter: ['!=', ['get', 'scenario_id'], 'BASE'],
        paint: {
          'line-color': [
            'match', ['get', 'scenario_id'],
            'LEFT', SCENARIO_STYLES.LEFT.color,
            'RIGHT', SCENARIO_STYLES.RIGHT.color,
            C.muted,
          ],
          'line-width': 1.5,
          'line-opacity': 0.7,
          'line-dasharray': [4, 3],
        },
      },
    ],
  },

  'uncertainty': {
    source: { id: 'uncertainty', ...fc() },
    layers: [
      {
        id: 'uncertainty-cone', type: 'fill',
        paint: { 'fill-color': C.primary, 'fill-opacity': 0.08, 'fill-outline-color': 'rgba(66,199,255,0.35)' },
      },
    ],
  },

  'cyclone-center': {
    source: { id: 'cyclone-center', ...fc() },
    layers: [
      {
        id: 'cyclone-center-pulse', type: 'circle',
        paint: {
          'circle-radius': 18,
          'circle-color': C.primary,
          'circle-opacity': 0.25,
          'circle-stroke-width': 1,
          'circle-stroke-color': C.primary,
          'circle-stroke-opacity': 0.4,
        },
      },
      {
        id: 'cyclone-center-core', type: 'circle',
        paint: {
          'circle-radius': 7,
          'circle-color': C.background,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': C.primary,
        },
      },
    ],
  },

  'wind': {
    source: { id: 'wind-hazard', ...fc() },
    layers: [
      {
        id: 'wind-hazard-fill', type: 'fill',
        paint: {
          'fill-color': [
            'match', ['get', 'threshold'],
            '34kt', C.watch, '50kt', C.warning, '64kt', C.critical,
            C.muted,
          ],
          'fill-opacity': [
            'match', ['get', 'threshold'],
            '34kt', 0.10, '50kt', 0.13, '64kt', 0.18,
            0.1,
          ],
        },
      },
      {
        id: 'wind-hazard-outline', type: 'line',
        paint: {
          'line-color': [
            'match', ['get', 'threshold'],
            '34kt', C.watch, '50kt', C.warning, '64kt', C.critical,
            C.muted,
          ],
          'line-width': 1.2,
          'line-opacity': 0.6,
        },
      },
    ],
  },

  // Flood = INDEX-BASED assessment (NOT a hydrodynamic simulation)
  'flood': {
    source: { id: 'flood-impact', ...fc() },
    layers: [
      {
        id: 'flood-impact-fill', type: 'fill',
        paint: { 'fill-color': C.flood, 'fill-opacity': ['interpolate', ['linear'], ['get', 'index'], 0, 0.05, 1, 0.4] },
      },
    ],
  },

  'composite-risk': {
    source: { id: 'composite-risk', ...fc() },
    layers: [
      {
        id: 'composite-risk-fill', type: 'fill',
        paint: {
          'fill-color': [
            'interpolate', ['linear'], ['get', 'risk'],
            0, C.success, 0.5, C.watch, 0.75, C.warning, 1, C.critical,
          ],
          'fill-opacity': 0.25,
        },
      },
    ],
  },

  'district-risk': {
    source: { id: 'district-boundaries', ...fc() },
    layers: [
      {
        id: 'district-risk-fill', type: 'fill',
        paint: {
          'fill-color': [
            'interpolate', ['linear'], ['coalesce', ['get', 'risk'], 0],
            0, C.success, 0.5, C.watch, 0.75, C.warning, 1, C.critical,
          ],
          'fill-opacity': 0.3,
        },
      },
      { id: 'district-risk-outline', type: 'line', paint: { 'line-color': C.border, 'line-width': 1 } },
    ],
  },

  'population': {
    source: { id: 'population-exposure', ...fc() },
    layers: [
      {
        id: 'population-heat', type: 'heatmap',
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['coalesce', ['get', 'population'], 0], 0, 0, 1000000, 1],
          'heatmap-radius': 30,
          'heatmap-opacity': 0.5,
          'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,0,0,0)', 0.4, C.flood, 0.8, C.warning, 1, C.critical],
        },
      },
    ],
  },

  'infrastructure': {
    source: { id: 'infrastructure', ...fc() },
    layers: [
      {
        id: 'infrastructure-points', type: 'circle',
        paint: { 'circle-radius': 4, 'circle-color': C.muted, 'circle-stroke-width': 1, 'circle-stroke-color': C.background },
      },
    ],
  },

  'roads': {
    source: { id: 'roads', ...fc() },
    layers: [
      { id: 'roads-line', type: 'line', paint: { 'line-color': C.border, 'line-width': 1, 'line-opacity': 0.8 } },
    ],
  },

  'resources': {
    source: { id: 'resources', ...fc() },
    layers: [
      {
        id: 'resources-points', type: 'circle',
        paint: {
          'circle-radius': 6,
          'circle-color': [
            'match', ['get', 'status'],
            'READY', C.success, 'ALERT', C.watch, 'DEPLOYED', C.primary, 'MOVING', C.warning,
            C.muted,
          ],
          'circle-opacity': ['case', ['get', 'available'], 1, 0.45],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': C.background,
        },
      },
    ],
  },

  'resource-movements': {
    source: { id: 'resource-movements', ...fc() },
    layers: [
      {
        id: 'resource-movements-line', type: 'line',
        paint: { 'line-color': C.success, 'line-width': 1.5, 'line-opacity': 0.7, 'line-dasharray': [2, 3] },
      },
    ],
  },

  // RRAS routes: geometry is supplied by the backend planner.
  'routes': {
    source: { id: 'rras-routes', ...fc() },
    layers: [
      {
        id: 'rras-routes-line', type: 'line',
        paint: {
          'line-color': [
            'match', ['get', 'status'],
            'ACTIVE', C.success, 'AT_RISK', C.warning, 'BLOCKED', C.critical,
            C.primary,
          ],
          'line-width': 2.5,
          'line-opacity': 0.85,
        },
      },
    ],
  },

  'sos': {
    source: { id: 'sos-reports', ...fc(), cluster: true, clusterRadius: 40, clusterMaxZoom: 8 },
    layers: [
      {
        id: 'sos-clusters', type: 'circle', filter: ['has', 'point_count'],
        paint: {
          'circle-radius': ['step', ['get', 'point_count'], 12, 10, 15, 50, 20],
          'circle-color': C.sos,
          'circle-opacity': 0.75,
        },
      },
      {
        id: 'sos-cluster-count', type: 'symbol', filter: ['has', 'point_count'],
        layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 10, 'text-font': ['Noto Sans Regular'] },
        paint: { 'text-color': '#FFFFFF' },
      },
      {
        id: 'sos-points', type: 'circle', filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 6,
          'circle-color': [
            'match', ['get', 'severity'],
            'CRITICAL', C.sos, 'HIGH', C.critical, 'MEDIUM', C.warning,
            C.muted,
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#FFFFFF',
        },
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Lifecycle helpers                                                   */
/* ------------------------------------------------------------------ */

/** Register every source + layer exactly once (after style load). */
export function addAllLayers(map) {
  for (const group of Object.values(LAYER_GROUPS)) {
    if (!map.getSource(group.source.id)) {
      const { id, ...def } = group.source;
      map.addSource(id, def);
    }
    for (const layer of group.layers) {
      if (!map.getLayer(layer.id)) {
        map.addLayer({ ...layer, source: group.source.id });
      }
    }
  }
}

/** Push new data into an existing source (never recreates the map). */
export function setSourceData(map, sourceId, data) {
  const src = map.getSource(sourceId);
  if (src && src.type === 'geojson') src.setData(data || EMPTY_FC);
}

/** Toggle visibility of a whole group. */
export function setGroupVisibility(map, groupKey, visible) {
  const group = LAYER_GROUPS[groupKey];
  if (!group) return;
  const v = visible ? 'visible' : 'none';
  for (const layer of group.layers) {
    if (map.getLayer(layer.id)) map.setLayoutProperty(layer.id, 'visibility', v);
  }
}

/** Toggle a single layer id. */
export function setLayerVisibility(map, layerId, visible) {
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
  }
}

/** Per-threshold wind visibility (34kt / 50kt / 64kt toggles). */
export function setWindThresholdVisibility(map, { show34 = true, show50 = true, show64 = true } = {}) {
  const allowed = [];
  if (show34) allowed.push('34kt');
  if (show50) allowed.push('50kt');
  if (show64) allowed.push('64kt');
  const filter = ['in', ['get', 'threshold'], ['literal', allowed]];
  for (const layerId of ['wind-hazard-fill', 'wind-hazard-outline']) {
    if (map.getLayer(layerId)) map.setFilter(layerId, filter);
  }
}

/**
 * Subtle pulse for the cyclone center. Returns a cleanup function.
 */
export function startCenterPulse(map, layerId = 'cyclone-center-pulse') {
  let frame = null;
  let t0 = null;
  const tick = (ts) => {
    if (t0 === null) t0 = ts;
    const t = (ts - t0) / 1000;
    const p = (Math.sin(t * 2.2) + 1) / 2; // 0..1
    if (map.getLayer(layerId)) {
      map.setPaintProperty(layerId, 'circle-radius', 14 + p * 14);
      map.setPaintProperty(layerId, 'circle-opacity', 0.3 - p * 0.2);
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}
