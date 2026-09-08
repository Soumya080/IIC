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

        {/* SOS Flashcards Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="panel-hd">
            <AlertTriangle size={14} style={{ color: 'var(--sos)' }} />
            <span className="panel-title">INCOMING DISTRESS SIGNAL QUEUE</span>
          </div>

          {sosReports.length === 0 ? (
            <div className="state-empty font-mono" style={{ background: 'var(--panel)', border: '1px solid var(--border-2)', padding: '30px', borderRadius: '6px' }}>
              No active SOS distress signals reported in queue for this tick.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
              {sosReports.map(sos => (
                <div
                  key={sos.id}
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border-2)',
                    borderLeft: '4px solid var(--sos)',
                    borderRadius: '6px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--sos)' }}>{sos.id}</span>
                      <span className={`chip ${sos.severity === 'CRITICAL' ? 'chip-red' : 'chip-yellow'}`}>
                        {sos.severity || 'CRITICAL'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>
                      <MapPin size={14} style={{ color: 'var(--cyan)' }} /> {sos.district}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-2)', lineHeight: '1.4', marginBottom: '8px' }}>
                      {sos.description || 'Citizens trapped by storm surge / inland flooding. Urgent rescue requested.'}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>Trapped: <strong style={{ color: 'var(--yellow)' }}>{sos.people_count || 14} Citizens</strong></span>
                    <span>Status: <strong style={{ color: 'var(--cyan)' }}>{sos.status || 'UNASSIGNED'}</strong></span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => updateSOSStatus(sos.id, 'ACKNOWLEDGED')}
                    >
                      ACKNOWLEDGE
                    </button>
                    <button 
                      className="btn btn-sos btn-sm flex items-center gap-1" 
                      style={{ flex: 1.2, justifyContent: 'center' }}
                      onClick={() => updateSOSStatus(sos.id, 'ASSIGNED')}
                    >
                      <Send size={10} /> DISPATCH NDRF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


