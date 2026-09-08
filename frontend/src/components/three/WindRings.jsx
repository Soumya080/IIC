import { useRef, useMemo, useEffect, useRef as useRRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RING_DEFS = [
  { ktLabel: '34kt', baseRadius: 1.4, color: new THREE.Color(0.95, 0.79, 0.30), opacity: 0.18, threshold: 34 },
  { ktLabel: '50kt', baseRadius: 1.0, color: new THREE.Color(0.95, 0.60, 0.29), opacity: 0.22, threshold: 50 },
  { ktLabel: '64kt', baseRadius: 0.65, color: new THREE.Color(0.94, 0.35, 0.35), opacity: 0.30, threshold: 64 },
];

function Ring({ baseRadius, color, opacity, intensity, threshold, regime }) {
  const meshRef = useRef();
  const matRef = useRef();

  const targetScale = useMemo(() => {
    if (intensity < threshold) return 0;
    const normalized = Math.min(1.0, intensity / 170);
    return baseRadius * (0.6 + normalized * 0.8);
  }, [intensity, threshold, baseRadius]);

  const currentScale = useRef(0);

  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
  }), [color, opacity]);

  matRef.current = mat;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    // Smooth interpolation toward target scale
    const lerpSpeed = 1.2;
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, delta * lerpSpeed);
    meshRef.current.scale.setScalar(currentScale.current);

    // Subtle breathing
    const t = performance.now() / 1000;
    const breathe = 1 + 0.015 * Math.sin(t * 0.8 + threshold * 0.1);
    meshRef.current.scale.setScalar(currentScale.current * breathe);

    if (matRef.current) {
      matRef.current.opacity = intensity >= threshold ? opacity * (0.85 + 0.15 * Math.sin(t * 0.6)) : 0;
    }
  });

  return (
    <mesh ref={meshRef} material={mat}>
      <ringGeometry args={[0.88, 1.0, 96, 1]} />
    </mesh>
  );
}

/**
 * WindRings — 34/50/64kt wind footprint rings.
 * Smoothly expand/contract based on intensity from backend.
 */
export default function WindRings({ intensity = 0, regime = 'FORMATION' }) {
  return (
    <group>
      {RING_DEFS.map((ring) => (
        <Ring key={ring.ktLabel} {...ring} intensity={intensity} regime={regime} />
      ))}
    </group>
  );
}
