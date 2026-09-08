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

        {/* Table */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border-2)', display: 'flex', flexDirection: 'column' }}>
          <div className="panel-hd">
            <Truck size={14} style={{ color: 'var(--cyan)' }} />
            <span className="panel-title">BATTALION & EQUIPMENT INVENTORY</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Resource ID</th>
                  <th>Unit Name</th>
                  <th>Asset Type</th>
                  <th>District</th>
                  <th>Capacity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {resources.map(r => (
                  <tr key={r.id}>
                    <td className="td-cyan">{r.id}</td>
                    <td className="td-name">{r.name}</td>
                    <td>{r.resource_type}</td>
                    <td>{r.district}</td>
                    <td>{r.capacity}</td>
                    <td>
                      <span className={`chip ${r.status === 'READY' || r.status === 'STANDBY' ? 'chip-green' : 'chip-yellow'}`}>
                        {r.status}
                      </span>
                    </td>
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


