import { useEffect, useState } from 'react';
import useAppStore from '../../store/appStore.js';
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { DEMO_TICKS } from '../../services/demo.js';

const SPEEDS = [
  { label: '0.5×', ms: 2800 },
  { label: '1×',   ms: 1500 },
  { label: '2×',   ms: 750  },
  { label: '4×',   ms: 380  },
];

export default function OperationalControls() {
  const currentTick  = useAppStore(s => s.currentTick);
  const maxTick      = useAppStore(s => s.maxTick);
  const isPlaying    = useAppStore(s => s.isPlaying);
  const setIsPlaying = useAppStore(s => s.setIsPlaying);
  const replayPlay   = useAppStore(s => s.replayPlay);
  const replayReset  = useAppStore(s => s.replayReset);
  const replayGoto   = useAppStore(s => s.replayGoto);

  const [speedIdx, setSpeedIdx] = useState(1); // 1× default
  const intervalMs = SPEEDS[speedIdx].ms;

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying) return;
    if (currentTick >= maxTick) { setIsPlaying(false); return; }
    const t = setTimeout(() => replayPlay(), intervalMs);
    return () => clearTimeout(t);
  }, [isPlaying, currentTick, maxTick, intervalMs, replayPlay, setIsPlaying]);

  const togglePlay = () => {
    if (currentTick >= maxTick) replayReset().then(() => setTimeout(() => setIsPlaying(true), 300));
    else setIsPlaying(!isPlaying);
  };

  const pct = maxTick > 0 ? Math.round((currentTick / maxTick) * 100) : 0;
  const tick = DEMO_TICKS[currentTick];
  const ts   = tick?.ts?.slice(0, 16).replace('T', ' ') || '—';

  return (
    <>
      {/* Left: replay buttons */}
      <button className="replay-btn" onClick={replayReset}  title="Reset"><RotateCcw  size={12} /></button>
      <button className="replay-btn" onClick={() => replayGoto(Math.max(0, currentTick - 1))} disabled={currentTick === 0} title="Prev"><SkipBack size={12} /></button>
      <button className={`replay-btn ${isPlaying ? 'active' : ''}`} onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? <Pause size={12} /> : <Play size={12} />}
      </button>
      <button className="replay-btn" onClick={() => replayGoto(Math.min(maxTick, currentTick + 1))} disabled={currentTick >= maxTick} title="Next"><SkipForward size={12} /></button>

      {/* Speed selector */}
      <div className="flex gap-1">
        {SPEEDS.map((s, i) => (
          <button
            key={i}
            className={`speed-btn ${speedIdx === i ? 'active' : ''}`}
            onClick={() => setSpeedIdx(i)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Scrubber */}
      <div className="replay-scrubber">
        <input
          type="range"
          className="tick-slider"
          style={{ '--progress': `${pct}%` }}
          min={0}
          max={maxTick}
          value={currentTick}
          onChange={e => replayGoto(parseInt(e.target.value, 10))}
        />
        <div className="tick-info">
          <span>T+00 FORMATION</span>
          <span className="mono-sm" style={{ color: 'var(--cyan)' }}>T+{String(currentTick).padStart(2,'0')} · {ts} UTC</span>
          <span>T+{maxTick} LANDFALL</span>
        </div>
      </div>
    </>
  );
}
