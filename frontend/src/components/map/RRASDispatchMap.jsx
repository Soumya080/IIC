import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import useAppStore from '../../store/appStore.js';
import { MAP_CONFIG } from './mapConfig.js';
import { Truck, Navigation, ShieldAlert, Anchor, Compass, Clock, MapPin, Layers } from 'lucide-react';

const NODE_COORDS = {
  'DEP-BBS': { name: 'NDRF Bhubaneswar Depot (Safe Hub)', lat: 20.29, lon: 85.82, type: 'DEPOT' },
  'DEP-KOL': { name: 'NDRF Kolkata Depot (Safe Hub)', lat: 22.57, lon: 88.36, type: 'DEPOT' },
  'DEP-KON': { name: 'Contai Forward Base (Safe Hub)', lat: 21.62, lon: 87.51, type: 'DEPOT' },
  'Puri': { name: 'Puri District', lat: 19.81, lon: 85.83, type: 'DISTRICT' },
  'Khordha': { name: 'Khordha District', lat: 20.18, lon: 85.67, type: 'DISTRICT' },
  'Jagatsinghpur': { name: 'Jagatsinghpur District', lat: 20.31, lon: 86.61, type: 'DISTRICT' },
  'Kendrapara': { name: 'Kendrapara District', lat: 20.50, lon: 86.42, type: 'DISTRICT' },
  'Bhadrak': { name: 'Bhadrak District', lat: 21.06, lon: 86.49, type: 'DISTRICT' },
  'Balasore': { name: 'Balasore District', lat: 21.49, lon: 86.93, type: 'DISTRICT' },
  'East Medinipur': { name: 'East Medinipur District', lat: 21.62, lon: 87.51, type: 'DISTRICT' },
  'South 24 Parganas': { name: 'South 24 Parganas District', lat: 22.00, lon: 88.30, type: 'DISTRICT' },
  'Kolkata': { name: 'Kolkata Metro', lat: 22.57, lon: 88.36, type: 'DISTRICT' },
  'Howrah': { name: 'Howrah District', lat: 22.58, lon: 88.30, type: 'DISTRICT' },
  'Hooghly': { name: 'Hooghly District', lat: 22.90, lon: 88.40, type: 'DISTRICT' },
  'Nadia': { name: 'Nadia District', lat: 23.47, lon: 88.56, type: 'DISTRICT' },
  'Murshidabad': { name: 'Murshidabad District', lat: 24.18, lon: 88.27, type: 'DISTRICT' },
};

const ROAD_EDGES = [
  ["DEP-BBS", "Puri"], ["DEP-BBS", "Khordha"], ["DEP-BBS", "Jagatsinghpur"], ["DEP-BBS", "Bhadrak"],
  ["Puri", "Khordha"], ["Puri", "Jagatsinghpur"], ["Khordha", "Jagatsinghpur"], ["Jagatsinghpur", "Kendrapara"],
  ["Kendrapara", "Bhadrak"], ["Bhadrak", "Balasore"], ["Balasore", "East Medinipur"],
  ["East Medinipur", "South 24 Parganas"], ["East Medinipur", "DEP-KON"], ["DEP-KON", "South 24 Parganas"],
  ["South 24 Parganas", "Kolkata"], ["South 24 Parganas", "Howrah"], ["Kolkata", "Howrah"],
  ["Kolkata", "DEP-KOL"], ["DEP-KOL", "Howrah"], ["DEP-KOL", "Hooghly"], ["Howrah", "Hooghly"],
  ["Hooghly", "Nadia"], ["Nadia", "Murshidabad"]
];

function getTransportMode(accessStatus) {
  if (accessStatus === 'NO_ACCESS' || accessStatus === 'UNREACHABLE') {
    return {
      mode: 'IAF Helicopter Airlift & NDRF Marine Boats',
      icon: Anchor,
      color: '#ff1744',
      desc: 'Coastal highways blocked by surge & debris. Air-drop & marine rescue craft required.',
      type: 'AIR_MARINE',
    };
  }
  if (accessStatus === 'REROUTED') {
    return {
      mode: 'All-Terrain Rescue Column (Diverted Route)',
      icon: Navigation,
      color: '#ffc107',
      desc: 'Diverted around flooded highway sections via inland feeder arteries.',
      type: 'ALL_TERRAIN',
    };
  }
  return {
    mode: 'NDRF Heavy Motor Transport Convoy',
    icon: Truck,
    color: '#00e676',
    desc: 'Direct highway corridor clear. Heavy troop transport & medical supply vehicles.',
    type: 'HIGHWAY_CONVOY',
  };
}

