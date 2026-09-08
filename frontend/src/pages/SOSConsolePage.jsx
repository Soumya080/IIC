import React, { useEffect } from 'react';
import useAppStore from '../store/appStore.js';
import { LifeBuoy, AlertTriangle, Send, MapPin } from 'lucide-react';

export default function SOSConsolePage() {
  const sosReports = useAppStore(s => s.sosReports);
  const fetchSOS = useAppStore(s => s.fetchSOS);

  useEffect(() => {
    fetchSOS();
  }, [fetchSOS]);

  return (
    <div className="page">
      {/* Header */}
      <div className="page-hd">
        <LifeBuoy size={16} style={{ color: 'var(--sos)' }} />
        <span className="page-title">SOS & NDRF DISPATCH CONSOLE</span>
        <span className="page-sub">Distress signal triage & emergency battalion allocation</span>
        <div style={{ marginLeft: 'auto' }}>
          <span className="chip chip-red flex items-center gap-1">
            TOTAL IN QUEUE: {sosReports.length}
          </span>
        </div>
      </div>

      {/* Page Body */}
      <div className="page-body" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Hackathon Disclaimer */}
        <div className="sos-disclaimer flex items-center gap-2">
          <AlertTriangle size={14} style={{ color: 'var(--sos)', flexShrink: 0 }} />
          <span>MANDATORY DISCLAIMER: Simulated emergency SOS triage channel for hackathon demonstration purposes.</span>
        </div>

        {/* SOS List Table */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border-2)', display: 'flex', flexDirection: 'column' }}>
          <div className="panel-hd">
            <AlertTriangle size={14} style={{ color: 'var(--sos)' }} />
            <span className="panel-title">INCOMING DISTRESS SIGNAL QUEUE</span>
          </div>

          {sosReports.length === 0 ? (
            <div className="state-empty font-mono">
              No active SOS distress signals reported in queue for this tick.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SOS ID</th>
                    <th>District / Location</th>
                    <th>Severity</th>
                    <th>Trapped Citizens</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sosReports.map(sos => (
                    <tr key={sos.id}>
                      <td style={{ color: 'var(--sos)' }}>{sos.id}</td>
                      <td className="td-name flex items-center gap-1">
                        <MapPin size={12} style={{ color: 'var(--cyan)' }} /> {sos.district}
                      </td>
                      <td>
                        <span className="chip chip-red">
                          {sos.severity || 'CRITICAL'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--yellow)' }}>{sos.people_count || 14} Citizens</td>
                      <td>
                        <span className="chip chip-yellow">
                          {sos.status || 'UNASSIGNED'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-ghost btn-sm">ACKNOWLEDGE</button>
                          <button className="btn btn-sos btn-sm flex items-center gap-1">
                            <Send size={10} /> DISPATCH NDRF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


