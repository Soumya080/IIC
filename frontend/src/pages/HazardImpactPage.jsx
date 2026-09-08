import React, { useEffect } from 'react';
import useAppStore from '../store/appStore.js';
import { Wind, Waves, MapPin, Building2, AlertTriangle, Zap } from 'lucide-react';

export default function HazardImpactPage() {
  const districts = useAppStore(s => s.districts);
  const fetchDistricts = useAppStore(s => s.fetchDistricts);

  useEffect(() => {
    fetchDistricts();
  }, [fetchDistricts]);

  return (
    <div className="page">
      {/* Header */}
      <div className="page-hd">
        <Wind size={16} style={{ color: 'var(--cyan)' }} />
        <span className="page-title">HAZARD CASCADE & DISTRICT RISK BOARD</span>
        <span className="page-sub">Storm surge inundation modeling & district risk breakdown</span>
        <div style={{ marginLeft: 'auto' }}>
          <span className="chip chip-red flex items-center gap-1">
            <AlertTriangle size={10} /> PEAK STORM SURGE: 4.8M
          </span>
        </div>
      </div>

      {/* Page Body */}
      <div className="page-body" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Cascade stages */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border-2)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="section-title" style={{ margin: 0, justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cyan)' }}>
              <Zap size={14} /> CASCADING HAZARD DYNAMICS
            </span>
            <span className="telemetry-xs">TRIGGER THRESHOLD: &gt;90 KT WIND VELOCITY</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', textAlign: 'center' }}>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', padding: '8px' }} className="telemetry-xs">
              <div style={{ color: 'var(--cyan)', fontWeight: '700' }}>STAGE 1</div>
              <div>DEEP CYCLONE</div>
            </div>
            <div style={{ background: 'rgba(242,153,74,0.1)', border: '1px solid rgba(242,153,74,0.3)', padding: '8px', color: 'var(--orange)' }} className="telemetry-xs">
              <div style={{ fontWeight: '700' }}>STAGE 2</div>
              <div>EYEWALL BURST</div>
            </div>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', padding: '8px' }} className="telemetry-xs">
              <div style={{ color: 'var(--cyan)', fontWeight: '700' }}>STAGE 3</div>
              <div>EXTREME WINDS</div>
            </div>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', padding: '8px' }} className="telemetry-xs">
              <div style={{ color: 'var(--cyan)', fontWeight: '700' }}>STAGE 4</div>
              <div>TORRENTIAL RAIN</div>
            </div>
            <div style={{ background: 'rgba(78,139,240,0.1)', border: '1px solid rgba(78,139,240,0.3)', padding: '8px', color: 'var(--flood)' }} className="telemetry-xs">
              <div style={{ fontWeight: '700' }}>STAGE 5</div>
              <div>COASTAL SURGE</div>
            </div>
            <div style={{ background: 'rgba(239,90,90,0.1)', border: '1px solid rgba(239,90,90,0.3)', padding: '8px', color: 'var(--red)' }} className="telemetry-xs">
              <div style={{ fontWeight: '700' }}>STAGE 6</div>
              <div>GRID FAILURE</div>
            </div>
          </div>
        </div>

        {/* District Risk Board Table */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border-2)', display: 'flex', flexDirection: 'column' }}>
          <div className="panel-hd">
            <MapPin size={14} style={{ color: 'var(--cyan)' }} />
            <span className="panel-title">DISTRICT COMPOSITE RISK BOARD</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>District</th>
                  <th>Risk Level</th>
                  <th>Vulnerability</th>
                  <th>Evacuation</th>
                  <th>Shelter Cap</th>
                  <th>Medical</th>
                  <th>Transport</th>
                </tr>
              </thead>
              <tbody>
                {districts.map((d, i) => (
                  <tr key={i}>
                    <td className="td-name">{d.district}</td>
                    <td>
                      <span className={`chip ${
                        d.label === 'EXTREME' || d.label === 'HIGH' ? 'chip-red' : d.label === 'MODERATE' ? 'chip-yellow' : 'chip-green'
                      }`}>
                        {d.label || 'EXTREME'}
                      </span>
                    </td>
                    <td className="td-cyan">{d.overall}%</td>
                    <td>{d.evacuation}%</td>
                    <td>{d.shelter}%</td>
                    <td>{d.medical}%</td>
                    <td>{d.transport}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


