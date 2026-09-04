"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center } from "@react-three/drei";

function MineModel() {
  const { scene } = useGLTF("/3d/mine.glb");

  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

export default function Mine3DViewer() {
  return (
    <div className="h-full w-full bg-black">
      <Canvas
        camera={{
          position: [15, 15, 15],
          fov: 45,
          near: 0.1,
          far: 5000,
        }}
      >
        <color attach="background" args={["#020609"]} />

        <ambientLight intensity={1.5} />

        <directionalLight
          position={[10, 20, 10]}
          intensity={2}
        />

        <pointLight
          position={[0, 5, 0]}
          intensity={3}
          distance={100}
        />

        <Suspense fallback={null}>
          <MineModel />
        </Suspense>

        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={2}
          maxDistance={500}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/3d/mine.glb");