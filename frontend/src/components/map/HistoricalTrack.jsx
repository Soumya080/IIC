import { useEffect, useRef } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import useAppStore from '../../store/appStore.js';

/**
 * Historical storm track — grows as replay advances.
 * Data: SIMULATED (derived from IBTrACS seed data)
 */
export default function HistoricalTrack() {
  const intelligence = useAppStore(s => s.intelligence);
  const currentTick = useAppStore(s => s.currentTick);

  const state = intelligence?.state;
  if (!state) return null;

  // Build track from scenarios data / intelligence
  // We use the timeline to reconstruct track points
  const trackPoints = [];
  
  // Always include current position
  if (state.lat && state.lon) {
    // Amphan historical positions up to current tick
    const AMPHAN_POS = [
      [86.5, 10.5], [86.3, 11.2], [86.0, 12.1], [85.8, 13.0],
      [85.5, 13.8], [85.2, 14.8], [85.0, 16.0], [85.0, 17.5],
      [85.2, 19.0], [86.8, 20.5], [87.5, 22.0], [88.2, 23.5],
    ];
    
    for (let i = 0; i <= Math.min(currentTick, AMPHAN_POS.length - 1); i++) {
      trackPoints.push(AMPHAN_POS[i]);
    }
  }

  if (trackPoints.length < 2) return null;

  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: trackPoints },
        properties: { data_status: 'SIMULATED' },
      },
      // Track points as dots
      ...trackPoints.map((coord, i) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: coord },
        properties: { index: i, isCurrent: i === currentTick },
      })),
    ],
  };

  return (
    <Source id="historical-track" type="geojson" data={geojson}>
      {/* Track line */}
      <Layer
        id="track-line"
        type="line"
        filter={['==', '$type', 'LineString']}
        paint={{
          'line-color': '#42C7FF',
          'line-width': 2,
          'line-opacity': 0.8,
          'line-dasharray': [4, 2],
        }}
      />
      {/* Track dots */}
      <Layer
        id="track-points"
        type="circle"
        filter={['==', '$type', 'Point']}
        paint={{
          'circle-radius': ['case', ['get', 'isCurrent'], 7, 4],
          'circle-color': ['case', ['get', 'isCurrent'], '#42C7FF', 'rgba(66,199,255,0.5)'],
          'circle-stroke-width': ['case', ['get', 'isCurrent'], 2, 1],
          'circle-stroke-color': '#06101C',
        }}
      />
    </Source>
  );
}
