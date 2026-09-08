import { Activity, CalendarDays, Satellite, TrendingUp, Wind, ShieldAlert, LifeBuoy, FileBarChart2 } from 'lucide-react';
import useAppStore from '../../store/appStore.js';

const NAV = [
  { id: 'COMMAND_CENTER', icon: Activity,        label: 'Command' },
  { id: 'EVENTS',         icon: CalendarDays,    label: 'Events' },
  { id: 'SATELLITE',      icon: Satellite,       label: 'Satellite' },
  { id: 'FORECAST',       icon: TrendingUp,      label: 'Forecast' },
  { id: 'HAZARD_IMPACT',  icon: Wind,            label: 'Hazards' },
  { id: 'RESOURCE_OPS',   icon: ShieldAlert,     label: 'Resources' },
  { id: 'SOS_CONSOLE',    icon: LifeBuoy,        label: 'SOS', badgeKey: 'sos' },
  { id: 'AUDIT',          icon: FileBarChart2,   label: 'Audit' },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const sosReports = useAppStore(s => s.sosReports);
  const activeSOS  = sosReports.filter(r => r.status !== 'RESOLVED').length;

  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav">
        {NAV.map(({ id, icon: Icon, label, badgeKey }) => {
          const badge = badgeKey === 'sos' ? activeSOS : 0;
          return (
            <button
              key={id}
              className={`nav-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
              title={label}
              aria-label={label}
            >
              <Icon className="nav-item-icon" strokeWidth={1.5} />
              {badge > 0 && <span className="nav-badge">{badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="nav-item" style={{ cursor: 'default', justifyContent: 'center' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
        </div>
      </div>
    </aside>
  );
}
