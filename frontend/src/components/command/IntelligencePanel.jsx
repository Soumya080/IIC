import useAppStore from '../../store/appStore.js';

const RISK_COLOR = { EXTREME: 'var(--red)', HIGH: 'var(--orange)', MODERATE: 'var(--yellow)', LOW: 'var(--green)' };

function CascadeChain({ impact, scenarios }) {
  const intensity = useAppStore(s => s.intelligence?.state?.intensity_kt) || 0;
  const steps = [
    { label: 'CYCLONE DETECTED',     active: intensity > 0,   cls: 'active' },
    { label: 'RAPID INTENSIFICATION',active: intensity >= 90, cls: 'warning' },
    { label: 'WIND EXPANSION',        active: intensity >= 50, cls: 'warning' },
    { label: 'HEAVY RAINFALL',        active: intensity >= 50, cls: 'active' },
    { label: 'COASTAL INUNDATION',    active: (impact?.flood_risk_index || 0) > 0.2, cls: 'flood' },
    { label: 'COMPOSITE EXTREME RISK',active: (impact?.composite_risk || 0) > 0.6, cls: 'critical' },
  ];

  return (
    <div className="cascade" style={{ gap: 0 }}>
      {steps.map((s, i) => (
        <div key={i}>
          <div className="cascade-step">
            <div className={`cascade-bullet ${s.active ? s.cls : ''}`} />
            <span className={`cascade-label ${s.active ? s.cls : ''}`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && <div className="cascade-arrow-line" />}
        </div>
      ))}
    </div>
  );
}

export default function IntelligencePanel() {
  const intelligence  = useAppStore(s => s.intelligence);
  const changePoint   = intelligence?.change_point;
  const impact        = intelligence?.impact || intelligence?.exposure;
  const scenarios     = intelligence?.scenarios || [];
  const dataStatus    = intelligence?.metadata?.data_status || 'SIMULATED';
  const state         = intelligence?.state;

  const tti    = impact?.time_to_impact_hours;
  const pop    = impact?.total_exposed_population || 0;
  const risk   = impact?.composite_risk || 0;
  const riskLv = impact?.risk_level || 'LOW';
  const wind   = state?.intensity_kt || 0;

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="panel-hd">
        <span className="panel-title">DECISION INTELLIGENCE</span>
        <span className={`src src-${dataStatus.toLowerCase()}`}>{dataStatus}</span>
      </div>

      <div className="panel-body">
        {/* RI / Change Point Alert */}
        {changePoint?.detected && (
          <div className="ri-alert">
            <div className="ri-alert-hd">⚡ REGIME SHIFT DETECTED</div>
            <div className="ri-alert-body">{changePoint.description}</div>
          </div>
        )}

        {/* WHY CONCERN */}
        <div className="concern-block">
          <div className="concern-hd">
            <span>■</span> WHY SYSTEM IS CONCERNED
          </div>
          {wind >= 90 && (
            <div className="concern-item">
              <div className="concern-dot" />
              <span>Rapid intensification: +{wind > 120 ? '18+' : '12'} KT / 6h track detected</span>
            </div>
          )}
          {(impact?.flood_risk_index || 0) > 0.1 && (
            <div className="concern-item">
              <div className="concern-dot" />
              <span>Coastal districts entering elevated flood &amp; surge risk</span>
            </div>
          )}
          {pop > 0 && (
            <div className="concern-item">
              <div className="concern-dot" />
              <span>Population exposure: <strong style={{ color: 'var(--text)' }}>{(pop / 1e6).toFixed(2)}M</strong> people</span>
            </div>
          )}
          {intelligence?.operations?.length > 0 && (
            <div className="concern-item">
              <div className="concern-dot" />
              <span>Resource gap detected — {intelligence.operations.length} ops task(s) active</span>
            </div>
          )}
        </div>

        {/* Time-to-Consequence */}
        <div className="panel-section">
          <div className="label-sm" style={{ marginBottom: 8, color: 'var(--text-3)' }}>TIME TO CONSEQUENCE</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="trow-key">Landfall / Impact</span>
            <span className={`tti-display ${tti !== null && tti < 24 ? 'critical' : ''}`}>
              {tti !== null && tti !== undefined ? `${tti}h` : '—'}
            </span>
          </div>
          <div className="trow" style={{ marginTop: 4 }}>
            <span className="trow-key">Flood Inundation</span>
            <span className="trow-val mono-sm">
              {tti !== null && tti !== undefined ? `~${Math.max(0, tti - 4)}h` : '—'}
            </span>
          </div>
          {tti !== null && (
            <div style={{ marginTop: 4, fontSize: 8, color: 'var(--text-3)', fontStyle: 'italic' }}>
              ⚠ SIMULATED / INDEX-DERIVED — not official IMD forecast
            </div>
          )}
        </div>

        {/* Composite Risk */}
        <div className="panel-section">
          <div className="trow" style={{ marginBottom: 6 }}>
            <span className="trow-key">Composite Risk</span>
            <span className="trow-val mono-sm" style={{ color: RISK_COLOR[riskLv] || 'var(--text)' }}>
              {Math.round(risk * 100)}% — {riskLv}
            </span>
          </div>
          <div className="prog">
            <div className="prog-fill" style={{
              width: `${Math.round(risk * 100)}%`,
              background: RISK_COLOR[riskLv] || 'var(--text-3)',
            }} />
          </div>
        </div>

        {/* Hazard Cascade */}
        <div className="panel-section">
          <div className="label-sm" style={{ marginBottom: 6, color: 'var(--text-3)' }}>HAZARD CASCADE</div>
          <CascadeChain impact={impact} scenarios={scenarios} />
        </div>

        {/* Scenario Probabilities */}
        <div className="panel-section">
          <div className="label-sm" style={{ marginBottom: 8, color: 'var(--text-3)' }}>SCENARIO WEIGHTS</div>
          {scenarios.map(sc => (
            <div key={sc.scenario_type} style={{ marginBottom: 6 }}>
              <div className="trow">
                <span className="trow-key">{sc.scenario_type} TRACK</span>
                <span className="trow-val mono-sm" style={{ color: sc.scenario_type === 'BASE' ? 'var(--cyan)' : 'var(--text)' }}>
                  {Math.round(sc.probability * 100)}%
                </span>
              </div>
              <div className="prog">
                <div className="prog-fill" style={{
                  width: `${Math.round(sc.probability * 100)}%`,
                  background: sc.scenario_type === 'BASE' ? 'var(--cyan)' : sc.scenario_type === 'RIGHT' ? 'var(--orange)' : 'var(--green)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
