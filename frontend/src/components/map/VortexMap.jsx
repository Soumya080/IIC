/**
 * VortexMap — primary 2D geographic renderer for the VORTEX command center.
 *
 * - Initializes ONE native maplibregl.Map instance (never recreated on state change).
 * - Registers the full operational layer registry (mapLayers.js).
 * - Pushes backend/demo data into sources via setData() only.
 * - Exposes camera helpers (mapUtils.js) through a forwarded ref.
 * - Fails safe: DATA/STYLE errors degrade this panel, not the application.
 */
import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import useAppStore from '../../store/appStore.js';
import { MAP_CONFIG, MAP_STATUS, VORTEX_COLORS } from './mapConfig.js';
import {
  addAllLayers, setSourceData, setGroupVisibility, setWindThresholdVisibility,
  startCenterPulse,
} from './mapLayers.js';
import {
  buildTrackGeoJSON, buildForecastGeoJSON, buildWindHazardGeoJSON,
  buildResourcesGeoJSON, buildSosGeoJSON, pointFeature, EMPTY_FC,
  flyToCyclone, resetView, fitCycloneTrack,
} from './mapUtils.js';
import LayerControlPanel from './LayerControlPanel.jsx';
import CycloneScene from '../three/CycloneScene.jsx';
import { Layers, Compass, Maximize2, RefreshCw, Plus, Minus, Crosshair } from 'lucide-react';

