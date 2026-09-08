import React from 'react';
import useAppStore from '../store/appStore.js';
import { TrendingUp, GitFork, ShieldAlert, Compass, Gauge, AlertTriangle } from 'lucide-react';

export default function ForecastPage() {
  const intelligence = useAppStore(s => s.intelligence);
  const scenarios = intelligence?.scenarios || [
    { scenario_type: 'BASE', probability: 0.65, peak_intensity_kt: 125, landfall_lat: 21.6, landfall_lon: 88.2, time_to_impact_hours: 18, source: 'ECMWF_HWRF_ENSEMBLE' },
    { scenario_type: 'LEFT', probability: 0.20, peak_intensity_kt: 110, landfall_lat: 21.2, landfall_lon: 87.5, time_to_impact_hours: 15, source: 'GFS_GEFS_ENSEMBLE' },
    { scenario_type: 'RIGHT', probability: 0.15, peak_intensity_kt: 135, landfall_lat: 22.0, landfall_lon: 89.1, time_to_impact_hours: 22, source: 'UKMET_ENSEMBLE' },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div className="page-hd">
        <TrendingUp size={16} style={{ color: 'var(--cyan)' }} />
        <span className="page-title">FORECAST & SCENARIO ENSEMBLE ENGINE</span>
        <span className="page-sub">51 NWP ensemble tracks divergence & cone modeling</span>
        <div style={{ marginLeft: 'auto' }}>
          <span className="chip chip-cyan">ENSEMBLE MEMBERS: 51</span>
        </div>
      </div>

      {/* Page Body */}
      <div className="page-body" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Scenario Ensemble Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {scenarios.map(sc => (
            <div 
              key={sc.scenario_type} 
              style={{
                background: 'var(--panel)',
                border: sc.scenario_type === 'BASE' ? '1px solid rgba(66,199,255,0.4)' : '1px solid var(--border-2)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifySpace: 'between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '10px' }}>
                  <span className="label" style={{ color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <GitFork size={12} /> {sc.scenario_type} TRACK SCENARIO
                  </span>
                  <span className="chip chip-cyan">{Math.round(sc.probability * 100)}% PROB</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className="trow">
                    <span className="trow-key">Peak Wind Velocity</span>
                    <span className="trow-val" style={{ color: 'var(--yellow)' }}>{sc.peak_intensity_kt} kt</span>
                  </div>
                  <div className="trow">
                    <span className="trow-key">Expected Landfall</span>
                    <span className="trow-val">{sc.landfall_lat}°N, {sc.landfall_lon}°E</span>
                  </div>
                  <div className="trow">
                    <span className="trow-key">ETA to Landfall</span>
                    <span className="trow-val" style={{ color: 'var(--green)' }}>{sc.time_to_impact_hours ? `${sc.time_to_impact_hours} hrs` : '18 hrs'}</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between' }} className="telemetry-xs">
                <span>MODEL: <strong style={{ color: 'var(--text)' }}>{sc.source}</strong></span>
                <span style={{ color: 'var(--cyan)' }}>UNCERTAINTY: ±28km</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Strategy Simulation */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border-2)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="section-title" style={{ margin: 0, justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cyan)' }}>
              <ShieldAlert size={14} /> EARLY ACTION DECISION MATRIX (RESOURCES DISPATCH SIMULATION)
            </span>
            <span className="chip chip-green">RECOMMENDED: PRE-POSITION (T-12H)</span>
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text-2)', lineHeight: '1.4' }}>
            Pre-positioning NDRF battalions 12 hours before tropical storm wind radius arrival reduces transport delays by up to <strong>74%</strong>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="ri-alert" style={{ margin: 0 }}>
              <div className="ri-alert-hd flex items-center justify-between">
                <span>REACTIVE DISPATCH (POST-LANDFALL)</span>
                <AlertTriangle size={12} />
              </div>
              <div className="ri-alert-body" style={{ marginTop: '4px' }}>
                Dispatch executed after storm landfall confirmation. Roads flooded and blocked by debris. Response lag: <strong style={{ color: 'var(--red)' }}>14.2 Hours</strong>.
              </div>
            </div>

            <div className="opt-result" style={{ margin: 0 }}>
              <div className="opt-result-hd flex items-center justify-between">
                <span>OPTIMIZED PRE-POSITIONING (ENSEMBLE)</span>
                <Gauge size={12} />
              </div>
              <div className="opt-reason" style={{ marginTop: '4px' }}>
                14 NDRF battalions pre-deployed to staging hubs. Transit completed prior to wind cutoff. Response lag: <strong style={{ color: 'var(--green)' }}>2.1 Hours (-85%)</strong>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


