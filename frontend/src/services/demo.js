/**
 * CycloneOps — Demo Mode Fallback Data
 * Deterministic local data used when backend is unavailable.
 * All values are SIMULATED.
 */

export const DEMO_EVENT_ID = 'CYC-2020-AMPHAN';

export const DEMO_EVENT = {
  id: 'CYC-2020-AMPHAN',
  name: 'Amphan',
  status: 'ACTIVE',
  basin: 'BOB',
  current_tick: 0,
  max_tick: 11,
  demo_mode: true,
  current_alert: 'GREEN',
  current_time: '2020-05-14T00:00:00Z',
};

// 12 ticks of Amphan data
export const DEMO_TICKS = [
  { tick: 0, ts: '2020-05-14T00:00:00Z', lat: 10.5, lon: 86.5, wind: 30, pres: 1004, regime: 'FORMATION', conf: 0.72, tti: null, risk: 0.05, flood: 0.0, pop: 0, alert: 'GREEN' },
  { tick: 1, ts: '2020-05-14T12:00:00Z', lat: 11.2, lon: 86.3, wind: 45, pres: 998, regime: 'DEVELOPING', conf: 0.76, tti: null, risk: 0.08, flood: 0.0, pop: 0, alert: 'GREEN' },
  { tick: 2, ts: '2020-05-15T00:00:00Z', lat: 12.1, lon: 86.0, wind: 65, pres: 988, regime: 'INTENSIFYING', conf: 0.80, tti: 96.0, risk: 0.15, flood: 0.05, pop: 50000, alert: 'GREEN' },
  { tick: 3, ts: '2020-05-15T12:00:00Z', lat: 13.0, lon: 85.8, wind: 95, pres: 970, regime: 'RAPID_INTENSIFICATION', conf: 0.88, tti: 84.0, risk: 0.30, flood: 0.10, pop: 200000, alert: 'YELLOW' },
  { tick: 4, ts: '2020-05-16T00:00:00Z', lat: 13.8, lon: 85.5, wind: 120, pres: 952, regime: 'RAPID_INTENSIFICATION', conf: 0.91, tti: 72.0, risk: 0.48, flood: 0.18, pop: 500000, alert: 'YELLOW' },
  { tick: 5, ts: '2020-05-16T12:00:00Z', lat: 14.8, lon: 85.2, wind: 155, pres: 920, regime: 'MATURE', conf: 0.93, tti: 60.0, risk: 0.62, flood: 0.28, pop: 1200000, alert: 'ORANGE' },
  { tick: 6, ts: '2020-05-17T00:00:00Z', lat: 16.0, lon: 85.0, wind: 150, pres: 925, regime: 'MATURE', conf: 0.90, tti: 48.0, risk: 0.70, flood: 0.35, pop: 1800000, alert: 'ORANGE' },
  { tick: 7, ts: '2020-05-17T12:00:00Z', lat: 17.5, lon: 85.0, wind: 135, pres: 935, regime: 'WEAKENING', conf: 0.87, tti: 36.0, risk: 0.80, flood: 0.45, pop: 2400000, alert: 'RED' },
  { tick: 8, ts: '2020-05-18T00:00:00Z', lat: 19.0, lon: 85.2, wind: 120, pres: 947, regime: 'WEAKENING', conf: 0.85, tti: 24.0, risk: 0.88, flood: 0.55, pop: 3000000, alert: 'RED' },
  { tick: 9, ts: '2020-05-18T12:00:00Z', lat: 20.5, lon: 86.8, wind: 155, pres: 920, regime: 'MATURE', conf: 0.95, tti: 12.0, risk: 0.95, flood: 0.70, pop: 3400000, alert: 'RED' },
  { tick: 10, ts: '2020-05-19T00:00:00Z', lat: 22.0, lon: 87.5, wind: 90, pres: 960, regime: 'WEAKENING', conf: 0.80, tti: 2.0, risk: 0.92, flood: 0.65, pop: 2800000, alert: 'RED' },
  { tick: 11, ts: '2020-05-19T12:00:00Z', lat: 23.5, lon: 88.2, wind: 45, pres: 988, regime: 'DISSIPATING', conf: 0.75, tti: 0.0, risk: 0.60, flood: 0.40, pop: 1500000, alert: 'RED' },
];