const VortexMap = forwardRef(function VortexMap(_props, ref) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const pulseStopRef = useRef(null);

const [status, setStatus] = useState(MAP_STATUS.LOADING);
  const [mapReady, setMapReady] = useState(false);
  const [layerOpen, setLayerOpen] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const [showDetection, setShowDetection] = useState(false);
  const prevRegime = useRef(null);

  const intelligence   = useAppStore(s => s.intelligence);
  const activeLayers   = useAppStore(s => s.activeLayers);
  const currentTick    = useAppStore(s => s.currentTick);
  const resources      = useAppStore(s => s.resources);
  const sosReports     = useAppStore(s => s.sosReports);
  const trackHistory   = useAppStore(s => s.trackHistory);

  const state     = intelligence?.state;
  const hazard    = intelligence?.hazard;
  const scenarios = intelligence?.scenarios || [];
  const intensity = state?.intensity_kt || 0;
  const regime    = state?.regime || 'FORMATION';

  /* ---------------------------------------------------------------- */
  /* Map init �?" exactly once                                            */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!MAP_STYLE_OK) {
      setStatus(MAP_STATUS.DEGRADED);
      return;
    }
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;
    let map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_CONFIG.STYLE_URL,
        center: MAP_CONFIG.DEFAULT_CENTER,
        zoom: MAP_CONFIG.DEFAULT_ZOOM,
        minZoom: MAP_CONFIG.MIN_ZOOM,
        maxZoom: MAP_CONFIG.MAX_ZOOM,
        attributionControl: false,
      });
    } catch (err) {
      console.error('[VortexMap] init failed:', err);
      setStatus(MAP_STATUS.STYLE_ERROR);
      return;
    }
    mapRef.current = map;

    const onLoad = () => {
      if (cancelled) return;
      try {
        addAllLayers(map);
        pulseStopRef.current = startCenterPulse(map);
        setMapReady(true);
        setStatus(MAP_STATUS.READY);
        map.resize();
      } catch (err) {
        console.error('[VortexMap] layer registration failed:', err);
        setStatus(MAP_STATUS.DEGRADED);
      }
    };

    const onError = (e) => {
      // Distinguish style-load failure from tile hiccups
      const isStyleError = e?.error?.status === 404 || !map.isStyleLoaded();
      console.error('[VortexMap] map error:', e?.error || e);
      if (isStyleError) setStatus(MAP_STATUS.STYLE_ERROR);
    };

    const onCenterClick = (e) => {
      const feat = map.queryRenderedFeatures(e.point, { layers: ['cyclone-center-core'] })[0];
      if (!feat) return;
      popupRef.current?.remove();
      const popup = new maplibregl.Popup({ closeButton: false, maxWidth: '240px', className: 'vortex-popup' })
        .setLngLat(feat.geometry.coordinates);
      const el = document.createElement('div');
      el.style.cssText = 'font-size:11px;line-height:1.5;';
      const title = document.createElement('div');
      title.style.cssText = `color:${VORTEX_COLORS.primary};font-weight:600;letter-spacing:0.06em;`; 
      title.textContent = 'CYCLONE CENTER';
      const body = document.createElement('div');
      const s = useAppStore.getState().intelligence?.state;
      body.textContent = s
        ? `${s.lat?.toFixed(2)}°N ${s.lon?.toFixed(2)}°E · ${s.intensity_kt} kt · ${s.pressure_hpa} hPa · ${s.regime}`
        : 'Position acquired';
      const tag = document.createElement('div');
      tag.style.cssText = 'opacity:0.6;font-size:9px;margin-top:2px;';
      tag.textContent = 'DEMO · SIMULATED · DERIVED';
      el.append(title, body, tag);
      popup.setDOMContent(el).addTo(map);
      popupRef.current = popup;
    };

    const onLoadWithHandlers = () => {
      // Delegated layer handlers require the layers to exist first
      map.on('click', 'cyclone-center-core', onCenterClick);
      map.on('click', 'cyclone-center-pulse', onCenterClick);
      onLoad();
    };

    map.on('load', onLoadWithHandlers);
    map.on('error', onError);

    return () => {
      cancelled = true;
      pulseStopRef.current?.();
      popupRef.current?.remove();
      map.off('load', onLoadWithHandlers);
      map.off('error', onError);
      try { map.off('click', 'cyclone-center-core', onCenterClick); } catch { /* layer may not exist */ }
      try { map.off('click', 'cyclone-center-pulse', onCenterClick); } catch { /* layer may not exist */ }
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

/* ---------------------------------------------------------------- */
  /* Data �+" sources (never recreate map/layers)                        */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    try {
      // Historical track: backend track if available, else deterministic demo positions
      const history = (trackHistory?.length ? trackHistory : demoHistoryUpTo(currentTick))
        .map(p => ({ lon: p.lon, lat: p.lat }));
      setSourceData(map, 'cyclone-track', buildTrackGeoJSON(history));

      setSourceData(map, 'cyclone-forecast', buildForecastGeoJSON(scenarios, state));

      setSourceData(map, 'cyclone-center', state && Number.isFinite(state.lon)
        ? { type: 'FeatureCollection', features: [pointFeature(state.lon, state.lat, { regime, intensity_kt: intensity })] }
        : EMPTY_FC);

      setSourceData(map, 'wind-hazard', buildWindHazardGeoJSON(hazard?.zones || []));
    } catch (err) {
      console.error('[VortexMap] data update failed:', err);
      setStatus(MAP_STATUS.DATA_ERROR);
    }
  }, [intelligence, trackHistory, currentTick, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    setSourceData(map, 'resources', buildResourcesGeoJSON(resources));
  }, [resources, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    setSourceData(map, 'sos-reports', buildSosGeoJSON(sosReports));
  }, [sosReports, mapReady]);

  /* ---------------------------------------------------------------- */
  /* Layer visibility �+" app store                                      */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    setGroupVisibility(map, 'cyclone-track', activeLayers.track);
    setGroupVisibility(map, 'cyclone-forecast', activeLayers.forecast);
    setGroupVisibility(map, 'wind', true);
    setWindThresholdVisibility(map, {
      show34: activeLayers.wind34, show50: activeLayers.wind50, show64: activeLayers.wind64,
    });
    if (!activeLayers.forecast) {
      // scenario variants share the forecast group; LEFT/RIGHT have their own toggles
    }
    setGroupVisibility(map, 'flood', activeLayers.flood);
    setGroupVisibility(map, 'composite-risk', activeLayers.composite);
    setGroupVisibility(map, 'population', activeLayers.exposure);
    setGroupVisibility(map, 'district-risk', activeLayers.districts);
    setGroupVisibility(map, 'resources', activeLayers.resources);
    setGroupVisibility(map, 'sos', activeLayers.sos);
    // Scenario-variant line visibility inside the forecast group
    if (map.getLayer('cyclone-scenario-line')) {
      const allowed = [];
      if (activeLayers.scenarioLeft) allowed.push('LEFT');
      if (activeLayers.scenarioRight) allowed.push('RIGHT');
      map.setFilter('cyclone-scenario-line',
        ['all', ['!=', ['get', 'scenario_id'], 'BASE'], ['in', ['get', 'scenario_id'], ['literal', allowed]]]);
    }
  }, [activeLayers, mapReady]);

  /* ---------------------------------------------------------------- */
  /* Camera helpers (also exposed via ref)                             */
  /* ---------------------------------------------------------------- */
  const handleFlyToCyclone = useCallback(() => flyToCyclone(mapRef.current, state), [state]);
  const handleResetView    = useCallback(() => resetView(mapRef.current), []);
  const handleFitTrack     = useCallback(() => {
    const map = mapRef.current;
    const fc = map?.getSource('cyclone-track')?.serialize?.().data;
    const line = fc?.features?.find(f => f.geometry?.type === 'LineString');
    if (line) fitCycloneTrack(map, line.geometry.coordinates);
  }, []);

  useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
    flyToCyclone: (s) => flyToCyclone(mapRef.current, s),
    resetView: () => resetView(mapRef.current),
    fitCycloneTrack: handleFitTrack,
  }), [handleFitTrack]);

  // Detection sweep trigger on first regime / RI transition (UI overlay only)
  useEffect(() => {
    if (!regime) return;
    if (prevRegime.current === null ||
        (prevRegime.current !== 'RAPID_INTENSIFICATION' && regime === 'RAPID_INTENSIFICATION')) {
      setShowDetection(true);
      const t = setTimeout(() => setShowDetection(false), 3000);
      return () => clearTimeout(t);
    }
    prevRegime.current = regime;
  }, [regime]);

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */
  if (status === MAP_STATUS.DEGRADED && !MAP_STYLE_OK) {
    return (
      <div className="map-container" style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--bg, #06101C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
        <span className="label" style={{ color: 'var(--yellow)', fontSize: 11 }}>MAP DISABLED — MISSING CONFIG</span>
        <span className="telemetry-xs">Set VITE_MAP_STYLE_URL in frontend/.env.local (see .env.example).</span>
      </div>
    );
  }

  return (
    <div className="map-container" style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--bg, #F7F4EC)' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      {status === MAP_STATUS.STYLE_ERROR && (
        <div className="state-error" style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span className="label" style={{ color: 'var(--red)', fontSize: '11px', marginBottom: '6px' }}>MAP STYLE UNAVAILABLE</span>
          <span className="telemetry-xs">Check network connection or VITE_MAP_STYLE_URL.</span>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: '12px' }} onClick={() => { setStatus(MAP_STATUS.LOADING); mapRef.current?.setStyle(MAP_CONFIG.STYLE_URL); setStatus(MAP_STATUS.READY); }}>
            <RefreshCw size={10} /> RETRY LOADING MAP
          </button>
        </div>
      )}

      {/* Three.js cinematic cyclone overlay (specialized 3D layer) */}
      {state && (
        <CycloneScene
          intensity={intensity}
          regime={regime}
          isDetecting={showDetection}
          webglFailed={webglFailed}
          onWebGLError={() => setWebglFailed(true)}
        />
      )}

      {/* Position telemetry */}
      {state && (
        <div className="map-annotation" style={{ bottom: 8, right: 8, zIndex: 20 }}>
          <span className="mono-sm" style={{ color: 'var(--cyan)' }}>
            {state.lat?.toFixed(2)}°N &nbsp;{state.lon?.toFixed(2)}°E
          </span>
          &nbsp;·&nbsp;
          <span className="mono-sm" style={{ color: 'var(--yellow)' }}>{intensity} KT</span>
          &nbsp;·&nbsp;
          <span className="mono-sm">{state.pressure_hpa} hPa</span>
        </div>
      )}

      {/* Map control toolbar (VORTEX styled) */}
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 25, display: 'flex', gap: '6px' }}>
        <button onClick={handleFlyToCyclone} className="btn btn-ghost btn-sm" style={btnStyle} title="Fly to Storm Core">
          <Compass size={11} style={{ color: 'var(--cyan)' }} /> RE-CENTER
        </button>
        <button onClick={handleFitTrack} className="btn btn-ghost btn-sm" style={btnStyle} title="Fit Cyclone Track">
          <Crosshair size={11} /> FIT TRACK
        </button>
        <button onClick={handleResetView} className="btn btn-ghost btn-sm" style={btnStyle} title="Reset Regional View">
          <Maximize2 size={11} /> FIT VIEW
        </button>
        <button onClick={() => setLayerOpen(o => !o)}
          className={`btn ${layerOpen ? 'btn-primary' : 'btn-ghost'} btn-sm`}
          style={{ background: layerOpen ? 'var(--cyan)' : btnStyle.background }}>
          <Layers size={11} /> LAYERS
        </button>
      </div>

      {/* Zoom / north controls */}
      <div style={{ position: 'absolute', top: 40, right: 8, zIndex: 24, display: 'flex', flexDirection: 'column', gap: 4, marginTop: (layerOpen ? 0 : 0) }}>
        <button className="btn btn-ghost btn-sm" style={btnStyle} title="Zoom in"
          onClick={() => mapRef.current?.zoomIn()}><Plus size={11} /></button>
        <button className="btn btn-ghost btn-sm" style={btnStyle} title="Zoom out"
          onClick={() => mapRef.current?.zoomOut()}><Minus size={11} /></button>
        <button className="btn btn-ghost btn-sm" style={btnStyle} title="Reset north"
          onClick={() => mapRef.current?.resetNorth()}><Compass size={11} /></button>
      </div>

      {layerOpen && (
        <div style={{ position: 'absolute', top: 38, right: 140, zIndex: 25 }}>
          <LayerControlPanel onClose={() => setLayerOpen(false)} />
        </div>
      )}

      {/* Legend */}
      <div className="layer-panel" style={{ position: 'absolute', bottom: 8, left: 8, zIndex: 20, width: '180px', padding: '10px', background: 'var(--panel)', border: '1px solid var(--border-2)', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="label-sm" style={{ marginBottom: '6px', color: 'var(--text-3)', display: 'flex', justifyContent: 'space-between' }}>
          <span>LEGEND</span>
          <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>LIVE</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className="telemetry-xs">
          <LegendSwatch sw={<div style={{ width: 8, height: 8, borderRadius: '50%', border: `2px solid ${VORTEX_COLORS.primary}` }} />} label="Storm Core / Eye" />
          <LegendSwatch sw={<div style={{ width: 12, height: 2, background: VORTEX_COLORS.primary }} />} label="Forecast Line (BASE)" />
          <LegendSwatch sw={<div style={{ width: 10, height: 10, background: 'rgba(201,59,59,0.2)', border: `1px solid ${VORTEX_COLORS.critical}` }} />} label="64 KT Wind Threshold" />
          <LegendSwatch sw={<div style={{ width: 8, height: 8, borderRadius: '50%', background: VORTEX_COLORS.sos }} />} label="SOS Distress Signals" />
        </div>
      </div>

      {/* Demo banner — data provenance */}
      <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 20 }}
        className="telemetry-xs">
        <span style={{ background: 'var(--panel)', border: '1px solid var(--border-2)', color: 'var(--text-2)', padding: '4px 8px', borderRadius: 4, fontWeight: 500, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          {MAP_CONFIG.USING_FALLBACK_STYLE ? 'DEV BASEMAP · ' : ''}DATA: DEMO · SIMULATED · DERIVED
        </span>
      </div>

      {/* Loading state */}
      {status === MAP_STATUS.LOADING && (
        <div className="state-loading" style={{ position: 'absolute', inset: 0, background: 'rgba(247,244,236,0.85)', backdropFilter: 'blur(4px)', zIndex: 30 }}>
          <div className="loading-bar"><div className="loading-bar-fill" /></div>
          <span className="label-sm" style={{ color: 'var(--text-2)' }}>INITIALIZING MAPLIBRE ENGINE...</span>
        </div>
      )}
    </div>
  );
});

const btnStyle = { background: '#FAF8F3', border: '1px solid var(--border-2)', color: 'var(--text)' };

const MAP_STYLE_OK = !!MAP_CONFIG.STYLE_URL;

function LegendSwatch({ sw, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {sw}<span>{label}</span>
    </div>
  );
}

// Deterministic DEMO fallback history (SIMULATED, derived) — used only when
// no backend track is available. Mirrors services/demo.js positions.
const DEMO_HISTORY = [
  [86.5, 10.5], [86.3, 11.2], [86.0, 12.1], [85.8, 13.0],
  [85.5, 13.8], [85.2, 14.8], [85.0, 16.0], [85.0, 17.5],
  [85.2, 19.0], [86.8, 20.5], [87.5, 22.0], [88.2, 23.5],
];
function demoHistoryUpTo(tick) {
  return DEMO_HISTORY.slice(0, Math.min(tick, DEMO_HISTORY.length - 1) + 1).map(([lon, lat]) => ({ lon, lat }));
}

export default VortexMap;
