import useAppStore from '../../store/appStore.js';

const LAYERS = [
  { key: 'track',        label: 'Track',       color: '#42C7FF' },
  { key: 'forecast',     label: 'Forecast',    color: '#35C98A' },
  { key: 'wind34',       label: '34 KT Wind',  color: '#F2C94C' },
  { key: 'wind50',       label: '50 KT Wind',  color: '#F2994A' },
  { key: 'wind64',       label: '64 KT Wind',  color: '#EF5A5A' },
  { key: 'flood',        label: 'Flood Risk',  color: '#4E8BF0' },
  { key: 'composite',   label: 'Composite',   color: '#EF5A5A' },
  { key: 'resources',   label: 'Resources',   color: '#35C98A' },
  { key: 'sos',         label: 'SOS',         color: '#FF4D6D' },
];

function Toggle({ on, color }) {
  return (
    <div className={`layer-toggle-track ${on ? 'on' : ''}`} style={on ? { borderColor: `${color}50` } : {}}>
      <div className="layer-toggle-knob" style={on ? { background: color } : {}} />
    </div>
  );
}

export default function LayerControlPanel({ onClose }) {
  const activeLayers = useAppStore(s => s.activeLayers);
  const toggleLayer  = useAppStore(s => s.toggleLayer);

  return (
    <div className="layer-panel" style={{ minWidth: 160 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
        <span className="label-sm">MAP LAYERS</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</button>
      </div>
      {LAYERS.map(({ key, label, color }) => (
        <div
          key={key}
          className={`layer-row ${activeLayers[key] ? 'on' : ''}`}
          onClick={() => toggleLayer(key)}
        >
          <div className="layer-dot" style={{ background: activeLayers[key] ? color : 'var(--border-2)' }} />
          <span style={{ flex: 1, fontSize: 10 }}>{label}</span>
          <Toggle on={activeLayers[key]} color={color} />
        </div>
      ))}
    </div>
  );
}
