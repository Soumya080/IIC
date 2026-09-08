import React, { useEffect, useState } from 'react';
import useAppStore from '../store/appStore.js';
<<<<<<< HEAD
import { ShieldAlert, Zap, Truck, CheckCircle2, Cpu } from 'lucide-react';
=======
import { ShieldAlert, Zap, Truck, CheckCircle2, Cpu, Clock } from 'lucide-react';
import RRASDispatchMap from '../components/map/RRASDispatchMap.jsx';
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)

export default function ResourceOpsPage() {
  const resources = useAppStore(s => s.resources);
  const resourceGap = useAppStore(s => s.resourceGap);
<<<<<<< HEAD
  const fetchResources = useAppStore(s => s.fetchResources);
  const fetchResourceGap = useAppStore(s => s.fetchResourceGap);
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);
=======
  const rrasData = useAppStore(s => s.rrasData);
  const redAlertDispatched = useAppStore(s => s.redAlertDispatched);
  const fetchResources = useAppStore(s => s.fetchResources);
  const fetchResourceGap = useAppStore(s => s.fetchResourceGap);
  const fetchRRAS = useAppStore(s => s.fetchRRAS);
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)

  useEffect(() => {
    fetchResources();
    fetchResourceGap();
<<<<<<< HEAD
  }, [fetchResources, fetchResourceGap]);
=======
    fetchRRAS();
  }, [fetchResources, fetchResourceGap, fetchRRAS]);
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)

  const handleOptimize = () => {
    setOptimizing(true);
    setTimeout(() => {
      setOptimizing(false);
      setOptimized(true);
    }, 1200);
  };

