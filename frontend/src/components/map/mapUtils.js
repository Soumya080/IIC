/**
 * VORTEX Map Utilities
 * Pure GeoJSON builders + MapLibre camera helpers.
 * No React here — these operate on a live maplibregl.Map instance.
 */
import * as maplibregl from 'maplibre-gl';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from './mapConfig.js';

/* ------------------------------------------------------------------ */
/* GeoJSON builders                                                    */
/* ------------------------------------------------------------------ */

export const EMPTY_FC = { type: 'FeatureCollection', features: [] };

export function pointFeature(lon, lat, properties = {}) {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [Number(lon), Number(lat)] },
    properties,
  };
}

export function lineFeature(coords, properties = {}) {
  return {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: coords },
    properties,
  };
}

/** Historical/current cyclone track → cyclone-track source (line + dots). */
export function buildTrackGeoJSON(points = []) {
  const coords = points
    .filter(p => Number.isFinite(p.lon) && Number.isFinite(p.lat))
    .map(p => [p.lon, p.lat]);
  if (!coords.length) return EMPTY_FC;
  const features = [];
  if (coords.length > 1) features.push(lineFeature(coords, { kind: 'track', data_status: 'SIMULATED' }));
  coords.forEach((c, i) =>
    features.push(pointFeature(c[0], c[1], { kind: 'track-point', index: i, isCurrent: i === coords.length - 1 }))
  );
  return { type: 'FeatureCollection', features };
}

/**
 * Forecast scenarios → forecast GeoJSON.
 * Each scenario: { scenario_id|scenario_type, probability?, geometry?|track?, source?, confidence? }
 * Probabilities are passed through only when supplied — never invented here.
 */
export function buildForecastGeoJSON(scenarios = [], currentPos = null) {
  const features = [];
  for (const s of scenarios) {
    const id = s.scenario_id || s.scenario_type || 'BASE';
    let coords = null;
    if (s.geometry?.type === 'LineString') {
      coords = s.geometry.coordinates;
    } else if (Array.isArray(s.track) && s.track.length) {
      coords = s.track
        .filter(p => Number.isFinite(p.lon) && Number.isFinite(p.lat))
        .map(p => [p.lon, p.lat]);
    }
    if (!coords || !coords.length) continue;
    if (currentPos && Number.isFinite(currentPos.lon) && Number.isFinite(currentPos.lat)) {
      coords = [[currentPos.lon, currentPos.lat], ...coords];
    }
    features.push(lineFeature(coords, {
      scenario_id: id,
      probability: s.probability ?? null,
      forecast_time: s.forecast_time ?? null,
      confidence: s.confidence ?? null,
      source: s.source || 'SIMULATED',
    }));
  }
  return { type: 'FeatureCollection', features };
}

/** Wind hazard zones → single wind-hazard source (threshold property drives styling). */
export function buildWindHazardGeoJSON(zones = []) {
  const features = [];
  for (const z of zones) {
    const fc = z.geojson;
    if (!fc?.features) continue;
    for (const f of fc.features) {
      features.push({ ...f, properties: { ...f.properties, threshold: z.threshold, source: 'SIMULATED' } });
    }
  }
  return { type: 'FeatureCollection', features };
}

/** Resources → points (resource_id/type/status/location/capacity/assignment). */
export function buildResourcesGeoJSON(resources = []) {
  return {
    type: 'FeatureCollection',
    features: resources
      .filter(r => Number.isFinite(r.lon) && Number.isFinite(r.lat))
      .map(r => pointFeature(r.lon, r.lat, {
        resource_id: r.id,
        name: r.name,
        type: r.resource_type,
        status: r.status,
        capacity: r.capacity ?? null,
        available: !!r.available,
        district: r.district ?? null,
      })),
  };
}

/** SOS reports → points. Exact coordinates only as authorized by the backend payload. */
export function buildSosGeoJSON(reports = []) {
  return {
    type: 'FeatureCollection',
    features: reports
      .filter(r => Number.isFinite(r.lon) && Number.isFinite(r.lat))
      .map(r => pointFeature(r.lon, r.lat, {
        sos_id: r.id,
        severity: r.severity ?? 'LOW',
        status: r.status ?? 'NEW',
        category: r.category ?? null,
        timestamp: r.timestamp ?? r.created_at ?? null,
      })),
  };
}

/** RRAS routes: geometry is computed by the backend — frontend only renders it. */
export function buildRoutesGeoJSON(routes = []) {
  const features = [];
  for (const r of routes) {
    if (r.geometry?.type === 'LineString') {
      features.push({
        type: 'Feature',
        geometry: r.geometry,
        properties: {
          route_id: r.route_id,
          resource_id: r.resource_id ?? null,
          status: r.status ?? 'PLANNED',
          risk: r.risk ?? null,
          distance: r.distance ?? null,
          travel_time: r.travel_time ?? null,
          scenario_id: r.scenario_id ?? null,
        },
      });
    }
  }
  return { type: 'FeatureCollection', features };
}

/* ------------------------------------------------------------------ */
/* Camera helpers                                                      */
/* ------------------------------------------------------------------ */

export function resetView(map) {
  map?.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, bearing: 0, pitch: 0, duration: 1400 });
}

export function flyToCyclone(map, state) {
  if (!map || !Number.isFinite(state?.lon) || !Number.isFinite(state?.lat)) return;
  map.flyTo({ center: [state.lon, state.lat], zoom: 5.8, duration: 1600, essential: true });
}

export function fitCycloneTrack(map, coords, opts = {}) {
  if (!map || !coords?.length) return;
  map.fitBounds(boundsOf(coords), { padding: 80, duration: 1400, maxZoom: 7, ...opts });
}

export function flyToDistrict(map, lonLat) {
  if (!map || !lonLat) return;
  map.flyTo({ center: lonLat, zoom: 8, duration: 1400 });
}

export function flyToResource(map, resource) {
  if (!map || !Number.isFinite(resource?.lon) || !Number.isFinite(resource?.lat)) return;
  map.flyTo({ center: [resource.lon, resource.lat], zoom: 8.5, duration: 1400 });
}

export function flyToSOS(map, sos) {
  if (!map || !Number.isFinite(sos?.lon) || !Number.isFinite(sos?.lat)) return;
  map.flyTo({ center: [sos.lon, sos.lat], zoom: 9, duration: 1400 });
}

export function fitScenario(map, scenario) {
  const coords = scenario?.geometry?.type === 'LineString'
    ? scenario.geometry.coordinates
    : (scenario?.track || []).map(p => [p.lon, p.lat]);
  fitCycloneTrack(map, coords);
}

function boundsOf(coords) {
  const b = new maplibregl.LngLatBounds();
  for (const [lon, lat] of coords) b.extend([lon, lat]);
  return b;
}
