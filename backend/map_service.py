"""
CYCLONE-OS: map_service.py
MapLibre / Geospatial backend service.
Provides GeoJSON endpoints, basemap style configuration, layer metadata,
vector feature query endpoints, and spatial bounds for MapLibre GL JS integration.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query

import replay_engine as re
from schemas import ScenarioType
from seed_data import DEMO_RESOURCES

router = APIRouter()

# Default map style URL (MapLibre vector style)
DEFAULT_MAP_STYLE_URL = "https://demotiles.maplibre.org/style.json"

# Regional default viewport (India + Bay of Bengal + Arabian Sea + North Indian Ocean)
DEFAULT_BOUNDS = {
    "center": [82.5, 18.5],
    "zoom": 4.5,
    "min_zoom": 3.0,
    "max_zoom": 16.0,
    "bbox": [65.0, 5.0, 100.0, 32.0],  # [min_lon, min_lat, max_lon, max_lat]
}


@router.get("/config", summary="Get MapLibre map configuration and basemap style URL")
def get_map_config():
    """
    Returns MapLibre initialization parameters, style configuration,
    and operational bounds.
    """
    return {
        "style_url": DEFAULT_MAP_STYLE_URL,
        "default_center": DEFAULT_BOUNDS["center"],
        "default_zoom": DEFAULT_BOUNDS["zoom"],
        "min_zoom": DEFAULT_BOUNDS["min_zoom"],
        "max_zoom": DEFAULT_BOUNDS["max_zoom"],
        "bbox": DEFAULT_BOUNDS["bbox"],
        "projection": "mercator",
        "attribution": "VORTEX Geospatial Intelligence Engine | MapLibre GL JS",
    }


@router.get("/layers", summary="Get MapLibre layer registry metadata")
def get_layer_registry():
    """
    Returns active MapLibre layer capabilities, source mappings,
    and styling metadata.
    """
    return {
        "sources": [
            {"id": "cyclone-track", "type": "geojson", "description": "Historical cyclone track"},
            {"id": "cyclone-forecast", "type": "geojson", "description": "Forecast scenarios (BASE, LEFT, RIGHT)"},
            {"id": "uncertainty", "type": "geojson", "description": "Probabilistic uncertainty cone"},
            {"id": "cyclone-center", "type": "geojson", "description": "Current storm center marker & core"},
            {"id": "wind-hazard", "type": "geojson", "description": "Wind threshold hazard polygons (34kt, 50kt, 64kt)"},
            {"id": "flood-impact", "type": "geojson", "description": "Flood impact index zones"},
            {"id": "composite-risk", "type": "geojson", "description": "Multi-hazard composite risk index"},
            {"id": "district-boundaries", "type": "geojson", "description": "District boundaries & risk score"},
            {"id": "resources", "type": "geojson", "description": "NDRF & relief resource markers"},
            {"id": "rras-routes", "type": "geojson", "description": "RRAS optimized response routes"},
            {"id": "sos-reports", "type": "geojson", "description": "Citizen SOS distress clusters & points"},
        ],
        "layer_count": 16,
        "engine": "MapLibre GL JS Native Vector Renderer",
    }


@router.get("/geojson/{event_id}/track", summary="Get cyclone track as standard GeoJSON FeatureCollection")
def get_track_geojson(event_id: str):
    """
    Returns the historical/current cyclone track formatted as MapLibre-ready GeoJSON.
    """
    ev = re.store.events.get(event_id)
    if not ev:
        raise HTTPException(404, f"Event '{event_id}' not found")

    states = re.store.states.get(event_id, {})
    points = [s for t, s in sorted(states.items()) if t <= ev.current_tick]

    if not points:
        return {"type": "FeatureCollection", "features": []}

    line_coords = [[s.lon, s.lat] for s in points]
    features = []

    if len(line_coords) > 1:
        features.push({
            "type": "Feature",
            "geometry": {"type": "LineString", "coordinates": line_coords},
            "properties": {
                "kind": "track",
                "event_id": event_id,
                "data_status": "SIMULATED",
                "source": "IBTrACS+SIMULATED",
            },
        })

    for i, s in enumerate(points):
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [s.lon, s.lat]},
            "properties": {
                "kind": "track-point",
                "tick": s.tick,
                "timestamp": s.timestamp.isoformat(),
                "intensity_kt": s.intensity_kt,
                "pressure_hpa": s.pressure_hpa,
                "regime": s.regime.value if s.regime else None,
                "isCurrent": i == len(points) - 1,
            },
        })

    return {"type": "FeatureCollection", "features": features}


@router.get("/geojson/{event_id}/scenarios", summary="Get forecast scenarios as standard GeoJSON FeatureCollection")
def get_scenarios_geojson(event_id: str, tick: Optional[int] = Query(default=None)):
    """
    Returns forecast scenarios (BASE, LEFT, RIGHT) as MapLibre LineString GeoJSON features.
    """
    ev = re.store.events.get(event_id)
    if not ev:
        raise HTTPException(404, f"Event '{event_id}' not found")

    t = tick if tick is not None else ev.current_tick
    state = re.store.states.get(event_id, {}).get(t)
    scenarios = re.store.scenarios.get(event_id, {}).get(t, [])

    features = []
    current_coord = [state.lon, state.lat] if state else None

    for sc in scenarios:
        coords = [[p.lon, p.lat] for p in sc.track]
        if current_coord:
            coords = [current_coord] + coords
        if len(coords) > 1:
            features.append({
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": coords},
                "properties": {
                    "scenario_id": sc.scenario_type.value,
                    "probability": sc.probability,
                    "peak_intensity_kt": sc.peak_intensity_kt,
                    "peak_pressure_hpa": sc.peak_pressure_hpa,
                    "landfall_time": sc.landfall_time.isoformat() if sc.landfall_time else None,
                    "source": sc.source,
                    "rationale": sc.rationale,
                },
            })

    return {"type": "FeatureCollection", "features": features}


@router.get("/geojson/{event_id}/wind", summary="Get wind hazard polygons as MapLibre-ready GeoJSON")
def get_wind_geojson(
    event_id: str,
    tick: Optional[int] = Query(default=None),
    scenario: ScenarioType = Query(default=ScenarioType.BASE),
):
    """
    Returns wind hazard zones (34kt, 50kt, 64kt) as MapLibre GeoJSON polygons.
    """
    ev = re.store.events.get(event_id)
    if not ev:
        raise HTTPException(404, f"Event '{event_id}' not found")

    t = tick if tick is not None else ev.current_tick
    state = re.store.states.get(event_id, {}).get(t)
    if not state:
        raise HTTPException(404, f"No state at tick {t}")

    hz = re.generate_hazard(event_id, t, state, scenario)
    features = []
    for zone in hz.zones:
        fc = zone.geojson
        if fc and "features" in fc:
            for feat in fc["features"]:
                f_copy = dict(feat)
                f_copy["properties"] = {
                    **(f_copy.get("properties") or {}),
                    "threshold": zone.threshold.value,
                    "color": zone.color,
                    "area_km2": zone.area_km2,
                    "source": hz.source,
                }
                features.append(f_copy)

    return {"type": "FeatureCollection", "features": features}


@router.get("/geojson/resources", summary="Get resources as GeoJSON Point FeatureCollection")
def get_resources_geojson():
    """
    Returns relief resources, shelters, and NDRF battalion positions as GeoJSON points for MapLibre markers.
    """
    features = [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [r["lon"], r["lat"]]},
            "properties": {
                "resource_id": r["id"],
                "name": r["name"],
                "type": r["resource_type"],
                "district": r["district"],
                "capacity": r["capacity"],
                "available": r["available"],
                "status": r["status"],
            },
        }
        for r in DEMO_RESOURCES
    ]
    return {"type": "FeatureCollection", "features": features}


@router.get("/geojson/{event_id}/sos", summary="Get active SOS reports as GeoJSON Point FeatureCollection")
def get_sos_geojson(event_id: str):
    """
    Returns citizen SOS distress reports as GeoJSON points for MapLibre clustering.
    """
    reports = [r for r in re.store.sos.values() if isinstance(r, dict) and r.get("event_id") == event_id]
    features = [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [r["lon"], r["lat"]]},
            "properties": {
                "sos_id": r["id"],
                "severity": r["severity"],
                "status": r["status"],
                "category": r["category"],
                "district": r["district"],
                "people_count": r["people_count"],
                "submitted_at": r.get("submitted_at"),
            },
        }
        for r in reports
    ]
    return {"type": "FeatureCollection", "features": features}
