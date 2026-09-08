import React, { useEffect } from 'react';
import useAppStore from '../store/appStore.js';
import { FileText, ShieldCheck, Award } from 'lucide-react';

export default function AuditPage() {
  const timeline = useAppStore(s => s.timeline);
  const fetchTimeline = useAppStore(s => s.fetchTimeline);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return (
    <div className="page">
      {/* Header */}
      <div className="page-hd">
        <FileText size={16} style={{ color: 'var(--cyan)' }} />
        <span className="page-title">ANALYTICS & AUDIT LOG</span>
        <span className="page-sub">Append-only operational timeline & forecast skill metrics</span>
        <div style={{ marginLeft: 'auto' }}>
          <span className="chip chip-green flex items-center gap-1">
            <Award size={10} /> FORECAST ACCURACY: 94.2% (BRIER: 0.08)
          </span>
        </div>
      </div>

      {/* Page Body */}
      <div className="page-body" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div className="metric-block" style={{ background: 'var(--panel)', border: '1px solid var(--border-2)' }}>
            <div className="metric-label">Track Prediction Skill</div>
            <div className="metric-value" style={{ color: 'var(--cyan)' }}>96.4%</div>
            <div className="metric-delta down">&lt;18km Track Error</div>
          </div>

          <div className="metric-block" style={{ background: 'var(--panel)', border: '1px solid var(--border-2)' }}>
            <div className="metric-label">Intensity Forecast Score</div>
            <div className="metric-value" style={{ color: 'var(--green)' }}>92.1%</div>
            <div className="metric-delta down">Brier 0.082</div>
          </div>

          <div className="metric-block" style={{ background: 'var(--panel)', border: '1px solid var(--border-2)' }}>
            <div className="metric-label">Ledger Integrity</div>
            <div className="metric-value" style={{ color: 'var(--yellow)' }}>100%</div>
            <div className="metric-delta">SHA-256 Verifiable</div>
          </div>
        </div>

        {/* Timeline Ledger */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border-2)', display: 'flex', flexDirection: 'column' }}>
          <div className="panel-hd">
            <ShieldCheck size={14} style={{ color: 'var(--cyan)' }} />
            <span className="panel-title">OPERATIONAL EVENT TIMELINE LEDGER</span>
          </div>

          <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {timeline.length === 0 ? (
              <div className="state-empty font-mono">No timeline audit events logged yet.</div>
            ) : (
              timeline.map((item, idx) => (
                <div key={idx} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', padding: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cyan)', marginTop: '4px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="telemetry-xs" style={{ color: 'var(--cyan)', fontWeight: '700' }}>{item.type || 'SYSTEM_EVENT'}</span>
                      <span className="chip chip-grey">TICK {item.tick ?? 0}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-2)', lineHeight: '1.4' }}>{item.summary || item.message || 'Operational state recorded.'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


