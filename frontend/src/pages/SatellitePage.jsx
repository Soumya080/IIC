import React, { useState } from 'react';
import useAppStore from '../store/appStore.js';
import { Satellite, Eye, RefreshCw, Layers, ShieldCheck, Thermometer, Radio, Wind, Sparkles } from 'lucide-react';

export default function SatellitePage() {
  const intelligence = useAppStore(s => s.intelligence);
  const state = intelligence?.state;
  const [selectedChannel, setSelectedChannel] = useState('IR_THERMAL');
  const [enhancement, setEnhancement] = useState('DVB_COLOR');

  const channels = [
    { id: 'IR_THERMAL', name: 'Infrared Thermal (10.8µm)', spec: 'INSAT-3DR TIR-1', desc: 'Cloud top temperature (-78°C eyewall core) & deep convective updrafts.' },
    { id: 'VISIBLE', name: 'High-Res Visible (0.64µm)', spec: 'INSAT-3DR VIS', desc: 'Daylight cloud imagery, eye structure definition & low-level circulation.' },
    { id: 'WATER_VAPOR', name: 'Upper Water Vapor (6.2µm)', spec: 'INSAT-3DR WV', desc: 'Mid-to-upper tropospheric moisture, dry air intrusion & outflow channels.' },
    { id: 'DOPPLER_RADAR', name: 'DWR Reflectivity (S-Band)', spec: 'Paradip / Digha DWR', desc: 'Precipitation reflectivity (dBZ), mesoscale rainbands & eyewall replacement.' },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div className="page-hd">
        <Satellite size={16} style={{ color: 'var(--cyan)' }} />
        <span className="page-title">SENSING & EARTH OBSERVATION INTELLIGENCE</span>
        <span className="page-sub">Multi-spectral satellite & radar telemetry</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="chip chip-green flex items-center gap-1">
            <RefreshCw size={10} className="animate-spin" /> INSAT-3DR: ACTIVE
          </span>
        </div>
      </div>

      {/* Page Body */}
      <div className="page-body" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Channel Selection Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {channels.map(ch => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.id)}
              className={`btn ${selectedChannel === ch.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '10px',
                textAlign: 'left',
                height: 'auto'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700' }}>{ch.name}</span>
              </div>
              <div style={{ fontSize: '9px', color: 'var(--cyan)', fontFamily: 'monospace', marginBottom: '4px' }}>{ch.spec}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-3)', lineHeight: '1.3' }}>{ch.desc}</div>
            </button>
          ))}
        </div>

        {/* Viewer Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '14px', flex: 1 }}>
          {/* Main Visualizer Radar Box */}
          <div className="sat-viewer" style={{ padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '400px' }}>
            <div className="sat-overlay" />
            
            {/* Top HUD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
              <div style={{ background: 'rgba(10,10,10,0.85)', border: '1px solid var(--border-2)', padding: '10px', backdropFilter: 'blur(6px)', width: '220px' }}>
                <div className="label" style={{ color: 'var(--cyan)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Layers size={12} /> SENSOR: {selectedChannel}
                </div>
                <div className="telemetry-xs" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>PLATFORM:</span> <span>INSAT-3DR</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>EYE COORDS:</span> <span style={{ color: 'var(--cyan)' }}>{state?.lat || '20.5'}°N, {state?.lon || '88.3'}°E</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CLOUD TEMP:</span> <span style={{ color: 'var(--red)' }}>-76.4°C</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>RESOLUTION:</span> <span>1.0 km / px</span></div>
                </div>
              </div>

              {/* Selector */}
              <div style={{ background: 'rgba(10,10,10,0.85)', border: '1px solid var(--border-2)', padding: '6px 10px', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={12} style={{ color: 'var(--yellow)' }} />
                <span className="label">ENHANCEMENT:</span>
                <select 
                  value={enhancement} 
                  onChange={(e) => setEnhancement(e.target.value)}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border-3)', color: 'var(--text)', fontSize: '10px', padding: '2px 4px', fontFamily: 'monospace' }}
                >
                  <option value="DVB_COLOR">BD-Curve (Thermal Color)</option>
                  <option value="ENHANCED_IR">Enhanced Convection IR</option>
                  <option value="GREYSCALE">RAW Grey</option>
                </select>
              </div>
            </div>

            {/* Concentric radar rings animation */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyCenter: 'center', pointerEvents: 'none', opacity: 0.5 }}>
              <div style={{ width: '280px', height: '280px', borderRadius: '50%', border: '1px solid rgba(66,199,255,0.3)', margin: 'auto' }} />
              <div style={{ width: '180px', height: '180px', borderRadius: '50%', border: '1px solid rgba(239,90,90,0.4)', margin: 'auto', position: 'absolute' }} />
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--cyan)', margin: 'auto', position: 'absolute' }} />
            </div>

            {/* Bottom HUD */}
            <div style={{ zIndex: 10, background: 'rgba(10,10,10,0.85)', border: '1px solid var(--border-2)', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="telemetry-xs">
              <div>TIMESTAMP: <span style={{ color: 'var(--text)' }}>2026-09-08 16:00 UTC</span></div>
              <div>EYEWALL: <span style={{ color: 'var(--green)' }}>CLOSED (SYMMETRIC)</span></div>
              <div>DVORAK T-NUMBER: <span style={{ color: 'var(--cyan)' }}>6.5 (CDO)</span></div>
            </div>
          </div>

          {/* Right Panel Convection Telemetry */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="panel-section" style={{ background: 'var(--panel)', border: '1px solid var(--border-2)', padding: '12px' }}>
              <div className="section-title">
                <Wind size={14} style={{ color: 'var(--cyan)' }} /> CONVECTIVE CORE ANALYSIS
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="trow">
                  <span className="trow-key">Min Cloud Top Temp</span>
                  <span className="trow-val" style={{ color: 'var(--red)' }}>-78.2°C</span>
                </div>
                <div className="trow">
                  <span className="trow-key">CDO Diameter</span>
                  <span className="trow-val" style={{ color: 'var(--yellow)' }}>240 km</span>
                </div>
                <div className="trow">
                  <span className="trow-key">Warm Core Anomaly</span>
                  <span className="trow-val" style={{ color: 'var(--green)' }}>+14.5°C</span>
                </div>
                <div className="trow">
                  <span className="trow-key">Dvorak Intensity</span>
                  <span className="trow-val" style={{ color: 'var(--cyan)' }}>T6.5 / 127 kt</span>
                </div>
              </div>
            </div>

            <div className="ri-alert" style={{ margin: 0 }}>
              <div className="ri-alert-hd flex items-center gap-1">
                <ShieldCheck size={14} /> AI DVORAK SCAN SUMMARY
              </div>
              <div className="ri-alert-body">
                Deep convective cloud tops wrapping 100% around eyewall. Thermal gradient confirms Category 4 Super Cyclone with active eyewall replacement cycle.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


