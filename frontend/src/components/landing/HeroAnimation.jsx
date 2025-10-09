import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GlassCard = () => {
  const mesh = useRef();
  
  const [position, rotation] = useMemo(() => {
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8
    );
    const rot = new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    return [pos, rot];
  }, []);

  useFrame((state) => {
    if (mesh.current) {
        mesh.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={mesh} position={position} rotation={rotation}>
      <planeGeometry args={[1.5, 0.75]} />
      <meshBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.1} 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export const HeroAnimation = () => {
  const group = useRef();
  
  useFrame(({ clock, mouse }) => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, mouse.x * 0.3, 0.02);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -mouse.y * 0.3, 0.02);
    }
  });

  const cards = useMemo(() => Array.from({ length: 20 }, (_, i) => <GlassCard key={i} />), []);

  return <group ref={group}>{cards}</group>;
};
