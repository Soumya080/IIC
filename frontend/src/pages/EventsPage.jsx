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

      <div className="page-body">
        {/* Event List */}
        <div className="page-section">
          <div className="section-title">AVAILABLE EVENTS</div>
          <table className="data-table" style={{ marginBottom: 0 }}>
            <thead>
              <tr>
                <th>EVENT ID</th>
                <th>NAME</th>
                <th>YEAR</th>
                <th>BASIN</th>
                <th>CATEGORY</th>
                <th>PEAK INTENSITY</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_EVENTS.map(ev => {
                const isActive = selectedEventId === ev.id;
                return (
                  <tr key={ev.id} style={isActive ? { background: 'rgba(66,199,255,0.04)' } : {}}>
                    <td className="td-cyan">{ev.id}</td>
                    <td className="td-name">{ev.name}</td>
                    <td>{ev.year}</td>
                    <td>{ev.basin}</td>
                    <td>{ev.cat}</td>
                    <td style={{ color: 'var(--orange)' }}>{ev.peak}</td>
                    <td>
                      <span className={`chip ${isActive ? 'chip-cyan' : 'chip-grey'}`}>
                        {isActive ? 'ACTIVE' : ev.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${isActive ? 'btn-ghost' : 'btn-ghost'}`}
                        onClick={() => setSelectedEvent(ev.id)}
                        style={isActive ? { color: 'var(--cyan)', borderColor: 'rgba(66,199,255,0.3)' } : {}}
                      >
                        {isActive ? '● LOADED' : 'LOAD'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Replay Audit Table */}
        <div className="page-section">
          <div className="section-title">
            REPLAY TIMELINE — {selectedEventId}
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>TICK</th>
                <th>TIMESTAMP (UTC)</th>
                <th>LAT</th>
                <th>LON</th>
                <th>WIND</th>
                <th>PRESSURE</th>
                <th>REGIME</th>
                <th>ALERT</th>
                <th>JUMP</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_TICKS.map(t => {
                const isCurrent = t.tick === currentTick;
                return (
                  <tr key={t.tick} style={isCurrent ? { background: 'rgba(66,199,255,0.06)' } : {}}>
                    <td className={isCurrent ? 'td-cyan' : ''}>{t.tick}</td>
                    <td>{t.ts.replace('T', ' ').slice(0, 16)}</td>
                    <td>{t.lat}°N</td>
                    <td>{t.lon}°E</td>
                    <td style={{ color: t.wind > 100 ? 'var(--red)' : t.wind > 64 ? 'var(--orange)' : 'var(--text-2)' }}>
                      {t.wind} KT
                    </td>
                    <td>{t.pres} hPa</td>
                    <td>
                      <span className={`regime regime-${t.regime}`} style={{ fontSize: '7px' }}>
                        {t.regime.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`chip chip-${t.alert === 'GREEN' ? 'green' : t.alert === 'YELLOW' ? 'yellow' : t.alert === 'ORANGE' ? 'orange' : 'red'}`}>
                        {t.alert}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => replayGoto(t.tick)}>
                        <Play size={9} /> JUMP
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
