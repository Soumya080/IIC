import React, { useState, useEffect, useRef } from 'react';
import useAppStore from '../store/appStore.js';
import { Satellite, Eye, RefreshCw, Layers, ShieldCheck, Thermometer, Radio, Wind, Sparkles } from 'lucide-react';

function SatelliteCanvas({ channel, enhancement, state }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;
    let t = 0;

    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Radial background simulation
      const grad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
      if (channel === 'IR_THERMAL') {
        grad.addColorStop(0, '#C93B3B');
        grad.addColorStop(0.3, '#D96B00');
        grad.addColorStop(0.6, '#007799');
        grad.addColorStop(1, 'rgba(247,244,236,0.1)');
      } else if (channel === 'VISIBLE') {
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.4, '#DFDACD');
        grad.addColorStop(0.8, '#8C8270');
        grad.addColorStop(1, 'rgba(247,244,236,0.1)');
      } else if (channel === 'WATER_VAPOR') {
        grad.addColorStop(0, '#2962CC');
        grad.addColorStop(0.5, '#007799');
        grad.addColorStop(1, 'rgba(247,244,236,0.1)');
      } else {
        grad.addColorStop(0, '#C93B3B');
        grad.addColorStop(0.2, '#D96B00');
        grad.addColorStop(0.5, '#1F8A5A');
        grad.addColorStop(1, 'rgba(247,244,236,0.1)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w * 0.42, 0, Math.PI * 2);
      ctx.fill();

      // Rotating eyewall spiral rings
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(t * 0.5);
      ctx.strokeStyle = channel === 'DOPPLER_RADAR' ? '#1F8A5A' : '#007799';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 90 + Math.sin(t) * 5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#C93B3B';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, 45 + Math.cos(t) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Eye center point
      ctx.fillStyle = '#24211D';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#007799';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [channel, enhancement, state]);

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={420}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: '4px' }}
    />
  );
}

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
                padding: '12px',
                textAlign: 'left',
                height: 'auto',
                minHeight: '80px',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: '700', lineHeight: '1.2' }}>{ch.name}</div>
              <div style={{ fontSize: '10px', color: selectedChannel === ch.id ? 'var(--text)' : 'var(--cyan)', fontFamily: 'monospace', fontWeight: '600' }}>{ch.spec}</div>
              <div style={{ fontSize: '10px', opacity: 0.85, lineHeight: '1.3' }}>{ch.desc}</div>
            </button>
          ))}
        </div>

        {/* Viewer Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px', flex: 1 }}>
          {/* Main Visualizer Radar Box */}
          <div className="sat-viewer" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '460px', position: 'relative' }}>
            <div className="sat-overlay" />
            
            {/* Interactive Canvas Renderer */}
            <SatelliteCanvas channel={selectedChannel} enhancement={enhancement} state={state} />

            {/* Top HUD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border-2)', padding: '12px', backdropFilter: 'blur(6px)', width: '230px', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                <div className="label" style={{ color: 'var(--cyan)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                  <Layers size={13} /> SENSOR: {selectedChannel}
                </div>
                <div className="telemetry-xs" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>PLATFORM:</span> <strong style={{ color: 'var(--text)' }}>INSAT-3DR</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>EYE COORDS:</span> <strong style={{ color: 'var(--cyan)' }}>{state?.lat || '20.5'}°N, {state?.lon || '88.3'}°E</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CLOUD TEMP:</span> <strong style={{ color: 'var(--red)' }}>-76.4°C</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>RESOLUTION:</span> <span>1.0 km / px</span></div>
                </div>
              </div>

              {/* Selector */}
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border-2)', padding: '8px 12px', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                <Sparkles size={13} style={{ color: 'var(--yellow)' }} />
                <span className="label" style={{ fontWeight: '700' }}>ENHANCEMENT:</span>
                <select 
                  value={enhancement} 
                  onChange={(e) => setEnhancement(e.target.value)}
                  className="btn btn-ghost btn-sm"
                  style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: '4px' }}
                >
                  <option value="DVB_COLOR">BD-Curve (Thermal Color)</option>
                  <option value="RAW_GREY">RAW Infrared Grey</option>
                  <option value="RAIN_RATE">DWR Reflectivity (dBZ)</option>
                  <option value="WIND_VECTOR">Atmospheric Motion Vectors</option>
                </select>
              </div>
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


