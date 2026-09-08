import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const REGIME_SPEED = {
  FORMATION:             0.15,
  DEVELOPING:            0.28,
  INTENSIFYING:          0.50,
  RAPID_INTENSIFICATION: 0.90,
  MATURE:                0.68,
  WEAKENING:             0.35,
  DISSIPATING:           0.12,
};

const REGIME_COLOR = {
  FORMATION:             new THREE.Color(0.3, 0.6, 0.8),
  DEVELOPING:            new THREE.Color(0.26, 0.78, 1.0),
  INTENSIFYING:          new THREE.Color(0.95, 0.79, 0.30),
  RAPID_INTENSIFICATION: new THREE.Color(0.95, 0.60, 0.29),
  MATURE:                new THREE.Color(0.94, 0.35, 0.35),
  WEAKENING:             new THREE.Color(0.31, 0.55, 0.94),
  DISSIPATING:           new THREE.Color(0.4, 0.4, 0.4),
};

/**
 * Builds a logarithmic spiral as a series of points.
 */
function buildSpiral(turns, pointsPerTurn, innerR, outerR, angleOffset = 0) {
  const totalPoints = turns * pointsPerTurn;
  const points = [];
  for (let i = 0; i < totalPoints; i++) {
    const t = i / totalPoints;
    const angle = t * turns * Math.PI * 2 + angleOffset;
    const r = innerR + (outerR - innerR) * t;
    points.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0));
  }
  return points;
}

/**
 * CycloneSpiral — rotating logarithmic spiral arms.
 * 3 arms, 120° apart. Rotation speed tied to regime.
 */
export default function CycloneSpiral({ intensity = 0, regime = 'FORMATION' }) {
  const groupRef = useRef();
  const speed = REGIME_SPEED[regime] || 0.3;
  const color = REGIME_COLOR[regime] || REGIME_COLOR.DEVELOPING;
  const scale = Math.max(0.25, Math.min(1.0, intensity / 150));

  const spiralLines = useMemo(() => {
    const numArms = 3;
    const lines = [];
    for (let arm = 0; arm < numArms; arm++) {
      const points = buildSpiral(1.5, 80, 0.12, 1.05, (arm / numArms) * Math.PI * 2);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.35,
        linewidth: 1,
      });
      lines.push({ geo, mat, key: arm });
    }
    return lines;
  }, [regime, color]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Counter-clockwise rotation (Northern Hemisphere cyclone)
      groupRef.current.rotation.z = -clock.getElapsedTime() * speed;
      groupRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef}>
      {spiralLines.map(({ geo, mat, key }) => (
        <line key={key} geometry={geo} material={mat} />
      ))}
    </group>
  );
}
