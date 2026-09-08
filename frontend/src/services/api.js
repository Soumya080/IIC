/**
 * CycloneOps — Central API Service
 * All backend calls go through this module.
 * Provides DEMO MODE fallback when backend is unavailable.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

let _connectionState = 'CONNECTING'; // 'API' | 'DEMO' | 'DEGRADED'
let _lastKnownData = null;

export function getConnectionState() {
  return _connectionState;
}

async function request(path, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    const data = await res.json();
    _connectionState = 'API';
    return data;
  } catch (err) {
    if (_connectionState !== 'DEMO') {
      _connectionState = _lastKnownData ? 'DEGRADED' : 'DEMO';
    }
    throw err;
  }
}

// ─── Health ────────────────────────────────────────────────────────────────

export async function checkHealth() {
  try {
    const data = await request('/api/v1/health');
    _connectionState = 'API';
    return data;
  } catch {
    _connectionState = 'DEMO';
    return null;
  }
}

// ─── Events ────────────────────────────────────────────────────────────────

export const listEvents = () => request('/api/v1/events');
export const getEvent = (id) => request(`/api/v1/events/${id}`);
export const createEvent = (body) => request('/api/v1/events', { method: 'POST', body: JSON.stringify(body) });

// ─── Intelligence (primary command-center endpoint) ───────────────────────

export const getIntelligence = (eventId, tick = null, scenario = 'BASE') => {
  const params = new URLSearchParams({ scenario });
  if (tick !== null) params.set('tick', tick);
  return request(`/api/v1/events/${eventId}/intelligence?${params}`);
};

// ─── State / Track ────────────────────────────────────────────────────────

export const getState = (eventId, tick = null) => {
  const params = tick !== null ? `?tick=${tick}` : '';
  return request(`/api/v1/events/${eventId}/state${params}`);
};

export const getTrack = (eventId) => request(`/api/v1/events/${eventId}/track`);

// ─── Forecasts / Scenarios ────────────────────────────────────────────────

export const getForecasts = (eventId, tick = null) => {
  const params = tick !== null ? `?tick=${tick}` : '';
  return request(`/api/v1/events/${eventId}/forecasts${params}`);
};

export const getScenarios = (eventId, tick = null) => {
  const params = tick !== null ? `?tick=${tick}` : '';
  return request(`/api/v1/events/${eventId}/scenarios${params}`);
};

// ─── Hazard / Impact ─────────────────────────────────────────────────────

export const getHazard = (eventId, tick = null, scenario = 'BASE') => {
  const params = new URLSearchParams({ scenario });
  if (tick !== null) params.set('tick', tick);
  return request(`/api/v1/events/${eventId}/hazards?${params}`);
};

export const getImpact = (eventId, tick = null, scenario = 'BASE') => {
  const params = new URLSearchParams({ scenario });
  if (tick !== null) params.set('tick', tick);
  return request(`/api/v1/events/${eventId}/impact?${params}`);
};

// ─── Operations ───────────────────────────────────────────────────────────

export const getOperations = (eventId, tick = null) => {
  const params = tick !== null ? `?tick=${tick}` : '';
  return request(`/api/v1/events/${eventId}/operations${params}`);
};

// ─── Timeline / Audit ────────────────────────────────────────────────────

export const getTimeline = (eventId, sinceTick = 0) =>
  request(`/api/v1/events/${eventId}/timeline?since_tick=${sinceTick}`);

export const getAudit = (eventId) => request(`/api/v1/events/${eventId}/audit`);
export const getForecastSkill = (eventId) => request(`/api/v1/events/${eventId}/audit/forecast-skill`);
export const getOutcome = (eventId) => request(`/api/v1/events/${eventId}/outcome`);

// ─── Replay Controls ─────────────────────────────────────────────────────

export const replayAdvance = (eventId) =>
  request(`/api/v1/events/${eventId}/replay/advance`, { method: 'POST' });

export const replayReset = (eventId) =>
  request(`/api/v1/events/${eventId}/replay/reset`, { method: 'POST' });

export const replayGoto = (eventId, tick) =>
  request(`/api/v1/events/${eventId}/replay/goto?tick=${tick}`, { method: 'POST' });

// ─── SOS ─────────────────────────────────────────────────────────────────

export const listSOS = (eventId = null) => {
  const params = eventId ? `?event_id=${eventId}` : '';
  return request(`/api/v1/sos${params}`);
};

export const submitSOS = (body) =>
  request('/api/v1/sos', { method: 'POST', body: JSON.stringify(body) });

export const updateSOSStatus = (sosId, status) =>
  request(`/api/v1/sos/${sosId}/status?status=${status}`, { method: 'PATCH' });

// ─── NDRF Alerts ─────────────────────────────────────────────────────────

export const listNDRFAlerts = (eventId = null) => {
  const params = eventId ? `?event_id=${eventId}` : '';
  return request(`/api/v1/ndrf-alerts${params}`);
};

// ─── Resources ───────────────────────────────────────────────────────────

export const listResources = () => request('/api/v1/resources');
export const getResourceGap = (eventId) => request(`/api/v1/resources/gap?event_id=${eventId}`);

// ─── Districts ───────────────────────────────────────────────────────────

export const listDistricts = () => request('/api/v1/districts');
export const getDistrictReadiness = (district) =>
  request(`/api/v1/districts/${encodeURIComponent(district)}/readiness`);

// ─── MapLibre Backend Services ───────────────────────────────────────────

export const getMapConfig = () => request('/api/v1/map/config');
export const getMapLayers = () => request('/api/v1/map/layers');
export const getTrackGeoJSON = (eventId) => request(`/api/v1/map/geojson/${eventId}/track`);
export const getScenariosGeoJSON = (eventId, tick = null) => {
  const params = tick !== null ? `?tick=${tick}` : '';
  return request(`/api/v1/map/geojson/${eventId}/scenarios${params}`);
};
export const getWindGeoJSON = (eventId, tick = null, scenario = 'BASE') => {
  const params = new URLSearchParams({ scenario });
  if (tick !== null) params.set('tick', tick);
  return request(`/api/v1/map/geojson/${eventId}/wind?${params}`);
};
export const getResourcesGeoJSON = () => request('/api/v1/map/geojson/resources');
export const getSOSGeoJSON = (eventId) => request(`/api/v1/map/geojson/${eventId}/sos`);

// ─── Demo seed ───────────────────────────────────────────────────────────

export const demoSeed = () => request('/api/v1/demo/seed', { method: 'POST' });
