"""
CYCLONE-OS: persistence.py
SQLite engine + session factory.
Member 2 — Backend / Event / State Architect

Currently used for lightweight persistence of SOS reports and audit records.
The core replay state remains in-memory (Store) for hackathon speed.
"""
from __future__ import annotations

import os
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional

# ---------------------------------------------------------------------------
# Database path
# ---------------------------------------------------------------------------

_DB_DIR = Path(__file__).parent / "data"
_DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = str(_DB_DIR / "cyclone_os.db")


# ---------------------------------------------------------------------------
# Schema DDL
# ---------------------------------------------------------------------------

_DDL = """
CREATE TABLE IF NOT EXISTS events (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    basin       TEXT NOT NULL DEFAULT 'BOB',
    status      TEXT NOT NULL DEFAULT 'ACTIVE',
    start_time  TEXT NOT NULL,
    demo_mode   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL,
    meta        TEXT DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS sos_reports (
    id              TEXT PRIMARY KEY,
    event_id        TEXT NOT NULL,
    category        TEXT NOT NULL,
    severity        TEXT NOT NULL,
    lat             REAL NOT NULL,
    lon             REAL NOT NULL,
    district        TEXT NOT NULL,
    people_count    INTEGER NOT NULL DEFAULT 1,
    description     TEXT DEFAULT '',
    contact         TEXT,
    status          TEXT NOT NULL DEFAULT 'NEW',
    priority_score  REAL NOT NULL DEFAULT 0,
    submitted_at    TEXT NOT NULL,
    duplicate_of    TEXT,
    ndrf_alert_id   TEXT
);

CREATE TABLE IF NOT EXISTS ndrf_alerts (
    id          TEXT PRIMARY KEY,
    event_id    TEXT NOT NULL,
    sos_id      TEXT NOT NULL,
    priority    TEXT NOT NULL,
    target_role TEXT NOT NULL,
    district    TEXT NOT NULL,
    category    TEXT NOT NULL,
    lat         REAL NOT NULL,
    lon         REAL NOT NULL,
    people_count INTEGER NOT NULL DEFAULT 1,
    status      TEXT NOT NULL DEFAULT 'OPEN',
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_records (
    id                   TEXT PRIMARY KEY,
    event_id             TEXT NOT NULL,
    prediction_tick      INTEGER NOT NULL,
    prediction_time      TEXT NOT NULL,
    target_time          TEXT NOT NULL,
    lead_hours           INTEGER NOT NULL,
    model_source         TEXT NOT NULL,
    predicted_lat        REAL,
    predicted_lon        REAL,
    predicted_intensity  REAL,
    actual_lat           REAL,
    actual_lon           REAL,
    actual_intensity     REAL,
    track_error_km       REAL,
    intensity_error_kt   REAL
);

CREATE TABLE IF NOT EXISTS timeline_events (
    id          TEXT PRIMARY KEY,
    event_id    TEXT NOT NULL,
    tick        INTEGER NOT NULL,
    timestamp   TEXT NOT NULL,
    type        TEXT NOT NULL,
    summary     TEXT NOT NULL,
    payload     TEXT DEFAULT '{}',
    severity    TEXT NOT NULL DEFAULT 'INFO'
);
"""


# ---------------------------------------------------------------------------
# Connection helper
# ---------------------------------------------------------------------------

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    """Create all tables if they don't exist. Called at startup."""
    conn = get_connection()
    conn.executescript(_DDL)
    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# Generic helpers
# ---------------------------------------------------------------------------

def execute(sql: str, params: tuple = ()) -> None:
    conn = get_connection()
    conn.execute(sql, params)
    conn.commit()
    conn.close()


def query(sql: str, params: tuple = ()) -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def query_one(sql: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    row = conn.execute(sql, params).fetchone()
    conn.close()
    return dict(row) if row else None
