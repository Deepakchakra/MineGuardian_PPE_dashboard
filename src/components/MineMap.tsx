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

import type { HelmetData } from "@/hooks/useHelmetData";

type Checkpoint = {
  id: string;
  name: string;
  position: [number, number, number];
};

/* ============================================================
   CHECKPOINT LOCATIONS
   ============================================================ */

const CHECKPOINTS: Checkpoint[] = [
  {
    id: "01",
    name: "CHECKPOINT 1",
    position: [0, -0.85, 42],
  },
  {
    id: "02",
    name: "CHECKPOINT 2",
    position: [-4.8, -4.65, 0.5],
  },
  {
    id: "03",
    name: "CHECKPOINT 3",
    position: [4.8, -5.15, -7.5],
  },
  {
    id: "04",
    name: "CHECKPOINT 4",
    position: [-17, -5.35, -7],
  },
  {
    id: "05",
    name: "CHECKPOINT 5",
    position: [0, -7.15, -34],
  },
];

/* ============================================================
   CHECKPOINT MARKER
   ============================================================ */

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
        position={[0, 0.05, 0]}
      >
        <circleGeometry args={[0.65, 32]} />

        <meshBasicMaterial
          color="#1683ff"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floor ring */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.08, 0]}
      >
        <ringGeometry args={[0.38, 0.52, 32]} />

        <meshBasicMaterial
          color="#1683ff"
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Pole */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry
          args={[0.045, 0.055, 1.1, 16]}
        />

        <meshStandardMaterial
          color="#1683ff"
          emissive="#0066ff"
          emissiveIntensity={2}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Beacon */}
      <mesh position={[0, 1.12, 0]}>
        <sphereGeometry args={[0.15, 20, 20]} />

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
        position={[0, 1.12, 0]}
        color="#1683ff"
        intensity={1.5}
        distance={4}
        decay={2}
      />

      {/* Label */}
      <Billboard
        follow
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <Html
          center
          position={[0, 1.65, 0]}
          distanceFactor={8}
          transform
          sprite
        >
          <div className="pointer-events-none flex flex-col items-center">
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

            <div
              className="
                mt-1
                whitespace-nowrap
                rounded-md
                border border-blue-400/40
                bg-black/90
                px-2 py-1
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

/* ============================================================
   WORKER MARKER
   ============================================================ */

function WorkerMarker({
  helmet,
  selected,
  onSelect,
}: {
  helmet: HelmetData;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const where =
    helmet.checkpoint?.where?.trim().toUpperCase() ?? "";

  const checkpointNumber = where.match(/\d+/)?.[0];

  if (!checkpointNumber) {
    return null;
  }

  const currentIndex = Number(checkpointNumber) - 1;

  if (
    currentIndex < 0 ||
    currentIndex >= CHECKPOINTS.length
  ) {
    return null;
  }

  const current = CHECKPOINTS[currentIndex];

  const next =
    CHECKPOINTS[currentIndex + 1] ?? null;

  /*
   * Worker is estimated at the midpoint between
   * the last RFID checkpoint and the next checkpoint.
   */
  const position: [number, number, number] = next
    ? [
        (current.position[0] + next.position[0]) / 2,
        (current.position[1] + next.position[1]) / 2 + 0.4,
        (current.position[2] + next.position[2]) / 2,
      ]
    : [
        current.position[0],
        current.position[1] + 0.4,
        current.position[2],
      ];

  return (
    <group position={position}>
      {/* Worker beacon */}
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect(helmet.helmetId);
        }}
      >
        <sphereGeometry args={[0.25, 20, 20]} />

        <meshStandardMaterial
          color="#ef4444"
          emissive="#ff0000"
          emissiveIntensity={selected ? 5 : 3}
        />
      </mesh>

      {/* Worker light */}
      <pointLight
        color="#ff2020"
        intensity={selected ? 2 : 1}
        distance={4}
        decay={2}
      />

      {/* Worker label */}
      <Billboard
        follow
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <Html
          center
          position={[0, 0.7, 0]}
          distanceFactor={8}
          transform
          sprite
        >
          <div className="pointer-events-none flex flex-col items-center">
            <div
              className={`
                flex h-8 w-8
                items-center justify-center
                rounded-full
                border-2
                ${
                  selected
                    ? "border-white bg-red-500"
                    : "border-red-200 bg-red-600"
                }
                text-[9px]
                font-bold
                text-white
                shadow-[0_0_18px_rgba(255,0,0,0.8)]
              `}
            >
              ●
            </div>

            <div
              className="
                mt-1
                whitespace-nowrap
                rounded
                bg-black/90
                px-1.5 py-0.5
                text-[8px]
                font-semibold
                text-white
              "
            >
              {helmet.helmetId
                .replace("_", "-")
                .toUpperCase()}
            </div>
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

/* ============================================================
   MINE MODEL
   ============================================================ */

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

/* ============================================================
   MINE SCENE
   ============================================================ */

function MineScene({
  helmets,
  selectedId,
  onSelectHelmet,
}: {
  helmets: HelmetData[];
  selectedId: string | null;
  onSelectHelmet: (id: string) => void;
}) {
  return (
    <>
      {/* Lighting */}
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

      {/* Mine + checkpoints + workers */}
      <Center>
        <group>
          {/* Mine */}
          <Suspense fallback={null}>
            <MineModel />
          </Suspense>

          {/* Checkpoints */}
          {CHECKPOINTS.map((checkpoint) => (
            <CheckpointMarker
              key={checkpoint.id}
              checkpoint={checkpoint}
            />
          ))}

          {/* Workers */}
          {helmets.map((helmet) => (
            <WorkerMarker
              key={helmet.helmetId}
              helmet={helmet}
              selected={helmet.helmetId === selectedId}
              onSelect={onSelectHelmet}
            />
          ))}
        </group>
      </Center>
    </>
  );
}

/* ============================================================
   MAIN VIEWER
   ============================================================ */

interface Mine3DViewerProps {
  helmets?: HelmetData[];
  selectedId?: string | null;
  onSelectHelmet?: (id: string) => void;
}

export default function Mine3DViewer({
  helmets = [],
  selectedId = null,
  onSelectHelmet = () => {},
}: Mine3DViewerProps) {
  return (
    <div className="h-full w-full bg-black">
      <Canvas
        shadows
        camera={{
          position: [105, 90, 115],
          fov: 45,
          near: 0.1,
          far: 5000,
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <color
          attach="background"
          args={["#020609"]}
        />

        <MineScene
          helmets={helmets}
          selectedId={selectedId}
          onSelectHelmet={onSelectHelmet}
        />

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