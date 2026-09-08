/**
 * VORTEX Map Configuration
 * Centralized constants for the MapLibre GL JS base map.
 * Style URL comes from VITE_MAP_STYLE_URL (never hardcode private credentials).
 * The demotiles URL is acceptable ONLY for local development testing.
 */

export const VORTEX_COLORS = {
  background: '#06101C',
  surface: '#0D1B2A',
  elevated: '#12263A',
  border: '#22384B',
  primary: '#42C7FF',
  success: '#35C98A',
  watch: '#F2C94C',
  warning: '#F2994A',
  critical: '#EF5A5A',
  flood: '#4E8BF0',
  sos: '#FF4D6D',
  muted: '#8EA6B8',
};

// Default viewport: India + Bay of Bengal + Arabian Sea + North Indian Ocean.
// NOTE: this is a region default, NOT a cyclone-specific center. The selected
// event controls the camera via the helpers in mapUtils.js.
export const DEFAULT_CENTER = [82.5, 18.5]; // [lon, lat]
export const DEFAULT_ZOOM = 4.5;
export const MIN_ZOOM = 3;
export const MAX_ZOOM = 16;

export const MAP_STYLE_URL = import.meta.env?.VITE_MAP_STYLE_URL || null;

// Local-testing-only fallback style. Set VITE_MAP_STYLE_URL for any real deployment.
export const FALLBACK_STYLE_URL = 'https://demotiles.maplibre.org/style.json';

export const MAP_CONFIG = {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  STYLE_URL: MAP_STYLE_URL || FALLBACK_STYLE_URL,
  USING_FALLBACK_STYLE: !MAP_STYLE_URL,
};

/**
 * Map lifecycle status:
 *  LOADING     - map/style still initializing
 *  READY       - style loaded, layers registered
 *  STYLE_ERROR - style failed to load (network / bad URL)
 *  DATA_ERROR  - overlay data could not be parsed/applied
 *  DEGRADED    - no style URL configured; rest of the app keeps working
 */
export const MAP_STATUS = {
  LOADING: 'LOADING',
  READY: 'READY',
  STYLE_ERROR: 'STYLE_ERROR',
  DATA_ERROR: 'DATA_ERROR',
  DEGRADED: 'DEGRADED',
};

// Scenario styling (BASE = official line, others dashed probabilistic variants)
export const SCENARIO_STYLES = {
  BASE:  { color: VORTEX_COLORS.primary, width: 2.5, opacity: 0.9, dash: null },
  LEFT:  { color: VORTEX_COLORS.success, width: 1.5, opacity: 0.7, dash: [4, 3] },
  RIGHT: { color: VORTEX_COLORS.warning, width: 1.5, opacity: 0.7, dash: [4, 3] },
};
