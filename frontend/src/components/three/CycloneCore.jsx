import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const REGIME_COLORS = {
  FORMATION:             [0.3, 0.6, 0.8],
  DEVELOPING:            [0.26, 0.78, 1.0],
  INTENSIFYING:          [0.95, 0.79, 0.30],
  RAPID_INTENSIFICATION: [0.95, 0.60, 0.29],
  MATURE:                [0.94, 0.35, 0.35],
  WEAKENING:             [0.31, 0.55, 0.94],
  DISSIPATING:           [0.4, 0.4, 0.4],
};

const REGIME_SPEED = {
  FORMATION:             0.3,
  DEVELOPING:            0.5,
  INTENSIFYING:          0.9,
  RAPID_INTENSIFICATION: 1.5,
  MATURE:                1.1,
  WEAKENING:             0.6,
  DISSIPATING:           0.2,
};

/**
 * CycloneCore — the eye + eyewall of the storm.
 * Eye: dark disc. Eyewall: emissive ring. Pulse tied to intensity.
 */
export default function CycloneCore({ intensity = 0, regime = 'FORMATION' }) {
  const eyewallRef = useRef();
  const eyeRef = useRef();
  const glowRef = useRef();

  const color = useMemo(() => {
    const [r, g, b] = REGIME_COLORS[regime] || REGIME_COLORS.DEVELOPING;
    return new THREE.Color(r, g, b);
  }, [regime]);

  const speed = REGIME_SPEED[regime] || 0.5;
  const baseScale = useMemo(() => Math.max(0.3, Math.min(1.0, intensity / 150)), [intensity]);

  const eyewallMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    wireframe: false,
  }), [color]);

  const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
  }), [color]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 0.92 + 0.08 * Math.sin(t * speed * 2.5);

    if (eyewallRef.current) {
      eyewallRef.current.scale.setScalar(baseScale * pulse);
      eyewallRef.current.rotation.z = -t * speed * 0.8;
    }
    if (eyeRef.current) {
      eyeRef.current.scale.setScalar(baseScale * 0.35 * (0.97 + 0.03 * Math.sin(t * 3)));
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(baseScale * 1.6 * (0.97 + 0.03 * Math.sin(t * 1.2)));
      glowRef.current.material.opacity = 0.08 + 0.05 * Math.sin(t * 0.8);
    }
  });

  return (
    <group>
      {/* Outer atmospheric glow disc */}
      <mesh ref={glowRef} material={glowMaterial}>
        <circleGeometry args={[1.0, 64]} />
      </mesh>

      {/* Eyewall ring */}
      <mesh ref={eyewallRef} material={eyewallMaterial}>
        <ringGeometry args={[0.5, 1.0, 64, 1]} />
      </mesh>

      {/* Eye — near-black disc */}
      <mesh ref={eyeRef}>
        <circleGeometry args={[1.0, 48]} />
        <meshBasicMaterial color="#050505" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}
