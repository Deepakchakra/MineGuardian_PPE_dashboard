"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Billboard,
  Center,
  Html,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

type Checkpoint = {
  id: string;
  name: string;
  position: [number, number, number];
};

/*
 * ============================================================
 * CHECKPOINT LOCATIONS
 * ============================================================
 *
 * Coordinates are based on the actual mine.glb geometry.
 *
 * CP1 = just inside the MAIN entrance
 * CP2 = beginning of LEFT tunnel
 * CP3 = beginning of RIGHT tunnel
 * CP4 = beginning of DEEP LEFT tunnel
 * CP5 = deeper point on the MAIN tunnel
 *
 * These are 3D model coordinates, NOT 2D screen coordinates.
 */
const CHECKPOINTS: Checkpoint[] = [
  {
    id: "01",
    name: "CHECKPOINT 1",

    // Main mine entrance
    position: [0, -4.8, 44],
  },

  {
    id: "02",
    name: "CHECKPOINT 2",

    // Start of left tunnel, immediately after the junction
    position: [-4.2, -4.7, 0.8],
  },

  {
    id: "03",
    name: "CHECKPOINT 3",

    // Start of right tunnel
    position: [4.4, -4.8, -7.5],
  },

  {
    id: "04",
    name: "CHECKPOINT 4",

    // Start of deep-left tunnel
    position: [-18.2, -5.0, -6.3],
  },

  {
    id: "05",
    name: "CHECKPOINT 5",

    // Main tunnel, further inside the mine
    position: [0, -5.0, -45],
  },
];

/*
 * ============================================================
 * CHECKPOINT MARKER
 * ============================================================
 */

function CheckpointMarker({
  checkpoint,
}: {
  checkpoint: Checkpoint;
}) {
  return (
    <group position={checkpoint.position}>
      {/* Floor glow */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.06, 0]}
      >
        <circleGeometry args={[0.7, 32]} />

        <meshBasicMaterial
          color="#1683ff"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floor ring */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.08, 0]}
      >
        <ringGeometry args={[0.42, 0.55, 32]} />

        <meshBasicMaterial
          color="#1683ff"
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Vertical pole */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.045, 0.055, 1.3, 16]} />

        <meshStandardMaterial
          color="#1683ff"
          emissive="#0066ff"
          emissiveIntensity={2}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Blue beacon */}
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.16, 20, 20]} />

        <meshStandardMaterial
          color="#1683ff"
          emissive="#0066ff"
          emissiveIntensity={5}
          metalness={0.2}
          roughness={0.2}
        />
      </mesh>

      {/* Beacon light */}
      <pointLight
        position={[0, 1.35, 0]}
        color="#1683ff"
        intensity={1.5}
        distance={4}
        decay={2}
      />

      {/* Label always faces camera */}
      <Billboard
        follow
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <Html
          center
          position={[0, 1.9, 0]}
          distanceFactor={8}
          transform
          sprite
        >
          <div className="pointer-events-none flex flex-col items-center">
            {/* Number */}
            <div
              className="
                flex h-8 w-8
                items-center justify-center
                rounded-full
                border-2 border-white
                bg-blue-600
                text-[10px]
                font-bold
                text-white
                shadow-[0_0_18px_rgba(0,102,255,0.9)]
              "
            >
              {checkpoint.id}
            </div>

            {/* Label */}
            <div
              className="
                mt-1
                whitespace-nowrap
                rounded-md
                border border-blue-400/40
                bg-black/90
                px-2
                py-1
                text-[8px]
                font-bold
                tracking-wider
                text-blue-100
                shadow-lg
              "
            >
              {checkpoint.name}
            </div>
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

/*
 * ============================================================
 * MINE MODEL
 * ============================================================
 */

function MineModel() {
  const { scene } = useGLTF("/3d/mine.glb");

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    return clone;
  }, [scene]);

  return <primitive object={clonedScene} />;
}

/*
 * ============================================================
 * MINE SCENE
 * ============================================================
 */

function MineScene() {
  return (
    <>
      {/* Mine lighting */}
      <ambientLight intensity={1.15} />

      <directionalLight
        position={[20, 30, 15]}
        intensity={1.8}
        castShadow
      />

      <pointLight
        position={[0, 5, 0]}
        intensity={2}
        distance={100}
        decay={2}
      />

      {/*
       * IMPORTANT:
       *
       * Mine and checkpoints are inside the SAME Center.
       *
       * Therefore they use the exact same coordinate system
       * after the model is centered.
       */}
      <Center>
        <group>
          {/* Actual mine */}
          <Suspense fallback={null}>
            <MineModel />
          </Suspense>

          {/* Actual 3D checkpoints */}
          {CHECKPOINTS.map((checkpoint) => (
            <CheckpointMarker
              key={checkpoint.id}
              checkpoint={checkpoint}
            />
          ))}
        </group>
      </Center>
    </>
  );
}

/*
 * ============================================================
 * VIEWER
 * ============================================================
 */

export default function Mine3DViewer() {
  return (
    <div className="h-full w-full bg-black">
      <Canvas
        shadows
        camera={{
          position: [115, 95, 125],
          fov: 45,
          near: 0.1,
          far: 5000,
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        {/* Dark mining environment */}
        <color
          attach="background"
          args={["#020609"]}
        />

        <MineScene />

        {/* 360° controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          enablePan
          enableZoom
          rotateSpeed={0.7}
          zoomSpeed={0.8}
          minDistance={15}
          maxDistance={500}
          target={[0, -3, -20]}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/3d/mine.glb");