export function getDemoIntelligence(tick = 0) {
  const t = DEMO_TICKS[Math.min(tick, 11)];
  const prev = tick > 0 ? DEMO_TICKS[tick - 1] : null;
  
  const ri_prob = t.regime === 'RAPID_INTENSIFICATION' ? 0.75 : 0.10;
  
  return {
    event: { ...DEMO_EVENT, current_tick: tick, current_time: t.ts, current_alert: t.alert },
    state: {
      tick: t.tick, timestamp: t.ts, lat: t.lat, lon: t.lon,
      intensity_kt: t.wind, pressure_hpa: t.pres, regime: t.regime,
      confidence: t.conf, movement_speed_kmh: 20, movement_heading_deg: 355,
      environment: { sst_c: 30.2, shear_kt: 8, humidity_pct: 78 },
    },
    regime: t.regime,
    change_point: tick === 3 ? {
      detected: true, from_regime: 'INTENSIFYING', to_regime: 'RAPID_INTENSIFICATION',
      delta_wind_kt: 30, delta_pressure_hpa: -18, confidence: 0.88,
      description: 'Regime shift INTENSIFYING → RAPID_INTENSIFICATION: Δwind=+30kt, ΔP=-18hPa',
    } : null,
    scenarios: [
      { scenario_type: 'BASE', probability: 0.65, peak_intensity_kt: t.wind * 1.0, time_to_impact_hours: t.tti,
        landfall_lat: 21.65, landfall_lon: 88.35, source: 'SIMULATED',
        track: buildScenarioTrack(t, 0) },
      { scenario_type: 'LEFT', probability: 0.20, peak_intensity_kt: t.wind * 0.9, time_to_impact_hours: t.tti ? t.tti + 6 : null,
        landfall_lat: 21.2, landfall_lon: 87.8, source: 'SIMULATED',
        track: buildScenarioTrack(t, -1.5) },
      { scenario_type: 'RIGHT', probability: 0.15, peak_intensity_kt: t.wind * 1.1, time_to_impact_hours: t.tti ? Math.max(0, t.tti - 6) : null,
        landfall_lat: 22.1, landfall_lon: 88.9, source: 'SIMULATED',
        track: buildScenarioTrack(t, 1.5) },
    ],
    hazard: {
      event_id: DEMO_EVENT_ID, tick, scenario_type: 'BASE',
      source: 'PARAMETRIC_HOLLAND_SIMPLIFIED',
      zones: buildHazardZones(t.lat, t.lon, t.wind),
    },
    exposure: {
      tick, total_exposed_population: t.pop,
      affected_districts: getAffectedDistricts(tick),
      time_to_impact_hours: t.tti, flood_risk_index: t.flood,
      composite_risk: t.risk, risk_level: getRiskLevel(t.risk),
      source: 'SIMULATED_PRECOMPUTED',
    },
    impact: {
      tick, total_exposed_population: t.pop,
      affected_districts: getAffectedDistricts(tick),
      time_to_impact_hours: t.tti, flood_risk_index: t.flood,
      composite_risk: t.risk, risk_level: getRiskLevel(t.risk),
      source: 'SIMULATED_PRECOMPUTED',
    },
    alert: {
      level: t.alert, tti_hours: t.tti, risk_pct: t.risk,
      triggered_by: [`TTI=${t.tti}h`, `risk=${Math.round(t.risk * 100)}%`],
    },
    operations: getOperations(tick, t),
    timeline: getTimeline(tick),
    metadata: {
      tick, max_tick: 11, scenario: 'BASE',
      data_status: 'SIMULATED',
      source: 'DEMO_FALLBACK',
      disclaimer: 'DEMO MODE — backend unavailable. All data SIMULATED.',
    },
  };
}

function buildScenarioTrack(t, lonOffset) {
  return [
    { lead_hours: 6, lat: t.lat + 0.7, lon: t.lon + lonOffset * 0.3, intensity_kt: t.wind + 5, pressure_hpa: t.pres - 3 },
    { lead_hours: 12, lat: t.lat + 1.5, lon: t.lon + lonOffset * 0.5, intensity_kt: t.wind + 10, pressure_hpa: t.pres - 6 },
    { lead_hours: 24, lat: t.lat + 3.0, lon: t.lon + lonOffset * 0.8, intensity_kt: t.wind + 15, pressure_hpa: t.pres - 10 },
    { lead_hours: 48, lat: t.lat + 5.5, lon: t.lon + lonOffset * 1.0, intensity_kt: Math.max(35, t.wind - 10), pressure_hpa: t.pres + 5 },
  ];
}

