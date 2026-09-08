import { Activity, CalendarDays, Satellite, TrendingUp, Wind, ShieldAlert, LifeBuoy, FileBarChart2 } from 'lucide-react';
import useAppStore from '../../store/appStore.js';

const NAV = [
  { id: 'COMMAND_CENTER', icon: Activity,        label: 'Command Center', group: 'Situation' },
  { id: 'EVENTS',         icon: CalendarDays,    label: 'Events / Replay', group: 'Situation' },
  { id: 'SATELLITE',      icon: Satellite,       label: 'Sensing', group: 'Intelligence' },
  { id: 'FORECAST',       icon: TrendingUp,      label: 'Forecast / Scenarios', group: 'Intelligence' },
  { id: 'HAZARD_IMPACT',  icon: Wind,            label: 'Hazard / District Risk', group: 'Impact' },
  { id: 'RESOURCE_OPS',   icon: ShieldAlert,     label: 'Resources', group: 'Operations' },
  { id: 'SOS_CONSOLE',    icon: LifeBuoy,        label: 'SOS / Response', group: 'Operations', badgeKey: 'sos' },
  { id: 'AUDIT',          icon: FileBarChart2,   label: 'Analytics / Audit', group: 'Governance' },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const sosReports = useAppStore(s => s.sosReports);
  const activeSOS  = sosReports.filter(r => r.status !== 'RESOLVED').length;

  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav" aria-label="Operational navigation">
        {['Situation', 'Intelligence', 'Impact', 'Operations', 'Governance'].map(group => (
          <div className="nav-group" key={group}>
            <div className="nav-group-label">{group}</div>
            {NAV.filter(item => item.group === group).map(({ id, icon: Icon, label, badgeKey }) => {
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
              <span className="nav-item-label">{label}</span>
              {badge > 0 && <span className="nav-badge">{badge}</span>}
            </button>
          );
            })}
          </div>
        ))}
      </nav>

    </aside>
  );
}
