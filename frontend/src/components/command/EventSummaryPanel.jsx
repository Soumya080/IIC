import { useEffect, useRef, useState } from 'react';
import useAppStore from '../../store/appStore.js';
import { MapPin, Wind, Gauge, Compass, Thermometer } from 'lucide-react';

/**
 * AnimatedValue — smoothly counts to the target value.
 */
function AnimatedValue({ value, decimals = 0 }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    const start = prev.current;
    const end   = value;
    const duration = 600;
    const startTime = performance.now();

    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const curr = start + (end - start) * ease;
      setDisplay(decimals ? curr.toFixed(decimals) : Math.round(curr));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    prev.current = value;
  }, [value, decimals]);

  return display;
}

export default function EventSummaryPanel() {
  const intelligence = useAppStore(s => s.intelligence);
  const isLoading    = useAppStore(s => s.isLoadingIntelligence);
  const dataStatus   = intelligence?.metadata?.data_status || 'SIMULATED';

  const state  = intelligence?.state;
  const event  = intelligence?.event;
  const regime = intelligence?.regime || state?.regime || 'FORMATION';

  if (isLoading && !state) {
    return (
      <div className="state-loading" style={{ height: '100%' }}>
        <div className="loading-bar"><div className="loading-bar-fill" /></div>
        <span className="label-sm">LOADING INTELLIGENCE</span>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="state-empty">
        <Wind size={20} style={{ opacity: 0.2 }} />
        <span>SELECT AN EVENT TO BEGIN</span>
      </div>
    );
  }

  const wind    = state.intensity_kt   || 0;
  const pres    = state.pressure_hpa   || 1000;
  const spd     = state.movement_speed_kmh  || 0;
  const hdg     = state.movement_heading_deg || 0;
  const conf    = Math.round((state.confidence || 0.85) * 100);

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div className="panel-hd">
        <span className="panel-title">CYCLONE STATUS</span>
        <span className={`src src-${dataStatus.toLowerCase()}`}>{dataStatus}</span>
      </div>

      <div className="panel-body">
        {/* Event ID + Regime */}
        <div className="panel-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: 0.5 }}>
                {event?.name || 'AMPHAN'}
              </div>
              <div className="mono-sm" style={{ color: 'var(--text-3)', marginTop: 1 }}>
                {event?.id || 'CYC-2020-AMPHAN'}
              </div>
            </div>
            <span className={`regime regime-${regime}`}>{regime.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* Primary Metrics */}
        <div className="metric-block">
          <div className="metric-label">MAX WIND SPEED</div>
          <div className="metric-value">
            <AnimatedValue value={wind} />
            <span className="metric-unit">KT</span>
          </div>
          <div className="metric-delta" style={{ color: wind > 100 ? 'var(--red)' : 'var(--text-3)' }}>
            {wind >= 64 ? '64KT+ · MAJOR CYCLONE' : wind >= 50 ? '50KT+ · SEVERE' : wind >= 34 ? '34KT+' : 'SUB-TROPICAL'}
          </div>
        </div>

        <div className="metric-block">
          <div className="metric-label">CENTRAL PRESSURE</div>
          <div className="metric-value">
            <AnimatedValue value={pres} />
            <span className="metric-unit">hPa</span>
          </div>
        </div>

        {/* Position */}
        <div className="panel-section">
          <div className="flex items-center gap-1 label-sm" style={{ marginBottom: 8, color: 'var(--text-3)' }}>
            <MapPin size={10} /> POSITION
          </div>
          <div className="trow">
            <span className="trow-key">Latitude</span>
            <span className="trow-val mono-sm"><AnimatedValue value={state.lat || 0} decimals={2} />°N</span>
          </div>
          <div className="trow">
            <span className="trow-key">Longitude</span>
            <span className="trow-val mono-sm"><AnimatedValue value={state.lon || 0} decimals={2} />°E</span>
          </div>
          <div className="trow">
            <span className="trow-key">Movement</span>
            <span className="trow-val mono-sm">{spd} km/h @ {hdg}°</span>
          </div>
        </div>

        {/* Environment */}
        {state.environment && (
          <div className="panel-section">
            <div className="flex items-center gap-1 label-sm" style={{ marginBottom: 8, color: 'var(--text-3)' }}>
              <Thermometer size={10} /> ENVIRONMENT
            </div>
            <div className="trow">
              <span className="trow-key">Sea Surface Temp</span>
              <span className="trow-val mono-sm">{state.environment.sst_c}°C</span>
            </div>
            <div className="trow">
              <span className="trow-key">Wind Shear</span>
              <span className="trow-val mono-sm">{state.environment.shear_kt} KT</span>
            </div>
            <div className="trow">
              <span className="trow-key">Humidity</span>
              <span className="trow-val mono-sm">{state.environment.humidity_pct}%</span>
            </div>
          </div>
        )}

        {/* Confidence */}
        <div className="panel-section">
          <div className="trow">
            <span className="trow-key">Detection Confidence</span>
            <span className="trow-val mono-sm" style={{ color: 'var(--cyan)' }}>{conf}%</span>
          </div>
          <div className="prog">
            <div className="prog-fill" style={{ width: `${conf}%`, background: 'var(--cyan)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
