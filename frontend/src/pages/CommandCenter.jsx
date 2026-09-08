import CycloneMap from '../components/map/CycloneMap.jsx';
import EventSummaryPanel from '../components/command/EventSummaryPanel.jsx';
import IntelligencePanel from '../components/command/IntelligencePanel.jsx';
import OperationalControls from '../components/command/OperationalControls.jsx';

export default function CommandCenter() {
  return (
    <div className="command-center">
      <div className="cmd-rail">
        <EventSummaryPanel />
      </div>

      <div className="cmd-map">
        <CycloneMap />
      </div>

      <div className="cmd-intel">
        <IntelligencePanel />
      </div>

      <div className="cmd-timeline">
        <OperationalControls />
      </div>
    </div>
  );
}