function buildHazardZones(lat, lon, wind) {
  const zones = [];
  const radii = [{ kt: 34, r: wind * 2.8, color: '#FFF176' }, { kt: 50, r: wind * 1.6, color: '#FF9800' }, { kt: 64, r: wind * 0.9, color: '#F44336' }];
  for (const { kt, r, color } of radii) {
    if (wind >= kt) {
      zones.push({ threshold: `${kt}kt`, geojson: circleGeoJSON(lat, lon, r), area_km2: Math.PI * r * r, color });
    }
  }
  return zones;
}

function circleGeoJSON(lat, lon, radiusKm, n = 64) {
  const coords = [];
  for (let i = 0; i <= n; i++) {
    const angle = (2 * Math.PI * i) / n;
    const dlat = radiusKm / 111.32;
    const dlon = radiusKm / (111.32 * Math.cos((Math.PI * lat) / 180));
    coords.push([lon + dlon * Math.sin(angle), lat + dlat * Math.cos(angle)]);
  }
  return { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: {} }] };
}

function getRiskLevel(risk) {
  if (risk > 0.75) return 'EXTREME';
  if (risk > 0.55) return 'HIGH';
  if (risk > 0.25) return 'MODERATE';
  return 'LOW';
}

function getAffectedDistricts(tick) {
  const map = {
    0: [], 1: [], 2: ['Puri'], 3: ['Puri', 'Khordha'], 4: ['Puri', 'Khordha', 'Jagatsinghpur'],
    5: ['Jagatsinghpur', 'Kendrapara', 'Bhadrak'], 6: ['Bhadrak', 'Balasore', 'East Medinipur'],
    7: ['East Medinipur', '24 Parganas North', 'South 24 Parganas'],
    8: ['South 24 Parganas', 'Kolkata', 'Howrah'],
    9: ['South 24 Parganas', 'Kolkata', 'Howrah', 'Hooghly'],
    10: ['Kolkata', 'Howrah', 'Hooghly', 'Nadia'], 11: ['Nadia', 'Murshidabad'],
  };
  return map[tick] || [];
}

function getOperations(tick, t) {
  const ops = [];
  if (t.regime === 'RAPID_INTENSIFICATION') {
    ops.push({ title: 'Activate Maritime Monitoring', priority: 'HIGH', status: 'ACTIVE', description: 'Deploy maritime patrol assets for RI storm tracking.', assigned_role: 'COAST_GUARD', is_simulated: true });
  }
  if (t.tti && t.tti <= 72) {
    ops.push({ title: 'Initiate Coastal Evacuation Warning', priority: 'HIGH', status: 'ACTIVE', description: 'Issue pre-evacuation advisory for coastal districts.', assigned_role: 'DISTRICT_ADMIN', is_simulated: true });
  }
  if (t.tti && t.tti <= 48 && t.pop > 500000) {
    ops.push({ title: 'Pre-Position NDRF Teams', priority: 'CRITICAL', status: 'ACTIVE', description: 'Move NDRF battalions to high-risk districts.', assigned_role: 'NDRF_COMMAND', is_simulated: true });
  }
  return ops;
}

function getTimeline(tick) {
  const entries = [
    { tick: 0, type: 'OBSERVATION_RECEIVED', summary: 'Initial observation — Depression forming in Bay of Bengal', severity: 'INFO' },
    { tick: 1, type: 'STATE_UPDATED', summary: 'State updated: 45 kt / 998 hPa @ (11.2N, 86.3E)', severity: 'INFO' },
    { tick: 3, type: 'CHANGE_POINT_DETECTED', summary: 'Change point: INTENSIFYING → RAPID_INTENSIFICATION', severity: 'WARNING' },
    { tick: 3, type: 'REGIME_CHANGED', summary: 'Regime changed: INTENSIFYING → RAPID_INTENSIFICATION', severity: 'WARNING' },
    { tick: 5, type: 'ALERT_CHANGED', summary: 'Alert escalated: YELLOW → ORANGE', severity: 'CRITICAL' },
    { tick: 7, type: 'ALERT_CHANGED', summary: 'Alert escalated: ORANGE → RED', severity: 'CRITICAL' },
    { tick: 7, type: 'TASK_ACTIVATED', summary: 'Task activated: Pre-Position NDRF Teams', severity: 'INFO' },
  ];
  return entries.filter(e => e.tick <= tick);
}

