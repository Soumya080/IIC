import { motion } from 'framer-motion';
import useAppStore from '../store/appStore.js';
import { DEMO_TICKS } from '../services/demo.js';
import { CalendarDays, Play } from 'lucide-react';

const DEMO_EVENTS = [
  { id: 'CYC-2020-AMPHAN',    name: 'Cyclone Amphan',    year: 2020, basin: 'Bay of Bengal',  cat: 'Super Cyclone',     peak: '155 KT', status: 'REPLAY_ONLY' },
  { id: 'CYC-2021-YAAS',      name: 'Cyclone Yaas',      year: 2021, basin: 'Bay of Bengal',  cat: 'Very Severe',       peak: '105 KT', status: 'HISTORICAL' },
  { id: 'CYC-2019-FANI',      name: 'Cyclone Fani',      year: 2019, basin: 'Bay of Bengal',  cat: 'Extremely Severe',  peak: '135 KT', status: 'HISTORICAL' },
  { id: 'CYC-2023-BIPARJOY',  name: 'Cyclone Biparjoy',  year: 2023, basin: 'Arabian Sea',    cat: 'Very Severe',       peak: '95 KT',  status: 'HISTORICAL' },
];

export default function EventsPage() {
  const selectedEventId = useAppStore(s => s.selectedEventId);
  const currentTick     = useAppStore(s => s.currentTick);
  const setSelectedEvent = useAppStore(s => s.setSelectedEvent);
  const replayGoto       = useAppStore(s => s.replayGoto);

  return (
    <div className="page">
      <div className="page-hd">
        <CalendarDays size={14} style={{ color: 'var(--cyan)' }} />
        <span className="page-title">EVENT MANAGEMENT & HISTORICAL REPLAY</span>
        <span className="page-sub">Select an event to load cyclone intelligence</span>
      </div>

      <div className="page-body" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Available Events Flashcards */}
        <div>
          <div className="section-title" style={{ marginBottom: '10px', color: 'var(--cyan)' }}>
            AVAILABLE HISTORICAL CYCLONES & REPLAY DATABASE
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {DEMO_EVENTS.map(ev => {
              const isActive = selectedEventId === ev.id;
              return (
                <div
                  key={ev.id}
                  style={{
                    background: 'var(--panel)',
                    border: isActive ? '2px solid var(--cyan)' : '1px solid var(--border-2)',
                    borderRadius: '6px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: isActive ? '0 4px 14px rgba(0,119,153,0.15)' : '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="chip chip-cyan" style={{ fontSize: '10px', fontWeight: '700' }}>{ev.id}</span>
                      <span className={`chip ${isActive ? 'chip-green' : 'chip-grey'}`}>{isActive ? '● LOADED' : ev.status}</span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>{ev.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{ev.year} · {ev.basin}</div>
                  </div>

                  <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>Category: <strong style={{ color: 'var(--text)' }}>{ev.cat}</strong></span>
                    <span>Peak: <strong style={{ color: 'var(--orange)' }}>{ev.peak}</strong></span>
                  </div>

                  <button
                    className={`btn ${isActive ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                    onClick={() => setSelectedEvent(ev.id)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {isActive ? 'CURRENTLY ACTIVE' : 'LOAD EVENT INTELLIGENCE'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Replay Timeline Flashcards */}
        <div>
          <div className="section-title" style={{ marginBottom: '10px', color: 'var(--cyan)' }}>
            REPLAY TIMELINE STEPS — {selectedEventId}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {DEMO_TICKS.map(t => {
              const isCurrent = t.tick === currentTick;
              return (
                <div
                  key={t.tick}
                  style={{
                    background: isCurrent ? 'var(--panel-hover)' : 'var(--panel)',
                    border: isCurrent ? '1.5px solid var(--cyan)' : '1px solid var(--border-2)',
                    borderRadius: '6px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: isCurrent ? 'var(--cyan)' : 'var(--text)' }}>TICK T+{t.tick}</span>
                    <span className={`chip chip-${t.alert === 'GREEN' ? 'green' : t.alert === 'YELLOW' ? 'yellow' : t.alert === 'ORANGE' ? 'orange' : 'red'}`} style={{ fontSize: '9px' }}>
                      {t.alert}
                    </span>
                  </div>

                  <div style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: 'monospace' }}>{t.ts.replace('T', ' ').slice(0, 16)} UTC</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11px' }}>
                    <div style={{ background: 'var(--bg-1)', padding: '4px 6px', borderRadius: '3px' }}>
                      <span style={{ fontSize: '9px', color: 'var(--text-3)', display: 'block' }}>WIND SPEED</span>
                      <strong style={{ color: t.wind > 100 ? 'var(--red)' : t.wind > 64 ? 'var(--orange)' : 'var(--text)' }}>{t.wind} KT</strong>
                    </div>
                    <div style={{ background: 'var(--bg-1)', padding: '4px 6px', borderRadius: '3px' }}>
                      <span style={{ fontSize: '9px', color: 'var(--text-3)', display: 'block' }}>PRESSURE</span>
                      <strong>{t.pres} hPa</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                    <span className={`regime regime-${t.regime}`} style={{ fontSize: '8px', padding: '2px 6px' }}>{t.regime.replace('_', ' ')}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => replayGoto(t.tick)} style={{ padding: '3px 8px', fontSize: '10px' }}>
                      <Play size={9} /> JUMP
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
