import { Marker } from 'react-map-gl/maplibre';
import useAppStore from '../../store/appStore.js';

const SEV_COLORS = {
  CRITICAL: '#FF4D6D',
  HIGH:     '#EF5A5A',
  MEDIUM:   '#F2994A',
  LOW:      '#8EA6B8',
};

export default function SOSMarkers() {
  const sosReports = useAppStore(s => s.sosReports);

  return (
    <>
      {sosReports.map(r => (
        <Marker key={r.id} longitude={r.lon} latitude={r.lat} anchor="center">
          <div
            title={`SOS ${r.severity}: ${r.category} — ${r.district} (${r.people_count} people)`}
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: SEV_COLORS[r.severity] || '#8EA6B8',
              border: '2px solid white',
              cursor: 'pointer',
              animation: (r.severity === 'CRITICAL' && r.status === 'NEW')
                ? 'sos-pulse 1.2s ease-in-out infinite'
                : 'none',
              boxShadow: (r.severity === 'CRITICAL')
                ? `0 0 10px ${SEV_COLORS.CRITICAL}80`
                : 'none',
            }}
          />
          <style>{`
            @keyframes sos-pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50%       { transform: scale(1.4); opacity: 0.7; }
            }
          `}</style>
        </Marker>
      ))}
    </>
  );
}
