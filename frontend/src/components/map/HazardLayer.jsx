import { Layer, Source } from 'react-map-gl/maplibre';

/**
 * Wind hazard rings (34/50/64kt).
 * Source: PARAMETRIC_HOLLAND_SIMPLIFIED (SIMULATED)
 */
export default function HazardLayer({ hazard, show34, show50, show64 }) {
  if (!hazard?.zones?.length) return null;

  const zoneMap = {};
  for (const zone of hazard.zones) {
    zoneMap[zone.threshold] = zone;
  }

  const configs = [
    { key: '34kt', show: show34, color: '#FFF176', opacity: 0.12, strokeColor: '#F2C94C', strokeOpacity: 0.6 },
    { key: '50kt', show: show50, color: '#FF9800', opacity: 0.15, strokeColor: '#F2994A', strokeOpacity: 0.7 },
    { key: '64kt', show: show64, color: '#F44336', opacity: 0.20, strokeColor: '#EF5A5A', strokeOpacity: 0.8 },
  ];

  return (
    <>
      {configs.map(({ key, show, color, opacity, strokeColor, strokeOpacity }) => {
        const zone = zoneMap[key];
        if (!show || !zone) return null;
        return (
          <Source key={key} id={`hazard-${key}`} type="geojson" data={zone.geojson}>
            <Layer
              id={`hazard-fill-${key}`}
              type="fill"
              paint={{ 'fill-color': color, 'fill-opacity': opacity }}
            />
            <Layer
              id={`hazard-stroke-${key}`}
              type="line"
              paint={{
                'line-color': strokeColor,
                'line-width': 1.5,
                'line-opacity': strokeOpacity,
              }}
            />
          </Source>
        );
      })}
    </>
  );
}