// Detailed geographical coastline coordinates for Bay of Bengal (Andhra coast -> Odisha coast -> Sundarbans -> Bangladesh border)
const BAY_OF_BENGAL_COASTLINE_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [84.5, 18.5], [84.8, 19.1], [85.4, 19.7], [85.8, 19.8], [86.3, 19.9],
          [86.8, 20.3], [86.9, 20.7], [87.1, 21.3], [87.5, 21.6], [88.0, 21.6],
          [88.4, 21.5], [88.9, 21.6], [89.5, 21.8], [89.5, 18.5], [84.5, 18.5]
        ]]
      },
      properties: { name: 'Bay of Bengal Waters' }
    }
  ]
};

export default function RRASDispatchMap({ selectedTrip, onSelectTrip }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const rrasData = useAppStore(s => s.rrasData);
  const currentTick = useAppStore(s => s.currentTick);

  const allocations = rrasData?.allocation_plan || [];
  const roadNetwork = rrasData?.road_network?.segments || [];
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredTrip, setHoveredTrip] = useState(null);

  const activeTrip = selectedTrip || hoveredTrip || allocations[0] || null;

  // Initialize MapLibre GL Map centered on Bay of Bengal Coastal Region
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_CONFIG.STYLE_URL,
        center: [87.1, 21.5], // Center of Odisha / Bengal Coast
        zoom: 6.6,
        minZoom: 5.0,
        maxZoom: 12.0,
        attributionControl: false,
      });

      map.on('load', () => {
        setMapLoaded(true);
        map.resize();
      });

      mapRef.current = map;
    } catch (err) {
      console.warn('[RRASDispatchMap] MapLibre WebGL fallback active:', err);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update MapLibre GL vector sources when rrasData or selectedTrip changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    try {
      // Build 23 Road Network LineStrings with status color properties
      const roadFeatures = ROAD_EDGES.map(([u, v]) => {
        const uNode = NODE_COORDS[u];
        const vNode = NODE_COORDS[v];
        if (!uNode || !vNode) return null;

        const segInfo = roadNetwork.find(s => (s.from === u && s.to === v) || (s.from === v && s.to === u));
        const status = segInfo ? segInfo.status : 'NORMAL';

        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[uNode.lon, uNode.lat], [vNode.lon, vNode.lat]]
          },
          properties: {
            from: u,
            to: v,
            status: status,
            color: status === 'NORMAL' ? '#00e676' : status === 'REROUTED' ? '#ffc107' : '#ff1744'
          }
        };
      }).filter(Boolean);

      // Add/Update Road Network Source & Layer
      if (map.getSource('rras-road-network')) {
        map.getSource('rras-road-network').setData({ type: 'FeatureCollection', features: roadFeatures });
      } else {
        map.addSource('rras-road-network', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: roadFeatures }
        });
        map.addLayer({
          id: 'rras-road-lines',
          type: 'line',
          source: 'rras-road-network',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 3,
            'line-opacity': 0.8
          }
        });
      }

      // Add/Update Active Trip Route Lines
      const tripFeatures = allocations.map(item => {
        const depot = NODE_COORDS[item.depot_id];
        const dist = NODE_COORDS[item.district];
        if (!depot || !dist) return null;

        const isSelected = activeTrip?.district === item.district;

        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[depot.lon, depot.lat], [dist.lon, dist.lat]]
          },
          properties: {
            district: item.district,
            depot_id: item.depot_id,
            status: item.access_status,
            isSelected: isSelected,
            color: item.access_status === 'CLEAR' ? '#00e676' : item.access_status === 'REROUTED' ? '#ffc107' : '#ff1744'
          }
        };
      }).filter(Boolean);

      if (map.getSource('rras-active-trips')) {
        map.getSource('rras-active-trips').setData({ type: 'FeatureCollection', features: tripFeatures });
      } else {
        map.addSource('rras-active-trips', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: tripFeatures }
        });
        map.addLayer({
          id: 'rras-active-lines',
          type: 'line',
          source: 'rras-active-trips',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': ['case', ['get', 'isSelected'], 5, 3],
            'line-opacity': 0.95
          }
        });
      }

      // Add Node Markers (Depots & Districts)
      const nodeFeatures = Object.entries(NODE_COORDS).map(([id, info]) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [info.lon, info.lat] },
        properties: {
          id,
          name: info.name,
          type: info.type,
          color: info.type === 'DEPOT' ? '#00bcd4' : '#f44336'
        }
      }));

      if (map.getSource('rras-nodes')) {
        map.getSource('rras-nodes').setData({ type: 'FeatureCollection', features: nodeFeatures });
      } else {
        map.addSource('rras-nodes', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: nodeFeatures }
        });
        map.addLayer({
          id: 'rras-nodes-point',
          type: 'circle',
          source: 'rras-nodes',
          paint: {
            'circle-color': ['get', 'color'],
            'circle-radius': ['case', ['==', ['get', 'type'], 'DEPOT'], 7, 5],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });
      }
    } catch (err) {
      console.warn('[RRASDispatchMap] layer update exception:', err);
    }
  }, [rrasData, mapLoaded, activeTrip]);

  // High-precision projection math for geographical SVG Fallback (lon: 84.0..89.8, lat: 18.8..24.5)
  const minLon = 84.0, maxLon = 89.8;
  const minLat = 18.8, maxLat = 24.5;
  const width = 640, height = 360;

  const project = (lon, lat) => {
    const x = ((lon - minLon) / (maxLon - minLon)) * width;
    const y = height - ((lat - minLat) / (maxLat - minLat)) * height;
    return [x, y];
  };

  return (
    <div
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border-2)',
        borderRadius: '6px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Map Section Header */}
      <div className="panel-hd" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation size={15} style={{ color: 'var(--cyan)' }} />
          <span className="panel-title">BAY OF BENGAL RRAS ROUTING & TRANSPORTATION MAP</span>
          <span className="chip chip-cyan" style={{ fontSize: '10px' }}>T+{currentTick} DISPATCH</span>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-3)', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, background: '#00e676', borderRadius: '50%' }} /> Clear Highway
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, background: '#ffc107', borderRadius: '50%' }} /> Rerouted Path
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, background: '#ff1744', borderRadius: '50%' }} /> Blocked / Airlift
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Route & Transportation Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '14px' }}>
        {/* Map Container (MapLibre Canvas + Vector Geo-Accurate Fallback) */}
        <div
          style={{
            position: 'relative',
            background: '#0a111e',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            overflow: 'hidden',
            height: '360px',
          }}
        >
          {/* MapLibre GL Canvas Container */}
          <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />

          {/* Geo-Accurate Geographic Overlay (renders when MapLibre GL tiles load or fallback) */}
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: mapLoaded ? 'none' : 'auto',
            }}
          >
            {!mapLoaded && (
              <>
                {/* Bay of Bengal Sea Coast Polygon */}
                <path
                  d="M 60 360 L 110 320 L 190 270 L 260 230 L 310 215 L 390 190 L 460 190 L 520 180 L 640 160 L 640 360 Z"
                  fill="rgba(0, 188, 212, 0.08)"
                  stroke="rgba(0, 188, 212, 0.3)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text x="360" y="270" fill="rgba(0, 188, 212, 0.35)" fontSize="13" fontWeight="800" letterSpacing="3">
                  BAY OF BENGAL
                </text>
                <text x="140" y="160" fill="rgba(255, 255, 255, 0.2)" fontSize="11" fontWeight="700">
                  ODISHA & WEST BENGAL COAST
                </text>

                {/* 23 Road Network Lines */}
                {ROAD_EDGES.map(([u, v], i) => {
                  const uNode = NODE_COORDS[u];
                  const vNode = NODE_COORDS[v];
                  if (!uNode || !vNode) return null;
                  const [x1, y1] = project(uNode.lon, uNode.lat);
                  const [x2, y2] = project(vNode.lon, vNode.lat);
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="rgba(255, 255, 255, 0.12)"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Active RRAS Fastest Route LineStrings */}
                {allocations.map((item, idx) => {
                  const depot = NODE_COORDS[item.depot_id];
                  const dist = NODE_COORDS[item.district];
                  if (!depot || !dist) return null;

                  const [x1, y1] = project(depot.lon, depot.lat);
                  const [x2, y2] = project(dist.lon, dist.lat);
                  const isSelected = activeTrip?.district === item.district;

                  const color =
                    item.access_status === 'CLEAR'
                      ? '#00e676'
                      : item.access_status === 'REROUTED'
                      ? '#ffc107'
                      : '#ff1744';

                  const midX = (x1 + x2) / 2;
                  const midY = (y1 + y2) / 2;

                  return (
                    <g key={idx} onClick={() => onSelectTrip && onSelectTrip(item)} style={{ cursor: 'pointer' }}>
                      {isSelected && (
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="7" strokeOpacity="0.3" />
                      )}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={color}
                        strokeWidth={isSelected ? 3.5 : 2.5}
                        strokeDasharray={item.access_status === 'REROUTED' ? '6 3' : item.access_status === 'CLEAR' ? 'none' : '2 4'}
                      />
                      <circle cx={midX} cy={midY} r={isSelected ? 4 : 3} fill={color}>
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.4s" repeatCount="indefinite" />
                      </circle>

                      {/* ETA Badge on Route Midpoint */}
                      <g transform={`translate(${midX}, ${midY - 8})`}>
                        <rect x="-26" y="-10" width="52" height="15" fill="#09101d" rx="4" stroke={color} strokeWidth="1.2" opacity="0.95" />
                        <text x="0" y="1" fill="#ffc107" fontSize="9" fontWeight="800" textAnchor="middle">
                          ⏱️ {item.est_time_min ? `${Math.round(item.est_time_min)}m` : 'Air'}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Render Nodes (Depots & Districts) */}
                {Object.entries(NODE_COORDS).map(([id, info]) => {
                  const [x, y] = project(info.lon, info.lat);
                  const isDepot = info.type === 'DEPOT';
                  const isTarget = allocations.some(a => a.district === id);
                  if (!isDepot && !isTarget) return null;

                  return (
                    <g key={id} transform={`translate(${x}, ${y})`}>
                      {isDepot ? (
                        <g>
                          <rect x="-7" y="-7" width="14" height="14" fill="#00bcd4" rx="2" stroke="#fff" strokeWidth="1.5" />
                          <text x="10" y="4" fill="#00bcd4" fontSize="10" fontWeight="700">
                            {id} (Depot)
                          </text>
                        </g>
                      ) : (
                        <g>
                          <circle r="6" fill="rgba(244, 67, 54, 0.4)" />
                          <circle r="3.5" fill="#f44336" stroke="#fff" strokeWidth="1" />
                          <text x="8" y="4" fill="#fff" fontSize="10" fontWeight="600">
                            {id}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </>
            )}
          </svg>

          {/* Bottom Left Legend Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)',
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              fontSize: '11px',
              color: 'var(--text-2)',
            }}
          >
            🏰 Safe Hubs: <strong style={{ color: 'var(--cyan)' }}>3 NDRF Depots</strong> | ⚠️ Threat Target Areas:{' '}
            <strong style={{ color: 'var(--yellow)' }}>{allocations.length} Coastal Districts</strong>
          </div>
        </div>

        {/* Selected Route & Mode of Transportation Inspector */}
        <div
          style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          {activeTrip ? (
            <>
              {/* Target & Origin */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--cyan)', letterSpacing: '0.5px' }}>
                    FASTEST ROUTE & TRANSPORT INSPECTOR
                  </span>
                  <span
                    className={`chip ${
                      activeTrip.access_status === 'CLEAR'
                        ? 'chip-green'
                        : activeTrip.access_status === 'REROUTED'
                        ? 'chip-yellow'
                        : 'chip-red'
                    }`}
                  >
                    {activeTrip.access_status} ACCESS
                  </span>
                </div>

                <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)' }}>
                  {activeTrip.depot_name} ➔ <span style={{ color: 'var(--cyan)' }}>{activeTrip.district}</span>
                </div>
              </div>

              {/* Mode of Transportation Callout Box */}
              {(() => {
                const transport = getTransportMode(activeTrip.access_status);
                const IconComponent = transport.icon;
                return (
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${transport.color}`,
                      borderRadius: '6px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: transport.color }}>
                      <IconComponent size={18} />
                      <span>PRIMARY MODE: {transport.mode}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', lineHeight: '1.4' }}>
                      {transport.desc}
                    </div>
                  </div>
                );
              })()}

              {/* Route Distance & Travel Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                <div style={{ background: 'var(--panel)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-2)' }}>
                  <div style={{ color: 'var(--text-3)', marginBottom: '2px' }}>Fastest Distance</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
                    {activeTrip.total_km ? `${activeTrip.total_km} km` : 'Direct Air Corridor'}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 193, 7, 0.12)',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 193, 7, 0.4)',
                  }}
                >
                  <div style={{ color: '#ffc107', marginBottom: '2px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> Est. Travel Time (ETA)
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '900', color: '#ffc107' }}>
                    {activeTrip.est_time_min ? `${activeTrip.est_time_min} mins (${(activeTrip.est_time_min/60).toFixed(1)}h)` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Node Path Itinerary */}
              <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-3)', marginBottom: '4px' }}>ITINERARY PATH NODES</div>
                <div
                  style={{
                    background: 'var(--panel)',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    color: 'var(--cyan)',
                    border: '1px solid var(--border-2)',
                    fontSize: '11px',
                  }}
                >
                  {activeTrip.path && activeTrip.path.length > 0 ? activeTrip.path.join(' ➔ ') : `${activeTrip.depot_id} ➔ ${activeTrip.district}`}
                </div>
              </div>

              {/* Mobilized Cargo */}
              <div style={{ fontSize: '11px', color: 'var(--text-2)', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-3)', marginBottom: '4px' }}>RESOURCE CARGO DISPATCHED</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text)' }}>
                  <span>Food: <strong style={{ color: 'var(--cyan)' }}>{activeTrip.food_units?.toLocaleString()}</strong></span>
                  <span>Water: <strong style={{ color: 'var(--cyan)' }}>{activeTrip.water_units?.toLocaleString()}</strong></span>
                  <span>NDRF: <strong style={{ color: 'var(--green)' }}>{activeTrip.ndrf_teams} Teams</strong></span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 10px', fontSize: '12px' }}>
              Click any route on the map or trip in the table to inspect fastest path & mode of transportation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
