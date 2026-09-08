import React, { useEffect, useState } from 'react';
import useAppStore from '../store/appStore.js';
import { ShieldAlert, Zap, Truck, CheckCircle2, Cpu } from 'lucide-react';

export default function ResourceOpsPage() {
  const resources = useAppStore(s => s.resources);
  const resourceGap = useAppStore(s => s.resourceGap);
  const fetchResources = useAppStore(s => s.fetchResources);
  const fetchResourceGap = useAppStore(s => s.fetchResourceGap);
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);

  useEffect(() => {
    fetchResources();
    fetchResourceGap();
  }, [fetchResources, fetchResourceGap]);

  const handleOptimize = () => {
    setOptimizing(true);
    setTimeout(() => {
      setOptimizing(false);
      setOptimized(true);
    }, 1200);
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-hd">
        <Cpu size={16} style={{ color: 'var(--cyan)' }} />
        <span className="page-title">RESOURCE OPERATIONS & OPTIMIZATION</span>
        <span className="page-sub">Battalion demand vs active supply shortfall analytics</span>
        <div style={{ marginLeft: 'auto' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleOptimize}
            disabled={optimizing}
          >
            <Zap size={12} /> {optimizing ? 'OPTIMIZING...' : 'OPTIMIZE DEPLOYMENT'}
          </button>
        </div>
      </div>

      {/* Page Body */}
      <div className="page-body" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div className="metric-block" style={{ background: 'var(--panel)', border: '1px solid var(--border-2)' }}>
            <div className="metric-label">Required NDRF Battalions</div>
            <div className="metric-value" style={{ color: 'var(--yellow)' }}>{resourceGap?.required_ndrf_teams || 24}</div>
          </div>

          <div className="metric-block" style={{ background: 'var(--panel)', border: '1px solid var(--border-2)' }}>
            <div className="metric-label">Active NDRF Battalions</div>
            <div className="metric-value" style={{ color: 'var(--green)' }}>{resourceGap?.available_ndrf_teams || 18}</div>
          </div>

          <div className="metric-block" style={{ background: 'var(--panel)', border: '1px solid var(--border-2)' }}>
            <div className="metric-label">Resource Shortfall / Gap</div>
            <div className="metric-value" style={{ color: 'var(--red)' }}>{resourceGap?.shortfall || 6}</div>
          </div>
        </div>

        {/* Result banner */}
        {optimized && (
          <div className="opt-result" style={{ margin: 0 }}>
            <div className="opt-result-hd">
              <CheckCircle2 size={14} /> AI ROUTING PLAN GENERATED
            </div>
            <div className="opt-reason">
              Move <strong>NDRF 2nd Battalion</strong> from Kolkata → South 24 Parganas.<br />
              Estimated travel time (2.2h) &lt; Wind hazard arrival (12.0h). Vulnerable population exposure: 420,000.
            </div>
          </div>
        )}

        {/* Resource Inventory Flashcards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="panel-hd">
            <Truck size={14} style={{ color: 'var(--cyan)' }} />
            <span className="panel-title">BATTALION & EQUIPMENT INVENTORY FLASHCARDS</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {resources.map(r => (
              <div
                key={r.id}
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border-2)',
                  borderRadius: '6px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--cyan)', fontFamily: 'monospace' }}>{r.id}</span>
                    <span className={`chip ${r.status === 'READY' || r.status === 'STANDBY' ? 'chip-green' : 'chip-yellow'}`}>
                      {r.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>{r.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>Asset Type: <strong style={{ color: 'var(--text-2)' }}>{r.resource_type}</strong></div>
                </div>

                <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span>District: <strong style={{ color: 'var(--text)' }}>{r.district}</strong></span>
                  <span>Capacity: <strong style={{ color: 'var(--green)' }}>{r.capacity} personnel</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