export const DEMO_RESOURCES = [
  { id: 'RES-001', name: 'NDRF 2nd Battalion', resource_type: 'NDRF_TEAM', district: 'Kolkata', lat: 22.57, lon: 88.36, capacity: 150, available: true, status: 'STANDBY' },
  { id: 'RES-002', name: 'NDRF 8th Battalion', resource_type: 'NDRF_TEAM', district: 'Bhubaneswar', lat: 20.29, lon: 85.82, capacity: 150, available: true, status: 'STANDBY' },
  { id: 'RES-003', name: 'NDRF 12th Battalion', resource_type: 'NDRF_TEAM', district: 'Guwahati', lat: 26.18, lon: 91.73, capacity: 150, available: false, status: 'DEPLOYED' },
  { id: 'RES-004', name: 'Emergency Shelter A', resource_type: 'SHELTER', district: 'South 24 Parganas', lat: 22.0, lon: 88.3, capacity: 5000, available: true, status: 'READY' },
  { id: 'RES-005', name: 'Medical Hub Kolkata', resource_type: 'MEDICAL', district: 'Kolkata', lat: 22.55, lon: 88.33, capacity: 200, available: true, status: 'READY' },
  { id: 'RES-006', name: 'Coast Guard Paradip', resource_type: 'COAST_GUARD', district: 'Jagatsinghpur', lat: 20.31, lon: 86.61, capacity: 40, available: true, status: 'ALERT' },
  { id: 'RES-007', name: 'Cyclone Shelter Digha', resource_type: 'SHELTER', district: 'East Medinipur', lat: 21.62, lon: 87.51, capacity: 3000, available: true, status: 'READY' },
  { id: 'RES-008', name: 'Transport Fleet WB', resource_type: 'TRANSPORT', district: 'Howrah', lat: 22.58, lon: 88.30, capacity: 80, available: true, status: 'STANDBY' },
];

export const DEMO_DISTRICTS = [
  { district: 'South 24 Parganas', evacuation: 45, shelter: 60, medical: 55, transport: 40, overall: 50, label: 'CRITICAL' },
  { district: 'Kolkata', evacuation: 70, shelter: 75, medical: 80, transport: 65, overall: 72, label: 'MODERATE' },
  { district: 'Howrah', evacuation: 60, shelter: 68, medical: 72, transport: 55, overall: 64, label: 'MODERATE' },
  { district: 'East Medinipur', evacuation: 40, shelter: 50, medical: 45, transport: 38, overall: 43, label: 'CRITICAL' },
  { district: 'Bhadrak', evacuation: 55, shelter: 62, medical: 58, transport: 50, overall: 56, label: 'MODERATE' },
  { district: 'Puri', evacuation: 65, shelter: 70, medical: 68, transport: 60, overall: 66, label: 'MODERATE' },
];
<<<<<<< HEAD
=======

export const DEMO_SOS = [
  { id: 'SOS-8801', sos_id: 'SOS-8801', event_id: 'CYC-2020-AMPHAN', category: 'TRAPPED', severity: 'CRITICAL', district: 'South 24 Parganas', lat: 22.00, lon: 88.30, people_count: 14, description: 'Storm surge flooded ground floor. 14 citizens trapped on roof.', contact: '+91 98301 11223', status: 'NEW', priority_score: 56.0 },
  { id: 'SOS-8802', sos_id: 'SOS-8802', event_id: 'CYC-2020-AMPHAN', category: 'MEDICAL', severity: 'HIGH', district: 'East Medinipur', lat: 21.62, lon: 87.51, people_count: 6, description: 'Severe trauma casualties requiring immediate ambulance.', contact: '+91 94331 44556', status: 'ACKNOWLEDGED', priority_score: 18.0 },
  { id: 'SOS-8803', sos_id: 'SOS-8803', event_id: 'CYC-2020-AMPHAN', category: 'EVACUATION', severity: 'CRITICAL', district: 'Kolkata', lat: 22.57, lon: 88.36, people_count: 22, description: 'Power grid collapsed and water level rising near canal.', contact: '+91 98312 99887', status: 'ASSIGNED', priority_score: 88.0 },
];
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