<<<<<<< HEAD
  return (
    <div className="page">
      {/* Header */}
      <div className="page-hd">
        <Cpu size={16} style={{ color: 'var(--cyan)' }} />
        <span className="page-title">RESOURCE OPERATIONS & OPTIMIZATION</span>
        <span className="page-sub">Battalion demand vs active supply shortfall analytics</span>
=======
  const roadCounts = rrasData?.summary?.road_status_counts || { NORMAL: 23, REROUTED: 0, BLOCKED: 0, UNREACHABLE: 0 };
  const allocations = rrasData?.allocation_plan || [];

  const avgEstTime = allocations.length > 0
    ? Math.round(allocations.reduce((acc, curr) => acc + (curr.est_time_min || 0), 0) / allocations.length)
    : 58;

  return (
    <div className="page" style={{ overflowY: 'auto' }}>
      {/* Header */}
      <div className="page-hd">
        <Cpu size={16} style={{ color: 'var(--cyan)' }} />
        <span className="page-title">RESOURCE OPERATIONS & RRAS ALLOCATION</span>
        <span className="page-sub">Rapid Resource Allocation & Routing System (RRAS) dispatch analytics</span>
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
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
<<<<<<< HEAD
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
=======
        {redAlertDispatched && (
          <div
            style={{
              background: 'linear-gradient(90deg, rgba(244, 67, 54, 0.25) 0%, rgba(183, 28, 28, 0.25) 100%)',
              border: '1px solid var(--red)',
              borderRadius: '6px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 0 15px rgba(244, 67, 54, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={18} style={{ color: 'var(--red)' }} />
              <div>
                <strong style={{ color: '#fff', fontSize: '13px' }}>🚨 CRITICAL RED ALERT DISPATCH ENGAGED</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                  RRAS shortest-path routing and emergency battalion resource plan dynamically calculated for active threat level.
                </div>
              </div>
            </div>
            <span className="chip chip-red" style={{ fontWeight: '700' }}>DISPATCH ACTIVE</span>
          </div>
        )}
        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          <div className="metric-block" style={{ background: 'var(--panel)', border: '1px solid var(--border-2)', borderLeft: '4px solid var(--yellow)' }}>
            <div className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--yellow)', fontWeight: '700' }}>
              <Clock size={12} /> EST. TRAVEL TIME (ETA)
            </div>
            <div className="metric-value" style={{ color: 'var(--yellow)', fontSize: '20px' }}>
              {avgEstTime} mins
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '2px' }}>
              Avg Convoy / Airlift ETA
            </div>
          </div>

          <div className="metric-block" style={{ background: 'var(--panel)', border: '1px solid var(--border-2)' }}>
            <div className="metric-label">Normal Roads</div>
            <div className="metric-value" style={{ color: 'var(--green)' }}>{roadCounts.NORMAL || 0}</div>
          </div>

          <div className="metric-block" style={{ background: 'var(--panel)', border: '1px solid var(--border-2)' }}>
            <div className="metric-label">Rerouted Roads</div>
            <div className="metric-value" style={{ color: 'var(--yellow)' }}>{roadCounts.REROUTED || 0}</div>
          </div>

          <div className="metric-block" style={{ background: 'var(--panel)', border: '1px solid var(--border-2)' }}>
            <div className="metric-label">Blocked Roads</div>
            <div className="metric-value" style={{ color: 'var(--red)' }}>{roadCounts.BLOCKED || 0}</div>
          </div>

          <div className="metric-block" style={{ background: 'var(--panel)', border: '1px solid var(--border-2)' }}>
            <div className="metric-label">Unreachable Areas</div>
            <div className="metric-value" style={{ color: 'var(--red)' }}>{roadCounts.UNREACHABLE || 0}</div>
          </div>
        </div>

        {/* RRAS Interactive Route & Transportation Map */}
        <RRASDispatchMap selectedTrip={selectedTrip} onSelectTrip={setSelectedTrip} />

        {/* RRAS Allocation Plan Table */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '14px' }}>
          <div className="panel-hd" style={{ marginBottom: '10px' }}>
            <ShieldAlert size={14} style={{ color: 'var(--cyan)' }} />
            <span className="panel-title">RRAS DEPOT-TO-DISTRICT DISPATCH & ROUTING PLAN</span>
            {rrasData?.disclaimer && (
              <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-3)', fontStyle: 'italic' }}>
                {rrasData.disclaimer}
              </span>
            )}
          </div>

          {allocations.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-2)' }}>
                    <th style={{ padding: '8px' }}>Target District</th>
                    <th style={{ padding: '8px' }}>Depot Source</th>
                    <th style={{ padding: '8px' }}>Access Status</th>
                    <th style={{ padding: '8px' }}>Food Units</th>
                    <th style={{ padding: '8px' }}>Water Units</th>
                    <th style={{ padding: '8px' }}>Med Kits</th>
                    <th style={{ padding: '8px' }}>NDRF Teams</th>
                    <th style={{ padding: '8px', color: 'var(--yellow)', fontWeight: '800' }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      Est. Travel Time (ETA)
                    </th>
                    <th style={{ padding: '8px' }}>Priority Score</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((item, idx) => {
                    const isSelected = selectedTrip?.district === item.district;
                    return (
                      <tr
                        key={idx}
                        onClick={() => setSelectedTrip(item)}
                        style={{
                          borderBottom: '1px solid var(--border-2)',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(0, 188, 212, 0.12)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '8px', fontWeight: '700', color: 'var(--text)' }}>{item.district}</td>
                        <td style={{ padding: '8px', color: 'var(--text-2)' }}>{item.depot_name}</td>
                        <td style={{ padding: '8px' }}>
                          <span className={`chip ${item.access_status === 'CLEAR' ? 'chip-green' : item.access_status === 'REROUTED' ? 'chip-yellow' : 'chip-red'}`}>
                            {item.access_status}
                          </span>
                        </td>
                        <td style={{ padding: '8px', color: 'var(--cyan)' }}>{item.food_units?.toLocaleString()}</td>
                        <td style={{ padding: '8px', color: 'var(--cyan)' }}>{item.water_units?.toLocaleString()}</td>
                        <td style={{ padding: '8px', color: 'var(--yellow)' }}>{item.med_kits}</td>
                        <td style={{ padding: '8px', color: 'var(--green)', fontWeight: '700' }}>{item.ndrf_teams}</td>
                        <td style={{ padding: '8px' }}>
                          <span
                            style={{
                              background: 'rgba(255, 193, 7, 0.15)',
                              border: '1px solid rgba(255, 193, 7, 0.4)',
                              color: '#ffc107',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontWeight: '800',
                              fontSize: '11px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Clock size={11} />
                            {item.est_time_min ? `${item.est_time_min} mins (${(item.est_time_min / 60).toFixed(1)}h)` : 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '8px', fontWeight: '700', color: 'var(--yellow)' }}>{item.priority_score}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-3)', fontSize: '12px' }}>
              No active allocations required for current tick state.
            </div>
          )}
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
        </div>

        {/* Result banner */}
        {optimized && (
          <div className="opt-result" style={{ margin: 0 }}>
            <div className="opt-result-hd">
              <CheckCircle2 size={14} /> RECOMMENDED DEPLOYMENT ACTION
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


