import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const REGIME_GLOW = {
  FORMATION:             { color: new THREE.Color(0.3, 0.6, 0.8),   intensity: 0.08 },
  DEVELOPING:            { color: new THREE.Color(0.26, 0.78, 1.0), intensity: 0.12 },
  INTENSIFYING:          { color: new THREE.Color(0.95, 0.79, 0.30), intensity: 0.16 },
  RAPID_INTENSIFICATION: { color: new THREE.Color(0.95, 0.60, 0.29), intensity: 0.22 },
  MATURE:                { color: new THREE.Color(0.94, 0.35, 0.35), intensity: 0.20 },
  WEAKENING:             { color: new THREE.Color(0.31, 0.55, 0.94), intensity: 0.12 },
  DISSIPATING:           { color: new THREE.Color(0.4, 0.4, 0.4),   intensity: 0.06 },
};

/**
 * AtmosphericGlow — soft radial glow behind the cyclone eye.
 * Uses additive blending for a natural halo effect.
 */
export default function AtmosphericGlow({ intensity = 0, regime = 'FORMATION' }) {
  const meshRef = useRef();
  const def = REGIME_GLOW[regime] || REGIME_GLOW.DEVELOPING;
  const scale = Math.max(0.3, Math.min(1.2, intensity / 120));

  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: def.color,
    transparent: true,
    opacity: def.intensity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  }), [def]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    // Slow breathing
    const breathe = scale * (0.95 + 0.05 * Math.sin(t * 0.4));
    meshRef.current.scale.setScalar(breathe);
    // Subtle opacity pulse
    meshRef.current.material.opacity = def.intensity * (0.8 + 0.2 * Math.sin(t * 0.6));
  });

  return (
    <mesh ref={meshRef} material={mat}>
      <circleGeometry args={[2.5, 64]} />
    </mesh>
  );
}
