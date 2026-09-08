import { useEffect, useState } from 'react';
import useAppStore from '../../store/appStore.js';
import { Radio, AlertTriangle } from 'lucide-react';

function UTCClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="mono-sm" style={{ color: 'var(--text-2)' }}>
      {time.toISOString().slice(11, 19)} UTC
    </span>
  );
}

const MODE_DOT = { API: 'dot-live', DEMO: 'dot-demo', DEGRADED: 'dot-deg', CONNECTING: 'dot-demo' };
const MODE_LABEL = { API: 'LIVE', DEMO: 'DEMO', DEGRADED: 'DEGRADED', CONNECTING: '…' };

export default function TopBar() {
  const connectionState = useAppStore(s => s.connectionState);
  const intelligence    = useAppStore(s => s.intelligence);
  const alertState      = useAppStore(s => s.alertState);
  const sosReports      = useAppStore(s => s.sosReports);
  const currentTick     = useAppStore(s => s.currentTick);

  const eventName = intelligence?.event?.name || 'AMPHAN';
  const regime = intelligence?.regime || intelligence?.state?.regime || '—';
  const activeSOS = sosReports.filter(r => r.status !== 'RESOLVED').length;

  // Keep alert state in sync with intelligence
  useEffect(() => {
    const al = intelligence?.alert?.level || intelligence?.event?.current_alert;
    if (al) useAppStore.getState().setAlertState(al);
  }, [intelligence]);

  return (
    <header className="app-topbar">
      {/* Brand */}
      <div className="topbar-brand">
        <div className="brand-symbol"><Radio size={16} /></div>
        <div><div className="brand-mark"><span>VOR</span>TEX</div><div className="brand-subtitle">Cyclone Intelligence &amp; Response</div></div>
      </div>

      {/* Event */}
      <div className="topbar-section">
        <span className="topbar-key">EVENT</span>
        <span className="topbar-val">{eventName}</span>
      </div>

      {/* Regime */}
      <div className="topbar-section">
        <span className="topbar-key">REGIME</span>
        <span className={`regime regime-${regime}`} style={{ fontSize: '8px' }}>{regime.replace('_', ' ')}</span>
      </div>

      {/* Tick */}
      <div className="topbar-section">
        <span className="topbar-key">TICK</span>
        <span className="topbar-val mono-sm">T+{String(currentTick).padStart(2, '0')}</span>
      </div>

      <div className="topbar-spacer" />

      {/* UTC */}
      <div className="topbar-indicator" style={{ gap: 6 }}>
        <UTCClock />
      </div>

      {/* Alert */}
<<<<<<< HEAD
      <div className="topbar-indicator">
        <span className={`alert-indicator alert-${alertState}`}>
          <AlertTriangle size={9} /> {alertState}
=======
      <div className="topbar-indicator" style={{ cursor: alertState === 'RED' ? 'pointer' : 'default' }} onClick={() => {
        if (alertState === 'RED') {
          useAppStore.getState().setRedAlertDismissed(false);
          useAppStore.getState().dispatchRedAlertToRRAS();
        }
      }}>
        <span className={`alert-indicator alert-${alertState}`} title={alertState === 'RED' ? 'Click to Dispatch RRAS Emergency Alert' : `Alert Level: ${alertState}`}>
          <AlertTriangle size={9} /> {alertState} {alertState === 'RED' && '· DISPATCH'}
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
        </span>
      </div>

      {/* SOS */}
      {activeSOS > 0 && (
        <div className="sos-indicator">
          <span style={{ width: 6, height: 6, background: 'var(--sos)', borderRadius: '50%', flexShrink: 0, animation: 'dot-blink 1s ease-in-out infinite' }} />
          SOS {activeSOS}
        </div>
      )}

      {/* Connection mode */}
      <div className="topbar-indicator">
        <span className={MODE_DOT[connectionState] || 'dot-demo'} />
        <span className="mono-sm">DATA: {MODE_LABEL[connectionState] || 'DEMO'}</span>
      </div>
    </header>
  );
}
