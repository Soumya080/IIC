import { Marker } from 'react-map-gl/maplibre';
import useAppStore from '../../store/appStore.js';

const RESOURCE_ICONS = {
  NDRF_TEAM: '🔵',
  SHELTER: '🏥',
  MEDICAL: '⚕',
  COAST_GUARD: '⚓',
  TRANSPORT: '🚛',
};

const STATUS_COLORS = {
  STANDBY: '#8EA6B8',
  READY: '#35C98A',
  ALERT: '#F2C94C',
  DEPLOYED: '#42C7FF',
  MOVING: '#F2994A',
};

export default function ResourceMarkers() {
  const resources = useAppStore(s => s.resources);

  return (
    <>
      {resources.map(r => (
        <Marker key={r.id} longitude={r.lon} latitude={r.lat} anchor="center">
          <div
            title={`${r.name} — ${r.status}`}
            style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              background: 'rgba(13,27,42,0.9)',
              border: `1.5px solid ${STATUS_COLORS[r.status] || '#8EA6B8'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              cursor: 'pointer',
              boxShadow: r.available
                ? `0 0 6px ${STATUS_COLORS[r.status] || '#8EA6B8'}40`
                : 'none',
              opacity: r.available ? 1 : 0.5,
            }}
          >
            {RESOURCE_ICONS[r.resource_type] || '◆'}
          </div>
        </Marker>
      ))}
    </>
  );
}
