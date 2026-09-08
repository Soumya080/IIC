/**
 * CycloneOps — Global Application Store (Zustand)
 */
import { create } from 'zustand';
import * as api from '../services/api.js';
<<<<<<< HEAD
import { getDemoIntelligence, DEMO_EVENT_ID, DEMO_RESOURCES, DEMO_DISTRICTS } from '../services/demo.js';
=======
import { getDemoIntelligence, DEMO_EVENT_ID, DEMO_RESOURCES, DEMO_DISTRICTS, DEMO_SOS } from '../services/demo.js';
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)

const useAppStore = create((set, get) => ({
  // ─── Connection ─────────────────────────────────────────────────────────
  connectionState: 'CONNECTING', // 'API' | 'DEMO' | 'DEGRADED' | 'CONNECTING'
  setConnectionState: (s) => set({ connectionState: s }),

  // ─── Selected Event ──────────────────────────────────────────────────────
  selectedEventId: null,
  events: [],
  setSelectedEvent: (id) => {
    set({ selectedEventId: id, currentTick: 0, isPlaying: false });
    get().fetchIntelligence(id, 0);
  },
  setEvents: (events) => set({ events }),

  // ─── Replay State ────────────────────────────────────────────────────────
  currentTick: 0,
  maxTick: 11,
  isPlaying: false,
  replaySpeed: 1500, // ms between ticks
  setCurrentTick: (tick) => set({ currentTick: tick }),
  setIsPlaying: (v) => set({ isPlaying: v }),

<<<<<<< HEAD
  // ─── Intelligence Data ───────────────────────────────────────────────────
  intelligence: null,
  isLoadingIntelligence: false,
  intelligenceError: null,

=======
  // ─── Intelligence & RRAS Data ────────────────────────────────────────────
  intelligence: null,
  rrasData: null,
  isLoadingIntelligence: false,
  intelligenceError: null,

  fetchRRAS: async (eventId, tick = null) => {
    const id = eventId || get().selectedEventId;
    if (!id) return;
    try {
      const data = await api.getRRAS(id, tick);
      set({ rrasData: data });
    } catch {
      // keep null or static
    }
  },

>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
  fetchIntelligence: async (eventId, tick = null) => {
    const id = eventId || get().selectedEventId;
    if (!id) return;
    set({ isLoadingIntelligence: true, intelligenceError: null });
    try {
      const data = await api.getIntelligence(id, tick);
<<<<<<< HEAD
      const connState = api.getConnectionState();
      set({
        intelligence: data,
=======
      const rras = await api.getRRAS(id, tick).catch(() => null);
      const connState = api.getConnectionState();
      set({
        intelligence: data,
        rrasData: rras,
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
        currentTick: data.metadata?.tick ?? data.event?.current_tick ?? 0,
        maxTick: data.event?.max_tick ?? 11,
        connectionState: connState,
        isLoadingIntelligence: false,
      });
    } catch (err) {
      // Fallback to demo mode
      const demoTick = tick !== null ? tick : get().currentTick;
      const demoData = getDemoIntelligence(demoTick);
      set({
        intelligence: demoData,
        currentTick: demoTick,
        connectionState: 'DEMO',
        isLoadingIntelligence: false,
        intelligenceError: null,
      });
    }
  },

  // ─── Replay Actions ──────────────────────────────────────────────────────
  replayPlay: async () => {
    const { selectedEventId, currentTick, maxTick, fetchIntelligence } = get();
    if (!selectedEventId || currentTick >= maxTick) return;
    try {
      await api.replayAdvance(selectedEventId);
      await fetchIntelligence(selectedEventId, null);
    } catch {
      const next = Math.min(currentTick + 1, maxTick);
      const demoData = getDemoIntelligence(next);
      set({ intelligence: demoData, currentTick: next, connectionState: 'DEMO' });
    }
  },

  replayReset: async () => {
    const { selectedEventId, fetchIntelligence } = get();
    set({ isPlaying: false, currentTick: 0 });
    if (!selectedEventId) return;
    try {
      await api.replayReset(selectedEventId);
      await fetchIntelligence(selectedEventId, null);
    } catch {
      set({ intelligence: getDemoIntelligence(0), connectionState: 'DEMO' });
    }
  },

  replayGoto: async (tick) => {
    const { selectedEventId, fetchIntelligence } = get();
    set({ currentTick: tick });
    if (!selectedEventId) return;
    try {
      await api.replayGoto(selectedEventId, tick);
      await fetchIntelligence(selectedEventId, null);
    } catch {
      set({ intelligence: getDemoIntelligence(tick), connectionState: 'DEMO' });
    }
  },

  // ─── Active Map Layers ───────────────────────────────────────────────────
  activeLayers: {
    track: true,
    forecast: true,
    scenarioLeft: true,
    scenarioRight: true,
    wind34: true,
    wind50: true,
    wind64: true,
    flood: false,
    composite: false,
    exposure: false,
    districts: false,
    resources: true,
    sos: true,
  },
  toggleLayer: (layerKey) =>
    set((state) => ({
      activeLayers: { ...state.activeLayers, [layerKey]: !state.activeLayers[layerKey] },
    })),

  // ─── Active Scenario ─────────────────────────────────────────────────────
  activeScenario: 'BASE',
  setActiveScenario: (s) => set({ activeScenario: s }),

<<<<<<< HEAD
  // ─── Alert State ─────────────────────────────────────────────────────────
  alertState: 'GREEN',
  setAlertState: (s) => set({ alertState: s }),

  // ─── SOS State ───────────────────────────────────────────────────────────
  sosReports: [],
=======
  // ─── Active Tab / Navigation ──────────────────────────────────────────────
  activeTab: 'COMMAND_CENTER',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ─── Alert State & Emergency Dispatch ─────────────────────────────────────
  alertState: 'GREEN',
  redAlertDismissed: false,
  redAlertDispatched: false,
  setAlertState: (s) => set({ alertState: s }),
  setRedAlertDismissed: (v) => set({ redAlertDismissed: v }),

  dispatchRedAlertToRRAS: () => {
    set({
      activeTab: 'RESOURCE_OPS',
      redAlertDismissed: true,
      redAlertDispatched: true,
    });
    get().fetchRRAS();
  },

  // ─── SOS State ───────────────────────────────────────────────────────────
  sosReports: DEMO_SOS,
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
  ndrfAlerts: [],
  setSosReports: (r) => set({ sosReports: r }),
  setNdrfAlerts: (a) => set({ ndrfAlerts: a }),

  fetchSOS: async (eventId) => {
    const id = eventId || get().selectedEventId;
    try {
      const data = await api.listSOS(id);
<<<<<<< HEAD
      set({ sosReports: data.reports || [] });
    } catch {
      // keep existing
=======
      const reports = (data.reports && data.reports.length > 0) ? data.reports : DEMO_SOS;
      set({ sosReports: reports });
    } catch {
      if (get().sosReports.length === 0) set({ sosReports: DEMO_SOS });
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
    }
  },

  fetchNDRF: async (eventId) => {
    const id = eventId || get().selectedEventId;
    try {
      const data = await api.listNDRFAlerts(id);
      set({ ndrfAlerts: data.alerts || [] });
    } catch {
      // keep existing
    }
  },

<<<<<<< HEAD
=======
  submitSOS: async (sosPayload) => {
    const id = get().selectedEventId || 'CYC-2020-AMPHAN';
    try {
      const res = await api.submitSOS({ event_id: id, ...sosPayload });
      await get().fetchSOS(id);
      await get().fetchNDRF(id);
      return res;
    } catch (err) {
      console.warn('[AppStore] API submitSOS failed, inserting local mock:', err);
      const newMock = {
        id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
        event_id: id,
        category: sosPayload.category || 'TRAPPED',
        severity: sosPayload.severity || 'CRITICAL',
        district: sosPayload.district || 'South 24 Parganas',
        lat: sosPayload.lat || 22.0,
        lon: sosPayload.lon || 88.3,
        people_count: sosPayload.people_count || 1,
        description: sosPayload.description || 'Emergency SOS',
        contact: sosPayload.contact || '+91 98300 00000',
        status: 'NEW',
        priority_score: (sosPayload.people_count || 1) * 4,
      };
      set(s => ({ sosReports: [newMock, ...s.sosReports] }));
      return { report_id: newMock.id, status: 'RECEIVED' };
    }
  },

  updateSOSStatus: async (sosId, status) => {
    const id = get().selectedEventId || 'CYC-2020-AMPHAN';
    try {
      const res = await api.updateSOSStatus(sosId, status);
      set(s => ({
        sosReports: s.sosReports.map(r => (r.id === sosId || r.sos_id === sosId) ? { ...r, status: status } : r)
      }));
      await get().fetchSOS(id);
      return res;
    } catch (err) {
      console.warn('[AppStore] API updateSOSStatus failed, updating local state:', err);
      set(s => ({
        sosReports: s.sosReports.map(r => (r.id === sosId || r.sos_id === sosId) ? { ...r, status: status } : r)
      }));
      return { id: sosId, status };
    }
  },

  dispatchAndRemoveSOS: async (sosId) => {
    try {
      await api.updateSOSStatus(sosId, 'ASSIGNED');
    } catch (err) {
      console.warn('[AppStore] API updateSOSStatus failed:', err);
    }
    set(s => ({
      sosReports: s.sosReports.filter(r => r.id !== sosId && r.sos_id !== sosId)
    }));
  },

>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
  // ─── Resources ───────────────────────────────────────────────────────────
  resources: [],
  resourceGap: null,
  setResources: (r) => set({ resources: r }),

  fetchResources: async () => {
    try {
      const data = await api.listResources();
      set({ resources: data.resources || DEMO_RESOURCES });
    } catch {
      set({ resources: DEMO_RESOURCES });
    }
  },

  fetchResourceGap: async (eventId) => {
    const id = eventId || get().selectedEventId;
    if (!id) return;
    try {
      const data = await api.getResourceGap(id);
      set({ resourceGap: data });
    } catch {
      // derive from current intelligence
      const intel = get().intelligence;
      const pop = intel?.impact?.total_exposed_population || 0;
      const required = Math.max(1, Math.floor(pop / 200000));
      const available = (get().resources || DEMO_RESOURCES).filter(r => r.resource_type === 'NDRF_TEAM' && r.available).length;
      set({ resourceGap: { required_ndrf_teams: required, available_ndrf_teams: available, shortfall: Math.max(0, required - available), source: 'SIMULATED' } });
    }
  },

  // ─── Districts ───────────────────────────────────────────────────────────
  districts: [],
  fetchDistricts: async () => {
    try {
      const data = await api.listDistricts();
      set({ districts: data.districts || DEMO_DISTRICTS });
    } catch {
      set({ districts: DEMO_DISTRICTS });
    }
  },

  // ─── Timeline ─────────────────────────────────────────────────────────────
  timeline: [],
  fetchTimeline: async (eventId) => {
    const id = eventId || get().selectedEventId;
    if (!id) return;
    try {
      const data = await api.getTimeline(id, 0);
      set({ timeline: data });
    } catch {
      set({ timeline: get().intelligence?.timeline || [] });
    }
  },

  // ─── Track ───────────────────────────────────────────────────────────────
  trackHistory: [],
  fetchTrack: async (eventId) => {
    const id = eventId || get().selectedEventId;
    if (!id) return;
    try {
      const data = await api.getTrack(id);
      set({ trackHistory: data.track || [] });
    } catch {
      // derive from intelligence
    }
  },
}));

export default useAppStore;
