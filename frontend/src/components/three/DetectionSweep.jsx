import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * DetectionSweep — one-shot radar sweep animation that plays when storm is detected.
 * A rotating arc that expands outward from the cyclone center.
 */
export default function DetectionSweep() {
  const sweepRef = useRef();
  const startTime = useRef(null);
  const DURATION = 2.5; // seconds

  useFrame(({ clock }) => {
    if (startTime.current === null) startTime.current = clock.getElapsedTime();
    const elapsed = clock.getElapsedTime() - startTime.current;
    const t = Math.min(elapsed / DURATION, 1);

    if (sweepRef.current) {
      // Expand outward
      const scale = 0.1 + t * 2.5;
      sweepRef.current.scale.setScalar(scale);
      // Rotate the sweep
      sweepRef.current.rotation.z = -elapsed * 1.8;
      // Fade out toward the end
      sweepRef.current.children.forEach(child => {
        if (child.material) {
          child.material.opacity = Math.max(0, 0.6 * (1 - t));
        }
      });
    }
  });

  const arcs = useMemo(() => {
    const results = [];
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.RingGeometry(0.9, 1.0, 64, 1, 0, (Math.PI * 2) / 3);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.26, 0.78, 1.0),
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      results.push({ geo, mat, rot: (i / 3) * Math.PI * 2 });
    }
    return results;
  }, []);

  return (
    <group ref={sweepRef}>
      {arcs.map(({ geo, mat, rot }, i) => (
        <mesh key={i} geometry={geo} material={mat} rotation={[0, 0, rot]} />
      ))}
    </group>
  );
}
