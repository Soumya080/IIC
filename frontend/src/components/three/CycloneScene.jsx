import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import CycloneCore from './CycloneCore.jsx';
import CycloneSpiral from './CycloneSpiral.jsx';
import WindRings from './WindRings.jsx';
import AtmosphericGlow from './AtmosphericGlow.jsx';
import DetectionSweep from './DetectionSweep.jsx';

/**
 * CycloneScene — React Three Fiber canvas overlaid on the map.
 * Positioned as absolute inside .cmd-map, pointer-events: none.
 * All values driven by backend state, never invented.
 */
export default function CycloneScene({ intensity = 0, regime = 'FORMATION', isDetecting = false, webglFailed, onWebGLError }) {
  if (webglFailed) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: false }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        onError={onWebGLError}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          {/* Ambient light — very dim, scene is mostly emissive */}
          <ambientLight intensity={0.1} />

          {/* Atmospheric glow behind everything */}
          <AtmosphericGlow intensity={intensity} regime={regime} />

          {/* Detection sweep — plays once on first detection */}
          {isDetecting && <DetectionSweep />}

          {/* Wind rings — concentric bands tied to kt thresholds */}
          <WindRings intensity={intensity} regime={regime} />

          {/* Spiral arms — rotation speed tied to regime */}
          <CycloneSpiral intensity={intensity} regime={regime} />

          {/* Eye + eyewall — core of the visualization */}
          <CycloneCore intensity={intensity} regime={regime} />
        </Suspense>
      </Canvas>
    </div>
  );
}
