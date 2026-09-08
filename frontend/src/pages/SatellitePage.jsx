import { useEffect, useRef, useState } from 'react';
import useAppStore from '../store/appStore.js';
import { Layers, RefreshCw, Satellite, ShieldCheck, Wind } from 'lucide-react';

function SatelliteCanvas({ channel, state }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    let frameId;
    let phase = 0;
    const colors = {
      IR_THERMAL: ['#C93B3B', '#D96B00', '#007799'], VISIBLE: ['#FFFFFF', '#DFDACD', '#8C8270'],
      WATER_VAPOR: ['#2962CC', '#007799', '#6C8A99'], DOPPLER_RADAR: ['#C93B3B', '#D96B00', '#1F8A5A'],
    }[channel];
    const render = () => {
      phase += 0.018;
      const { width, height } = canvas;
      const x = width / 2;
      const y = height / 2;
      const gradient = context.createRadialGradient(x, y, 8, x, y, width * 0.5);
      gradient.addColorStop(0, colors[0]); gradient.addColorStop(0.34, colors[1]); gradient.addColorStop(0.68, colors[2]); gradient.addColorStop(1, '#E5E2D9');
      context.fillStyle = gradient; context.fillRect(0, 0, width, height);
      context.save(); context.translate(x, y); context.rotate(phase * 0.45);
      context.setLineDash([10, 7]); context.strokeStyle = '#075D78'; context.lineWidth = 2; context.beginPath(); context.arc(0, 0, 112 + Math.sin(phase) * 4, 0, Math.PI * 2); context.stroke();
      context.setLineDash([13, 8]); context.strokeStyle = '#C93636'; context.beginPath(); context.arc(0, 0, 54 + Math.cos(phase) * 3, 0, Math.PI * 2); context.stroke(); context.restore();
      context.fillStyle = '#17212B'; context.beginPath(); context.arc(x, y, 15, 0, Math.PI * 2); context.fill();
      frameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frameId);
  }, [channel, state]);
  return <canvas ref={canvasRef} width={700} height={420} className="satellite-canvas" aria-label="Simulated satellite observation" />;
}

const CHANNELS = [
  { id: 'IR_THERMAL', name: 'Infrared Thermal (10.8µm)', spec: 'INSAT-3DR TIR-1', desc: 'Cloud top temperature and deep convective updrafts.' },
  { id: 'VISIBLE', name: 'High-Res Visible (0.64µm)', spec: 'INSAT-3DR VIS', desc: 'Daylight cloud imagery and low-level circulation.' },
  { id: 'WATER_VAPOR', name: 'Upper Water Vapor (6.2µm)', spec: 'INSAT-3DR WV', desc: 'Mid-to-upper moisture and outflow channels.' },
  { id: 'DOPPLER_RADAR', name: 'DWR Reflectivity (S-Band)', spec: 'Paradip / Digha DWR', desc: 'Precipitation reflectivity and rainband structure.' },
];

export default function SatellitePage() {
  const state = useAppStore(s => s.intelligence?.state);
  const [selectedChannel, setSelectedChannel] = useState('IR_THERMAL');
  const [enhancement, setEnhancement] = useState('DVB_COLOR');
  return <div className="page">
    <div className="page-hd"><Satellite size={16} style={{ color: 'var(--cyan)' }} /><span className="page-title">SENSING &amp; EARTH OBSERVATION</span><span className="page-sub">Multi-spectral satellite and radar telemetry</span><span className="chip chip-green sensing-status"><RefreshCw size={10} /> INSAT-3DR ACTIVE</span></div>
    <div className="page-body satellite-page-body">
      <div className="sensor-grid" aria-label="Observation channels">{CHANNELS.map(channel => <button key={channel.id} onClick={() => setSelectedChannel(channel.id)} className={`sensor-selector ${selectedChannel === channel.id ? 'selected' : ''}`}><span className="sensor-name">{channel.name}</span><span className="sensor-spec">{channel.spec}</span><span className="sensor-description">{channel.desc}</span></button>)}</div>
      <div className="satellite-workspace">
        <section className="observation-column" aria-label="Satellite observation">
          <div className="observation-toolbar"><div className="observation-title"><Layers size={14} /> {selectedChannel.replaceAll('_', ' ')}</div><label className="enhancement-control">Enhancement<select value={enhancement} onChange={event => setEnhancement(event.target.value)}><option value="DVB_COLOR">BD-Curve (Thermal Color)</option><option value="RAW_GREY">Raw Infrared Grey</option><option value="RAIN_RATE">DWR Reflectivity (dBZ)</option><option value="WIND_VECTOR">Atmospheric Motion Vectors</option></select></label></div>
          <div className="sat-viewer observation-canvas"><SatelliteCanvas channel={selectedChannel} state={state} /></div>
          <div className="observation-meta telemetry-xs"><span>Platform <strong>INSAT-3DR</strong></span><span>Eye <strong>{state?.lat || '20.5'}°N, {state?.lon || '88.3'}°E</strong></span><span>Timestamp <strong>2026-09-08 16:00 UTC</strong></span><span>Resolution <strong>1.0 km / px</strong></span></div>
        </section>
        <aside className="observation-analysis"><div className="panel-section analysis-panel"><div className="section-title"><Wind size={14} style={{ color: 'var(--cyan)' }} /> Convective Core Analysis</div><div className="analysis-rows"><div className="trow"><span className="trow-key">Min Cloud Top Temp</span><span className="trow-val" style={{ color: 'var(--red)' }}>-78.2°C</span></div><div className="trow"><span className="trow-key">CDO Diameter</span><span className="trow-val" style={{ color: 'var(--yellow)' }}>240 km</span></div><div className="trow"><span className="trow-key">Warm Core Anomaly</span><span className="trow-val" style={{ color: 'var(--green)' }}>+14.5°C</span></div><div className="trow"><span className="trow-key">Dvorak Intensity</span><span className="trow-val" style={{ color: 'var(--cyan)' }}>T6.5 / 127 kt</span></div></div></div><div className="ri-alert observation-note"><div className="ri-alert-hd flex items-center gap-1"><ShieldCheck size={14} /> Dvorak Interpretation</div><div className="ri-alert-body">Deep convective cloud tops are wrapping around the eyewall. The thermal gradient indicates an active eyewall replacement cycle.</div></div></aside>
      </div>
    </div>
  </div>;
}
