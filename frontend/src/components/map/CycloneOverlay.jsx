import { useEffect, useRef, useState } from 'react';
import { Marker } from 'react-map-gl/maplibre';

/**
 * Cyclone core animation overlay.
 * Renders: rotating spiral, eye pulse, wind rings, detection sweep.
 */
export default function CycloneOverlay({ lat, lon, intensity, regime }) {
  const [animPhase, setAnimPhase] = useState(0);
  const animRef = useRef(null);

  // Animate rotation
  useEffect(() => {
    let frame;
    let start = null;
    function tick(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      setAnimPhase(elapsed);
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!lat || !lon) return null;

  const rotation = (animPhase / 8000) * 360; // full rotation every 8s
  const eyePulse = 0.85 + 0.15 * Math.sin(animPhase / 1200);
  const isRI = regime === 'RAPID_INTENSIFICATION';
  const isMature = regime === 'MATURE';

  // Scale visual size based on intensity
  const baseSize = Math.max(20, Math.min(60, intensity * 0.35));
  const eyeSize = Math.max(6, baseSize * 0.3);

  // Glow color based on regime
  const glowColor = isRI ? '#F2994A' : isMature ? '#EF5A5A' : '#42C7FF';

  return (
    <Marker longitude={lon} latitude={lat} anchor="center">
      <div style={{ position: 'relative', width: baseSize * 2, height: baseSize * 2 }}>
        {/* Outer pulse rings */}
        {[1, 1.6, 2.2].map((scale, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: baseSize * 2,
              height: baseSize * 2,
              marginLeft: -baseSize,
              marginTop: -baseSize,
              borderRadius: '50%',
              border: `1px solid ${glowColor}`,
              opacity: 0.15 + i * 0.05,
              transform: `scale(${scale})`,
              animation: `pulse-out ${2 + i * 0.5}s ease-in-out infinite`,
              pointerEvents: 'none',
            }}
          />
        ))}

<<<<<<< HEAD
        {/* Rotating spiral arms */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: baseSize * 2,
            height: baseSize * 2,
            marginLeft: -baseSize,
            marginTop: -baseSize,
            transform: `rotate(${-rotation}deg)`,
            borderRadius: '50%',
            background: `
              conic-gradient(
                from 0deg,
                transparent 0deg,
                ${glowColor}22 30deg,
                transparent 60deg,
                transparent 120deg,
                ${glowColor}22 150deg,
                transparent 180deg,
                transparent 240deg,
                ${glowColor}22 270deg,
                transparent 300deg,
                transparent 360deg
              )
            `,
          }}
        />
=======
        {/* Rotating spiral arms disabled */}
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)

        {/* Eye wall */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: eyeSize * 2,
            height: eyeSize * 2,
            marginLeft: -eyeSize,
            marginTop: -eyeSize,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${glowColor}40 0%, ${glowColor}20 60%, transparent 100%)`,
            border: `1.5px solid ${glowColor}`,
            transform: `scale(${eyePulse})`,
            boxShadow: `0 0 ${isRI ? 12 : 8}px ${glowColor}60`,
          }}
        />

        {/* Eye center */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: eyeSize * 0.6,
            height: eyeSize * 0.6,
            marginLeft: -eyeSize * 0.3,
            marginTop: -eyeSize * 0.3,
            borderRadius: '50%',
            background: '#06101C',
            border: `1px solid ${glowColor}80`,
          }}
        />
      </div>

      <style>{`
        @keyframes pulse-out {
          0%, 100% { opacity: 0.08; transform: scale(1); }
          50%       { opacity: 0.18; transform: scale(1.05); }
        }
      `}</style>
    </Marker>
  );
}
