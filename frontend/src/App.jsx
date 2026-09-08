import { motion, AnimatePresence } from 'framer-motion';
<<<<<<< HEAD
import { useState, useEffect } from 'react';
import useAppStore from './store/appStore.js';
import TopBar from './components/layout/TopBar.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
=======
import { useEffect } from 'react';
import useAppStore from './store/appStore.js';
import TopBar from './components/layout/TopBar.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import RedAlertModal from './components/layout/RedAlertModal.jsx';
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
import CommandCenter from './pages/CommandCenter.jsx';
import EventsPage from './pages/EventsPage.jsx';
import SatellitePage from './pages/SatellitePage.jsx';
import ForecastPage from './pages/ForecastPage.jsx';
import HazardImpactPage from './pages/HazardImpactPage.jsx';
import ResourceOpsPage from './pages/ResourceOpsPage.jsx';
import SOSConsolePage from './pages/SOSConsolePage.jsx';
import AuditPage from './pages/AuditPage.jsx';

const PAGES = {
  COMMAND_CENTER: CommandCenter,
  EVENTS: EventsPage,
  SATELLITE: SatellitePage,
  FORECAST: ForecastPage,
  HAZARD_IMPACT: HazardImpactPage,
  RESOURCE_OPS: ResourceOpsPage,
  SOS_CONSOLE: SOSConsolePage,
  AUDIT: AuditPage,
};

export default function App() {
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState('COMMAND_CENTER');
=======
  const activeTab        = useAppStore(s => s.activeTab);
  const setActiveTab     = useAppStore(s => s.setActiveTab);
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
  const setSelectedEvent = useAppStore(s => s.setSelectedEvent);
  const fetchResources   = useAppStore(s => s.fetchResources);
  const fetchSOS         = useAppStore(s => s.fetchSOS);

  useEffect(() => {
    setSelectedEvent('CYC-2020-AMPHAN');
    fetchResources();
    fetchSOS('CYC-2020-AMPHAN');
  }, []);

  const Page = PAGES[activeTab] || CommandCenter;

  return (
    <div className="app-shell">
<<<<<<< HEAD
=======
      <RedAlertModal />
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
      <TopBar />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{ height: '100%', overflow: 'hidden' }}
          >
            <Page />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
