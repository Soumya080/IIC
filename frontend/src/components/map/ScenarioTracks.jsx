import { Layer, Source } from 'react-map-gl/maplibre';

/**
 * Scenario tracks: BASE / LEFT / RIGHT.
 * All labeled SIMULATED.
 */
export default function ScenarioTracks({ scenarios, showLeft, showRight }) {
  if (!scenarios?.length) return null;

  const configs = {
    BASE:  { color: '#42C7FF', width: 2.5, opacity: 0.9, dash: null },
    LEFT:  { color: '#35C98A', width: 1.5, opacity: 0.7, dash: [4, 3] },
    RIGHT: { color: '#F2994A', width: 1.5, opacity: 0.7, dash: [4, 3] },
  };

  const shouldShow = { BASE: true, LEFT: showLeft, RIGHT: showRight };

  return (
    <>
      {scenarios.map(scenario => {
        const type = scenario.scenario_type;
        if (!shouldShow[type]) return null;
        if (!scenario.track?.length) return null;

        const cfg = configs[type] || configs.BASE;
        const coords = scenario.track.map(p => [p.lon, p.lat]);

        const geojson = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: coords },
            properties: {
              scenario_type: type,
              probability: scenario.probability,
              source: 'SIMULATED',
            },
          }],
        };

        return (
          <Source key={type} id={`scenario-${type}`} type="geojson" data={geojson}>
            <Layer
              id={`scenario-line-${type}`}
              type="line"
              paint={{
                'line-color': cfg.color,
                'line-width': cfg.width,
                'line-opacity': cfg.opacity,
                ...(cfg.dash ? { 'line-dasharray': cfg.dash } : {}),
              }}
            />
          </Source>
        );
      })}
    </>
  );
}
